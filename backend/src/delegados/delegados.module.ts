import { Module } from '@nestjs/common';
import { DelegadosController } from './delegados.controller';
import { DelegadosService } from './delegados.service';

@Module({
  controllers: [DelegadosController],
  providers: [DelegadosService],
  exports: [DelegadosService],
})
export class DelegadosModule {}
