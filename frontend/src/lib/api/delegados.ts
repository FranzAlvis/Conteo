import { apiClient } from '@/lib/api-client'
import type { Delegado } from './types'

export interface CreateDelegadoPayload {
  nombre: string
  ci: string
  celular: string
  correo?: string
  mesaId?: string
  transcriptorId?: string
}

export interface UpdateDelegadoPayload {
  nombre?: string
  ci?: string
  celular?: string
  correo?: string
  mesaId?: string | null
  transcriptorId?: string | null
  isActive?: boolean
}

export const delegadosApi = {
  list: (search?: string) =>
    apiClient.get<Delegado[]>('/delegados', { params: search ? { search } : undefined }).then((res) => res.data),

  create: (payload: CreateDelegadoPayload) =>
    apiClient.post<Delegado>('/delegados', payload).then((res) => res.data),

  update: (id: string, payload: UpdateDelegadoPayload) =>
    apiClient.patch<Delegado>(`/delegados/${id}`, payload).then((res) => res.data),

  remove: (id: string) => apiClient.delete<void>(`/delegados/${id}`).then((res) => res.data),
}
