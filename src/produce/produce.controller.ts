import { Controller } from '@nestjs/common';
import { ProduceService } from './produce.service';

@Controller('produce')
export class ProduceController {
  // Create a constructor that uses the produceService
  constructor(private readonly produceService: ProduceService) {}
}
