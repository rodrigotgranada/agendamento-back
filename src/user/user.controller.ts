import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Logger, Req, ForbiddenException, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @Post('admin/create')
  async createUserByAdmin(@GetUser() user: any, @Body() createUserDto: CreateUserDto) {
    if (user.role === 'admin' && createUserDto.role !== 'user') {
      throw new ForbiddenException('Admins can only create users with role "user"');
    }
    const createdUser = await this.userService.createUser(createUserDto);
    if (createUserDto.active === 'pending') {
      await this.authService.sendActivationCode(createdUser);
    }
    return createdUser;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@GetUser() user: any) {
    return this.userService.findOne(user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(@GetUser() user: any, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(user.userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @Put(':id')
  async updateUserByAdmin(@Param('id') id: string, @GetUser() user: any, @Body() updateUserDto: UpdateUserDto) {
    if (user.role === 'admin' && updateUserDto.role && updateUserDto.role !== 'user') {
      throw new ForbiddenException('Admins can only update users to role "user"');
    }
    return this.userService.updateUser(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @Patch(':id/block')
  async blockUser(@Param('id') id: string) {
    return this.userService.blockUser(id, true);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @Patch(':id/unblock')
  async unblockUser(@Param('id') id: string) {
    return this.userService.blockUser(id, false);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin', 'owner')
  @Patch(':id/photo')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File // Usando Express.Multer.File aqui
  ) {
    const filePath = `/uploads/${id}/profile.jpg`;
    return await this.userService.updateUserPhoto(id, filePath);
  }
}
