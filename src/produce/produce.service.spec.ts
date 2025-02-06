import { Test, TestingModule } from '@nestjs/testing';
import { ProduceService } from './produce.service';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';

describe('ProduceService', () => {
  let service: ProduceService;
  let supabaseMock: jest.Mocked<SupabaseClient>;
  let configServiceMock: Partial<ConfigService>;

  beforeEach(async () => {
    // Creating the mocked supabase client, mocking each function to return 'this'
    supabaseMock = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    } as unknown as jest.Mocked<SupabaseClient>;

    // Mock ConfigService
    configServiceMock = {
      get: jest.fn((key: string) => {
        if (key === 'SUPABASE_URL') return 'https://mock.supabase.co';
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'mock-service-key';
        return null;
      }),
    };

    // Set up a testing module, using the mocked versions of configService and supabaseClient
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProduceService,
        { provide: 'SUPABASE_CLIENT', useValue: supabaseMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    // Retrieve the service from the module
    service = module.get<ProduceService>(ProduceService);
  });

  // Test 1: Check if the service was created successfully
  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(supabaseMock).toBeDefined();
  });
});
