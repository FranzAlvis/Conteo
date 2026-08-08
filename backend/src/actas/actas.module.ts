import { Module } from '@nestjs/common';
import { ActasController } from './actas.controller';

@Module({
  controllers: [ActasController],
})
export class ActasModule {}
