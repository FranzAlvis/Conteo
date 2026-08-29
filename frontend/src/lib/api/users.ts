import { apiClient } from '@/lib/api-client'
import type { Role, UserSummary } from './types'

export interface CreateUserPayload {
  name: string
  username: string
  role: Role
  telefono?: string
}

export interface UpdateUserPayload {
  name?: string
  username?: string
  role?: Role
  telefono?: string
  isActive?: boolean
}

export const usersApi = {
  list: () => apiClient.get<UserSummary[]>('/users').then((res) => res.data),

  transcriptores: () => apiClient.get<UserSummary[]>('/users/transcriptores').then((res) => res.data),

  create: (payload: CreateUserPayload) =>
    apiClient.post<UserSummary>('/users', payload).then((res) => res.data),

  update: (id: string, payload: UpdateUserPayload) =>
    apiClient.patch<UserSummary>(`/users/${id}`, payload).then((res) => res.data),

  resetPassword: (id: string) =>
    apiClient.post<UserSummary>(`/users/${id}/reset-password`).then((res) => res.data),

  remove: (id: string) => apiClient.delete<void>(`/users/${id}`).then((res) => res.data),
}
