import type { AuthUser } from '@/stores/auth-store'
import type { Role } from '@/lib/api/types'

/** `AuthUser.role` puede venir como string o array (legado del template); normaliza a un solo Role. */
export function getUserRole(user: AuthUser | null | undefined): Role | undefined {
  if (!user?.role) return undefined
  const role = Array.isArray(user.role) ? user.role[0] : user.role
  return role as Role
}
