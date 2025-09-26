#!/bin/bash

echo "🚀 Setting up AI Task Reminder App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Setup Backend
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    echo "API_KEY_ANTHROPIC=your_anthropic_api_key_here" > .env
    echo "PORT=5000" >> .env
    echo "⚠️  Please update the .env file with your actual Anthropic Claude API key"
fi

# Setup Frontend
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo ""
echo "🎉 Setup complete! Here's how to run the app:"
echo ""
echo "1. Update backend/.env with your Anthropic Claude API key"
echo "2. Start the backend server:"
echo "   cd backend && npm start"
echo ""
echo "3. In a new terminal, start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "Happy coding! 🚀"
