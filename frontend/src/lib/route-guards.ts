import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { getUserRole } from './auth-role'
import { canAccessRoute, defaultRouteForRole, type AppRoute } from '@/config/role-permissions'

/**
 * Defensa en profundidad: además de que el sidebar oculta las opciones no
 * permitidas, esto bloquea el acceso directo por URL a una ruta que el rol
 * del usuario no tiene habilitada, redirigiendo a su página por defecto.
 */
export function requireRouteAccess(route: AppRoute) {
  const role = getUserRole(useAuthStore.getState().auth.user)
  if (!canAccessRoute(role, route)) {
    throw redirect({ to: defaultRouteForRole(role) })
  }
}
