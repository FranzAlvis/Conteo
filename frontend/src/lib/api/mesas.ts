import { apiClient } from '@/lib/api-client'
import type { EstadoMesa, Mesa, TipoMesa } from './types'

export interface QueryMesasParams {
  facultadId?: string
  estado?: EstadoMesa
  tipo?: TipoMesa
  transcriptorId?: string
  search?: string
}

export interface CreateMesaPayload {
  codigo: string
  facultadId: string
  tipo: TipoMesa
  transcriptorId?: string
  ubicacion?: string
  totalPadron?: number
}

export interface UpdateMesaPayload {
  codigo?: string
  facultadId?: string
  tipo?: TipoMesa
  ubicacion?: string
  totalPadron?: number
}

export interface VotoCandidatoPayload {
  candidatoId: string
  cantidad: number
}

export interface TranscribirMesaPayload {
  votos: VotoCandidatoPayload[]
  actaFotoUrl?: string
  observaciones?: string
}

export const mesasApi = {
  list: (params?: QueryMesasParams) =>
    apiClient.get<Mesa[]>('/mesas', { params }).then((res) => res.data),

  get: (id: string) => apiClient.get<Mesa>(`/mesas/${id}`).then((res) => res.data),

  create: (payload: CreateMesaPayload) =>
    apiClient.post<Mesa>('/mesas', payload).then((res) => res.data),

  update: (id: string, payload: UpdateMesaPayload) =>
    apiClient.patch<Mesa>(`/mesas/${id}`, payload).then((res) => res.data),

  assignTranscriptor: (id: string, transcriptorId: string | null) =>
    apiClient.patch<Mesa>(`/mesas/${id}/transcriptor`, { transcriptorId }).then((res) => res.data),

  transcribir: (id: string, payload: TranscribirMesaPayload) =>
    apiClient.post<Mesa>(`/mesas/${id}/transcribir`, payload).then((res) => res.data),

  remove: (id: string) => apiClient.delete<void>(`/mesas/${id}`).then((res) => res.data),
}
