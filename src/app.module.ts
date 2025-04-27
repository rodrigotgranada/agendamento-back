import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { ServicesModule } from './shared/services/services.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServicesModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
