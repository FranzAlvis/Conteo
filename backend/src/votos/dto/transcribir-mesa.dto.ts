import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class VotoCandidatoDto {
  @IsUUID('4', { message: 'Candidato inválido' })
  candidatoId: string;

  @IsInt({ message: 'La cantidad de votos debe ser un número entero' })
  @Min(0, { message: 'La cantidad de votos no puede ser negativa' })
  cantidad: number;
}

export class TranscribirMesaDto {
  @IsArray()
  @ArrayMinSize(1, {
    message: 'Debe registrar al menos un candidato con votos',
  })
  @ValidateNested({ each: true })
  @Type(() => VotoCandidatoDto)
  votos: VotoCandidatoDto[];

  /** URL devuelta por POST /actas/upload. */
  @IsOptional()
  @IsString()
  actaFotoUrl?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
