import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Logger, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: any) {
    this.logger.log(`Registering user: ${JSON.stringify(createUserDto)}`);
    return this.authService.register(createUserDto);
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
