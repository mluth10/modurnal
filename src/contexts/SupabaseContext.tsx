import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

interface SupabaseContextType {
  supabase: SupabaseClient | null;
  loading: boolean;
}

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
  loading: true,
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

  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        // You'll need to replace these with your actual Supabase credentials
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
        const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

        if (!supabaseUrl || !supabaseAnonKey) {
          console.warn('Supabase credentials not found. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
          setLoading(false);
          return;
        }

        const client = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            storage: {
              async getItem(key: string) {
                return await SecureStore.getItemAsync(key);
              },
              async setItem(key: string, value: string) {
                await SecureStore.setItemAsync(key, value);
              },
              async removeItem(key: string) {
                await SecureStore.deleteItemAsync(key);
              },
            },
          },
        });

        setSupabase(client);
      } catch (error) {
        console.error('Error initializing Supabase:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeSupabase();
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase, loading }}>
      {children}
    </SupabaseContext.Provider>
  );
}; 