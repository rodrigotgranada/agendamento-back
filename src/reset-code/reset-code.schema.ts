import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ResetCodeDocument = ResetCode & Document;

@Schema()
export class ResetCode {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  code: string;

  @Prop({ default: Date.now, expires: '1h' })  // Expira em 1 hora
  createdAt: Date;
}

export const ResetCodeSchema = SchemaFactory.createForClass(ResetCode);
