import { Body, Controller, Get, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { FacultadesService } from './facultades.service';
import { CreateFacultadDto } from './dto/create-facultad.dto';

@Controller('facultades')
export class FacultadesController {
  constructor(private readonly facultadesService: FacultadesService) {}

  @Get()
  findAll() {
    return this.facultadesService.findAll();
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateFacultadDto) {
    return this.facultadesService.create(dto);
  }
}
