#!/bin/bash

# =============================================================================
# Environment Setup Script for Prosper
# =============================================================================

echo "🚀 Setting up Prosper environment configuration..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local already exists${NC}"
    echo "Do you want to:"
    echo "1) Keep existing file"
    echo "2) Create backup and recreate"
    read -p "Choose (1 or 2): " choice
    
    if [ "$choice" = "2" ]; then
        cp .env.local .env.local.backup
        echo -e "${GREEN}✅ Backup created: .env.local.backup${NC}"
    else
        echo -e "${BLUE}ℹ️  Keeping existing .env.local${NC}"
        exit 0
    fi
fi

# Copy template
if [ -f .env.example ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created .env.local from template${NC}"
else
    echo -e "${RED}❌ .env.example not found!${NC}"
    exit 1
fi

# Generate secure passwords
echo ""
echo "🔐 Generating secure passwords..."

WORKOS_COOKIE_PASSWORD=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Update .env.local with generated passwords
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/your_secure_password_here_must_be_at_least_32_characters_long/$WORKOS_COOKIE_PASSWORD/" .env.local
    sed -i '' "s/your_nextauth_secret_here/$NEXTAUTH_SECRET/" .env.local
else
    # Linux
    sed -i "s/your_secure_password_here_must_be_at_least_32_characters_long/$WORKOS_COOKIE_PASSWORD/" .env.local
    sed -i "s/your_nextauth_secret_here/$NEXTAUTH_SECRET/" .env.local
fi

echo -e "${GREEN}✅ Generated WORKOS_COOKIE_PASSWORD${NC}"
echo -e "${GREEN}✅ Generated NEXTAUTH_SECRET${NC}"

echo ""
echo "📋 Setup complete! Next steps:"
echo ""
echo -e "${BLUE}1. WorkOS AuthKit Setup (REQUIRED):${NC}"
echo "   • Go to https://dashboard.workos.com/"
echo "   • Create a new project"
echo "   • Get your WORKOS_CLIENT_ID and WORKOS_API_KEY"
echo "   • Set redirect URI to: http://localhost:3001/callback"
echo ""
echo -e "${BLUE}2. AI Services Setup (REQUIRED):${NC}"
echo "   • Gemini AI: https://aistudio.google.com/"
echo "   • OpenAI: https://platform.openai.com/api-keys"
echo ""
echo -e "${BLUE}3. Edit .env.local with your actual keys:${NC}"
echo "   nano .env.local"
echo ""
echo -e "${BLUE}4. Test your setup:${NC}"
echo "   npm run dev"
echo ""
echo -e "${YELLOW}⚠️  Remember: Never commit .env.local to version control!${NC}"
echo ""
echo "📚 For detailed setup guide, see: ENVIRONMENT_SETUP.md"
