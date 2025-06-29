#!/bin/bash

echo "🚀 Setting up Modurnal - AI-Powered Journaling App"
echo "=================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: Please update .env with your actual API keys:"
    echo "   - EXPO_PUBLIC_SUPABASE_URL"
    echo "   - EXPO_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - EXPO_PUBLIC_OPENAI_API_KEY"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your API keys"
echo "2. Set up your Supabase database using supabase/schema.sql"
echo "3. Run 'npm start' to start the development server"
echo ""
echo "For detailed instructions, see README.md" 