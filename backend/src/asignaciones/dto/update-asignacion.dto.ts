import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class UpdateAsignacionDto {
  /** Lista completa (exclusiva) de mesas que quedarán a cargo del transcriptor. */
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', {
    each: true,
    message: 'Una o más mesas indicadas son inválidas',
  })
  mesaIds: string[];
}
