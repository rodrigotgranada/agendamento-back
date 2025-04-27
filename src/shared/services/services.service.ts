import { Injectable } from '@nestjs/common';
import { FirebaseService } from './firebase/firebase.service';
import { User } from '@/types/users';

@Injectable()
export class ServicesService {
  constructor(private readonly firebaseService: FirebaseService) {}

  // async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
  //   try {
  //     const decodedToken = await this.firebaseService.verifyIdToken(idToken);
  //     return decodedToken;
  //   } catch (error) {
  //     console.error('Erro ao verificar token:', error);
  //     throw error;
  //   }
  // }

  // async createUser(userData: CreateUserDto): Promise<admin.auth.UserRecord> {
  //   try {
  //     const userRecord = await this.firebaseService.createUser(userData);
  //     return userRecord;
  //   } catch (error) {
  //     console.error('Erro ao criar usuário:', error);
  //     throw error;
  //   }
  // }

  async listAllUsers(): Promise<User[]> {
    try {
      const users = await this.firebaseService.listAllUsers();
      return users;
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw error;
    }
  }
}
