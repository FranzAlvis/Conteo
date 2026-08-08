import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { ConfiguracionService } from './configuracion.service';
import { UpdateConfiguracionDto } from './dto/update-configuracion.dto';

@Controller('configuracion')
export class ConfiguracionController {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  @Get()
  get() {
    return this.configuracionService.getOrCreate();
  }

  @Patch()
  @Roles(Role.ADMIN)
  update(@Body() dto: UpdateConfiguracionDto) {
    return this.configuracionService.setConteoAbierto(dto.conteoAbierto);
  }
}
