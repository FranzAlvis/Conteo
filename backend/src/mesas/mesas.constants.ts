import { TipoMesa } from '@prisma/client';

/** Ponderación oficial: 1 mesa docente equivale a 45 mesas estudiantiles. */
export const PONDERACION_POR_TIPO: Record<TipoMesa, number> = {
  ESTUDIANTIL: 1,
  DOCENTE: 45,
};
