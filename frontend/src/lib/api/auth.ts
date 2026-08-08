import { apiClient } from '@/lib/api-client'
import type { AuthenticatedUser, LoginResponse } from './types'

export interface LoginPayload {
  username: string
  password: string
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>('/auth/login', payload).then((res) => res.data),

  me: () => apiClient.get<AuthenticatedUser>('/auth/me').then((res) => res.data),
}
