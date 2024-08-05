import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CodeRegisterModule } from './code-register/code-register.module';
import { EmailModule } from './email/email.module';
import { TwilioModule } from './twilio/twilio.module';
import { LogRequestMiddleware } from './common/middleware/log-request.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sports-scheduling'),
    AuthModule,
    UserModule,
    CodeRegisterModule,
    EmailModule,
    TwilioModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LogRequestMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
