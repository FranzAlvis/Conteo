import * as fs from 'fs/promises';
import * as path from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { EventsGateway } from '../events/events.gateway';
import { ResultadosService } from '../resultados/resultados.service';
import { ResetSistemaDto } from './dto/reset-sistema.dto';
import { ResetSistemaResponseDto } from './dto/reset-sistema-response.dto';

const PALABRA_CONFIRMACION = 'REINICIAR';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resultadosService: ResultadosService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Puesta en 0: borra todos los votos y actas cargados, y devuelve cada mesa
   * a PENDIENTE. Es una acción destructiva e irreversible, por eso exige la
   * palabra de confirmación además del guard de rol ADMIN.
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

    const actasPrevias = await this.prisma.actaMesa.findMany({
      select: { fotoUrl: true },
    });

    const { votosEliminados, actasEliminadas, mesasReseteadas, auditoria } =
      await this.prisma.$transaction(async (tx) => {
        const votos = await tx.votoMesa.deleteMany({});
        const actas = await tx.actaMesa.deleteMany({});
        const mesas = await tx.mesa.updateMany({
          data: { estado: 'PENDIENTE', observaciones: null },
        });
        const auditoria = await tx.resetAuditoria.create({
          data: {
            ejecutadoPorId: currentUser.id,
            mesasReseteadas: mesas.count,
            votosEliminados: votos.count,
            actasEliminadas: actas.count,
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
