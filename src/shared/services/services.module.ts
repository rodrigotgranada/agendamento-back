import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { FirebaseModule } from './firebase/firebase.module';
import { FirebaseController } from './firebase/firebase.controller';

@Module({
  imports: [FirebaseModule],
  providers: [ServicesService],
  controllers: [FirebaseController],
  exports: [ServicesService],
})
export class ServicesModule {}
