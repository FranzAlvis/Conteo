import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'conteo-votos-api',
      timestamp: new Date().toISOString(),
    };
  }
}
