import { Body, Controller, Param, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { VotosService } from './votos.service';
import { TranscribirMesaDto } from './dto/transcribir-mesa.dto';

@Controller('mesas')
export class VotosController {
  constructor(private readonly votosService: VotosService) {}

  @Post(':mesaId/transcribir')
  @Roles(Role.ADMIN, Role.TRANSCRIPTOR)
  transcribir(
    @Param('mesaId') mesaId: string,
    @Body() dto: TranscribirMesaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.votosService.transcribir(mesaId, dto, user);
  }
}
