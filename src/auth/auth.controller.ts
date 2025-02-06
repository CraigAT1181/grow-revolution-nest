import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
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
      console.log('Received profilePic:', profilePic);
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

      const insertedUser = await this.authService.insertUser(
        authUserId,
        body.email,
        body.username,
        body.location,
        profilePicUrl,
      );

      return insertedUser;
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
      return await this.authService.signin(body.email, body.password);
    } catch (error) {
      console.error('In the controller', error);
      throw new HttpException(
        `Signin failed: ${error.message}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // Define the SIGNOUT route
  @Post('signout')
  async signout() {
    try {
      return await this.authService.signout();
    } catch (error) {
      throw new HttpException(
        `Signout failed: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Define the RESET PASSWORD route
  @Post('reset-password')
  async requestResetPassword(@Body() body: { email: string }) {
    try {
      return await this.authService.resetPassword(body.email);
    } catch (error) {
      throw new HttpException(
        'An error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
