import { IsBoolean } from 'class-validator';

export class UpdateConfiguracionDto {
  @IsBoolean()
  conteoAbierto: boolean;
}
