import { IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Autoedición del propio perfil (endpoint /auth/profile): a propósito NO
 * incluye `role`, `isActive` ni `username` — el ValidationPipe global
 * (whitelist + forbidNonWhitelisted) rechaza cualquier campo fuera de este
 * DTO, así que un cliente no puede colarse un `role` para escalar privilegios.
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  name?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
