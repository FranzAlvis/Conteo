import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFacultadDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la facultad es requerido' })
  @MaxLength(150)
  nombre: string;

  /** Palabra clave usada para agrupar mesas por coincidencia parcial de facultad. Por defecto, igual al nombre. */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  keyword?: string;
}
