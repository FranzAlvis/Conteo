import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { ControlCalidadService } from '../control-calidad/control-calidad.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';

const SALT_ROUNDS = 10;
/** Sufijo de la contraseña inicial/de restablecimiento: `{username}.2026`. */
const SUFIJO_CONTRASENA_INICIAL = '.2026';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly controlCalidadService: ControlCalidadService,
  ) {}

  private toResponse(user: User): UserResponseDto {
    const {
      id,
      name,
      username,
      role,
      isActive,
      avatar,
      telefono,
      mustChangePassword,
      createdAt,
    } = user;
    return {
      id,
      name,
      username,
      role,
      isActive,
      avatar,
      telefono,
      mustChangePassword,
      createdAt,
    };
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

    const passwordHash = await bcrypt.hash(
      `${dto.username}${SUFIJO_CONTRASENA_INICIAL}`,
      SALT_ROUNDS,
    );
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        username: dto.username,
        passwordHash,
        mustChangePassword: true,
        role: dto.role,
        telefono: dto.telefono,
        avatar: dto.avatar,
        isActive: dto.isActive ?? true,
      },
    });
    await this.controlCalidadService.redistribuir();
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
      },
    });
    await this.controlCalidadService.redistribuir();
    return this.toResponse(user);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    await this.controlCalidadService.redistribuir();
  }

  /**
   * Restablece la contraseña a `{username}.2026` (ej. olvido de contraseña)
   * y vuelve a marcar `mustChangePassword` para que la cambie al entrar.
   */
  async resetPassword(id: string): Promise<UserResponseDto> {
    const existente = await this.findOne(id);
    const passwordHash = await bcrypt.hash(
      `${existente.username}${SUFIJO_CONTRASENA_INICIAL}`,
      SALT_ROUNDS,
    );
    const user = await this.prisma.user.update({
      where: { id },
      data: { passwordHash, mustChangePassword: true },
    });
    return this.toResponse(user);
  }

  /**
   * Autoedición del propio perfil. A propósito NO toca `role`/`isActive`/
   * `username` (ver UpdateProfileDto) y el `id` viene siempre del usuario
   * autenticado (JWT), nunca del cuerpo de la petición — así nadie puede
   * editar el perfil de otra persona ni escalar su propio rol.
   */
  async updateProfile(id: string, dto: UpdateProfileDto): Promise<UserResponseDto> {
    await this.findOne(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        telefono: dto.telefono,
        avatar: dto.avatar,
      },
    });
    return this.toResponse(user);
  }

  /** Cambio de la propia contraseña: exige la actual para confirmarla. */
  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const passwordValida = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!passwordValida) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash, mustChangePassword: false },
    });
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
