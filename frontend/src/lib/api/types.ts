export type Role = 'ADMIN' | 'TRANSCRIPTOR' | 'AYUDANTE' | 'VISOR'
export type EstadoMesa = 'PENDIENTE' | 'EN_CARGA' | 'CARGADA'
export type TipoMesa = 'ESTUDIANTIL' | 'DOCENTE'

export interface UserSummary {
  id: string
  name: string
  username: string
  role: Role
  isActive: boolean
  avatar: string | null
  telefono: string | null
  createdAt: string
}

export interface AuthenticatedUser {
  id: string
  username: string
  name: string
  role: Role
}

export interface LoginResponse {
  accessToken: string
  user: UserSummary
}

export interface Facultad {
  id: string
  nombre: string
  keyword: string
  totalMesas: number
  mesasCargadas: number
  porcentajeCompletado: number
}

export interface Mesa {
  id: string
  codigo: string
  facultadId: string
  facultad: string
  ubicacion: string
  totalPadron: number
  tipo: TipoMesa
  ponderacion: number
  estado: EstadoMesa
  transcriptorId: string | null
  transcriptorNombre: string | null
  transcriptorTelefono: string | null
  delegadoNombre: string | null
  delegadoCelular: string | null
  delegadoCorreo: string | null
  votosRegistrados: number
  votosPorCandidato: Record<string, number>
  actaFotoUrl: string | null
  observaciones: string | null
  updatedAt: string
}

export interface Delegado {
  id: string
  nombre: string
  ci: string
  celular: string
  correo: string | null
  mesaId: string | null
  mesaCodigo: string | null
  transcriptorId: string | null
  transcriptorNombre: string | null
  isActive: boolean
  createdAt: string
}

export interface Candidato {
  id: string
  nombre: string
  lista: string
  cargoId: string
  esPropio: boolean
  isActive: boolean
  createdAt: string
}

export interface CandidatoResultado {
  id: string
  nombre: string
  lista: string
  esPropio: boolean
  votosEstudiantiles: number
  votosDocentes: number
  votosPonderados: number
}

export interface ResumenVotos {
  conteoAbierto: boolean
  ultimaActualizacion: string
  mesasCargadas: number
  totalMesas: number
  totalVotosEstudiantiles: number
  totalVotosDocentes: number
  totalVotosPonderados: number
  totalPadron: number
  candidatos: CandidatoResultado[]
}

export interface DashboardData extends ResumenVotos {
  mesasRecientes: Mesa[]
}

export interface DelegadoAsignado {
  id: string
  nombre: string
  celular: string
  mesaCodigo: string | null
}

export interface Asignacion {
  transcriptorId: string
  transcriptorNombre: string
  transcriptorTelefono: string | null
  mesasCodigos: string[]
  delegados: DelegadoAsignado[]
}

export interface Configuracion {
  id: number
  conteoAbierto: boolean
  updatedAt: string
}

export interface ResetSistemaResult {
  mesasReseteadas: number
  votosEliminados: number
  actasEliminadas: number
  ejecutadoPor: string
  fecha: string
}

export interface ResetLogEntry {
  id: string
  mesasReseteadas: number
  votosEliminados: number
  actasEliminadas: number
  createdAt: string
  ejecutadoPor: { name: string; username: string }
}

export interface ApiErrorBody {
  message: string | string[]
  error?: string
  statusCode: number
}
