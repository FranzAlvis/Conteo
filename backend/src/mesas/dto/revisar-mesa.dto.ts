import { IsIn, IsOptional, IsString } from 'class-validator';

export class RevisarMesaDto {
  @IsIn(['APROBADA', 'RECHAZADA'], { message: 'Estado de revisión inválido' })
  estado: 'APROBADA' | 'RECHAZADA';

  @IsOptional()
  @IsString()
  comentario?: string;
}
