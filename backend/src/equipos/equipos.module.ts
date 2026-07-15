import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EquiposService } from './equipos.service';
import { EquiposController } from './equipos.controller';
import { PlatosController } from './platos.controller';
import { Equipo, EquipoSchema } from './schemas/equipo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Equipo.name, schema: EquipoSchema }]),
  ],
  controllers: [EquiposController, PlatosController],
  providers: [EquiposService],
  exports: [EquiposService],
})
export class EquiposModule {}
