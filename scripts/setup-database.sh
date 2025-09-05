#!/bin/bash

echo "🗄️  Database Setup for AI Blog System"
echo "====================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Please make sure you have your environment file set up."
    exit 1
fi

# Check if DIRECT_URL is configured
if grep -q "DIRECT_URL=\"postgresql://username:password" .env.local; then
    echo "⚠️  DIRECT_URL not configured yet!"
    echo ""
    echo "You need to set up a PostgreSQL database first."
    echo ""
    echo "🚀 Quick Database Setup Options:"
    echo ""
    echo "1. 🟢 Neon (Recommended - Free tier)"
    echo "   - Go to: https://neon.tech/"
    echo "   - Create account and new project"
    echo "   - Copy connection string"
    echo ""
    echo "2. 🚂 Railway (Simple deployment)"
    echo "   - Go to: https://railway.app/"
    echo "   - Create PostgreSQL database"
    echo "   - Copy connection string"
    echo ""
    echo "3. 🟦 Supabase (Full-featured)"
    echo "   - Go to: https://supabase.com/"
    echo "   - Create new project"
    echo "   - Go to Settings > Database"
    echo "   - Copy connection string"
    echo ""
    echo "📝 Then update line 18 in .env.local with your connection string:"
    echo "   DIRECT_URL=\"your_postgresql_connection_string_here\""
    echo ""
    echo "🔄 After that, run this script again to continue setup."
    exit 1
fi

echo "✅ Environment file found"
echo "✅ DIRECT_URL appears to be configured"
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
if npm run db:generate; then
    echo "✅ Prisma client generated successfully"
else
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo ""

# Test database connection and push schema
echo "🗄️  Testing database connection and pushing schema..."
if npm run db:push; then
    echo "✅ Database schema pushed successfully"
else
    echo "❌ Failed to push database schema"
    echo ""
    echo "🔍 Common issues:"
    echo "1. Check your DIRECT_URL connection string"
    echo "2. Make sure your database is accessible"
    echo "3. Verify your database credentials"
    echo ""
    echo "💡 Try testing your connection string manually:"
    echo "   psql \"your_connection_string_here\""
    exit 1
fi

echo ""

# Seed the database
echo "🌱 Seeding database with initial data..."
if npm run db:seed; then
    echo "✅ Database seeded successfully"
else
    echo "❌ Failed to seed database"
    echo "The schema was created but seeding failed."
    echo "You can try running: npm run db:seed"
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "📊 What was created:"
echo "✅ Blog posts table with AI support"
echo "✅ Blog images table for Nano Banana"
echo "✅ Analytics and SEO tracking"
echo "✅ Generation queue for automation"
echo "✅ Categories and tags"
echo "✅ Sample data and blog posts"
echo ""
echo "🚀 Next steps:"
echo "1. Start development server: npm run dev"
echo "2. View database: npm run db:studio"
echo "3. Test AI generation: npm run test:gemini"
echo "4. Test blog API: POST /api/blog/generate"
echo ""
echo "🍌 Your AI blog system with Nano Banana is ready!"
