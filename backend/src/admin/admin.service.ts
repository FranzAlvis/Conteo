import * as fs from 'fs/promises';
import * as path from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { EventsGateway } from '../events/events.gateway';
import { ResultadosService } from '../resultados/resultados.service';
import { ResetSistemaDto } from './dto/reset-sistema.dto';
import { ResetSistemaResponseDto } from './dto/reset-sistema-response.dto';
import { IniciarSegundaVueltaDto } from './dto/iniciar-segunda-vuelta.dto';
import { IniciarSegundaVueltaResponseDto } from './dto/iniciar-segunda-vuelta-response.dto';

const PALABRA_CONFIRMACION = 'REINICIAR';
const PALABRA_CONFIRMACION_VUELTA = 'SEGUNDA VUELTA';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resultadosService: ResultadosService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Puesta en 0: borra los votos y actas cargados de la vuelta activa, y
   * devuelve cada mesa a PENDIENTE. Es una acción destructiva e irreversible,
   * por eso exige la palabra de confirmación además del guard de rol ADMIN.
   * Solo afecta la vuelta en curso: los resultados de vueltas ya cerradas
   * (p. ej. la primera vuelta tras iniciar la segunda) no se tocan.
   */
  async resetSistema(
    dto: ResetSistemaDto,
    currentUser: AuthenticatedUser,
  ): Promise<ResetSistemaResponseDto> {
    if (dto.confirmacion !== PALABRA_CONFIRMACION) {
      throw new BadRequestException(
        `Debe escribir "${PALABRA_CONFIRMACION}" para confirmar la puesta en 0`,
      );
    }

    const { vuelta } = await this.prisma.configuracion.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });

    const actasPrevias = await this.prisma.actaMesa.findMany({
      where: { vuelta },
      select: { fotoUrl: true },
    });

    const { votosEliminados, actasEliminadas, mesasReseteadas, auditoria } =
      await this.prisma.$transaction(async (tx) => {
        const votos = await tx.votoMesa.deleteMany({ where: { vuelta } });
        const actas = await tx.actaMesa.deleteMany({ where: { vuelta } });
        await tx.revisionMesa.deleteMany({ where: { vuelta } });
        const mesas = await tx.mesa.updateMany({
          data: { estado: 'PENDIENTE', observaciones: null },
        });
        const auditoria = await tx.resetAuditoria.create({
          data: {
            ejecutadoPorId: currentUser.id,
            mesasReseteadas: mesas.count,
            votosEliminados: votos.count,
            actasEliminadas: actas.count,
            tipo: 'PUESTA_EN_CERO',
            vuelta,
          },
        });

        return {
          votosEliminados: votos.count,
          actasEliminadas: actas.count,
          mesasReseteadas: mesas.count,
          auditoria,
        };
      });

    await Promise.all(
      actasPrevias.map((acta) => this.borrarArchivoActa(acta.fotoUrl)),
    );

    const resumen = await this.resultadosService.computeResumen();
    this.eventsGateway.notificarResumenVotos(resumen);
    this.eventsGateway.notificarSistemaReseteado();

    return {
      mesasReseteadas,
      votosEliminados,
      actasEliminadas,
      ejecutadoPor: currentUser.name,
      fecha: auditoria.createdAt,
    };
  }

  /**
   * Inicia la segunda vuelta electoral: NO borra los votos ni actas de la
   * primera vuelta (quedan guardados y consultables por su campo `vuelta`),
   * solo devuelve cada mesa a PENDIENTE y avanza la ronda activa a 2 para
   * que las nuevas cargas se registren de forma independiente.
   */
  async iniciarSegundaVuelta(
    dto: IniciarSegundaVueltaDto,
    currentUser: AuthenticatedUser,
  ): Promise<IniciarSegundaVueltaResponseDto> {
    if (dto.confirmacion !== PALABRA_CONFIRMACION_VUELTA) {
      throw new BadRequestException(
        `Debe escribir "${PALABRA_CONFIRMACION_VUELTA}" para confirmar el avance de vuelta`,
      );
    }

    const configuracion = await this.prisma.configuracion.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
    if (configuracion.vuelta >= 2) {
      throw new BadRequestException('La segunda vuelta ya fue iniciada');
    }

    const nuevaVuelta = configuracion.vuelta + 1;

    const { mesasReseteadas, auditoria } = await this.prisma.$transaction(
      async (tx) => {
        const mesas = await tx.mesa.updateMany({
          data: { estado: 'PENDIENTE', observaciones: null },
        });
        await tx.configuracion.update({
          where: { id: 1 },
          data: { vuelta: nuevaVuelta },
        });
        const auditoria = await tx.resetAuditoria.create({
          data: {
            ejecutadoPorId: currentUser.id,
            mesasReseteadas: mesas.count,
            votosEliminados: 0,
            actasEliminadas: 0,
            tipo: 'AVANCE_VUELTA',
            vuelta: nuevaVuelta,
          },
        });

        return { mesasReseteadas: mesas.count, auditoria };
      },
    );

    const resumen = await this.resultadosService.computeResumen();
    this.eventsGateway.notificarResumenVotos(resumen);
    this.eventsGateway.notificarVueltaAvanzada(nuevaVuelta);

    return {
      vuelta: nuevaVuelta,
      mesasReseteadas,
      ejecutadoPor: currentUser.name,
      fecha: auditoria.createdAt,
    };
  }

  async getResetLog(take = 10) {
    return this.prisma.resetAuditoria.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      include: { ejecutadoPor: { select: { name: true, username: true } } },
    });
  }

  private async borrarArchivoActa(fotoUrl: string): Promise<void> {
    const relativo = fotoUrl.replace(/^\/uploads\//, '');
    const rutaAbsoluta = path.join(
      process.cwd(),
      process.env.UPLOADS_DIR || 'uploads',
      relativo,
    );
    await fs.unlink(rutaAbsoluta).catch(() => undefined);
  }
}
