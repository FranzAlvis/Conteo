export class DelegadoAsignadoDto {
  id: string;
  nombre: string;
  celular: string;
  mesaCodigo: string | null;
}

export class AsignacionResponseDto {
  transcriptorId: string;
  transcriptorNombre: string;
  transcriptorTelefono: string | null;
  mesasCodigos: string[];
  delegados: DelegadoAsignadoDto[];
}
