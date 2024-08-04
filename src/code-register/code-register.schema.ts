import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CodeRegisterDocument = CodeRegister & Document;

@Schema()
export class CodeRegister {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  code: string;

  @Prop({ default: Date.now, expires: '1h' })  // Expira em 1 hora
  createdAt: Date;
}

export const CodeRegisterSchema = SchemaFactory.createForClass(CodeRegister);
