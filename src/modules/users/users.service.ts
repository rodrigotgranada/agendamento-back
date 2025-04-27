import { Injectable } from '@nestjs/common';
import { ServicesService as IServicesService } from '@/shared/services/services.service';
import { User } from '@/types/users';

@Injectable()
export class UsersService {
  constructor(private readonly servicesService: IServicesService) {}

  async listAllUsers(): Promise<User[]> {
    try {
      const users = await this.servicesService.listAllUsers();
      return users;
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw error;
    }
  }
}
