import { Test, TestingModule } from '@nestjs/testing';
import { GrowService } from './grow.service';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';

describe('ProduceService', () => {
  let service: GrowService;
  let supabaseMock: jest.Mocked<SupabaseClient>;
  let configServiceMock: Partial<ConfigService>;

  beforeEach(async () => {
    supabaseMock = {
      from: jest.fn((table: string) => {
        if (table === 'produce') {
          return {
            select: jest.fn((columns: string) => {
              if (columns === '*') {
                return {
                  eq: jest.fn((column: string, value: string) => {
                    if (column === 'produce_id') {
                      // Find the specific produce item by ID
                      const produceItem = [
                        {
                          produce_id: '1',
                          name: 'Tomato',
                          category: 'vegetable',
                        },
                        {
                          produce_id: '2',
                          name: 'Sweet Potato',
                          category: 'vegetable',
                        },
                        {
                          produce_id: '3',
                          name: 'Beetroot',
                          category: 'vegetable',
                        },
                        {
                          produce_id: '4',
                          name: 'Swede',
                          category: 'vegetable',
                        },
                      ].find((p) => p.produce_id === value);

                      return {
                        single: jest.fn().mockResolvedValue({
                          data: produceItem || null,
                          error: produceItem ? null : { message: 'Not found' },
                        }),
                      };
                    }
                    return {
                      single: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Invalid column' },
                      }),
                    };
                  }),
                  then: jest.fn((callback) =>
                    callback({
                      data: [
                        {
                          produce_id: '1',
                          name: 'Tomato',
                          category: 'vegetable',
                        },
                        {
                          produce_id: '2',
                          name: 'Sweet Potato',
                          category: 'vegetable',
                        },
                        {
                          produce_id: '3',
                          name: 'Beetroot',
                          category: 'vegetable',
                        },
                        {
                          produce_id: '4',
                          name: 'Swede',
                          category: 'vegetable',
                        },
                      ],
                      error: null,
                    }),
                  ),
                };
              }
            }),
          };
        }
        return {
          select: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'No table mocked.' },
          }),
        };
      }),
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
        GrowService,
        { provide: 'SUPABASE_CLIENT', useValue: supabaseMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    // Retrieve the service from the module
    service = module.get<GrowService>(GrowService);
  });

  // Test 1: Check if the service was created successfully
  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(supabaseMock).toBeDefined();
  });

  // Test 2: Check if the service correctly retrieves all produce
  it('should retrieve all produce information', async () => {
    const result = await service.fetchAllProduce();

    expect(result).toEqual([
      { produce_id: '1', name: 'Tomato', category: 'vegetable' },
      { produce_id: '2', name: 'Sweet Potato', category: 'vegetable' },
      { produce_id: '3', name: 'Beetroot', category: 'vegetable' },
      { produce_id: '4', name: 'Swede', category: 'vegetable' },
    ]);
  });

  // Test 3: Check if the service correctly retrieves one produce entry using a produce_id
  it('should retrieve a single produce item by ID', async () => {
    const result = await service.fetchProduceById('1');
    expect(result).toEqual({
      produce_id: '1',
      name: 'Tomato',
      category: 'vegetable',
    });
  });
});
