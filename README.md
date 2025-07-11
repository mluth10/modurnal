# Modurnal - AI-Powered Journaling App

A React Native journaling app that combines AI-powered sentiment analysis with Spotify listening data to provide rich, contextual journal entries.

## Features

- **AI-Powered Analysis**: Automatic sentiment analysis and summarization of journal entries using OpenAI
- **Spotify Integration**: Pulls your daily listening data when creating journal entries
- **Secure Authentication**: Spotify OAuth integration via Supabase
- **Real-time Data**: Live updates and secure data storage
- **Beautiful UI**: Modern, intuitive interface built with React Native Paper

## Spotify Integration

The app now automatically pulls your Spotify listening data for the entire day when you create a journal entry. This includes:

- **Daily Listening Statistics**: Total tracks played and listening time
- **Top Tracks**: Your most played tracks for the day
- **Top Artists**: Your most listened to artists
- **Listening History**: Detailed track-by-track listening data
- **Genre Analysis**: Your preferred music genres

### How It Works

1. When you create a new journal entry, the app fetches your Spotify listening data for that day
2. The data is stored securely in your Supabase database
3. Your journal entry is linked to this listening data
4. You can view your listening patterns alongside your journal entries

### Privacy

- All Spotify data is stored securely in your personal Supabase database
- Data is only accessible to you
- No listening data is shared with third parties
- You can disconnect your Spotify account at any time

## Setup

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- Supabase account
- OpenAI API key
- Spotify Developer account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd modurnal
```

2. Run the setup script:
```bash
chmod +x setup.sh
./setup.sh
```

3. Update your `.env` file with your credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

4. Set up your Supabase database:
   - Copy the contents of `supabase/schema.sql`
   - Paste it into your Supabase SQL editor
   - Run the SQL to create the necessary tables

5. Configure Spotify OAuth in Supabase:
   - Go to your Supabase project settings
   - Add Spotify as an OAuth provider
   - Configure the redirect URLs

6. Start the development server:
```bash
npm start
```

## Database Schema

The app uses two main tables:

### `journal_entries`
- Stores your journal entries with AI analysis
- Links to Spotify listening data
- Includes sentiment analysis and summaries

### `spotify_listening_data`
- Stores daily Spotify listening statistics
- Includes top tracks, artists, and genres
- Tracks listening history and patterns

## Usage

1. **Sign In**: Connect your Spotify account for authentication
2. **Create Entries**: Write journal entries and see your daily listening data
3. **View History**: Browse past entries with associated Spotify data
4. **Analyze Patterns**: See how your music listening relates to your mood and activities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License. 