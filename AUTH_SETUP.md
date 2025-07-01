# Authentication Setup Guide

This guide will help you set up user authentication with Supabase for your Modurnal journal app.

## Prerequisites

- A Supabase project (create one at [supabase.com](https://supabase.com))
- Your Supabase project URL and anon key

## Step 1: Set up Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 2: Update Database Schema

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the updated schema from `supabase/schema.sql`

This will:
- Add a `user_id` column to the `journal_entries` table
- Create indexes for better performance
- Set up Row Level Security (RLS) policies
- Create triggers to automatically set user_id on insert

## Step 3: Configure Authentication Settings

In your Supabase dashboard:

1. Go to **Authentication** > **Settings**
2. Configure the following:

### Email Templates
- Customize the email templates for:
  - Confirm signup
  - Reset password
  - Magic link

### Site URL
- Set your site URL (for development: `http://localhost:8081`)
- Add redirect URLs for your app

### Email Provider
- Configure your email provider (Supabase provides a default one)
- Or set up your own SMTP settings

## Step 4: Enable Email Confirmation (Optional)

If you want to require email confirmation:

1. Go to **Authentication** > **Settings**
2. Enable "Enable email confirmations"
3. Users will need to verify their email before they can sign in

## Step 5: Test the Authentication

1. Start your app: `npm start`
2. Try creating a new account
3. Test signing in and out
4. Verify that journal entries are user-specific

## Features Included

### Authentication Screens
- **Sign In Screen**: Email and password login
- **Sign Up Screen**: Account creation with password confirmation
- **User-specific Home Screen**: Shows user email and sign out option

### Security Features
- **Row Level Security (RLS)**: Users can only access their own journal entries
- **Automatic User ID Assignment**: New entries are automatically associated with the current user
- **Secure Storage**: Authentication tokens are stored securely using Expo SecureStore

### User Experience
- **Loading States**: Proper loading indicators during authentication
- **Error Handling**: User-friendly error messages
- **Navigation Flow**: Automatic navigation based on authentication state
- **Sign Out Confirmation**: Confirmation dialog before signing out

## Database Schema Changes

The updated schema includes:

```sql
-- User-specific journal entries
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  summary TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
CREATE POLICY "Users can only access their own journal entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);

-- Automatic user_id assignment
CREATE TRIGGER set_journal_entries_user_id
  BEFORE INSERT ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();
```

## Troubleshooting

### Common Issues

1. **"Supabase credentials not found"**
   - Make sure your `.env` file exists and has the correct variables
   - Restart your development server after adding environment variables

2. **"Failed to create journal entry"**
   - Check that RLS policies are properly set up
   - Verify the database schema has been updated

3. **"Authentication failed"**
   - Check your Supabase project settings
   - Verify email/password format
   - Check if email confirmation is required

4. **"Users can see other users' entries"**
   - Ensure RLS is enabled on the `journal_entries` table
   - Verify the RLS policy is correctly configured

### Getting Help

- Check the [Supabase documentation](https://supabase.com/docs)
- Review the [React Native Supabase guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- Check the console for detailed error messages

## Next Steps

Consider adding these features:
- Password reset functionality
- Social authentication (Google, Apple, etc.)
- User profile management
- Email verification flow
- Biometric authentication 