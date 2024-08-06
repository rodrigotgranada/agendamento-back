import { Injectable, NotFoundException, InternalServerErrorException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { IUser } from './user.interface';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => AuthService)) private authService: AuthService
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const activeStatus = createUserDto.active ?? 'pending'; // Define active como 'pending' se não for fornecido
  
      const newUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
        active: activeStatus,
      });
  
      newUser.createdBy = newUser._id.toString();
      newUser.updatedBy = newUser._id.toString();
  
      return await newUser.save();
    } catch (error) {
      this.logger.error('Failed to create user', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }
  

  async findAll(): Promise<IUser[]> {
    try {
      const users = await this.userModel.find().exec();
      return users.map(user => this.toIUser(user));
    } catch (error) {
      this.logger.error('Failed to retrieve users', error);
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async findOne(id: string): Promise<IUser> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return this.toIUser(user);
    } catch (error) {
      this.logger.error(`Failed to retrieve user with ID: ${id}`, error);
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  async findUserDocumentById(id: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findById(id).exec();
    } catch (error) {
      this.logger.error(`Failed to find user document by ID: ${id}`, error);
      throw new InternalServerErrorException('Failed to find user document by ID');
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<IUser> {
    try {
      const existingUser = await this.userModel.findByIdAndUpdate(id, {
        ...updateUserDto,
        updatedBy: id,
        updatedAt: new Date(),
      }, { new: true }).exec();
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return this.toIUser(existingUser);
    } catch (error) {
      this.logger.error(`Failed to update user with ID: ${id}`, error);
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async deleteUser(id: string): Promise<IUser> {
    try {
      const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
      if (!deletedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return this.toIUser(deletedUser);
    } catch (error) {
      this.logger.error(`Failed to delete user with ID: ${id}`, error);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async blockUser(id: string, blocked: boolean): Promise<IUser> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      user.active = blocked ? 'blocked' : 'active';
      user.updatedAt = new Date();
      user.updatedBy = id;

      const updatedUser = await user.save();
      return this.toIUser(updatedUser);
    } catch (error) {
      this.logger.error(`Failed to block/unblock user with ID: ${id}`, error);
      throw new InternalServerErrorException('Failed to block/unblock user');
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      return user ? this.toIUser(user) : null;
    } catch (error) {
      this.logger.error('Failed to find user by email', error);
      throw new InternalServerErrorException('Failed to find user by email');
    }
  }

  async findByPhone(phone: string): Promise<IUser | null> {
    try {
      const user = await this.userModel.findOne({ phone }).exec();
      return user ? this.toIUser(user) : null;
    } catch (error) {
      this.logger.error('Failed to find user by phone', error);
      throw new InternalServerErrorException('Failed to find user by phone');
    }
  }

  async findByCpf(cpf: string): Promise<IUser | null> {
    try {
      const user = await this.userModel.findOne({ cpf }).exec();
      return user ? this.toIUser(user) : null;
    } catch (error) {
      this.logger.error('Failed to find user by CPF', error);
      throw new InternalServerErrorException('Failed to find user by CPF');
    }
  }

  async updateUserPhoto(userId: string, filePath: string): Promise<IUser> {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      user.photo = filePath;
      user.updatedAt = new Date();
      user.updatedBy = userId;

      const updatedUser = await user.save();
      return this.toIUser(updatedUser);
    } catch (error) {
      this.logger.error(`Failed to update user photo for ID: ${userId}`, error);
      throw new InternalServerErrorException('Failed to update user photo');
    }
  }

  public toIUser(user: UserDocument): IUser {
    const { _id, email, password, cpf, firstName, lastName, phone, photo, role, active, createdBy, updatedBy, createdAt, updatedAt } = user;
    return { _id: _id.toString(), email, password, cpf, firstName, lastName, phone, photo, role, active, createdBy, updatedBy, createdAt, updatedAt };
  }
}
