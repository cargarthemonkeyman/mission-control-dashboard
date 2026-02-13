#!/bin/bash

# Quick deploy script for Vercel
# Usage: ./deploy-vercel.sh

echo "🚀 Deploying Mission Control to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel
fi

# Check if Convex is set up
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found!"
    echo "Please run: npx convex dev"
    echo "Then create .env.local with your CONVEX_URL"
    exit 1
fi

# Deploy
echo ""
echo "⬆️  Deploying..."
vercel --prod

echo ""
echo "✅ Deployed!"
echo "📝 Don't forget to set NEXT_PUBLIC_CONVEX_URL in Vercel dashboard if not prompted."