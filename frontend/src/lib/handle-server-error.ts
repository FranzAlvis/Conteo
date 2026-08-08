import { AxiosError } from 'axios'
import { toast } from 'sonner'
import type { ApiErrorBody } from '@/lib/api/types'

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(error)
  }

  let errMsg = 'Algo salió mal. Intente nuevamente.'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'Sin contenido.'
  }

  if (error instanceof AxiosError) {
    if (error.code === 'ERR_NETWORK') {
      errMsg = 'No se pudo conectar con el servidor.'
    } else {
      const data = error.response?.data as ApiErrorBody | undefined
      if (data?.message) {
        errMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message
      }
    }
  }

  toast.error(errMsg)
}
