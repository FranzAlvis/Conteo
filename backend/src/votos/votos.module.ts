import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { MesasModule } from '../mesas/mesas.module';
import { ResultadosModule } from '../resultados/resultados.module';
import { ConfiguracionModule } from '../configuracion/configuracion.module';
import { VotosController } from './votos.controller';
import { VotosService } from './votos.service';

@Module({
  imports: [MesasModule, ResultadosModule, EventsModule, ConfiguracionModule],
  controllers: [VotosController],
  providers: [VotosService],
})
export class VotosModule {}
