import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './user.schema';
import { RolesGuard } from '../common/guards/roles.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { CodeRegister, CodeRegisterSchema } from '../code-register/code-register.schema';
import { TwilioModule } from '../twilio/twilio.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: CodeRegister.name, schema: CodeRegisterSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    forwardRef(() => AuthModule),
    TwilioModule,
    EmailModule,
  ],
  providers: [UserService, RolesGuard],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
