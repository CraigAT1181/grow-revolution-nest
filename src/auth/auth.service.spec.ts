import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';

describe('AuthService', () => {
  let service: AuthService;
  let supabaseMock: jest.Mocked<SupabaseClient>;
  let configServiceMock: Partial<ConfigService>;

  beforeEach(async () => {
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            auth_user_id: 'mock-user-id',
            name: 'John Doe',
            email: 'test@example.com',
            locations: { location_name: 'London' },
          },
          error: null,
        }),
      }),
    });

    supabaseMock = {
      auth: {
        signUp: jest.fn().mockResolvedValue({
          data: { user: { id: 'mock-user-id' }, session: null },
          error: null,
        }),
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { user: { id: 'mock-user-id' } },
          session: { access_token: 'mockToken' },
          error: null,
        }),
      },
      from: jest.fn((table: string) => {
        if (table === 'users') {
          return {
            select: mockSelect,
          };
        }
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Table not mocked' },
              }),
            }),
          }),
        };
      }),
    } as unknown as jest.Mocked<SupabaseClient>;

    configServiceMock = {
      get: jest.fn((key: string) => {
        if (key === 'SUPABASE_URL') return 'https://mock.supabase.co';
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'mock-service-key';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'SUPABASE_CLIENT', useValue: supabaseMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(supabaseMock).toBeDefined();
  });

  it('should register a user', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    const result = await service.register(email, password);

    // Check that the signUp function was called with the correct email and password
    expect(supabaseMock.auth.signUp).toHaveBeenCalledWith({ email, password });
    expect(result).toEqual({
      user: { id: 'mock-user-id' },
      session: null,
    });
  });

  it('should sign a user in and return a user from the users table', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    const result = await service.signin(email, password);

    // Ensure signInUser is called correctly
    expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalledWith({
      email,
      password,
    });

    // Ensure getUserDetails is called with the correct auth_user_id
    expect(supabaseMock.from).toHaveBeenCalledWith('users');
    expect(supabaseMock.from('users').select).toHaveBeenCalledWith(
      '*, locations(location_name)',
    );
    expect(supabaseMock.from('users').select().eq).toHaveBeenCalledWith(
      'auth_user_id',
      'mock-user-id',
    );
    expect(
      supabaseMock.from('users').select().eq('auth_user_id', 'mock-user-id')
        .single,
    ).toHaveBeenCalled();

    // Validate final returned user object
    expect(result).toEqual({
      auth_user_id: 'mock-user-id',
      name: 'John Doe',
      email: 'test@example.com',
      locations: { location_name: 'London' },
    });
  });
});
