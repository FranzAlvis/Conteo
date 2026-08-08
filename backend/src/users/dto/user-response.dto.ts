import { Role } from '@prisma/client';

export class UserResponseDto {
  id: string;
  name: string;
  username: string;
  role: Role;
  isActive: boolean;
  avatar: string | null;
  telefono: string | null;
  createdAt: Date;
}
