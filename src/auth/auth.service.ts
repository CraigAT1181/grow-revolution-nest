import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthApiError,
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  // Instantiate the SupabaseClient
  private supabase: SupabaseClient;

  // Access credentials centrally using ConfigService and pass into SupabaseClient
  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabasekey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    this.supabase = createClient(supabaseUrl, supabasekey);
  }

  async register(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    return data;
  }

  async signin(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Error signing in: ${error.message}`);

      return error.message;
    }

    return data;
  }

  async signout() {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      console.log(`Error signing out: ${error.message}`);

      return error.message;
    }
    return { message: 'Signed out successfully' };
  }
}
