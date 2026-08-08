import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { TipoMesa } from '@prisma/client';

export class UpdateMesaDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9-]+$/, {
    message: 'El código solo puede contener letras, números y guiones',
  })
  codigo?: string;

  @IsOptional()
  @IsString()
  facultadId?: string;

  @IsOptional()
  @IsEnum(TipoMesa, { message: 'Tipo de mesa inválido' })
  tipo?: TipoMesa;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsOptional()
  @IsInt({ message: 'El padrón debe ser un número entero' })
  @Min(0)
  totalPadron?: number;
}
