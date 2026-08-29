import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'thisisjustarandomstring'
const USER_DATA_KEY = 'conteo_user_profile_data'

export interface AuthUser {
  id?: string
  name?: string
  username?: string
  email?: string
  avatar?: string | null
  accountNo?: string
  role?: string | string[]
  mustChangePassword?: boolean
  exp?: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    updateAvatar: (avatarBase64: string) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = getCookie(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''

  const storedUserRaw = typeof window !== 'undefined' ? localStorage.getItem(USER_DATA_KEY) : null
  const initUser: AuthUser | null = storedUserRaw ? JSON.parse(storedUserRaw) : null

  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          if (typeof window !== 'undefined') {
            if (user) {
              localStorage.setItem(USER_DATA_KEY, JSON.stringify(user))
            } else {
              localStorage.removeItem(USER_DATA_KEY)
            }
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      updateAvatar: (avatarBase64: string) =>
        set((state) => {
          const updatedUser: AuthUser = {
            ...(state.auth.user || {}),
            avatar: avatarBase64,
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser))
          }
          return { ...state, auth: { ...state.auth, user: updatedUser } }
        }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_DATA_KEY)
          }
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})
