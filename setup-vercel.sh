#!/bin/bash

# VERCEL DEPLOY SETUP - One-time configuration
# Run this ONCE to set up automatic deploys

echo "🔧 Vercel Deploy Setup"
echo "======================"
echo ""
echo "Project: mission-control-dashboard"
echo "Vercel Project ID: prj_b9ppomJsGjI0wymj7RBAY3rb6rV2"
echo "Org ID: team_pTaRy62v94KoVQLGqrW2jojS"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not installed"
    echo "Install with: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""
echo "Setting up project..."

# Link project
vercel link --project mission-control-dashboard --yes

# Set environment variables
echo "Setting environment variables..."
vercel env add CONVEX_URL production <<< "https://flexible-dolphin-499.convex.cloud"
vercel env add NEXT_PUBLIC_CONVEX_URL production <<< "https://flexible-dolphin-499.convex.cloud"
vercel env add NEXT_PUBLIC_CONVEX_SITE_URL production <<< "https://flexible-dolphin-499.convex.site"
vercel env add MISSION_CONTROL_URL production <<< "https://mission-control-dashboard.vercel.app"

echo ""
echo "✅ Setup complete!"
echo "Next steps:"
echo "1. Run: vercel --prod"
echo "2. Or push to main: git push origin main"
