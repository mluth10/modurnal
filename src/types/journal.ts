export interface JournalEntry {
  id: string;
  text: string;
  summary: string;
  sentiment: string;
  created_at: string;
  updated_at: string;
}

export interface CreateJournalEntry {
  text: string;
  summary?: string;
  sentiment?: string;
}

export interface OpenAIResponse {
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface JournalEntryFormData {
  text: string;
} 