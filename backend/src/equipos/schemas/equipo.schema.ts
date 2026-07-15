import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EquipoDocument = Equipo & Document;

@Schema({ timestamps: true })
export class Equipo {
  @Prop({ required: true })
  marca: string;

  @Prop({ required: true })
  modelo: string;

  @Prop()
  serial?: string;

  @Prop({ required: true })
  descripcionProblema: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clienteId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recibidoPorId: Types.ObjectId;

  @Prop()
  accesorios?: string;

  @Prop({ default: true })
  activo: boolean;
}

export const EquipoSchema = SchemaFactory.createForClass(Equipo);
