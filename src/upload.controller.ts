import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseClient } from '@supabase/supabase-js';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
  constructor(private readonly supabase: SupabaseClient) {}

  // Single file upload
  @Post('single')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './temp', // Temporarily store files locally
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body() authUserId: string,
  ) {
    if (!file || !authUserId)
      throw new HttpException(
        'File or user ID not found',
        HttpStatus.BAD_REQUEST,
      );

    const filename = `${authUserId}/${Date.now()}_${file.originalname}`;

    try {
      // Upload to Supabase bucket
      const { data, error } = await this.supabase.storage
        .from('profile-pictures')
        .upload(filename, file.path, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error)
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      const { data: publicUrlData } = this.supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filename);

      return {
        message: 'File uploaded successfully.',
        publicUrl: publicUrlData?.publicUrl || null,
      };
    } catch (error) {
      throw new HttpException(
        `Upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
