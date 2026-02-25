-- Profiles table (auto-created on signup via trigger)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  level integer not null default 1,
  xp integer not null default 0,
  xp_to_next integer not null default 1000,
  total_tasks_completed integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Goals table
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  deadline date,
  progress integer not null default 0,
  category text not null default 'Personal',
  status text not null default 'in-progress' check (status in ('in-progress', 'completed', 'frozen')),
  created_at timestamptz not null default now()
);

alter table public.goals enable row level security;
drop policy if exists "goals_select_own" on public.goals;
create policy "goals_select_own" on public.goals for select using (auth.uid() = user_id);
drop policy if exists "goals_insert_own" on public.goals;
create policy "goals_insert_own" on public.goals for insert with check (auth.uid() = user_id);
drop policy if exists "goals_update_own" on public.goals;
create policy "goals_update_own" on public.goals for update using (auth.uid() = user_id);
drop policy if exists "goals_delete_own" on public.goals;
create policy "goals_delete_own" on public.goals for delete using (auth.uid() = user_id);

-- Subtasks table
create table if not exists public.subtasks (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.subtasks enable row level security;
drop policy if exists "subtasks_select_own" on public.subtasks;
create policy "subtasks_select_own" on public.subtasks for select using (auth.uid() = user_id);
drop policy if exists "subtasks_insert_own" on public.subtasks;
create policy "subtasks_insert_own" on public.subtasks for insert with check (auth.uid() = user_id);
drop policy if exists "subtasks_update_own" on public.subtasks;
create policy "subtasks_update_own" on public.subtasks for update using (auth.uid() = user_id);
drop policy if exists "subtasks_delete_own" on public.subtasks;
create policy "subtasks_delete_own" on public.subtasks for delete using (auth.uid() = user_id);

-- Tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  title text not null,
  completed boolean not null default false,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own" on public.tasks for select using (auth.uid() = user_id);
drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own" on public.tasks for insert with check (auth.uid() = user_id);
drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own" on public.tasks for update using (auth.uid() = user_id);
drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own" on public.tasks for delete using (auth.uid() = user_id);

-- Metrics table
create table if not exists public.metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  unit text not null default '',
  icon text not null default 'activity',
  target numeric,
  created_at timestamptz not null default now()
);

alter table public.metrics enable row level security;
drop policy if exists "metrics_select_own" on public.metrics;
create policy "metrics_select_own" on public.metrics for select using (auth.uid() = user_id);
drop policy if exists "metrics_insert_own" on public.metrics;
create policy "metrics_insert_own" on public.metrics for insert with check (auth.uid() = user_id);
drop policy if exists "metrics_update_own" on public.metrics;
create policy "metrics_update_own" on public.metrics for update using (auth.uid() = user_id);
drop policy if exists "metrics_delete_own" on public.metrics;
create policy "metrics_delete_own" on public.metrics for delete using (auth.uid() = user_id);

-- Metric entries table
create table if not exists public.metric_entries (
  id uuid primary key default gen_random_uuid(),
  metric_id uuid not null references public.metrics(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  value numeric not null,
  created_at timestamptz not null default now(),
  unique (metric_id, date)
);

alter table public.metric_entries enable row level security;
drop policy if exists "metric_entries_select_own" on public.metric_entries;
create policy "metric_entries_select_own" on public.metric_entries for select using (auth.uid() = user_id);
drop policy if exists "metric_entries_insert_own" on public.metric_entries;
create policy "metric_entries_insert_own" on public.metric_entries for insert with check (auth.uid() = user_id);
drop policy if exists "metric_entries_update_own" on public.metric_entries;
create policy "metric_entries_update_own" on public.metric_entries for update using (auth.uid() = user_id);
drop policy if exists "metric_entries_delete_own" on public.metric_entries;
create policy "metric_entries_delete_own" on public.metric_entries for delete using (auth.uid() = user_id);

-- Challenges table
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  duration integer not null default 30,
  start_date date not null default current_date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.challenges enable row level security;
drop policy if exists "challenges_select_own" on public.challenges;
create policy "challenges_select_own" on public.challenges for select using (auth.uid() = user_id);
drop policy if exists "challenges_insert_own" on public.challenges;
create policy "challenges_insert_own" on public.challenges for insert with check (auth.uid() = user_id);
drop policy if exists "challenges_update_own" on public.challenges;
create policy "challenges_update_own" on public.challenges for update using (auth.uid() = user_id);
drop policy if exists "challenges_delete_own" on public.challenges;
create policy "challenges_delete_own" on public.challenges for delete using (auth.uid() = user_id);

-- Challenge days table
create table if not exists public.challenge_days (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (challenge_id, date)
);

alter table public.challenge_days enable row level security;
drop policy if exists "challenge_days_select_own" on public.challenge_days;
create policy "challenge_days_select_own" on public.challenge_days for select using (auth.uid() = user_id);
drop policy if exists "challenge_days_insert_own" on public.challenge_days;
create policy "challenge_days_insert_own" on public.challenge_days for insert with check (auth.uid() = user_id);
drop policy if exists "challenge_days_delete_own" on public.challenge_days;
create policy "challenge_days_delete_own" on public.challenge_days for delete using (auth.uid() = user_id);

-- Achievements table
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  icon text not null default 'trophy',
  unlocked_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.achievements enable row level security;
drop policy if exists "achievements_select_own" on public.achievements;
create policy "achievements_select_own" on public.achievements for select using (auth.uid() = user_id);
drop policy if exists "achievements_insert_own" on public.achievements;
create policy "achievements_insert_own" on public.achievements for insert with check (auth.uid() = user_id);
drop policy if exists "achievements_update_own" on public.achievements;
create policy "achievements_update_own" on public.achievements for update using (auth.uid() = user_id);
