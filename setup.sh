#!/bin/bash

# Mission Control Dashboard Setup Script
# Run this after cloning the repository

echo "🚀 Setting up Mission Control Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "⚡ Setting up Convex..."
echo "This will open a browser to authenticate with Convex."
echo "Press Enter to continue..."
read

npx convex dev

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy the Convex deployment URL from above"
echo "2. Create .env.local with: NEXT_PUBLIC_CONVEX_URL=your-url"
echo "3. Run: npm run dev"
echo "4. Open http://localhost:3000"
echo ""
echo "🎯 Mission Control is ready for takeoff!"