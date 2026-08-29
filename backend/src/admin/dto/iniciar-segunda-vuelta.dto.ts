import { IsString } from 'class-validator';

export class IniciarSegundaVueltaDto {
  @IsString()
  confirmacion: string;
}
