import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { IUser } from './user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(createUserDto: CreateUserDto): Promise<IUser> {
    try {
      this.logger.log('Creating user with data:', createUserDto);
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
        active: 'pending',
      });

      newUser.createdBy = newUser._id.toString();
      newUser.updatedBy = newUser._id.toString();

      const createdUser = await newUser.save();

      this.logger.log(`User created: ${createdUser.email}`);
      return this.toIUser(createdUser);
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
      this.logger.log(`Retrieving user with ID: ${id}`);
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      this.logger.log(`User retrieved: ${user.email}`);
      return this.toIUser(user);
    } catch (error) {
      this.logger.error(`Failed to retrieve user with ID: ${id}`, error);
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  async findUserDocumentById(id: string): Promise<UserDocument | null> {
    try {
      this.logger.log(`Finding user document with ID: ${id}`);
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
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      this.logger.log(`User updated: ${existingUser.email}`);
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
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      this.logger.log(`User deleted: ${deletedUser.email}`);
      return this.toIUser(deletedUser);
    } catch (error) {
      this.logger.error(`Failed to delete user with ID: ${id}`, error);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      this.logger.log(`Find by email: ${email} - Result: ${user}`);
      return user ? this.toIUser(user) : null;
    } catch (error) {
      this.logger.error('Failed to find user by email', error);
      throw new InternalServerErrorException('Failed to find user by email');
    }
  }

  async findByPhone(phone: string): Promise<IUser | null> {
    try {
      const user = await this.userModel.findOne({ phone }).exec();
      this.logger.log(`Find by phone: ${phone} - Result: ${user}`);
      return user ? this.toIUser(user) : null;
    } catch (error) {
      this.logger.error('Failed to find user by phone', error);
      throw new InternalServerErrorException('Failed to find user by phone');
    }
  }

  async findByCpf(cpf: string): Promise<IUser | null> {
    try {
      const user = await this.userModel.findOne({ cpf }).exec();
      this.logger.log(`Find by CPF: ${cpf} - Result: ${user}`);
      return user ? this.toIUser(user) : null;
    } catch (error) {
      this.logger.error('Failed to find user by CPF', error);
      throw new InternalServerErrorException('Failed to find user by CPF');
    }
  }

  public toIUser(user: UserDocument): IUser {
    const { _id, email, password, cpf, firstName, lastName, phone, photo, role, active, createdBy, updatedBy, createdAt, updatedAt } = user;
    return { _id: _id.toString(), email, password, cpf, firstName, lastName, phone, photo, role, active, createdBy, updatedBy, createdAt, updatedAt };
  }
}
