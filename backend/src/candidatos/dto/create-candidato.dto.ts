import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCandidatoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del candidato es requerido' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'La lista/frente es requerida' })
  lista: string;

  @IsOptional()
  @IsBoolean()
  esPropio?: boolean;

  /** Opcional: si no se envía, se asocia al cargo activo por defecto. */
  @IsOptional()
  @IsUUID('4', { message: 'Cargo inválido' })
  cargoId?: string;
}
