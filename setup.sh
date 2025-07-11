#!/bin/bash

echo "Setting up Modurnal..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from example..."
    cp env.example .env
    echo "Please update .env with your actual credentials"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Run database migration
echo "Setting up database schema..."
echo "Please run the following SQL in your Supabase SQL editor:"
echo ""
echo "Copy and paste the contents of supabase/schema.sql into your Supabase SQL editor and run it."
echo ""

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your Supabase and OpenAI credentials"
echo "2. Run the SQL schema in your Supabase project"
echo "3. Configure Spotify OAuth in your Supabase project"
echo "4. Run 'npm start' to start the development server" 