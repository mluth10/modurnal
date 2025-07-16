import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { AuthService } from '../services/auth';

// Complete the auth session
// WebBrowser.maybeCompleteAuthSession();

interface SupabaseContextType {
  supabase: SupabaseClient | null;
  loading: boolean;
  user: User | null;
  session: Session | null;
  spotifyTokens: {
    accessToken: string | null;
    refreshToken: string | null;
  } | null;
  signInWithSpotify: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
  loading: true,
  user: null,
  session: null,
  spotifyTokens: null,
  signInWithSpotify: async () => ({ error: null }),
  signOut: async () => { },
});

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [spotifyTokens, setSpotifyTokens] = useState<{
    accessToken: string | null;
    refreshToken: string | null;
  } | null>(null);
  const [authService, setAuthService] = useState<AuthService | null>(null);

  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
        const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

        if (!supabaseUrl || !supabaseAnonKey) {
          console.warn('Supabase credentials not found. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
          setLoading(false);
          return;
        }

        const client = createClient(supabaseUrl, supabaseAnonKey);

        // const client = createClient(supabaseUrl, supabaseAnonKey, {
        //   auth: {
        //     storage: {
        //       async getItem(key: string) {
        //         return await SecureStore.getItemAsync(key);
        //       },
        //       async setItem(key: string, value: string) {
        //         await SecureStore.setItemAsync(key, value);
        //       },
        //       async removeItem(key: string) {
        //         await SecureStore.deleteItemAsync(key);
        //       },
        //     },
        //   },
        // });

        setSupabase(client);
        setAuthService(new AuthService(client));

        // Get initial session
        const { data: { session: initialSession } } = await client.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        // Listen for auth changes
        const { data: { subscription } } = client.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error initializing Supabase:', error);
        setLoading(false);
      }
    };

    initializeSupabase();
  }, []);

  const signInWithSpotify = async () => {
    if (!authService) return { error: new Error('Auth service not initialized') };

    try {
      // Try different redirect URI approaches for Expo Go
      let redirectUri;

      redirectUri = makeRedirectUri({ path: '/auth/callback' });
      console.log('Generated redirect URI:', redirectUri);

      const { data, error } = await authService.signInWithSpotify(redirectUri);

      if (error) {
        return { error };
      }
      // Handle the OAuth flow for React Native
      if (data?.url) {
        console.log('OAuth URL:', data.url);
        console.log('redirectUri:', redirectUri);

        // Use a simpler approach - just open the URL and let Supabase handle the session
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri
        );

        console.log('OAuth result:', result);

        // Check if the OAuth flow was successful
        if (result.type === 'success' && result.url) {
          console.log('OAuth successful - processing tokens...');
          
          // Extract the tokens from the redirect URL
          const fragment = result.url.split('#')[1];
          const params = new URLSearchParams(fragment);

          const accessToken = params.get('access_token'); // Supabase JWT
          const refreshToken = params.get('refresh_token');
          const providerToken = params.get('provider_token'); // Spotify access token
          const providerRefreshToken = params.get('provider_refresh_token'); // Spotify refresh token

          if (accessToken && supabase) {
            // Set the session manually using the tokens
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (sessionError) {
              console.error('Error setting session:', sessionError);
              return { error: sessionError };
            }
            
            if (sessionData.session) {
              console.log('Session set successfully:', sessionData.session.user.email);
              
              // Store Spotify tokens for API access
              if (providerToken) {
                setSpotifyTokens({
                  accessToken: providerToken,
                  refreshToken: providerRefreshToken,
                });
                console.log('Spotify tokens stored for API access');
              }
              
              // The onAuthStateChange listener will automatically fire and update the state
              return { error: null };
            }
          } else {
            console.log('No access token found in redirect URL');
          }
        } else if (result.type === 'cancel') {
          console.log('OAuth was cancelled by user');
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Spotify OAuth error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    if (!authService) return;

    await authService.signOut();
    // Clear Spotify tokens on sign out
    setSpotifyTokens(null);
  };

  return (
    <SupabaseContext.Provider value={{
      supabase,
      loading,
      user,
      session,
      spotifyTokens,
      signInWithSpotify,
      signOut
    }}>
      {children}
    </SupabaseContext.Provider>
  );
}; 