import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateDelegadoDto } from './dto/create-delegado.dto';
import { UpdateDelegadoDto } from './dto/update-delegado.dto';
import { DelegadoResponseDto } from './dto/delegado-response.dto';

const DELEGADO_INCLUDE = {
  mesa: { select: { codigo: true } },
  transcriptor: { select: { name: true } },
} satisfies Prisma.DelegadoInclude;

type DelegadoConRelaciones = Prisma.DelegadoGetPayload<{
  include: typeof DELEGADO_INCLUDE;
}>;

@Injectable()
export class DelegadosService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(delegado: DelegadoConRelaciones): DelegadoResponseDto {
    return {
      id: delegado.id,
      nombre: delegado.nombre,
      ci: delegado.ci,
      celular: delegado.celular,
      correo: delegado.correo,
      mesaId: delegado.mesaId,
      mesaCodigo: delegado.mesa?.codigo ?? null,
      transcriptorId: delegado.transcriptorId,
      transcriptorNombre: delegado.transcriptor?.name ?? null,
      isActive: delegado.isActive,
      createdAt: delegado.createdAt,
    };
  }

  async findAll(search?: string): Promise<DelegadoResponseDto[]> {
    const where: Prisma.DelegadoWhereInput = search
      ? {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { ci: { contains: search, mode: 'insensitive' } },
            { celular: { contains: search } },
            { mesa: { codigo: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const delegados = await this.prisma.delegado.findMany({
      where,
      include: DELEGADO_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return delegados.map((d) => this.toResponse(d));
  }

  async findOne(id: string): Promise<DelegadoResponseDto> {
    const delegado = await this.prisma.delegado.findUnique({
      where: { id },
      include: DELEGADO_INCLUDE,
    });
    if (!delegado) throw new NotFoundException('Delegado no encontrado');
    return this.toResponse(delegado);
  }

  async create(dto: CreateDelegadoDto): Promise<DelegadoResponseDto> {
    const ciExistente = await this.prisma.delegado.findUnique({
      where: { ci: dto.ci },
    });
    if (ciExistente)
      throw new ConflictException(
        'Ya existe un delegado registrado con ese CI',
      );

    if (dto.mesaId) await this.assertMesaExiste(dto.mesaId);
    if (dto.transcriptorId)
      await this.assertTranscriptorExiste(dto.transcriptorId);

    const delegado = await this.prisma.delegado.create({
      data: {
        nombre: dto.nombre,
        ci: dto.ci,
        celular: dto.celular,
        correo: dto.correo,
        mesaId: dto.mesaId,
        transcriptorId: dto.transcriptorId,
      },
      include: DELEGADO_INCLUDE,
    });
    return this.toResponse(delegado);
  }

  async update(
    id: string,
    dto: UpdateDelegadoDto,
  ): Promise<DelegadoResponseDto> {
    await this.findOne(id);

    if (dto.ci) {
      const ciExistente = await this.prisma.delegado.findUnique({
        where: { ci: dto.ci },
      });
      if (ciExistente && ciExistente.id !== id) {
        throw new ConflictException(
          'Ya existe un delegado registrado con ese CI',
        );
      }
    }
    if (dto.mesaId) await this.assertMesaExiste(dto.mesaId);
    if (dto.transcriptorId)
      await this.assertTranscriptorExiste(dto.transcriptorId);

    const delegado = await this.prisma.delegado.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        ci: dto.ci,
        celular: dto.celular,
        correo: dto.correo,
        mesaId: dto.mesaId,
        transcriptorId: dto.transcriptorId,
        isActive: dto.isActive,
      },
      include: DELEGADO_INCLUDE,
    });
    return this.toResponse(delegado);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.delegado.delete({ where: { id } });
  }

  private async assertMesaExiste(mesaId: string) {
    const mesa = await this.prisma.mesa.findUnique({ where: { id: mesaId } });
    if (!mesa) throw new BadRequestException('La mesa indicada no existe');
  }

  private async assertTranscriptorExiste(transcriptorId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: transcriptorId },
    });
    if (!user)
      throw new BadRequestException('El transcriptor indicado no existe');
  }
}
