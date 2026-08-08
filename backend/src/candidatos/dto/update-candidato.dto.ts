import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCandidatoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  lista?: string;

  @IsOptional()
  @IsBoolean()
  esPropio?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
