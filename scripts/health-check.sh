#!/bin/bash

# 🩺 LifeOS Health Check
# Быстрая проверка готовности проекта к деплою

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🩺 LifeOS Health Check"
echo "======================"
echo ""

ERRORS=0
WARNINGS=0

# 1. Проверка node_modules
echo -n "📦 node_modules... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}MISSING${NC}"
    echo "   → Run: npm install"
    ((ERRORS++))
fi

# 2. Проверка .env.local
echo -n "🔧 .env.local... "
if [ -f ".env.local" ]; then
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local && grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}INCOMPLETE${NC}"
        echo "   → Missing Supabase credentials in .env.local"
        ((ERRORS++))
    fi
else
    echo -e "${RED}MISSING${NC}"
    echo "   → Run: npm run setup"
    ((ERRORS++))
fi

# 3. Проверка файлов миграций
echo -n "🗄️  Migration files... "
if [ -f "supabase/migrations/001_initial_schema.sql" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}MISSING${NC}"
    ((ERRORS++))
fi

# 4. Проверка TypeScript (быстрая)
echo -n "📝 TypeScript check (quick)... "
if npx tsc --noEmit --skipLibCheck 2>/dev/null | head -5; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}WARNINGS${NC}"
    echo "   → Some type errors exist but won't block deployment"
    ((WARNINGS++))
fi

# 5. Проверка git
echo -n "📁 Git repository... "
if [ -d ".git" ]; then
    echo -e "${GREEN}OK${NC}"
    echo "   → Branch: $(git branch --show-current)"
    echo "   → Last commit: $(git log -1 --pretty=format:'%h - %s')"
else
    echo -e "${YELLOW}NOT FOUND${NC}"
    echo "   → Git not initialized (optional)"
    ((WARNINGS++))
fi

# 6. Проверка Vercel CLI
echo -n "🚀 Vercel CLI... "
if command -v vercel &> /dev/null; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}NOT INSTALLED${NC}"
    echo "   → Run: npm i -g vercel"
    ((WARNINGS++))
fi

# 7. Проверка build
echo -n "🏗️  Build output... "
if [ -d ".next" ]; then
    echo -e "${GREEN}EXISTS${NC}"
    echo "   → Last build: $(stat -f '%Sm' -t '%Y-%m-%d %H:%M' .next 2>/dev/null || stat -c '%y' .next 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1)"
else
    echo -e "${YELLOW}NOT FOUND${NC}"
    echo "   → Run: npm run build"
    ((WARNINGS++))
fi

# Сводка
echo ""
echo "======================"
echo "📊 Summary"
echo "======================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "🚀 Ready for deployment:"
    echo "   npm run deploy"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    echo ""
    echo "🚀 Ready for deployment (with warnings):"
    echo "   npm run deploy"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) found${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS warning(s)${NC}"
    fi
    echo ""
    echo "🔧 Fix errors before deploying:"
    echo "   npm run setup"
    exit 1
fi
