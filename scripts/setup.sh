#!/bin/bash

# ============================================
# LIFEOS SETUP SCRIPT
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  LIFEOS SETUP${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18+${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Install dependencies
echo ""
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Create .env.local if not exists
if [ ! -f ".env.local" ]; then
    echo ""
    echo -e "${YELLOW}📝 Creating .env.local...${NC}"
    
    cat > .env.local << 'EOF'
# Supabase Configuration
# Get these from https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EOF

    echo -e "${YELLOW}⚠️  Please edit .env.local with your Supabase credentials${NC}"
    echo ""
    echo "To get credentials:"
    echo "1. Go to https://supabase.com"
    echo "2. Create a new project"
    echo "3. Go to Project Settings → API"
    echo "4. Copy URL and anon key"
    echo ""
    
    # Try to open .env.local in default editor
    if command -v code &> /dev/null; then
        code .env.local
    elif command -v nano &> /dev/null; then
        nano .env.local
    fi
else
    echo -e "${GREEN}✅ .env.local already exists${NC}"
fi

# Run migrations check
echo ""
echo -e "${YELLOW}🔍 Checking database setup...${NC}"
echo ""
echo "Make sure to run SQL migrations in Supabase:"
echo "1. Go to https://app.supabase.com"
echo "2. Open SQL Editor"
echo "3. Copy content from supabase/migrations/001_initial_schema.sql"
echo "4. Run the SQL"
echo ""

# Build
echo -e "${YELLOW}🔨 Building project...${NC}"
npm run build

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}  Ready to start!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "Commands:"
echo "  npm run dev     - Start development server"
echo "  npm run build   - Build for production"
echo "  ./scripts/deploy.sh - Deploy to Vercel"
echo ""
echo "Don't forget to:"
echo "1. Edit .env.local with Supabase credentials"
echo "2. Run SQL migrations in Supabase"
echo "3. Test locally with 'npm run dev'"
echo ""
