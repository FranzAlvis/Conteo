import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { FacultadesService } from '../facultades/facultades.service';
import { ConfiguracionService } from '../configuracion/configuracion.service';
import { EventsGateway } from '../events/events.gateway';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { QueryMesasDto } from './dto/query-mesas.dto';
import { MesaResponseDto } from './dto/mesa-response.dto';
import { RevisarMesaDto } from './dto/revisar-mesa.dto';
import { PONDERACION_POR_TIPO } from './mesas.constants';

function mesaInclude(vuelta: number) {
  return {
    facultad: true,
    transcriptor: true,
    controlCalidad: true,
    delegados: {
      where: { isActive: true },
      orderBy: { createdAt: 'asc' as const },
      take: 1,
    },
    votos: { where: { vuelta }, select: { candidatoId: true, cantidad: true } },
    actas: {
      where: { vuelta },
      orderBy: { createdAt: 'desc' as const },
    },
    revisiones: {
      where: { vuelta },
      include: { revisadoPor: true },
    },
  } satisfies Prisma.MesaInclude;
}

type MesaConRelaciones = Prisma.MesaGetPayload<{
  include: ReturnType<typeof mesaInclude>;
}>;

@Injectable()
export class MesasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly facultadesService: FacultadesService,
    private readonly configuracionService: ConfiguracionService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  private async vueltaActiva(): Promise<number> {
    const { vuelta } = await this.configuracionService.getOrCreate();
    return vuelta;
  }

  private toResponse(mesa: MesaConRelaciones): MesaResponseDto {
    const delegado = mesa.delegados[0];
    const acta = mesa.actas.find((a) => a.tipo === 'ACTA');
    const pizarra = mesa.actas.find((a) => a.tipo === 'PIZARRA');
    const revision = mesa.revisiones[0];

    return {
      id: mesa.id,
      codigo: mesa.codigo,
      facultadId: mesa.facultadId,
      facultad: mesa.facultad.nombre,
      ubicacion: mesa.ubicacion,
      totalPadron: mesa.totalPadron,
      tipo: mesa.tipo,
      ponderacion: mesa.ponderacion,
      estado: mesa.estado,
      transcriptorId: mesa.transcriptorId,
      transcriptorNombre: mesa.transcriptor?.name ?? null,
      transcriptorTelefono: mesa.transcriptor?.telefono ?? null,
      delegadoNombre: delegado?.nombre ?? null,
      delegadoCelular: delegado?.celular ?? null,
      delegadoCorreo: delegado?.correo ?? null,
      votosRegistrados: mesa.votos.reduce((acc, v) => acc + v.cantidad, 0),
      votosPorCandidato: Object.fromEntries(
        mesa.votos.map((v) => [v.candidatoId, v.cantidad]),
      ),
      actaFotoUrl: acta?.fotoUrl ?? null,
      pizarraFotoUrl: pizarra?.fotoUrl ?? null,
      controlCalidadId: mesa.controlCalidadId,
      controlCalidadNombre: mesa.controlCalidad?.name ?? null,
      revisionEstado: revision?.estado ?? null,
      revisionComentario: revision?.comentario ?? null,
      revisadoPorNombre: revision?.revisadoPor?.name ?? null,
      revisadoEn: revision?.revisadoEn ?? null,
      observaciones: mesa.observaciones,
      updatedAt: mesa.updatedAt,
    };
  }

  async findAll(query: QueryMesasDto): Promise<MesaResponseDto[]> {
    const where: Prisma.MesaWhereInput = {
      facultadId: query.facultadId,
      estado: query.estado,
      tipo: query.tipo,
      transcriptorId: query.transcriptorId,
      ...(query.search
        ? {
            OR: [
              { codigo: { contains: query.search, mode: 'insensitive' } },
              {
                facultad: {
                  nombre: { contains: query.search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    const mesas = await this.prisma.mesa.findMany({
      where,
      include: mesaInclude(await this.vueltaActiva()),
      orderBy: { codigo: 'asc' },
    });
    return mesas.map((m) => this.toResponse(m));
  }

  async findOne(id: string): Promise<MesaResponseDto> {
    const mesa = await this.prisma.mesa.findUnique({
      where: { id },
      include: mesaInclude(await this.vueltaActiva()),
    });
    if (!mesa) throw new NotFoundException('Mesa no encontrada');
    return this.toResponse(mesa);
  }

  /** Últimas mesas con actividad (creadas o transcritas), para el panel de inicio. */
  async findRecientes(limit = 5): Promise<MesaResponseDto[]> {
    const mesas = await this.prisma.mesa.findMany({
      include: mesaInclude(await this.vueltaActiva()),
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
    return mesas.map((m) => this.toResponse(m));
  }

  async create(dto: CreateMesaDto): Promise<MesaResponseDto> {
    await this.facultadesService.findByIdOrThrow(dto.facultadId);
    if (dto.transcriptorId) {
      await this.assertTranscriptorExiste(dto.transcriptorId);
    }

    const mesa = await this.prisma.mesa.create({
      data: {
        codigo: dto.codigo.toUpperCase(),
        facultadId: dto.facultadId,
        tipo: dto.tipo,
        ponderacion: PONDERACION_POR_TIPO[dto.tipo],
        transcriptorId: dto.transcriptorId,
        ubicacion: dto.ubicacion,
        totalPadron: dto.totalPadron,
      },
      include: mesaInclude(await this.vueltaActiva()),
    });
    return this.toResponse(mesa);
  }

  async update(id: string, dto: UpdateMesaDto): Promise<MesaResponseDto> {
    await this.findOne(id);
    if (dto.facultadId)
      await this.facultadesService.findByIdOrThrow(dto.facultadId);

    const mesa = await this.prisma.mesa.update({
      where: { id },
      data: {
        codigo: dto.codigo?.toUpperCase(),
        facultadId: dto.facultadId,
        tipo: dto.tipo,
        ponderacion: dto.tipo ? PONDERACION_POR_TIPO[dto.tipo] : undefined,
        ubicacion: dto.ubicacion,
        totalPadron: dto.totalPadron,
      },
      include: mesaInclude(await this.vueltaActiva()),
    });
    return this.toResponse(mesa);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.mesa.delete({ where: { id } });
  }

  async assignTranscriptor(
    id: string,
    transcriptorId: string | null | undefined,
  ): Promise<MesaResponseDto> {
    await this.findOne(id);
    if (transcriptorId) await this.assertTranscriptorExiste(transcriptorId);

    const mesa = await this.prisma.mesa.update({
      where: { id },
      data: { transcriptorId: transcriptorId ?? null },
      include: mesaInclude(await this.vueltaActiva()),
    });
    return this.toResponse(mesa);
  }

  /**
   * Veredicto de control de calidad sobre la mesa: solo el CONTROL_CALIDAD
   * asignado (o un ADMIN) puede aprobar/rechazar, y solo tiene sentido sobre
   * una mesa que ya tiene votos cargados. Rechazar la devuelve a EN_CARGA para
   * que el transcriptor la corrija; al volver a transcribirla queda otra vez
   * PENDIENTE de revisión (ver VotosService.transcribir).
   */
  async revisar(
    id: string,
    dto: RevisarMesaDto,
    currentUser: AuthenticatedUser,
  ): Promise<MesaResponseDto> {
    const mesa = await this.prisma.mesa.findUnique({ where: { id } });
    if (!mesa) throw new NotFoundException('Mesa no encontrada');

    const esResponsable =
      currentUser.role === 'ADMIN' || mesa.controlCalidadId === currentUser.id;
    if (!esResponsable) {
      throw new ForbiddenException(
        'Solo el control de calidad asignado o un administrador pueden revisar esta mesa',
      );
    }

    if (mesa.estado !== 'CARGADA') {
      throw new BadRequestException(
        'Solo se pueden revisar mesas que ya tienen votos cargados',
      );
    }

    if (dto.estado === 'RECHAZADA' && !dto.comentario?.trim()) {
      throw new BadRequestException(
        'Debe indicar un comentario para rechazar la mesa',
      );
    }

    const { vuelta } = await this.configuracionService.getOrCreate();

    await this.prisma.$transaction([
      this.prisma.revisionMesa.upsert({
        where: { mesaId_vuelta: { mesaId: id, vuelta } },
        update: {
          estado: dto.estado,
          comentario: dto.comentario ?? null,
          revisadoPorId: currentUser.id,
          revisadoEn: new Date(),
        },
        create: {
          mesaId: id,
          vuelta,
          estado: dto.estado,
          comentario: dto.comentario ?? null,
          revisadoPorId: currentUser.id,
          revisadoEn: new Date(),
        },
      }),
      ...(dto.estado === 'RECHAZADA'
        ? [
            this.prisma.mesa.update({
              where: { id },
              data: { estado: 'EN_CARGA' },
            }),
          ]
        : []),
    ]);

    const mesaActualizada = await this.findOne(id);
    this.eventsGateway.notificarMesaActualizada(mesaActualizada);
    return mesaActualizada;
  }

  private async assertTranscriptorExiste(transcriptorId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: transcriptorId },
    });
    if (!user)
      throw new BadRequestException('El transcriptor indicado no existe');
  }
}
