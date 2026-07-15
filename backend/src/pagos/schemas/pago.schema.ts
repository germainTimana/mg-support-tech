import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentMethod, PaymentStatus } from '../../common/enums';

export type PagoDocument = Pago & Document;

@Schema({ timestamps: true })
export class Pago {
  @Prop({ type: Types.ObjectId, ref: 'Servicio', required: true })
  servicioId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clienteId: Types.ObjectId;

  @Prop({ required: true, enum: PaymentMethod })
  metodo: PaymentMethod;

  @Prop({ required: true, min: 0 })
  monto: number;

  @Prop({ required: true })
  referencia: string;

  @Prop()
  telefonoOrigen?: string;

  @Prop()
  nombreTitular?: string;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.COMPLETADO })
  estado: PaymentStatus;

  @Prop()
  notas?: string;
}

export const PagoSchema = SchemaFactory.createForClass(Pago);
