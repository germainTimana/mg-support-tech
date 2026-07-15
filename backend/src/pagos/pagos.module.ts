import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { Pago, PagoSchema } from './schemas/pago.schema';
import { ServiciosModule } from '../servicios/servicios.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pago.name, schema: PagoSchema }]),
    forwardRef(() => ServiciosModule),
  ],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule {}
