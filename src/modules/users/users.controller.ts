import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@/types/users';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async listAllUsers(): Promise<User[]> {
    return this.usersService.listAllUsers();
  }
}
