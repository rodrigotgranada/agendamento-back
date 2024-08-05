import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { IUser } from '../user/user.interface'; 
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from '../twilio/twilio.service';
import { EmailService } from '../email/email.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CodeRegister, CodeRegisterDocument } from '../code-register/code-register.schema';
import { ResetCode, ResetCodeDocument } from '../reset-code/reset-code.schema';
import { UserDocument } from '../user/user.schema'; 

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private twilioService: TwilioService,
    private emailService: EmailService,
    @InjectModel(CodeRegister.name) private codeRegisterModel: Model<CodeRegisterDocument>,
    @InjectModel(ResetCode.name) private resetCodeModel: Model<ResetCodeDocument>
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    try {
      const user = await this.userService.findByEmail(email);
      this.logger.log(`User found: ${JSON.stringify(user)}`);
      if (user && await bcrypt.compare(pass, user.password)) {
        const { password, ...result } = user;
        this.logger.log(`Password match: ${JSON.stringify(result)}`);
        return result;
      } else {
        this.logger.warn('Invalid credentials');
      }
      return null;
    } catch (error) {
      this.logger.error('Failed to validate user', error);
      throw new InternalServerErrorException('Failed to validate user');
    }
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: any) {
    const { email, phone, cpf } = createUserDto;

    try {
      // Verificar se o email já existe
      const emailExists = await this.userService.findByEmail(email);
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }

      // Verificar se o phone já existe
      const phoneExists = await this.userService.findByPhone(phone);
      if (phoneExists) {
        throw new ConflictException('Phone already exists');
      }

      // Verificar se o cpf já existe
      const cpfExists = await this.userService.findByCpf(cpf);
      if (cpfExists) {
        throw new ConflictException('CPF already exists');
      }

      createUserDto.role = 'user'; // Definir o role como 'user' por padrão
      const user = await this.userService.createUser(createUserDto) as unknown as UserDocument; // Forçar o tipo para UserDocument

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeRegister = new this.codeRegisterModel({ userId: user._id, code });
      await codeRegister.save();

      this.logger.log(`Activation code generated: ${code}`);

      try {
        await this.twilioService.sendSms(user.phone, `Your activation code is ${code}`);
        this.logger.log(`SMS sent to: ${user.phone}`);
      } catch (error) {
        this.logger.error('Failed to send SMS', error.message);
      }

      try {
        await this.emailService.sendVerificationEmail(user.email, code);
        this.logger.log(`Email sent to: ${user.email}`);
      } catch (error) {
        this.logger.error('Failed to send email', error.message);
      }

      return this.userService.toIUser(user);
    } catch (error) {
      this.logger.error('Failed to register user', error);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async activateUser(email: string, code: string): Promise<IUser> {
    this.logger.log(`Activating user with email: ${email} and code: ${code}`);

    const user = await this.userService.findByEmail(email);
    if (!user) {
      this.logger.warn(`User not found with email: ${email}`);
      throw new NotFoundException('User not found');
    }

    const codeRegister = await this.codeRegisterModel.findOne({ userId: user._id, code }).exec();
    if (!codeRegister) {
      this.logger.warn(`Invalid activation code for user ID: ${user._id}`);
      throw new UnauthorizedException('Invalid activation code');
    }

    const userDocument = await this.userService.findUserDocumentById(user._id.toString());
    if (!userDocument) {
      this.logger.warn(`User document not found for user ID: ${user._id}`);
      throw new NotFoundException('User document not found');
    }

    userDocument.active = 'active';
    userDocument.updatedAt = new Date();
    userDocument.updatedBy = user._id.toString();

    await userDocument.save();
    await this.codeRegisterModel.deleteOne({ _id: codeRegister._id }).exec();

    this.logger.log(`User activated successfully: ${email}`);
    return this.userService.toIUser(userDocument);
  }

  async regenerateActivationCode(email: string): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      this.logger.warn(`User not found with email: ${email}`);
      throw new NotFoundException('User not found');
    }

    if (user.active !== 'pending') {
      this.logger.warn(`User is not in pending state: ${email}`);
      throw new ConflictException('User is not in a pending state');
    }

    // Excluir códigos de ativação anteriores, se existirem
    await this.codeRegisterModel.deleteMany({ userId: user._id }).exec();

    // Gerar novo código de ativação
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeRegister = new this.codeRegisterModel({ userId: user._id, code });
    await codeRegister.save();

    this.logger.log(`New activation code generated: ${code}`);

    try {
      await this.twilioService.sendSms(user.phone, `Your new activation code is ${code}`);
      this.logger.log(`SMS sent to: ${user.phone}`);
    } catch (error) {
      this.logger.error('Failed to send SMS', error.message);
    }

    try {
      await this.emailService.sendVerificationEmail(user.email, code);
      this.logger.log(`Email sent to: ${user.email}`);
    } catch (error) {
      this.logger.error('Failed to send email', error.message);
    }

    return { message: 'A new activation code has been generated and sent to your email and phone' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      this.logger.warn(`User not found with email: ${email}`);
      throw new NotFoundException('Email not found');
    }

    // Excluir códigos de redefinição anteriores, se existirem
    await this.resetCodeModel.deleteMany({ userId: user._id }).exec();

    // Gerar novo código de redefinição
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeEntry = new this.resetCodeModel({ userId: user._id, code: resetCode });
    await resetCodeEntry.save();

    this.logger.log(`Reset code generated: ${resetCode}`);

    try {
      await this.twilioService.sendSms(user.phone, `Your password reset code is ${resetCode}`);
      this.logger.log(`SMS sent to: ${user.phone}`);
    } catch (error) {
      this.logger.error('Failed to send SMS', error.message);
    }

    try {
      await this.emailService.sendVerificationEmail(user.email, resetCode);
      this.logger.log(`Email sent to: ${user.email}`);
    } catch (error) {
      this.logger.error('Failed to send email', error.message);
    }

    return { message: 'A password reset code has been sent to your email and phone' };
  }

  async verifyResetCode(email: string, code: string): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      this.logger.warn(`User not found with email: ${email}`);
      throw new NotFoundException('User not found');
    }

    const resetCodeEntry = await this.resetCodeModel.findOne({ userId: user._id, code }).exec();
    if (!resetCodeEntry) {
      this.logger.warn(`Invalid reset code for user ID: ${user._id}`);
      throw new UnauthorizedException('Invalid reset code');
    }

    return { message: 'Reset code is valid' };
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      this.logger.warn(`User not found with email: ${email}`);
      throw new NotFoundException('User not found');
    }

    const resetCodeEntry = await this.resetCodeModel.findOne({ userId: user._id, code }).exec();
    if (!resetCodeEntry) {
      this.logger.warn(`Invalid reset code for user ID: ${user._id}`);
      throw new UnauthorizedException('Invalid reset code');
    }

    const userDocument = await this.userService.findUserDocumentById(user._id.toString());
    if (!userDocument) {
      this.logger.warn(`User document not found for user ID: ${user._id}`);
      throw new NotFoundException('User document not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    userDocument.password = hashedPassword;
    userDocument.updatedAt = new Date();
    userDocument.updatedBy = user._id.toString();

    await userDocument.save();
    await this.resetCodeModel.deleteOne({ _id: resetCodeEntry._id }).exec();

    this.logger.log(`Password reset successfully for user: ${email}`);
    return { message: 'Password has been reset successfully' };
  }
}
