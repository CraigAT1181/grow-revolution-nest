import {
  Controller,
  HttpException,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import { GrowService } from './grow.service';

@Controller('grow')
export class GrowController {
  // Create a constructor that uses the produceService
  constructor(private readonly growService: GrowService) {}

  @Get('produce')
  async getAllProduce() {
    try {
      return await this.growService.fetchAllProduce();
    } catch (error) {
      throw new HttpException(
        `Request failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('produce/:produce_id')
  async getProduceById(@Param('produce_id') produceId: string) {
    try {
      return await this.growService.fetchProduceById(produceId);
    } catch (error) {
      throw new HttpException(
        `Unable to complete request: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('months')
  async fetchMonths() {
    try {
      const monthList = await this.growService.fetchMonths();

      const sortedMonthList = monthList.sort((a, b) => a.month_id - b.month_id);

      return sortedMonthList;
    } catch (error) {
      throw new HttpException(
        `Unable to fetch months: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('months/:month_id/data')
  async getAllMonthlyData(@Param('month_id') monthId: string) {
    try {
      return await this.growService.fetchMonthData(monthId);
    } catch (error) {
      throw new HttpException(
        `Unable to fetch monthly data: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
