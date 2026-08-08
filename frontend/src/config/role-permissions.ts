import type { Role } from '@/lib/api/types'

/**
 * Rutas de la app real (no incluye las páginas de demo del template como
 * /tasks, /chats, /apps, que no forman parte de la navegación del sistema
 * de conteo y no están enlazadas en el sidebar).
 */
export const APP_ROUTES = [
  '/',
  '/resultados',
  '/transcripcion',
  '/mesas',
  '/delegados',
  '/users',
  '/asignaciones',
  '/configuracion',
] as const

export type AppRoute = (typeof APP_ROUTES)[number]

/** Rutas visibles/permitidas por rol. ADMIN tiene acceso total. */
export const ROLE_ROUTES: Record<Role, AppRoute[]> = {
  ADMIN: [...APP_ROUTES],
  TRANSCRIPTOR: ['/transcripcion', '/asignaciones'],
  AYUDANTE: ['/transcripcion', '/asignaciones'],
  VISOR: ['/resultados'],
}

/** Página a la que se redirige a cada rol al entrar a "/" o a una ruta sin permiso. */
export const ROLE_DEFAULT_ROUTE: Record<Role, AppRoute> = {
  ADMIN: '/',
  TRANSCRIPTOR: '/transcripcion',
  AYUDANTE: '/transcripcion',
  VISOR: '/resultados',
}

export function canAccessRoute(role: Role | undefined, route: AppRoute): boolean {
  if (!role) return false
  return ROLE_ROUTES[role].includes(route)
}

export function defaultRouteForRole(role: Role | undefined): AppRoute {
  if (!role) return '/resultados'
  return ROLE_DEFAULT_ROUTE[role]
}
