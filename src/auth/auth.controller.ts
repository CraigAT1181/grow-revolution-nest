import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  // Create a constructor that uses the authService
  constructor(private readonly authService: AuthService) {}

  // Define the REGISTER route
  @Post('register')
  @UseInterceptors(FileInterceptor('profilePic'))
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      username: string;
      location: string;
    },
    @UploadedFile() profilePic: Express.Multer.File,
  ) {
    try {
      const authResponse = await this.authService.register(
        body.email,
        body.password,
      );

      const authUserId = authResponse.user.id;
      let profilePicUrl = null;

      if (profilePic) {
        profilePicUrl = await this.authService.uploadProfilePicture(
          authUserId,
          profilePic,
        );
      }

      const insertResponse = await this.authService.insertUser(
        authUserId,
        body.email,
        body.username,
        body.location,
        profilePicUrl,
      );

      return insertResponse;
    } catch (error) {
      throw new HttpException(
        `Registration failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
