import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { User } from '@/types/users';
import { CreateUserDto } from './dto/create-user.dto';

interface MulterFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileInterceptor('photo'))
  async registerUser(
    @Body() userData: CreateUserDto,
    @UploadedFile() file?: MulterFile,
  ): Promise<User> {
    return this.usersService.createUser(userData, file);
  }

  @Get()
  async listAllUsers(): Promise<User[]> {
    return this.usersService.listAllUsers();
  }

  @Get(':id')
  async findUserById(@Param('id') id: string): Promise<User> {
    return this.usersService.findUserById(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('photo'))
  async updateUser(
    @Param('id') id: string,
    @Body() userData: Partial<User>,
    @UploadedFile() file?: MulterFile,
  ): Promise<User> {
    return this.usersService.updateUser(id, userData, file);
  }

  @Delete(':id/photo')
  async removeUserPhoto(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.usersService.removeUserPhoto(id);
  }
}
