import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateFacultadDto } from './dto/create-facultad.dto';
import { FacultadResponseDto } from './dto/facultad-response.dto';

@Injectable()
export class FacultadesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<FacultadResponseDto[]> {
    const facultades = await this.prisma.facultad.findMany({
      orderBy: { nombre: 'asc' },
      include: { mesas: { select: { estado: true } } },
    });

    return facultades.map((f) => {
      const totalMesas = f.mesas.length;
      const mesasCargadas = f.mesas.filter(
        (m) => m.estado === 'CARGADA',
      ).length;
      return {
        id: f.id,
        nombre: f.nombre,
        keyword: f.keyword,
        totalMesas,
        mesasCargadas,
        porcentajeCompletado:
          totalMesas > 0 ? Math.round((mesasCargadas / totalMesas) * 100) : 0,
      };
    });
  }

  async create(dto: CreateFacultadDto): Promise<FacultadResponseDto> {
    const existente = await this.prisma.facultad.findUnique({
      where: { nombre: dto.nombre },
    });
    if (existente)
      throw new ConflictException('Ya existe una facultad con ese nombre');

    const facultad = await this.prisma.facultad.create({
      data: { nombre: dto.nombre, keyword: dto.keyword?.trim() || dto.nombre },
    });

    return {
      id: facultad.id,
      nombre: facultad.nombre,
      keyword: facultad.keyword,
      totalMesas: 0,
      mesasCargadas: 0,
      porcentajeCompletado: 0,
    };
  }

  /** Usado por MesasService para validar/resolver la facultad al crear una mesa. */
  async findByIdOrThrow(id: string) {
    const facultad = await this.prisma.facultad.findUnique({ where: { id } });
    if (!facultad) throw new NotFoundException('Facultad no encontrada');
    return facultad;
  }
}
