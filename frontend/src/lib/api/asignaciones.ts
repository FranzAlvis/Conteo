import { apiClient } from '@/lib/api-client'
import type { Asignacion } from './types'

export const asignacionesApi = {
  list: () => apiClient.get<Asignacion[]>('/asignaciones').then((res) => res.data),

  updateMesas: (transcriptorId: string, mesaIds: string[]) =>
    apiClient
      .patch<Asignacion>(`/asignaciones/${transcriptorId}`, { mesaIds })
      .then((res) => res.data),
}
