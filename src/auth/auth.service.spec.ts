import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';

describe('AuthService', () => {
  let service: AuthService;
  let supabaseMock: jest.Mocked<SupabaseClient>;
  let configServiceMock: Partial<ConfigService>;

  beforeEach(async () => {
    supabaseMock = {
      auth: {
        signUp: jest.fn().mockResolvedValue({
          data: { user: { id: 'mock-user-id' }, session: null },
          error: null,
        }),
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { user: { id: 'mock-user-id' } },
          session: { access_token: 'mockToken' },
        }),
        signOut: jest
          .fn()
          .mockResolvedValue({ message: 'Signed out successfully' }),
        resetPasswordForEmail: jest
          .fn()
          .mockResolvedValue({ message: 'Password reset email sent.' }),
      },
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
          getPublicUrl: jest.fn().mockResolvedValue({
            data: { publicUrl: 'https://supabase.com/public/profile.jpg' },
          }),
        }),
      },
      from: jest.fn().mockReturnValue({
        insert: jest
          .fn()
          .mockResolvedValue({ data: { id: '456' }, error: null }),
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({
            data: { location_id: 'mock-location-id' },
            error: null,
          }),
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
});
