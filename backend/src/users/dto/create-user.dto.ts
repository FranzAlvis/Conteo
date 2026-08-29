import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

/**
 * Ya no se pide contraseña al crear un usuario: se genera automáticamente
 * como `{username}.2026` (ver UsersService.create) y queda marcado con
 * `mustChangePassword` para que la cambie obligatoriamente en su primer
 * inicio de sesión.
 */
export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  name: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos',
  })
  @MinLength(3, { message: 'El usuario debe tener al menos 3 caracteres' })
  username: string;

  @IsEnum(Role, { message: 'Rol inválido' })
  role: Role;

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
