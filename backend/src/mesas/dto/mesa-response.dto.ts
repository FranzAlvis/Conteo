import { EstadoMesa, TipoMesa } from '@prisma/client';

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
  observaciones: string | null;
  updatedAt: Date;
}
