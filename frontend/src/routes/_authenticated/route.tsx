import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'
import { authApi } from '@/lib/api/auth'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { accessToken, user, setUser, reset } = useAuthStore.getState().auth
    if (!accessToken || !user) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }

    // El perfil (incluido el rol) se persiste en localStorage solo para
    // mostrarlo sin parpadeos, pero es editable por el usuario en el
    // navegador. Antes de dejar entrar a cualquier ruta protegida se
    // revalida contra el backend, que deriva el rol desde la base de datos
    // en cada request, y se sobrescribe el valor local con el verificado.
    let verifiedUser
    try {
      verifiedUser = await authApi.me()
      setUser({ ...user, ...verifiedUser })
    } catch {
      reset()
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }

    // Contraseña inicial/restablecida pendiente de cambio: no se deja entrar
    // a ninguna otra pantalla hasta que la cambie.
    const CAMBIO_OBLIGATORIO_PATH = '/cambiar-password-temporal'
    if (verifiedUser.mustChangePassword && location.pathname !== CAMBIO_OBLIGATORIO_PATH) {
      throw redirect({ to: CAMBIO_OBLIGATORIO_PATH })
    }
  },
  component: AuthenticatedLayout,
})
