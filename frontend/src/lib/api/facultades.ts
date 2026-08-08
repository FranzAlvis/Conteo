import { apiClient } from '@/lib/api-client'
import type { Facultad } from './types'

export interface CreateFacultadPayload {
  nombre: string
  keyword?: string
}

export const facultadesApi = {
  list: () => apiClient.get<Facultad[]>('/facultades').then((res) => res.data),

  create: (payload: CreateFacultadPayload) =>
    apiClient.post<Facultad>('/facultades', payload).then((res) => res.data),
}
