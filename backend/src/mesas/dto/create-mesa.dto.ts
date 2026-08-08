import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';
import { TipoMesa } from '@prisma/client';

export class CreateMesaDto {
  @IsString()
  @IsNotEmpty({ message: 'El código de mesa es requerido' })
  @Matches(/^[A-Za-z0-9-]+$/, {
    message: 'El código solo puede contener letras, números y guiones',
  })
  codigo: string;

  @IsString()
  @IsNotEmpty({ message: 'La facultad es requerida' })
  facultadId: string;

  @IsEnum(TipoMesa, { message: 'Tipo de mesa inválido' })
  tipo: TipoMesa;

  @IsOptional()
  @IsUUID('4', { message: 'Transcriptor inválido' })
  transcriptorId?: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsOptional()
  @IsInt({ message: 'El padrón debe ser un número entero' })
  @Min(0)
  totalPadron?: number;
}
