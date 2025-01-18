import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  // Create a constructor that uses the authService
  constructor(private readonly authService: AuthService) {}

  // Define the REGISTER route
  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  // Define the LOGIN route
  @Post('signin')
  async signin(@Body() body: { email: string; password: string }) {
    try {
      return this.authService.signin(body.email, body.password);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  // Define the SIGNOUT route
  @Post('signout')
  async signout() {
    try {
      return this.authService.signout();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
