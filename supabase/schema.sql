-- Create the spotify_listening_data table first
CREATE TABLE IF NOT EXISTS spotify_listening_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_tracks_played INTEGER DEFAULT 0,
  total_minutes_listened INTEGER DEFAULT 0,
  top_tracks JSONB,
  top_artists JSONB,
  top_genres JSONB,
  listening_history JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create the journal_entries table with user authentication
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  summary TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  spotify_data_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint after both tables exist
ALTER TABLE journal_entries 
ADD CONSTRAINT fk_journal_entries_spotify_data 
FOREIGN KEY (spotify_data_id) REFERENCES spotify_listening_data(id) ON DELETE SET NULL;

-- Create indexes for spotify_listening_data
CREATE INDEX IF NOT EXISTS idx_spotify_listening_data_user_date ON spotify_listening_data(user_id, date);
CREATE INDEX IF NOT EXISTS idx_spotify_listening_data_date ON spotify_listening_data(date);

-- Create an index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column for journal_entries
CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a trigger to automatically update the updated_at column for spotify_listening_data
CREATE TRIGGER update_spotify_listening_data_updated_at
  BEFORE UPDATE ON spotify_listening_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotify_listening_data ENABLE ROW LEVEL SECURITY;

-- Create policies for user-specific access to journal_entries
CREATE POLICY "Users can only access their own journal entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);

-- Create policies for user-specific access to spotify_listening_data
CREATE POLICY "Users can only access their own spotify listening data" ON spotify_listening_data
  FOR ALL USING (auth.uid() = user_id);

-- Create a function to automatically set user_id on insert for journal_entries
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically set user_id for journal_entries
CREATE TRIGGER set_journal_entries_user_id
  BEFORE INSERT ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

-- Create a trigger to automatically set user_id for spotify_listening_data
CREATE TRIGGER set_spotify_listening_data_user_id
  BEFORE INSERT ON spotify_listening_data
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();