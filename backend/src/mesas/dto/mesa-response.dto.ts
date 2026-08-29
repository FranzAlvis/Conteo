import { EstadoMesa, EstadoRevision, TipoMesa } from '@prisma/client';

export class MesaResponseDto {
  id: string;
  codigo: string;
  facultadId: string;
  facultad: string;
  ubicacion: string;
  totalPadron: number;
  tipo: TipoMesa;
  ponderacion: number;
  estado: EstadoMesa;
  transcriptorId: string | null;
  transcriptorNombre: string | null;
  transcriptorTelefono: string | null;
  delegadoNombre: string | null;
  delegadoCelular: string | null;
  delegadoCorreo: string | null;
  votosRegistrados: number;
  votosPorCandidato: Record<string, number>;
  actaFotoUrl: string | null;
  pizarraFotoUrl: string | null;
  controlCalidadId: string | null;
  controlCalidadNombre: string | null;
  revisionEstado: EstadoRevision | null;
  revisionComentario: string | null;
  revisadoPorNombre: string | null;
  revisadoEn: Date | null;
  observaciones: string | null;
  updatedAt: Date;
}
