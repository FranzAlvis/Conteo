import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Resuelve una ruta relativa de archivo subido (ej. "/uploads/actas/x.jpg").
 * En producción, detrás de nginx, API_URL es relativo (p. ej. "/api") y
 * "/uploads" ya se sirve correctamente desde el mismo origen tal cual. En
 * desarrollo, API_URL es absoluto (http://localhost:3000) y el frontend
 * corre en otro puerto (Vite), así que hay que anteponerlo o la imagen 404.
 */
export function resolveUploadUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (/^https?:\/\//.test(path)) return path
  if (/^https?:\/\//.test(API_URL)) return `${API_URL}${path}`
  return path
}

export const apiClient = axios.create({
  baseURL: API_URL,
})

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState().auth
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})
