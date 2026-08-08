import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { AsignacionesService } from './asignaciones.service';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';

@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  /** ADMIN ve todos los transcriptores; cualquier otro rol solo ve su propia asignación. */
  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.asignacionesService.findAll(user);
  }

  @Patch(':transcriptorId')
  @Roles(Role.ADMIN)
  update(
    @Param('transcriptorId') transcriptorId: string,
    @Body() dto: UpdateAsignacionDto,
  ) {
    return this.asignacionesService.updateMesas(transcriptorId, dto.mesaIds);
  }
}
