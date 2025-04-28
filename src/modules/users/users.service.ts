import { Injectable, BadRequestException } from '@nestjs/common';
import { ServicesService } from '@/shared/services/services.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserStatus } from '@/types/users';
import { StorageService } from '@/shared/services/firebase/storage.service';
import * as bcrypt from 'bcrypt';

interface MulterFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly storageService: StorageService,
  ) {}

  private async checkUserExists(
    userData: CreateUserDto,
  ): Promise<{ exists: boolean; message: string }> {
    const users = await this.servicesService.listAllUsers();

    const existingUser = users.find(
      (user) =>
        user.email === userData.email ||
        (userData.cpf && user.cpf === userData.cpf) ||
        (userData.phone && user.phone === userData.phone),
    );

    if (existingUser) {
      if (existingUser.email === userData.email) {
        return { exists: true, message: 'Email já cadastrado' };
      }
      if (existingUser.cpf === userData.cpf) {
        return { exists: true, message: 'CPF já cadastrado' };
      }
      if (existingUser.phone === userData.phone) {
        return { exists: true, message: 'Telefone já cadastrado' };
      }
    }

    return { exists: false, message: '' };
  }

  async createUser(
    createUserDto: CreateUserDto,
    file?: MulterFile,
  ): Promise<{
    statusCode: number;
    success: boolean;
    message: string;
    error: null;
    data: User;
  }> {
    const { exists, message } = await this.checkUserExists(createUserDto);
    if (exists) {
      throw new BadRequestException(message);
    }

    // Criptografa a senha antes de enviar para o serviço
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const userDataWithHashedPassword = {
      ...createUserDto,
      password: hashedPassword,
      status: UserStatus.PENDING,
    };

    // Primeiro cria o usuário sem foto
    const user = await this.servicesService.createUser(
      userDataWithHashedPassword,
    );

    let updatedUser: User;

    // Se houver arquivo, faz o upload e atualiza o usuário
    if (file) {
      const filePath = `profile_pictures/${user.id}/picture.png`;
      const photoUrl = await this.storageService.uploadFile(
        file.buffer,
        filePath,
        file.mimetype,
      );

      // Atualiza o usuário com a URL da foto e o createdBy
      updatedUser = await this.servicesService.updateUser(user.id, {
        photoUrl,
        createdBy: user.id,
        updatedBy: user.id,
      });
    } else {
      // Se não houver arquivo, apenas atualiza o createdBy
      updatedUser = await this.servicesService.updateUser(user.id, {
        createdBy: user.id,
        updatedBy: user.id,
      });
    }

    return {
      statusCode: 201,
      success: true,
      message: 'Usuário criado com sucesso',
      error: null,
      data: updatedUser,
    };
  }

  async listAllUsers(): Promise<User[]> {
    return this.servicesService.listAllUsers();
  }

  async findUserById(userId: string): Promise<User> {
    console.log('SERVICE - FIND USER BY ID:', userId);
    const users = await this.servicesService.listAllUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      console.log('SERVICE - USER NOT FOUND');
      throw new BadRequestException('Usuário não encontrado');
    }
    return user;
  }

  async updateUser(
    userId: string,
    userData: Partial<User>,
    file?: MulterFile,
  ): Promise<User> {
    // Verifica se o usuário existe
    await this.findUserById(userId);
    console.log('EDIT FILE', file);
    if (file) {
      const filePath = `profile_pictures/${userId}/picture.png`;
      const photoUrl = await this.storageService.uploadFile(
        file.buffer,
        filePath,
        file.mimetype,
      );
      return this.servicesService.updateUser(userId, { ...userData, photoUrl });
    }
    return this.servicesService.updateUser(userId, userData);
  }

  async removeUserPhoto(
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verifica se o usuário existe
      const user = await this.findUserById(userId);

      // Se o usuário tiver uma foto, remove do storage
      if (user.photoUrl) {
        const filePath = `profile_pictures/${userId}/picture.png`;
        await this.storageService.deleteFile(filePath);

        // Atualiza o usuário removendo a URL da foto
        await this.servicesService.updateUser(userId, {
          photoUrl: null,
          updatedBy: userId,
        });

        return { success: true, message: 'Foto removida com sucesso' };
      }

      return { success: false, message: 'Usuário não possui foto' };
    } catch (error) {
      return {
        success: false,
        message: `Erro ao remover foto: ${error}`,
      };
    }
  }

  async searchUsers(term: string): Promise<User[]> {
    const users = await this.servicesService.listAllUsers();

    const filteredUsers = users.filter(
      (user) =>
        user.email.toLowerCase().includes(term.toLowerCase()) ||
        (user.cpf && user.cpf.includes(term)) ||
        (user.phone && user.phone.includes(term)) ||
        user.name.toLowerCase().includes(term.toLowerCase()) ||
        user.lastName.toLowerCase().includes(term.toLowerCase()),
    );

    return filteredUsers;
  }
}
