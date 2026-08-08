import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { AsignacionesService } from './asignaciones.service';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';

@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  @Get()
  findAll() {
    return this.asignacionesService.findAll();
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
