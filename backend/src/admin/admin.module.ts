import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { ResultadosModule } from '../resultados/resultados.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [ResultadosModule, EventsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
