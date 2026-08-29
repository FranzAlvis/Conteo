import { Module } from '@nestjs/common';
import { ConfiguracionModule } from '../configuracion/configuracion.module';
import { ControlCalidadService } from './control-calidad.service';

@Module({
  imports: [ConfiguracionModule],
  providers: [ControlCalidadService],
  exports: [ControlCalidadService],
})
export class ControlCalidadModule {}
