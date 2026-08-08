import { Module } from '@nestjs/common';
import { MesasModule } from '../mesas/mesas.module';
import { ResultadosModule } from '../resultados/resultados.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [ResultadosModule, MesasModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
