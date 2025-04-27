import { Injectable } from '@nestjs/common';
import { FirebaseService } from './firebase/firebase.service';
import { User, CreateUserDto } from '@/types/users';

@Injectable()
export class ServicesService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      return await this.firebaseService.createUser(userData);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async listAllUsers(): Promise<User[]> {
    try {
      return await this.firebaseService.listAllUsers();
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      return await this.firebaseService.updateUser(userId, userData);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }
}
