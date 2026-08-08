import { Controller, Get } from '@nestjs/common';
import { ResultadosService } from './resultados.service';

@Controller('resultados')
export class ResultadosController {
  constructor(private readonly resultadosService: ResultadosService) {}

  @Get()
  get() {
    return this.resultadosService.computeResumen();
  }
}
