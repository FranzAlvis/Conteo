import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { DelegadosService } from './delegados.service';
import { CreateDelegadoDto } from './dto/create-delegado.dto';
import { UpdateDelegadoDto } from './dto/update-delegado.dto';

@Controller('delegados')
export class DelegadosController {
  constructor(private readonly delegadosService: DelegadosService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.delegadosService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.delegadosService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.TRANSCRIPTOR)
  create(@Body() dto: CreateDelegadoDto) {
    return this.delegadosService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TRANSCRIPTOR)
  update(@Param('id') id: string, @Body() dto: UpdateDelegadoDto) {
    return this.delegadosService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.delegadosService.remove(id);
  }
}
