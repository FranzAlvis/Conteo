import { apiClient } from '@/lib/api-client'
import type { DashboardData } from './types'

export const dashboardApi = {
  get: () => apiClient.get<DashboardData>('/dashboard').then((res) => res.data),
}
