import { Module } from '@nestjs/common';
import { CandidatosController } from './candidatos.controller';
import { CandidatosService } from './candidatos.service';

@Module({
  controllers: [CandidatosController],
  providers: [CandidatosService],
  exports: [CandidatosService],
})
export class CandidatosModule {}
