import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { FacultadesService } from '../facultades/facultades.service';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { QueryMesasDto } from './dto/query-mesas.dto';
import { MesaResponseDto } from './dto/mesa-response.dto';
import { PONDERACION_POR_TIPO } from './mesas.constants';

const MESA_INCLUDE = {
  facultad: true,
  transcriptor: true,
  delegados: {
    where: { isActive: true },
    orderBy: { createdAt: 'asc' as const },
    take: 1,
  },
  votos: { select: { candidatoId: true, cantidad: true } },
  actas: { orderBy: { createdAt: 'desc' as const }, take: 1 },
} satisfies Prisma.MesaInclude;

type MesaConRelaciones = Prisma.MesaGetPayload<{
  include: typeof MESA_INCLUDE;
}>;

@Injectable()
export class MesasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly facultadesService: FacultadesService,
  ) {}

  private toResponse(mesa: MesaConRelaciones): MesaResponseDto {
    const delegado = mesa.delegados[0];
    const acta = mesa.actas[0];

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
      include: MESA_INCLUDE,
      orderBy: { codigo: 'asc' },
    });
    return mesas.map((m) => this.toResponse(m));
  }

  async findOne(id: string): Promise<MesaResponseDto> {
    const mesa = await this.prisma.mesa.findUnique({
      where: { id },
      include: MESA_INCLUDE,
    });
    if (!mesa) throw new NotFoundException('Mesa no encontrada');
    return this.toResponse(mesa);
  }

  /** Últimas mesas con actividad (creadas o transcritas), para el panel de inicio. */
  async findRecientes(limit = 5): Promise<MesaResponseDto[]> {
    const mesas = await this.prisma.mesa.findMany({
      include: MESA_INCLUDE,
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
      include: MESA_INCLUDE,
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
      include: MESA_INCLUDE,
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
      include: MESA_INCLUDE,
    });
    return this.toResponse(mesa);
  }

  private async assertTranscriptorExiste(transcriptorId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: transcriptorId },
    });
    if (!user)
      throw new BadRequestException('El transcriptor indicado no existe');
  }
}
