import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FacultadesModule } from './facultades/facultades.module';
import { MesasModule } from './mesas/mesas.module';
import { DelegadosModule } from './delegados/delegados.module';
import { CandidatosModule } from './candidatos/candidatos.module';
import { VotosModule } from './votos/votos.module';
import { ActasModule } from './actas/actas.module';
import { ResultadosModule } from './resultados/resultados.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AsignacionesModule } from './asignaciones/asignaciones.module';
import { ConfiguracionModule } from './configuracion/configuracion.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), process.env.UPLOADS_DIR || 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    EventsModule,
    AuthModule,
    UsersModule,
    FacultadesModule,
    MesasModule,
    DelegadosModule,
    CandidatosModule,
    VotosModule,
    ActasModule,
    ResultadosModule,
    DashboardModule,
    AsignacionesModule,
    ConfiguracionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
