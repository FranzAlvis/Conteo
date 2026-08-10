import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { AdminService } from './admin.service';
import { ResetSistemaDto } from './dto/reset-sistema.dto';

@Controller('admin')
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('reset-sistema')
  resetSistema(
    @Body() dto: ResetSistemaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.resetSistema(dto, user);
  }

  @Get('reset-log')
  getResetLog(@Query('take') take?: string) {
    return this.adminService.getResetLog(take ? Number(take) : undefined);
  }
}
