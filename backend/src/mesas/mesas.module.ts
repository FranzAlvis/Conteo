import { Module } from '@nestjs/common';
import { FacultadesModule } from '../facultades/facultades.module';
import { MesasController } from './mesas.controller';
import { MesasService } from './mesas.service';

@Module({
  imports: [FacultadesModule],
  controllers: [MesasController],
  providers: [MesasService],
  exports: [MesasService],
})
export class MesasModule {}
