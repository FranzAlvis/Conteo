import { IsString } from 'class-validator';

export class ResetSistemaDto {
  @IsString()
  confirmacion: string;
}
