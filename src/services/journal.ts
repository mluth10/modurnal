import { SupabaseClient } from '@supabase/supabase-js';
import { JournalEntry, CreateJournalEntry } from '../types/journal';
import { analyzeJournalEntry } from './openai';

export class JournalService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async createEntry(text: string): Promise<JournalEntry> {
    try {
      // First, analyze the text with OpenAI
      const analysis = await analyzeJournalEntry(text);

      // Create the entry in Supabase
      const { data, error } = await this.supabase
        .from('journal_entries')
        .insert({
          text,
          summary: analysis.summary,
          sentiment: analysis.sentiment,
        })
        .select()
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
        .select('*')
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
        .select('*')
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
} 