#!/bin/bash

# ============================================
# LIFEOS DEPLOY SCRIPT
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  LIFEOS DEPLOY TO VERCEL${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

echo -e "${GREEN}✅ Vercel CLI installed${NC}"

# Check .env.local
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ .env.local not found${NC}"
    echo ""
    echo "Please create .env.local with:"
    echo "  NEXT_PUBLIC_SUPABASE_URL=your_url"
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key"
    exit 1
fi

echo -e "${GREEN}✅ .env.local found${NC}"

# Check required env vars
if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL not set in .env.local${NC}"
    exit 1
fi

if ! grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not set in .env.local${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"

# Type check
echo ""
echo -e "${YELLOW}🔍 Running type check...${NC}"
if npm run typecheck; then
    echo -e "${GREEN}✅ Type check passed${NC}"
else
    echo -e "${RED}❌ Type check failed${NC}"
    echo "Please fix type errors before deploying"
    exit 1
fi

# Build check
echo ""
echo -e "${YELLOW}🔨 Running build check...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${YELLOW}🚀 Ready to deploy!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Ask for confirmation
read -p "Deploy to Vercel? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}📤 Deploying to Vercel...${NC}"
    
    # Deploy
    vercel --prod
    
    echo ""
    echo -e "${GREEN}✅ Deployment complete!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Go to Vercel Dashboard"
    echo "2. Add environment variables if not set:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "3. Redeploy if needed"
else
    echo -e "${YELLOW}⚠️ Deployment cancelled${NC}"
fi
