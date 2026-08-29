import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos',
  })
  @MinLength(3, { message: 'El usuario debe tener al menos 3 caracteres' })
  username?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Rol inválido' })
  role?: Role;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
