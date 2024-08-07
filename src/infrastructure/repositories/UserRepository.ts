import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { IUserDocument, UserModel } from '../models/UserModel';

export class UserRepository implements IUserRepository {
  async createUser(user: User): Promise<User> {
    const createdUser = await UserModel.create(user);
    return this.toDomain(createdUser);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? this.toDomain(user) : null;
  }

  async findUserByCPF(cpf: string): Promise<User | null> {
    const user = await UserModel.findOne({ cpf });
    return user ? this.toDomain(user) : null;
  }

  private toDomain(userDocument: IUserDocument): User {
    return new User(
      userDocument._id.toString(),
      userDocument.firstName,
      userDocument.lastName,
      userDocument.cpf,
      userDocument.phone,
      userDocument.email,
      userDocument.password,
      userDocument.role,
      userDocument.isActive,
      userDocument.createdAt,
      userDocument.updatedAt
    );
  }
}
