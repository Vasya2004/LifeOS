-- ============================================================
-- DEPRECATED: This file is kept for reference only
-- 
-- Use the full onboarding migration instead:
--   supabase/migrations/008_onboarding_setup.sql
--
-- The full migration creates:
--   - profiles
--   - user_data (sync blob)
--   - user_stats (game stats)
--   - streaks (streak tracking)
--   - user_settings (preferences)
--   - achievement_stats (achievement counters)
--
-- To apply: Run migration 008 in Supabase SQL Editor
-- ============================================================

-- NOTE: This is the OLD simplified version.
-- DO NOT USE - Use migration 008_onboarding_setup.sql instead

/*
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
*/

-- ============================================================
-- See: supabase/migrations/008_onboarding_setup.sql
-- ============================================================
