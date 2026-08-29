import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Role } from '@prisma/client';
import { MesaResponseDto } from '../mesas/dto/mesa-response.dto';
import { ResumenVotosDto } from '../resultados/dto/resumen-votos.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 Cliente conectado: ${client.id}`);
    // Unir por defecto al room global 'todos'
    client.join('todos');
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('unirseRoomRol')
  handleJoinRoleRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { role: Role },
  ) {
    if (payload.role === 'ADMIN' || payload.role === 'TRANSCRIPTOR') {
      client.join('admin_transcriptor');
      console.log(`🔒 Cliente ${client.id} unido a room: admin_transcriptor`);
    }
  }

  // Notificación de estado de mesa (Solo al room admin_transcriptor)
  notificarMesaActualizada(mesaData: MesaResponseDto) {
    this.server.to('admin_transcriptor').emit('mesaActualizada', mesaData);
  }

  // Notificación global de resumen de votos (A todos los conectados, incl. Visor)
  notificarResumenVotos(resumenData: ResumenVotosDto) {
    this.server.to('todos').emit('resumenVotosActualizado', resumenData);
  }

  // Notificación global de apertura/cierre de conteo (A todos)
  notificarEstadoConteo(abierto: boolean) {
    this.server.to('todos').emit('conteoEstadoCambiado', { abierto });
  }

  // Notificación global de puesta en 0 del sistema (A todos, para refrescar toda la caché local)
  notificarSistemaReseteado() {
    this.server.to('todos').emit('sistemaReseteado');
  }

  // Notificación global de avance a una nueva vuelta electoral (A todos, para refrescar toda la caché local)
  notificarVueltaAvanzada(vuelta: number) {
    this.server.to('todos').emit('vueltaAvanzada', { vuelta });
  }
}
