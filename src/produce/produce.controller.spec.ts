import { Test, TestingModule } from '@nestjs/testing';
import { ProduceController } from './produce.controller';
import { ProduceService } from './produce.service';

describe('ProduceController', () => {
  let controller: ProduceController;
  let serviceMock: Partial<ProduceService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProduceController],
      providers: [{ provide: ProduceService, useValue: serviceMock }],
    }).compile();

    controller = module.get<ProduceController>(ProduceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
