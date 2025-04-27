import { Injectable, BadRequestException } from '@nestjs/common';
import { ServicesService } from '@/shared/services/services.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@/types/users';
import { StorageService } from '@/shared/services/firebase/storage.service';

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
  ): Promise<User> {
    const { exists, message } = await this.checkUserExists(createUserDto);
    if (exists) {
      throw new BadRequestException(message);
    }

    // Primeiro cria o usuário sem foto
    const user = await this.servicesService.createUser(createUserDto);

    // Se houver arquivo, faz o upload e atualiza o usuário
    if (file) {
      const filePath = `profile_pictures/${user.id}/picture.png`;
      const photoUrl = await this.storageService.uploadFile(
        file.buffer,
        filePath,
        file.mimetype,
      );

      // Atualiza o usuário com a URL da foto e o createdBy
      return this.servicesService.updateUser(user.id, {
        photoUrl,
        createdBy: user.id,
        updatedBy: user.id,
      });
    }

    // Se não houver arquivo, apenas atualiza o createdBy
    return this.servicesService.updateUser(user.id, {
      createdBy: user.id,
      updatedBy: user.id,
    });
  }

  async listAllUsers(): Promise<User[]> {
    return this.servicesService.listAllUsers();
  }

  async findUserById(userId: string): Promise<User> {
    const users = await this.servicesService.listAllUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
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
}
