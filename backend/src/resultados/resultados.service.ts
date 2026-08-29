import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConfiguracionService } from '../configuracion/configuracion.service';
import {
  CandidatoResultadoDto,
  ResumenVotosDto,
} from './dto/resumen-votos.dto';

@Injectable()
export class ResultadosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configuracionService: ConfiguracionService,
  ) {}

  async computeResumen(vuelta?: number): Promise<ResumenVotosDto> {
    const configuracion = await this.configuracionService.getOrCreate();
    const vueltaConsultada = vuelta ?? configuracion.vuelta;

    // En la ronda activa solo se muestran candidatos vigentes (isActive): si
    // se dio de baja a alguien por error o quedó eliminado en una vuelta
    // anterior, no debe seguir apareciendo en el resumen en vivo. En cambio,
    // al consultar una vuelta ya cerrada se listan TODOS los que compitieron
    // entonces, aunque luego se hayan desactivado (p. ej. al pasar a un
    // balotaje), para no perder el histórico de esa ronda.
    const [candidatos, votos, mesasAgg] = await Promise.all([
      this.prisma.candidato.findMany({
        where:
          vueltaConsultada === configuracion.vuelta
            ? { isActive: true }
            : undefined,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.votoMesa.findMany({
        where: { vuelta: vueltaConsultada },
        include: { mesa: { select: { tipo: true, ponderacion: true } } },
      }),
      this.prisma.mesa.aggregate({
        _count: { _all: true },
        _sum: { totalPadron: true },
      }),
    ]);

    const mesasCargadas =
      vueltaConsultada === configuracion.vuelta
        ? await this.prisma.mesa.count({ where: { estado: 'CARGADA' } })
        : await this.prisma.votoMesa
            .findMany({
              where: { vuelta: vueltaConsultada },
              distinct: ['mesaId'],
              select: { mesaId: true },
            })
            .then((filas) => filas.length);

    const acumuladoPorCandidato = new Map<
      string,
      { estudiantiles: number; docentes: number }
    >();
    for (const voto of votos) {
      const actual = acumuladoPorCandidato.get(voto.candidatoId) ?? {
        estudiantiles: 0,
        docentes: 0,
      };
      if (voto.mesa.tipo === 'DOCENTE') {
        actual.docentes += voto.cantidad;
      } else {
        actual.estudiantiles += voto.cantidad;
      }
      acumuladoPorCandidato.set(voto.candidatoId, actual);
    }

    const candidatosResultado: CandidatoResultadoDto[] = candidatos.map((c) => {
      const acumulado = acumuladoPorCandidato.get(c.id) ?? {
        estudiantiles: 0,
        docentes: 0,
      };
      return {
        id: c.id,
        nombre: c.nombre,
        lista: c.lista,
        esPropio: c.esPropio,
        votosEstudiantiles: acumulado.estudiantiles,
        votosDocentes: acumulado.docentes,
        votosPonderados: acumulado.estudiantiles + acumulado.docentes * 45,
      };
    });

    const totalVotosEstudiantiles = candidatosResultado.reduce(
      (acc, c) => acc + c.votosEstudiantiles,
      0,
    );
    const totalVotosDocentes = candidatosResultado.reduce(
      (acc, c) => acc + c.votosDocentes,
      0,
    );
    const totalVotosPonderados = candidatosResultado.reduce(
      (acc, c) => acc + c.votosPonderados,
      0,
    );

    return {
      conteoAbierto: configuracion.conteoAbierto,
      ultimaActualizacion: new Date().toISOString(),
      vuelta: vueltaConsultada,
      vueltaActual: configuracion.vuelta,
      mesasCargadas,
      totalMesas: mesasAgg._count._all,
      totalVotosEstudiantiles,
      totalVotosDocentes,
      totalVotosPonderados,
      totalPadron: mesasAgg._sum.totalPadron ?? 0,
      candidatos: candidatosResultado,
    };
  }
}
