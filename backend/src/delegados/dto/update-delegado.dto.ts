import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateDelegadoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  ci?: string;

  @IsOptional()
  @IsString()
  celular?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Correo no válido' })
  correo?: string;

  /** Enviar null para desasignar la mesa. */
  @IsOptional()
  @IsUUID('4', { message: 'Mesa inválida' })
  mesaId?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
