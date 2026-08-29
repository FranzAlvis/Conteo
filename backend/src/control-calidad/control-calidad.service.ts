import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConfiguracionService } from '../configuracion/configuracion.service';

@Injectable()
export class ControlCalidadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configuracionService: ConfiguracionService,
  ) {}

  /**
   * Reparte las mesas entre los usuarios CONTROL_CALIDAD activos: las mesas ya
   * decididas (aprobadas o rechazadas) por alguien que sigue activo quedan
   * fijas a esa persona; todo lo demás (sin dueño, dueño inactivo, o pendiente
   * sin decisión) se reparte de forma pareja entre los activos, priorizando en
   * cada paso a quien tenga menos mesas en ese momento.
   */
  async redistribuir(): Promise<void> {
    const activos = await this.prisma.user.findMany({
      where: { role: 'CONTROL_CALIDAD', isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    if (activos.length === 0) {
      await this.prisma.mesa.updateMany({
        data: { controlCalidadId: null },
      });
      return;
    }

    const { vuelta } = await this.configuracionService.getOrCreate();
    const mesas = await this.prisma.mesa.findMany({
      orderBy: { codigo: 'asc' },
      select: {
        id: true,
        controlCalidadId: true,
        revisiones: {
          where: { vuelta },
          select: { revisadoPorId: true },
        },
      },
    });

    const activosIds = new Set(activos.map((u) => u.id));
    const conteo = new Map<string, number>(activos.map((u) => [u.id, 0]));
    const pool: string[] = [];

    for (const mesa of mesas) {
      const revisadoPorId = mesa.revisiones[0]?.revisadoPorId ?? null;
      const fija =
        mesa.controlCalidadId != null &&
        activosIds.has(mesa.controlCalidadId) &&
        revisadoPorId != null;

      if (fija) {
        conteo.set(
          mesa.controlCalidadId as string,
          (conteo.get(mesa.controlCalidadId as string) ?? 0) + 1,
        );
      } else {
        pool.push(mesa.id);
      }
    }

    const nuevaAsignacion = new Map<string, string>();
    for (const mesaId of pool) {
      let destino = activos[0];
      for (const u of activos) {
        if ((conteo.get(u.id) ?? 0) < (conteo.get(destino.id) ?? 0)) {
          destino = u;
        }
      }
      conteo.set(destino.id, (conteo.get(destino.id) ?? 0) + 1);
      nuevaAsignacion.set(mesaId, destino.id);
    }

    if (nuevaAsignacion.size === 0) return;

    await this.prisma.$transaction(
      Array.from(nuevaAsignacion.entries()).map(([mesaId, controlCalidadId]) =>
        this.prisma.mesa.update({
          where: { id: mesaId },
          data: { controlCalidadId },
        }),
      ),
    );
  }
}
