import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByUsernameWithPassword(
      dto.username,
    );
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const passwordValida = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordValida) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      username: user.username,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        avatar: user.avatar,
        telefono: user.telefono,
        createdAt: user.createdAt,
      },
    };
  }
}
