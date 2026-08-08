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
import { MesasService } from './mesas.service';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { QueryMesasDto } from './dto/query-mesas.dto';
import { AssignTranscriptorDto } from './dto/assign-transcriptor.dto';

@Controller('mesas')
export class MesasController {
  constructor(private readonly mesasService: MesasService) {}

  @Get()
  findAll(@Query() query: QueryMesasDto) {
    return this.mesasService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mesasService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateMesaDto) {
    return this.mesasService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateMesaDto) {
    return this.mesasService.update(id, dto);
  }

  @Patch(':id/transcriptor')
  @Roles(Role.ADMIN)
  assignTranscriptor(
    @Param('id') id: string,
    @Body() dto: AssignTranscriptorDto,
  ) {
    return this.mesasService.assignTranscriptor(id, dto.transcriptorId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.mesasService.remove(id);
  }
}
