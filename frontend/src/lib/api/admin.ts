import { apiClient } from '@/lib/api-client'
import type { IniciarSegundaVueltaResult, ResetLogEntry, ResetSistemaResult } from './types'

export const adminApi = {
  resetSistema: (confirmacion: string) =>
    apiClient
      .post<ResetSistemaResult>('/admin/reset-sistema', { confirmacion })
      .then((res) => res.data),

  iniciarSegundaVuelta: (confirmacion: string) =>
    apiClient
      .post<IniciarSegundaVueltaResult>('/admin/iniciar-segunda-vuelta', { confirmacion })
      .then((res) => res.data),

  getResetLog: () =>
    apiClient.get<ResetLogEntry[]>('/admin/reset-log').then((res) => res.data),
}
