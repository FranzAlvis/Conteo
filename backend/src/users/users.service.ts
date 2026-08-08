import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(user: User): UserResponseDto {
    const { id, name, username, role, isActive, avatar, telefono, createdAt } =
      user;
    return { id, name, username, role, isActive, avatar, telefono, createdAt };
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return users.map((u) => this.toResponse(u));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.toResponse(user);
  }

  /** Solo para uso interno de autenticación: incluye el hash de contraseña. */
  async findByUsernameWithPassword(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existente = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existente)
      throw new ConflictException('El nombre de usuario ya está en uso');

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        username: dto.username,
        passwordHash,
        role: dto.role,
        telefono: dto.telefono,
        avatar: dto.avatar,
        isActive: dto.isActive ?? true,
      },
    });
    return this.toResponse(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    await this.findOne(id);

    if (dto.username) {
      const existente = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });
      if (existente && existente.id !== id) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        username: dto.username,
        role: dto.role,
        telefono: dto.telefono,
        avatar: dto.avatar,
        isActive: dto.isActive,
        ...(dto.password
          ? { passwordHash: await bcrypt.hash(dto.password, SALT_ROUNDS) }
          : {}),
      },
    });
    return this.toResponse(user);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
  }

  /** Lista liviana de transcriptores activos, usada en asignaciones y formularios de mesa. */
  async findTranscriptores(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      where: { role: 'TRANSCRIPTOR', isActive: true },
      orderBy: { name: 'asc' },
    });
    return users.map((u) => this.toResponse(u));
  }
}
