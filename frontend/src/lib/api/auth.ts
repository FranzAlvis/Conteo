import { apiClient } from '@/lib/api-client'
import type { AuthenticatedUser, LoginResponse, UserSummary } from './types'

export interface LoginPayload {
  username: string
  password: string
}

export interface UpdateProfilePayload {
  name?: string
  telefono?: string
  avatar?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>('/auth/login', payload).then((res) => res.data),

  me: () => apiClient.get<AuthenticatedUser>('/auth/me').then((res) => res.data),

  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient.patch<UserSummary>('/auth/profile', payload).then((res) => res.data),

  changePassword: (payload: ChangePasswordPayload) =>
    apiClient.patch<void>('/auth/password', payload).then((res) => res.data),
}
