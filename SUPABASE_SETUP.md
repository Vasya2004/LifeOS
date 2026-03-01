# Supabase Setup Guide for LifeOS

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Enter project name: `lifeos`
4. Choose region (closest to your users)
5. Click "Create new project"

## 2. Get API Keys

1. Go to Project Settings → API
2. Copy these values:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Create .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Run SQL Migrations

Execute migrations in order in SQL Editor (Supabase Dashboard):

1. Go to SQL Editor in Supabase Dashboard
2. Run migrations in this order:
   - `001_initial_schema.sql` - Base tables (profiles, user_data)
   - `003_full_schema.sql` - Main app tables (tasks, goals, habits, etc.)
   - `005_achievements_v2.sql` - Achievements system
   - `007_missing_tables.sql` - Additional tables (settings, streaks, quests, etc.)
   - `008_onboarding_setup.sql` - **Onboarding trigger** (creates records on signup)

### ⚠️ Important: Onboarding

Migration `008_onboarding_setup.sql` creates the `handle_new_user()` trigger that automatically creates initial records when a user signs up:
- `profiles` — user profile
- `user_data` — sync blob
- `user_stats` — game stats (level, XP, coins)
- `streaks` — streak tracking
- `user_settings` — user preferences
- `achievement_stats` — achievement counters

To manually run onboarding for existing users:
```sql
SELECT * FROM public.run_onboarding_for_user('user-uuid-here');
```

## 5. Configure Auth (Optional)

### Email Confirmation
1. Go to Authentication → Settings
2. Disable "Confirm email" for easier testing (enable in production)

### OAuth Providers (Optional)
1. Go to Authentication → Providers
2. Enable Google/GitHub
3. Add your Client ID and Secret

## 6. Deploy

```bash
# Local development
npm run dev

# Production build
npm run build
npm start

# Or deploy to Vercel
vercel --prod
```

## 7. Test

1. Register new account at `/auth/register`
2. Login at `/auth/login`
3. Create some data (tasks, goals)
4. Check that data persists after reload
5. Check Network tab for `/api/sync` requests

## Troubleshooting

### "Failed to fetch" errors
- Check that `NEXT_PUBLIC_SUPABASE_URL` is correct
- Ensure you're using `anon` key, not `service_role`

### RLS errors
- Verify SQL migrations ran successfully
- Check that user is authenticated

### Data not syncing
- Check browser console for errors
- Verify `user_data` table exists
- Check RLS policies are correct

## Production Checklist

- [ ] Enable Email Confirmation
- [ ] Add custom SMTP for emails
- [ ] Configure OAuth providers
- [ ] Set up backups
- [ ] Enable Row Level Security
- [ ] Add rate limiting
- [ ] Configure CORS if needed
