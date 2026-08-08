import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AsignacionResponseDto } from './dto/asignacion-response.dto';

const TRANSCRIPTOR_INCLUDE = {
  mesasAsignadas: {
    select: { codigo: true },
    orderBy: { codigo: 'asc' as const },
  },
  delegadosAsignados: {
    select: {
      id: true,
      nombre: true,
      celular: true,
      mesa: { select: { codigo: true } },
    },
    orderBy: { nombre: 'asc' as const },
  },
};

@Injectable()
export class AsignacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<AsignacionResponseDto[]> {
    const transcriptores = await this.prisma.user.findMany({
      where: { role: 'TRANSCRIPTOR' },
      include: TRANSCRIPTOR_INCLUDE,
      orderBy: { name: 'asc' },
    });

    return transcriptores.map((t) => ({
      transcriptorId: t.id,
      transcriptorNombre: t.name,
      transcriptorTelefono: t.telefono,
      mesasCodigos: t.mesasAsignadas.map((m) => m.codigo),
      delegados: t.delegadosAsignados.map((d) => ({
        id: d.id,
        nombre: d.nombre,
        celular: d.celular,
        mesaCodigo: d.mesa?.codigo ?? null,
      })),
    }));
  }

  async updateMesas(
    transcriptorId: string,
    mesaIds: string[],
  ): Promise<AsignacionResponseDto> {
    const transcriptor = await this.prisma.user.findUnique({
      where: { id: transcriptorId },
    });
    if (!transcriptor || transcriptor.role !== 'TRANSCRIPTOR') {
      throw new NotFoundException('Transcriptor no encontrado');
    }

    if (mesaIds.length > 0) {
      const encontradas = await this.prisma.mesa.count({
        where: { id: { in: mesaIds } },
      });
      if (encontradas !== new Set(mesaIds).size) {
        throw new BadRequestException('Una o más mesas indicadas no existen');
      }
    }

    await this.prisma.$transaction([
      this.prisma.mesa.updateMany({
        where: { transcriptorId, id: { notIn: mesaIds } },
        data: { transcriptorId: null },
      }),
      this.prisma.mesa.updateMany({
        where: { id: { in: mesaIds } },
        data: { transcriptorId },
      }),
    ]);

    const actualizado = await this.prisma.user.findUniqueOrThrow({
      where: { id: transcriptorId },
      include: TRANSCRIPTOR_INCLUDE,
    });

    return {
      transcriptorId: actualizado.id,
      transcriptorNombre: actualizado.name,
      transcriptorTelefono: actualizado.telefono,
      mesasCodigos: actualizado.mesasAsignadas.map((m) => m.codigo),
      delegados: actualizado.delegadosAsignados.map((d) => ({
        id: d.id,
        nombre: d.nombre,
        celular: d.celular,
        mesaCodigo: d.mesa?.codigo ?? null,
      })),
    };
  }
}
