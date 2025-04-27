import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ServicesService } from '@/shared/services/services.service';
import { FirebaseService } from '@/shared/services/firebase/firebase.service';
import { StorageService } from '@/shared/services/firebase/storage.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ServicesService, FirebaseService, StorageService],
})
export class UsersModule {}
