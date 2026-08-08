export class DelegadoResponseDto {
  id: string;
  nombre: string;
  ci: string;
  celular: string;
  correo: string | null;
  mesaId: string | null;
  mesaCodigo: string | null;
  transcriptorId: string | null;
  transcriptorNombre: string | null;
  isActive: boolean;
  createdAt: Date;
}
