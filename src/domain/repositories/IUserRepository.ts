import { User } from '../entities/User';

export interface IUserRepository {
  createUser(user: User): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByCPF(cpf: string): Promise<User | null>;
  // Outras funções necessárias
}
