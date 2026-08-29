import { Module } from '@nestjs/common';
import { FacultadesModule } from '../facultades/facultades.module';
import { ConfiguracionModule } from '../configuracion/configuracion.module';
import { EventsModule } from '../events/events.module';
import { MesasController } from './mesas.controller';
import { MesasService } from './mesas.service';

@Module({
  imports: [FacultadesModule, ConfiguracionModule, EventsModule],
  controllers: [MesasController],
  providers: [MesasService],
  exports: [MesasService],
})
export class MesasModule {}
