import { SupabaseClient } from '@supabase/supabase-js';
import { JournalEntry, CreateJournalEntry, SpotifyListeningData } from '../types/journal';
import { analyzeJournalEntry } from './openai';
import { SpotifyService } from './spotify';

export class JournalService {
  private supabase: SupabaseClient;
  private spotifyService: SpotifyService | null;

  constructor(supabase: SupabaseClient, spotifyAccessToken?: string | null) {
    this.supabase = supabase;
    this.spotifyService = spotifyAccessToken ? new SpotifyService(spotifyAccessToken) : null;
  }

  async createEntry(text: string): Promise<JournalEntry> {
    try {
      // First, analyze the text with OpenAI
      const analysis = await analyzeJournalEntry(text);

      let spotifyDataId: string | undefined;

      // Check if Spotify data already exists for today, if not fetch it
      if (this.spotifyService) {
        try {
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
          
          // First, try to get existing Spotify data for today
          const existingSpotifyData = await this.getSpotifyData(today);
          
          if (existingSpotifyData) {
            // Use existing data
            spotifyDataId = existingSpotifyData.id;
          } else {
            // Fetch fresh Spotify data for today
            const spotifyData = await this.spotifyService.getDailyListeningData(today);
            
            // Store Spotify data in database
            const { data: spotifyDataResult, error: spotifyError } = await this.supabase
              .from('spotify_listening_data')
              .upsert({
                date: spotifyData.date,
                total_tracks_played: spotifyData.total_tracks_played,
                total_minutes_listened: spotifyData.total_minutes_listened,
                top_artists: spotifyData.top_artists,
                listening_history: spotifyData.listening_history,
              }, {
                onConflict: 'user_id,date'
              })
              .select()
              .single();

            if (spotifyError) {
              console.warn('Failed to store Spotify data:', spotifyError);
            } else {
              spotifyDataId = spotifyDataResult.id;
            }
          }
        } catch (spotifyError) {
          console.warn('Failed to fetch Spotify data:', spotifyError);
          // Continue without Spotify data
        }
      }

      // Create the entry in Supabase
      const { data, error } = await this.supabase
        .from('journal_entries')
        .insert({
          text,
          summary: analysis.summary,
          sentiment: analysis.sentiment,
          spotify_data_id: spotifyDataId,
        })
        .select(`
          *,
          spotify_data:spotify_listening_data(*)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to create journal entry: ${error.message}`);
      }

      return data as JournalEntry;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  }

  async getEntries(): Promise<JournalEntry[]> {
    try {
      const { data, error } = await this.supabase
        .from('journal_entries')
        .select(`
          *,
          spotify_data:spotify_listening_data(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch journal entries: ${error.message}`);
      }

      return data as JournalEntry[];
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      throw error;
    }
  }

  async getEntry(id: string): Promise<JournalEntry | null> {
    try {
      const { data, error } = await this.supabase
        .from('journal_entries')
        .select(`
          *,
          spotify_data:spotify_listening_data(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Entry not found
        }
        throw new Error(`Failed to fetch journal entry: ${error.message}`);
      }

      return data as JournalEntry;
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      throw error;
    }
  }

  async deleteEntry(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete journal entry: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  }

  // Get Spotify listening data for a specific date
  async getSpotifyData(date: string): Promise<SpotifyListeningData | null> {
    try {
      const { data, error } = await this.supabase
        .from('spotify_listening_data')
        .select('*')
        .eq('date', date)
        .single();
      
      console.log('spotify data', data);

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No data found for this date
        }
        throw new Error(`Failed to fetch Spotify data: ${error.message}`);
      }

      return data as SpotifyListeningData;
    } catch (error) {
      console.error('Error fetching Spotify data:', error);
      throw error;
    }
  }
} 