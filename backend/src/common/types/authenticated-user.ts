import { Role } from '@prisma/client';

/** Payload adjuntado a `request.user` por JwtStrategy tras validar el token. */
export interface AuthenticatedUser {
  id: string;
  username: string;
  name: string;
  role: Role;
  mustChangePassword: boolean;
}
