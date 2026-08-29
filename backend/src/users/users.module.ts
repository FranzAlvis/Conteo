import { Module } from '@nestjs/common';
import { ControlCalidadModule } from '../control-calidad/control-calidad.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [ControlCalidadModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
