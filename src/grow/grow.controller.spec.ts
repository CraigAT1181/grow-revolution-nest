import { Test, TestingModule } from '@nestjs/testing';
import { GrowController } from './grow.controller';
import { GrowService } from './grow.service';

describe('GrowController', () => {
  let controller: GrowController;
  let serviceMock: Partial<GrowService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrowController],
      providers: [{ provide: GrowService, useValue: serviceMock }],
    }).compile();

    controller = module.get<GrowController>(GrowController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
