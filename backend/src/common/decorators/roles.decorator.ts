import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/** Restringe un endpoint a los roles indicados. Sin este decorador, cualquier usuario autenticado puede acceder. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
