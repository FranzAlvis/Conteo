import { apiClient } from '@/lib/api-client'
import type { DashboardData } from './types'

export const dashboardApi = {
  get: (vuelta?: number) =>
    apiClient
      .get<DashboardData>('/dashboard', { params: vuelta ? { vuelta } : undefined })
      .then((res) => res.data),
}
