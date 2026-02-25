# 🚀 LifeOS Deployment Guide

## Quick Start (One Command)

```bash
# 1. Clone/pull latest code
git pull origin main

# 2. Setup project
./scripts/setup.sh

# 3. Deploy
./scripts/deploy.sh
```

---

## Step-by-Step Deployment

### 1. Supabase Setup (First Time Only)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Sign in
3. Click "New Project"
   - Name: `lifeos`
   - Database Password: (generate strong password)
   - Region: (closest to your users)
4. Wait for project creation (~2 minutes)

### 2. Get API Credentials

1. In your Supabase project, go to **Settings → API**
2. Copy:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Database Setup

1. Go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy entire content from `supabase/migrations/001_initial_schema.sql`
4. Paste and click **Run**

✅ **Success check:** Tables `profiles` and `user_data` should appear in Database → Tables

### 4. Local Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your credentials
nano .env.local  # or use VS Code: code .env.local
```

Your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 5. Test Locally

```bash
npm run dev
```

Open http://localhost:3000

Test:
1. Register at `/auth/register`
2. Create a task
3. Refresh page - data should persist
4. Check Supabase Database → user_data (should see your data)

### 6. Deploy to Vercel

#### Option A: Using Scripts (Recommended)

```bash
# One-time setup
node scripts/vercel-setup.js

# Deploy
./scripts/deploy.sh
```

#### Option B: Manual

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy
vercel --prod
```

---

## Post-Deployment

### Verify Deployment

1. Open your Vercel URL
2. Register a new account
3. Create test data
4. Check that data syncs (look for sync indicator in sidebar)

### Common Issues

#### "Failed to fetch"
- Check `.env.local` has correct Supabase URL
- Ensure you're using `anon` key, not `service_role`

#### "Authorization required"
- Check SQL migrations ran successfully
- Verify RLS policies exist

#### "Table not found"
- Run SQL migrations again
- Check for syntax errors in SQL Editor

---

## Updating Production

```bash
# Pull latest code
git pull origin main

# Install new dependencies
npm install

# Run tests
npm test

# Deploy
./scripts/deploy.sh
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Anonymous API key |

---

## Support

If deployment fails:

1. Check `npm run typecheck` passes
2. Check `npm run build` succeeds locally
3. Check Vercel deployment logs
4. Verify Supabase credentials
5. Check browser console for errors
