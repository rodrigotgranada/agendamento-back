import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Logger, Get, UseInterceptors, InternalServerErrorException, UploadedFile, BadRequestException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { CreateUserDto } from 'src/user/user.dto';
import * as fs from 'fs';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = join(__dirname, '..', '..', 'uploads');
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return cb(new BadRequestException('Invalid file type'), false);
      }
      cb(null, true);
    }
  }))
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    try {
      const user = await this.authService.register(createUserDto);

      if (file) {
        const userDir = join(__dirname, '..', '..', 'uploads', user._id.toString());
        if (!fs.existsSync(userDir)) {
          fs.mkdirSync(userDir, { recursive: true });
        }
        const filePath = join(userDir, 'profile.jpg');
        fs.renameSync(file.path, filePath);
        await this.authService.updateUserPhoto(user._id, filePath);
      }

      return user;
    } catch (error) {
      this.logger.error('Failed to register user', error.message);
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    this.logger.log(`Logging in user: ${JSON.stringify(req.user)}`);
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    this.logger.log(`Processing forgot password for email: ${email}`);
    return this.authService.forgotPassword(email);
  }

  @Post('verify-activation-code')
  async verifyActivationCode(@Body() body: { email: string; code: string }) {
    this.logger.log(`Verifying activation code for email: ${body.email}`);
    return this.authService.activateUser(body.email, body.code);
  }

  @Post('verify-reset-code')
  async verifyResetCode(@Body() body: { email: string; code: string }) {
    this.logger.log(`Verifying reset code for email: ${body.email}`);
    return this.authService.verifyResetCode(body.email, body.code);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; code: string; newPassword: string }) {
    this.logger.log(`Resetting password for email: ${body.email}`);
    return this.authService.resetPassword(body.email, body.code, body.newPassword);
  }

  @Post('regenerate-activation-code')
  async regenerateActivationCode(@Body('email') email: string) {
    this.logger.log(`Regenerating activation code for email: ${email}`);
    return this.authService.regenerateActivationCode(email);
  }
}
