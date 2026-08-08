import { apiClient } from '@/lib/api-client'
import type { Candidato } from './types'

export interface CreateCandidatoPayload {
  nombre: string
  lista: string
  esPropio?: boolean
  cargoId?: string
}

export interface UpdateCandidatoPayload {
  nombre?: string
  lista?: string
  esPropio?: boolean
  isActive?: boolean
}

export const candidatosApi = {
  list: (includeInactive = false) =>
    apiClient
      .get<Candidato[]>('/candidatos', { params: includeInactive ? { includeInactive: 'true' } : undefined })
      .then((res) => res.data),

  create: (payload: CreateCandidatoPayload) =>
    apiClient.post<Candidato>('/candidatos', payload).then((res) => res.data),

  update: (id: string, payload: UpdateCandidatoPayload) =>
    apiClient.patch<Candidato>(`/candidatos/${id}`, payload).then((res) => res.data),

  /** Baja logica (isActive=false); el backend nunca borra fisicamente candidatos con votos. */
  remove: (id: string) => apiClient.delete<Candidato>(`/candidatos/${id}`).then((res) => res.data),
}
