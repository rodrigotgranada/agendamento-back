import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { CreateUserDTO } from '../../interface-adapters/dtos/CreateUserDTO';
import { hash } from 'bcryptjs';

export class CreateUserUseCase {
    constructor(private userRepository: IUserRepository) {}
  
    async execute(data: CreateUserDTO): Promise<User> {
      // Verifique se o email ou CPF já existem
      const existingUserByEmail = await this.userRepository.findUserByEmail(data.email);
      if (existingUserByEmail) {
        throw new Error('Email already in use');
      }
  
      const existingUserByCPF = await this.userRepository.findUserByCPF(data.cpf);
      if (existingUserByCPF) {
        throw new Error('CPF already in use');
      }
  
      // Hash da senha
      const hashedPassword = await hash(data.password, 8);
  
      // Crie o novo usuário
      const user = new User(
        '', // ID gerado pelo banco
        data.firstName,
        data.lastName,
        data.cpf,
        data.phone,
        data.email,
        hashedPassword,
        data.role || 'user',
        'pending', // Status inicial
        new Date(),
        new Date()
      );
  
      // Salve o usuário no repositório
      const createdUser = await this.userRepository.createUser(user);
  
      return createdUser;
    }
  }
