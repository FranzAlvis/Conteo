import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  get(@Query('vuelta') vuelta?: string) {
    return this.dashboardService.getResumenGeneral(
      vuelta ? Number(vuelta) : undefined,
    );
  }
}
