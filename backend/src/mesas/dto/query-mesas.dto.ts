import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoMesa, TipoMesa } from '@prisma/client';

export class QueryMesasDto {
  @IsOptional()
  @IsString()
  facultadId?: string;

  @IsOptional()
  @IsEnum(EstadoMesa, { message: 'Estado inválido' })
  estado?: EstadoMesa;

  @IsOptional()
  @IsEnum(TipoMesa, { message: 'Tipo inválido' })
  tipo?: TipoMesa;

  @IsOptional()
  @IsString()
  transcriptorId?: string;

  /** Búsqueda libre por código de mesa o nombre de facultad. */
  @IsOptional()
  @IsString()
  search?: string;
}
