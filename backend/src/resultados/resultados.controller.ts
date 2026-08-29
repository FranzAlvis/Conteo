import { Controller, Get, Query } from '@nestjs/common';
import { ResultadosService } from './resultados.service';

@Controller('resultados')
export class ResultadosController {
  constructor(private readonly resultadosService: ResultadosService) {}

  @Get()
  get(@Query('vuelta') vuelta?: string) {
    return this.resultadosService.computeResumen(
      vuelta ? Number(vuelta) : undefined,
    );
  }
}
