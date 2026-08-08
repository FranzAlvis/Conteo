import { IsOptional, IsUUID } from 'class-validator';

export class AssignTranscriptorDto {
  /** Enviar null para desasignar al transcriptor de la mesa. */
  @IsOptional()
  @IsUUID('4', { message: 'Transcriptor inválido' })
  transcriptorId?: string | null;
}
