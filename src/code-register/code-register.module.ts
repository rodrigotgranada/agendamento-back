import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CodeRegister, CodeRegisterSchema } from './code-register.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CodeRegister.name, schema: CodeRegisterSchema }])
  ],
  exports: [MongooseModule]
})
export class CodeRegisterModule {}
