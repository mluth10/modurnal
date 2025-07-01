import { SupabaseClient } from '@supabase/supabase-js';

export class AuthService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async signInWithSpotify(redirectUri: string) {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        redirectTo: redirectUri
      },
    });

    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    return { user, error };
  }

  async getSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    return { session, error };
  }
} 