import { Injectable } from '@nestjs/common';
import { Configuracion } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

const CONFIG_ID = 1;

@Injectable()
export class ConfiguracionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /** La configuración es una fila única (id=1); se crea con valores por defecto si aún no existe. */
  async getOrCreate(): Promise<Configuracion> {
    return this.prisma.configuracion.upsert({
      where: { id: CONFIG_ID },
      update: {},
      create: { id: CONFIG_ID, conteoAbierto: true },
    });
  }

  async setConteoAbierto(conteoAbierto: boolean): Promise<Configuracion> {
    const config = await this.prisma.configuracion.upsert({
      where: { id: CONFIG_ID },
      update: { conteoAbierto },
      create: { id: CONFIG_ID, conteoAbierto },
    });
    this.eventsGateway.notificarEstadoConteo(config.conteoAbierto);
    return config;
  }
}
