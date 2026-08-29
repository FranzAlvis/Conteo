import { apiClient } from '@/lib/api-client'
import type { ResumenVotos } from './types'

export const resultadosApi = {
  get: (vuelta?: number) =>
    apiClient
      .get<ResumenVotos>('/resultados', { params: vuelta ? { vuelta } : undefined })
      .then((res) => res.data),
}
