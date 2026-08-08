import { apiClient } from '@/lib/api-client'
import type { Configuracion } from './types'

export const configuracionApi = {
  get: () => apiClient.get<Configuracion>('/configuracion').then((res) => res.data),

  setConteoAbierto: (conteoAbierto: boolean) =>
    apiClient.patch<Configuracion>('/configuracion', { conteoAbierto }).then((res) => res.data),
}
