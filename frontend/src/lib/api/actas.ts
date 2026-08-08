import { apiClient } from '@/lib/api-client'

export const actasApi = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient
      .post<{ url: string }>('/actas/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data.url)
  },
}
