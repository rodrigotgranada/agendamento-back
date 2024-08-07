import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';

export class UserController {
  private createUserUseCase: CreateUserUseCase;

  constructor() {
    const userRepository = new UserRepository();
    this.createUserUseCase = new CreateUserUseCase(userRepository);
  }

  async createUser(req: Request, res: Response): Promise<Response> {
    const { firstName, lastName, cpf, phone, email, password, role } = req.body;

    try {
      const user = await this.createUserUseCase.execute({ firstName, lastName, cpf, phone, email, password, role });
      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}
