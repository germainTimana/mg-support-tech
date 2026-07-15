import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiciosService } from './servicios.service';
import { ServiciosController, PedidosController } from './servicios.controller';
import { Servicio, ServicioSchema } from './schemas/servicio.schema';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Servicio.name, schema: ServicioSchema }]),
    EventsModule,
  ],
  controllers: [ServiciosController, PedidosController],
  providers: [ServiciosService],
  exports: [ServiciosService],
})
export class ServiciosModule {}
