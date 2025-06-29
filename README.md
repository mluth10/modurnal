# Modurnal - AI-Powered Journaling App

A React Native journaling app built with Expo and Supabase, featuring AI-powered sentiment analysis and summarization using OpenAI.

## Features

- 📝 **Create Journal Entries**: Write your thoughts with a beautiful, distraction-free interface
- 🤖 **AI Analysis**: Automatic sentiment analysis and summarization of your entries
- 📊 **Sentiment Tracking**: Visual indicators for positive, negative, and neutral entries
- 🔒 **Secure Storage**: All data is securely stored in Supabase with encryption
- 📱 **Cross-Platform**: Works on iOS, Android, and web
- 🎨 **Modern UI**: Clean, intuitive design with smooth animations

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **AI**: OpenAI GPT-3.5-turbo for sentiment analysis and summarization
- **Navigation**: React Navigation
- **State Management**: React Context API
- **TypeScript**: Full type safety

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account
- OpenAI API key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd modurnal
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Run the database schema:

```sql
-- Copy and paste the contents of supabase/schema.sql into your Supabase SQL editor
```

### 3. Configure Environment Variables

1. Copy the example environment file:
```bash
cp env.example .env
```

2. Update `.env` with your actual credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

### 4. Start the Development Server

```bash
npm start
```

This will open the Expo development tools. You can run the app on:
- iOS Simulator (requires Xcode on macOS)
- Android Emulator (requires Android Studio)
- Physical device using the Expo Go app

## Project Structure

```
modurnal/
├── src/
│   ├── contexts/
│   │   └── SupabaseContext.tsx    # Supabase client and context
│   ├── screens/
│   │   ├── HomeScreen.tsx         # Main journal list screen
│   │   └── NewEntryScreen.tsx     # Create new entry screen
│   ├── services/
│   │   ├── journal.ts             # Journal CRUD operations
│   │   └── openai.ts              # OpenAI API integration
│   └── types/
│       └── journal.ts             # TypeScript type definitions
├── supabase/
│   └── schema.sql                 # Database schema
├── App.tsx                        # Main app component
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## Database Schema

The app uses a single `journal_entries` table with the following structure:

- `id`: UUID primary key
- `text`: The journal entry content
- `summary`: AI-generated summary
- `sentiment`: AI-detected sentiment (positive/negative/neutral)
- `created_at`: Timestamp when entry was created
- `updated_at`: Timestamp when entry was last updated

## API Integration

### OpenAI Integration

The app automatically analyzes each journal entry using OpenAI's GPT-3.5-turbo model to:
- Generate a concise summary (2-3 sentences)
- Determine the overall sentiment

### Supabase Integration

- Secure data storage with Row Level Security (RLS)
- Real-time capabilities for future features
- Automatic timestamp management

## Development

### Adding New Features

1. **New Screens**: Add to `src/screens/` and update navigation in `App.tsx`
2. **New Services**: Add to `src/services/` for API integrations
3. **New Types**: Add to `src/types/` for TypeScript definitions

### Code Style

- Use TypeScript for all new code
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling

## Deployment

### Expo Build

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

### Supabase Deployment

The database schema is automatically applied when you run the SQL in your Supabase dashboard.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub. 