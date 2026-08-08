import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateDelegadoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El CI es requerido' })
  ci: string;

  @IsString()
  @IsNotEmpty({ message: 'El número de celular es requerido' })
  celular: string;

  @IsOptional()
  @IsEmail({}, { message: 'Correo no válido' })
  correo?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Mesa inválida' })
  mesaId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Transcriptor inválido' })
  transcriptorId?: string;
}
