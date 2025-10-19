#!/bin/bash

# =============================================================================
# AI-Powered Blog System Setup Script
# =============================================================================

echo "🚀 Setting up AI-Powered Blog System with Nano Banana..."
echo "🍌 Convex + Gemini AI Integration"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created."
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with:"
    echo "   - DIRECT_URL: Your original PostgreSQL connection string"
    echo "   - GEMINI_API_KEY: Your Gemini API key from https://aistudio.google.com/"
    echo ""
    echo "📚 See CONVEX_INTEGRATION_GUIDE.md for detailed setup guide"
    echo ""
else
    echo "✅ .env file already exists."
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Convex is configured
echo "🔧 Checking Convex configuration..."
if npx convex dev --once > /dev/null 2>&1; then
    echo "✅ Convex connection successful!"
else
    echo "❌ Convex connection failed. Please check your Convex configuration."
    echo ""
    echo "📋 Setup checklist:"
    echo "1. Run 'npx convex dev' to configure Convex"
    echo "2. Get Gemini API key from https://aistudio.google.com/"
    echo "3. Update GEMINI_API_KEY in .env file"
    echo "4. Run this setup script again"
    exit 1
fi

echo ""
echo "🎉 Setup complete! Your AI blog system is ready."
echo ""
echo "📋 What's been set up:"
echo "✅ Convex database with blog schema"
echo "✅ Real-time data synchronization"
echo "✅ Automated generation queue"
echo "✅ Image generation with Nano Banana support"
echo ""
echo "🚀 Next steps:"
echo "1. Start development server: npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Test blog generation: POST /api/blog/generate"
echo "4. View database: npx convex dashboard"
echo ""
echo "📚 Documentation:"
echo "- Convex integration: CONVEX_INTEGRATION_GUIDE.md"
echo "- AI blog vision: docs/AI_BLOG_VISION.md"
echo "- Nano Banana guide: docs/NANO_BANANA_SETUP.md"
echo ""
echo "🍌 Happy blogging with Nano Banana!"
