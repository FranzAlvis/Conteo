import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { EventsGateway } from '../events/events.gateway';
import { MesasService } from '../mesas/mesas.service';
import { MesaResponseDto } from '../mesas/dto/mesa-response.dto';
import { ResultadosService } from '../resultados/resultados.service';
import { TranscribirMesaDto } from './dto/transcribir-mesa.dto';

@Injectable()
export class VotosService {
  private static readonly LIMITE_VOTOS_MESA = 2000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mesasService: MesasService,
    private readonly resultadosService: ResultadosService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async transcribir(
    mesaId: string,
    dto: TranscribirMesaDto,
    currentUser: AuthenticatedUser,
  ): Promise<MesaResponseDto> {
    const mesa = await this.prisma.mesa.findUnique({ where: { id: mesaId } });
    if (!mesa) throw new NotFoundException('Mesa no encontrada');

    const esResponsable =
      currentUser.role === 'ADMIN' || mesa.transcriptorId === currentUser.id;
    if (!esResponsable) {
      throw new ForbiddenException(
        'Solo el transcriptor asignado o un administrador pueden cargar esta mesa',
      );
    }

    const candidatoIds = dto.votos.map((v) => v.candidatoId);
    const candidatosEncontrados = await this.prisma.candidato.count({
      where: { id: { in: candidatoIds } },
    });
    if (candidatosEncontrados !== new Set(candidatoIds).size) {
      throw new BadRequestException(
        'Uno o más candidatos indicados no existen',
      );
    }

    const totalVotos = dto.votos.reduce((acc, v) => acc + v.cantidad, 0);
    if (totalVotos > VotosService.LIMITE_VOTOS_MESA) {
      throw new BadRequestException(
        `La suma de votos (${totalVotos}) excede el límite permitido por mesa (${VotosService.LIMITE_VOTOS_MESA})`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await Promise.all(
        dto.votos.map((v) =>
          tx.votoMesa.upsert({
            where: {
              mesaId_candidatoId: { mesaId, candidatoId: v.candidatoId },
            },
            update: { cantidad: v.cantidad },
            create: {
              mesaId,
              candidatoId: v.candidatoId,
              cantidad: v.cantidad,
            },
          }),
        ),
      );

      await tx.mesa.update({
        where: { id: mesaId },
        data: {
          estado: 'CARGADA',
          observaciones: dto.observaciones ?? mesa.observaciones,
        },
      });

      if (dto.actaFotoUrl) {
        await tx.actaMesa.create({
          data: {
            mesaId,
            fotoUrl: dto.actaFotoUrl,
            observaciones: dto.observaciones,
            subidoPorId: currentUser.id,
          },
        });
      }
    });

    const mesaActualizada = await this.mesasService.findOne(mesaId);
    this.eventsGateway.notificarMesaActualizada(mesaActualizada);

    const resumen = await this.resultadosService.computeResumen();
    this.eventsGateway.notificarResumenVotos(resumen);

    return mesaActualizada;
  }
}
