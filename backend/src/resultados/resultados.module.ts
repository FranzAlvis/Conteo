import { Module } from '@nestjs/common';
import { ConfiguracionModule } from '../configuracion/configuracion.module';
import { ResultadosController } from './resultados.controller';
import { ResultadosService } from './resultados.service';

@Module({
  imports: [ConfiguracionModule],
  controllers: [ResultadosController],
  providers: [ResultadosService],
  exports: [ResultadosService],
})
export class ResultadosModule {}
