import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ServiceStatus } from '../../common/enums';

export type ObservacionDocument = Observacion & Document;

@Schema({ _id: false })
export class Observacion {
  @Prop({ required: true, enum: ServiceStatus })
  fase: ServiceStatus;

  @Prop({ required: true })
  texto: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autorId: Types.ObjectId;

  @Prop({ default: Date.now })
  fecha: Date;
}

export const ObservacionSchema = SchemaFactory.createForClass(Observacion);

export type ServicioDocument = Servicio & Document;

@Schema({ timestamps: true })
export class Servicio {
  @Prop({ required: true, unique: true })
  codigoServicio: string;

  @Prop({ type: Types.ObjectId, ref: 'Equipo', required: true })
  equipoId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clienteId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  tecnicoId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creadoPorId: Types.ObjectId;

  @Prop({ required: true, enum: ServiceStatus, default: ServiceStatus.PENDIENTE })
  estado: ServiceStatus;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: true, min: 0 })
  costoEstimado: number;

  @Prop({ type: [ObservacionSchema], default: [] })
  observaciones: Observacion[];

  @Prop({ default: false })
  pagado: boolean;
}

export const ServicioSchema = SchemaFactory.createForClass(Servicio);

ServicioSchema.index({ codigoServicio: 1 });
ServicioSchema.index({ tecnicoId: 1, estado: 1 });
ServicioSchema.index({ clienteId: 1 });
