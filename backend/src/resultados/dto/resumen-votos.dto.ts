export class CandidatoResultadoDto {
  id: string;
  nombre: string;
  lista: string;
  esPropio: boolean;
  votosEstudiantiles: number;
  votosDocentes: number;
  /** votosEstudiantiles + votosDocentes * ponderación de mesa docente (45) */
  votosPonderados: number;
}

export class ResumenVotosDto {
  conteoAbierto: boolean;
  ultimaActualizacion: string;
  /** Vuelta a la que corresponden estos resultados. */
  vuelta: number;
  /** Vuelta activa del proceso electoral (puede diferir de `vuelta` al consultar un histórico). */
  vueltaActual: number;
  mesasCargadas: number;
  totalMesas: number;
  totalVotosEstudiantiles: number;
  totalVotosDocentes: number;
  totalVotosPonderados: number;
  totalPadron: number;
  candidatos: CandidatoResultadoDto[];
}
