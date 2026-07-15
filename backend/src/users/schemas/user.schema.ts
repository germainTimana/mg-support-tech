import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../common/enums';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ required: true })
  documentoIdentidad: string;

  @Prop()
  telefono?: string;

  @Prop()
  direccion?: string;

  @Prop({ default: true })
  activo: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
