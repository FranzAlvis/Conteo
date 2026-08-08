import { Injectable, NotFoundException } from '@nestjs/common';
import { Candidato } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCandidatoDto } from './dto/create-candidato.dto';
import { UpdateCandidatoDto } from './dto/update-candidato.dto';

@Injectable()
export class CandidatosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(includeInactive = false): Promise<Candidato[]> {
    return this.prisma.candidato.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string): Promise<Candidato> {
    const candidato = await this.prisma.candidato.findUnique({ where: { id } });
    if (!candidato) throw new NotFoundException('Candidato no encontrado');
    return candidato;
  }

  async create(dto: CreateCandidatoDto): Promise<Candidato> {
    const cargoId = dto.cargoId ?? (await this.getOrCreateCargoPorDefecto()).id;
    return this.prisma.candidato.create({
      data: {
        nombre: dto.nombre,
        lista: dto.lista,
        esPropio: dto.esPropio ?? false,
        cargoId,
      },
    });
  }

  async update(id: string, dto: UpdateCandidatoDto): Promise<Candidato> {
    await this.findOne(id);
    return this.prisma.candidato.update({ where: { id }, data: dto });
  }

  /**
   * Los votos históricos de mesa referencian al candidato, por lo que no se
   * permite un borrado físico: se desactiva para que deje de aparecer en
   * boletas nuevas sin perder el histórico de cómputo.
   */
  async deactivate(id: string): Promise<Candidato> {
    await this.findOne(id);
    return this.prisma.candidato.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private async getOrCreateCargoPorDefecto() {
    const cargo = await this.prisma.cargo.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    if (cargo) return cargo;
    return this.prisma.cargo.create({ data: { nombre: 'Elección General' } });
  }
}
