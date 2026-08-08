import { apiClient } from '@/lib/api-client'
import type { ResumenVotos } from './types'

export const resultadosApi = {
  get: () => apiClient.get<ResumenVotos>('/resultados').then((res) => res.data),
}
