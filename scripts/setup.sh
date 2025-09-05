#!/bin/bash

# =============================================================================
# AI-Powered Blog System Setup Script
# =============================================================================

echo "🚀 Setting up AI-Powered Blog System with Nano Banana..."
echo "🍌 Prisma Accelerate + Gemini AI Integration"
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
    echo "📚 See docs/PRISMA_ACCELERATE_CONFIG.md for detailed setup guide"
    echo ""
else
    echo "✅ .env file already exists."
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Prisma client needs to be generated
echo "🔧 Generating Prisma client..."
npm run db:generate

# Check database connection
echo "🗄️  Checking database connection..."
if npm run db:push > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
    
    # Seed the database
    echo "🌱 Seeding database with initial data..."
    npm run db:seed
    echo "✅ Database seeded successfully!"
else
    echo "❌ Database connection failed. Please check your DATABASE_URL in .env file."
    echo ""
    echo "📋 Setup checklist:"
    echo "1. Create a PostgreSQL database (Neon, Railway, or local)"
    echo "2. Update DATABASE_URL in .env file"
    echo "3. Get Gemini API key from https://aistudio.google.com/"
    echo "4. Update GEMINI_API_KEY in .env file"
    echo "5. Run this setup script again"
    exit 1
fi

echo ""
echo "🎉 Setup complete! Your AI blog system is ready."
echo ""
echo "📋 What's been set up:"
echo "✅ Prisma database with blog schema"
echo "✅ Sample blog posts and categories"
echo "✅ Automated generation queue"
echo "✅ Image generation with Nano Banana support"
echo ""
echo "🚀 Next steps:"
echo "1. Start development server: npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Test blog generation: POST /api/blog/generate"
echo "4. View database: npm run db:studio"
echo ""
echo "📚 Documentation:"
echo "- Database setup: docs/DATABASE_SETUP.md"
echo "- AI blog vision: docs/AI_BLOG_VISION.md"
echo "- Nano Banana guide: docs/NANO_BANANA_SETUP.md"
echo ""
echo "🍌 Happy blogging with Nano Banana!"
