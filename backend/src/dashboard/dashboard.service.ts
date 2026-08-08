import { Injectable } from '@nestjs/common';
import { MesasService } from '../mesas/mesas.service';
import { ResultadosService } from '../resultados/resultados.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly resultadosService: ResultadosService,
    private readonly mesasService: MesasService,
  ) {}

  async getResumenGeneral() {
    const [resumen, mesasRecientes] = await Promise.all([
      this.resultadosService.computeResumen(),
      this.mesasService.findRecientes(5),
    ]);
    return { ...resumen, mesasRecientes };
  }
}
