export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration_ms: number;
  played_at?: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
}

export interface SpotifyGenre {
  name: string;
  count: number;
}

export interface SpotifyListeningData {
  id: string;
  user_id: string;
  date: string;
  total_tracks_played: number;
  total_minutes_listened: number;
  top_tracks: SpotifyTrack[];
  top_artists: SpotifyArtist[];
  top_genres: SpotifyGenre[];
  listening_history: SpotifyTrack[];
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  text: string;
  summary: string;
  sentiment: string;
  spotify_data_id?: string;
  spotify_data?: SpotifyListeningData;
  created_at: string;
  updated_at: string;
}

export interface CreateJournalEntry {
  text: string;
  summary?: string;
  sentiment?: string;
  spotify_data_id?: string;
}

export interface OpenAIResponse {
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface JournalEntryFormData {
  text: string;
} 