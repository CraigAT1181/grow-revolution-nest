import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProduceService } from './produce.service';

@Controller('produce')
export class ProduceController {
  // Create a constructor that uses the produceService
  constructor(private readonly produceService: ProduceService) {}

  @Get()
  async getAllProduce() {
    try {
      return await this.produceService.fetchAllProduce();
    } catch (error) {
      throw new HttpException(
        `Request failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
