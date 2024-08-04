import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TwilioModule } from './twilio/twilio.module';
import { CodeRegisterModule } from './code-register/code-register.module';
import { EmailModule } from './email/email.module';
import { LogRequestMiddleware } from './common/middleware/log-request.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/sports-scheduling'),
    AuthModule,
    UserModule,
    TwilioModule,
    CodeRegisterModule,
    EmailModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LogRequestMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
