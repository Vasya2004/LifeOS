-- ============================================
-- LIFEOS FULL SCHEMA - All entities for sync
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- FOUNDATION
-- ============================================

CREATE TABLE IF NOT EXISTS identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  vision text,
  mission text,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS core_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  importance integer CHECK (importance BETWEEN 1 AND 5),
  color text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS life_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  icon text,
  color text,
  vision text,
  current_level integer DEFAULT 1 CHECK (current_level BETWEEN 1 AND 10),
  target_level integer DEFAULT 5 CHECK (target_level BETWEEN 1 AND 10),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  area_id uuid REFERENCES life_areas(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  commitments text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- OPERATIONAL
-- ============================================

CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  area_id uuid REFERENCES life_areas(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  type text CHECK (type IN ('outcome', 'process')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'dropped')),
  priority integer DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  target_date date,
  started_at timestamptz,
  completed_at timestamptz,
  progress integer DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  related_values uuid[] DEFAULT '{}',
  related_roles uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  target_date date,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id uuid REFERENCES goals(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'on_hold')),
  start_date date,
  target_date date,
  completed_at timestamptz,
  estimated_hours integer DEFAULT 0,
  actual_hours integer DEFAULT 0,
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard', 'epic')),
  xp_reward integer DEFAULT 0,
  coin_reward integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  scheduled_date date NOT NULL,
  scheduled_time time,
  duration integer, -- in minutes
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  energy_cost text CHECK (energy_cost IN ('low', 'medium', 'high')),
  energy_type text CHECK (energy_type IN ('physical', 'mental', 'emotional', 'creative')),
  completed_at timestamptz,
  actual_duration integer,
  notes text,
  external_id text, -- for integrations
  source text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  area_id uuid REFERENCES life_areas(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  frequency text DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'custom')),
  target_days integer[] DEFAULT '{}',
  target_count integer,
  energy_impact integer DEFAULT 0,
  energy_type text CHECK (energy_type IN ('physical', 'mental', 'emotional', 'creative')),
  streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  total_completions integer DEFAULT 0,
  xp_reward integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habit_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id uuid REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  completed boolean DEFAULT false,
  note text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, habit_id, date)
);

-- ============================================
-- REFLECTION
-- ============================================

CREATE TABLE IF NOT EXISTS daily_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  day_rating integer CHECK (day_rating BETWEEN 1 AND 5),
  energy_level integer CHECK (energy_level BETWEEN 1 AND 5),
  focus_level integer CHECK (focus_level BETWEEN 1 AND 5),
  mood text CHECK (mood IN ('terrible', 'bad', 'neutral', 'good', 'excellent')),
  wins text[] DEFAULT '{}',
  struggles text[] DEFAULT '{}',
  lessons text,
  gratitude text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS weekly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start date NOT NULL,
  week_end date NOT NULL,
  tasks_completed integer DEFAULT 0,
  tasks_planned integer DEFAULT 0,
  habits_consistency integer DEFAULT 0,
  total_deep_work_hours integer DEFAULT 0,
  avg_energy numeric(3,1),
  top_wins text[] DEFAULT '{}',
  top_struggles text[] DEFAULT '{}',
  insights text,
  next_week_priorities text[] DEFAULT '{}',
  area_ratings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start)
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  timestamp timestamptz DEFAULT now(),
  type text CHECK (type IN ('thought', 'decision', 'milestone', 'gratitude', 'problem')),
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  linked_goal_id uuid REFERENCES goals(id) ON DELETE SET NULL,
  linked_task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- GAMIFICATION
-- ============================================

CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  level integer DEFAULT 1,
  xp integer DEFAULT 0,
  xp_to_next integer DEFAULT 100,
  coins integer DEFAULT 0,
  total_coins_earned integer DEFAULT 0,
  total_coins_spent integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_active_date date,
  total_tasks_completed integer DEFAULT 0,
  total_goals_achieved integer DEFAULT 0,
  total_projects_completed integer DEFAULT 0,
  total_habit_completions integer DEFAULT 0,
  total_deep_work_hours integer DEFAULT 0,
  total_focus_sessions integer DEFAULT 0,
  avg_daily_tasks numeric(3,1),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS wishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  cost integer DEFAULT 0,
  progress integer DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  linked_goal_id uuid REFERENCES goals(id) ON DELETE SET NULL,
  deadline date,
  status text DEFAULT 'saving' CHECK (status IN ('saving', 'ready', 'purchased', 'archived')),
  purchased_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  icon text,
  category text CHECK (category IN ('streak', 'productivity', 'growth', 'social', 'special')),
  tier text CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  unlocked_at timestamptz,
  progress integer DEFAULT 0,
  target integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- FINANCE
-- ============================================

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text CHECK (type IN ('cash', 'bank', 'investment', 'crypto', 'debt')),
  balance numeric(12,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  color text,
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  type text CHECK (type IN ('income', 'expense', 'transfer')),
  amount numeric(12,2) NOT NULL,
  category text NOT NULL,
  description text,
  transaction_date date NOT NULL,
  related_goal_id uuid REFERENCES goals(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  target_amount numeric(12,2) NOT NULL,
  current_amount numeric(12,2) DEFAULT 0,
  deadline date,
  category text CHECK (category IN ('savings', 'investment', 'debt_payment', 'purchase', 'emergency_fund')),
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  limit_amount numeric(12,2) NOT NULL,
  period text DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly')),
  start_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- HEALTH
-- ============================================

CREATE TABLE IF NOT EXISTS body_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  display_name text,
  icon text,
  status text DEFAULT 'green' CHECK (status IN ('green', 'yellow', 'red')),
  notes text,
  last_checkup date,
  position_x numeric(5,2),
  position_y numeric(5,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS medical_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  file_url text,
  file_type text CHECK (file_type IN ('pdf', 'image')),
  document_type text CHECK (document_type IN ('blood', 'xray', 'prescription', 'mri', 'ultrasound', 'other')),
  date date,
  summary text,
  tags text[] DEFAULT '{}',
  doctor_name text,
  clinic text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  type text CHECK (type IN ('weight', 'sleep', 'water', 'steps', 'mood', 'heart_rate', 'blood_pressure')),
  value numeric(10,2) NOT NULL,
  unit text,
  notes text,
  time time,
  source text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS health_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blood_type text,
  allergies text[] DEFAULT '{}',
  chronic_conditions text[] DEFAULT '{}',
  medications jsonb DEFAULT '[]',
  emergency_contact jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================
-- SKILLS
-- ============================================

CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  color text,
  category text,
  current_level integer DEFAULT 1,
  current_xp integer DEFAULT 0,
  xp_needed integer DEFAULT 3,
  total_xp_earned integer DEFAULT 0,
  last_activity_date date,
  is_decaying boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skill_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  description text,
  xp_amount integer DEFAULT 1,
  activity_type text CHECK (activity_type IN ('theory', 'practice', 'result')),
  proof_url text,
  proof_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skill_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  level_achieved integer NOT NULL,
  certificate_url text,
  issued_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skill_decay_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  xp_lost integer DEFAULT 0,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_decay_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Identity
DROP POLICY IF EXISTS "Users can CRUD their own identity" ON identities;
CREATE POLICY "Users can CRUD their own identity" ON identities
  FOR ALL USING (auth.uid() = user_id);

-- Core Values
DROP POLICY IF EXISTS "Users can CRUD their own values" ON core_values;
CREATE POLICY "Users can CRUD their own values" ON core_values
  FOR ALL USING (auth.uid() = user_id);

-- Life Areas
DROP POLICY IF EXISTS "Users can CRUD their own areas" ON life_areas;
CREATE POLICY "Users can CRUD their own areas" ON life_areas
  FOR ALL USING (auth.uid() = user_id);

-- Roles
DROP POLICY IF EXISTS "Users can CRUD their own roles" ON roles;
CREATE POLICY "Users can CRUD their own roles" ON roles
  FOR ALL USING (auth.uid() = user_id);

-- Goals
DROP POLICY IF EXISTS "Users can CRUD their own goals" ON goals;
CREATE POLICY "Users can CRUD their own goals" ON goals
  FOR ALL USING (auth.uid() = user_id);

-- Milestones
DROP POLICY IF EXISTS "Users can CRUD their own milestones" ON milestones;
CREATE POLICY "Users can CRUD their own milestones" ON milestones
  FOR ALL USING (auth.uid() = user_id);

-- Projects
DROP POLICY IF EXISTS "Users can CRUD their own projects" ON projects;
CREATE POLICY "Users can CRUD their own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- Tasks
DROP POLICY IF EXISTS "Users can CRUD their own tasks" ON tasks;
CREATE POLICY "Users can CRUD their own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- Habits
DROP POLICY IF EXISTS "Users can CRUD their own habits" ON habits;
CREATE POLICY "Users can CRUD their own habits" ON habits
  FOR ALL USING (auth.uid() = user_id);

-- Habit Entries
DROP POLICY IF EXISTS "Users can CRUD their own habit entries" ON habit_entries;
CREATE POLICY "Users can CRUD their own habit entries" ON habit_entries
  FOR ALL USING (auth.uid() = user_id);

-- Reviews
DROP POLICY IF EXISTS "Users can CRUD their own daily reviews" ON daily_reviews;
CREATE POLICY "Users can CRUD their own daily reviews" ON daily_reviews
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can CRUD their own weekly reviews" ON weekly_reviews;
CREATE POLICY "Users can CRUD their own weekly reviews" ON weekly_reviews
  FOR ALL USING (auth.uid() = user_id);

-- Journal
DROP POLICY IF EXISTS "Users can CRUD their own journal entries" ON journal_entries;
CREATE POLICY "Users can CRUD their own journal entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);

-- Stats
DROP POLICY IF EXISTS "Users can CRUD their own stats" ON user_stats;
CREATE POLICY "Users can CRUD their own stats" ON user_stats
  FOR ALL USING (auth.uid() = user_id);

-- Wishes
DROP POLICY IF EXISTS "Users can CRUD their own wishes" ON wishes;
CREATE POLICY "Users can CRUD their own wishes" ON wishes
  FOR ALL USING (auth.uid() = user_id);

-- Achievements
DROP POLICY IF EXISTS "Users can CRUD their own achievements" ON achievements;
CREATE POLICY "Users can CRUD their own achievements" ON achievements
  FOR ALL USING (auth.uid() = user_id);

-- Finance
DROP POLICY IF EXISTS "Users can CRUD their own accounts" ON accounts;
CREATE POLICY "Users can CRUD their own accounts" ON accounts
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can CRUD their own transactions" ON transactions;
CREATE POLICY "Users can CRUD their own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can CRUD their own financial goals" ON financial_goals;
CREATE POLICY "Users can CRUD their own financial goals" ON financial_goals
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can CRUD their own budgets" ON budgets;
CREATE POLICY "Users can CRUD their own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);

-- Health
DROP POLICY IF EXISTS "Users can CRUD their own body zones" ON body_zones;
CREATE POLICY "Users can CRUD their own body zones" ON body_zones
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can CRUD their own medical documents" ON medical_documents;
CREATE POLICY "Users can CRUD their own medical documents" ON medical_documents
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can CRUD their own health metrics" ON health_metrics;
CREATE POLICY "Users can CRUD their own health metrics" ON health_metrics
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can CRUD their own health profiles" ON health_profiles;
CREATE POLICY "Users can CRUD their own health profiles" ON health_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Skills
DROP POLICY IF EXISTS "Users can CRUD their own skills" ON skills;
CREATE POLICY "Users can CRUD their own skills" ON skills
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can CRUD their own skill activities" ON skill_activities;
CREATE POLICY "Users can CRUD their own skill activities" ON skill_activities
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can CRUD their own skill certificates" ON skill_certificates;
CREATE POLICY "Users can CRUD their own skill certificates" ON skill_certificates
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can CRUD their own skill decay logs" ON skill_decay_logs;
CREATE POLICY "Users can CRUD their own skill decay logs" ON skill_decay_logs
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================

DO $$
BEGIN
  -- goals
  CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
  CREATE INDEX IF NOT EXISTS idx_goals_status  ON goals(status);
  CREATE INDEX IF NOT EXISTS idx_goals_area_id ON goals(area_id);

  -- tasks (базовые колонки — есть всегда)
  CREATE INDEX IF NOT EXISTS idx_tasks_user_id        ON tasks(user_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON tasks(scheduled_date);
  CREATE INDEX IF NOT EXISTS idx_tasks_status         ON tasks(status);

  -- project_id есть только если tasks создана из 003, иначе там goal_id (из 004)
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='tasks' AND column_name='project_id') THEN
    CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='tasks' AND column_name='goal_id') THEN
    CREATE INDEX IF NOT EXISTS idx_tasks_goal_id ON tasks(goal_id);
  END IF;

  -- habits
  CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);

  -- habit_entries
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='habit_entries') THEN
    CREATE INDEX IF NOT EXISTS idx_habit_entries_user_id  ON habit_entries(user_id);
    CREATE INDEX IF NOT EXISTS idx_habit_entries_habit_id ON habit_entries(habit_id);
    CREATE INDEX IF NOT EXISTS idx_habit_entries_date     ON habit_entries(date);
  END IF;

  -- transactions
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='transactions') THEN
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id    ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date       ON transactions(transaction_date);
  END IF;

  -- health_metrics
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='health_metrics') THEN
    CREATE INDEX IF NOT EXISTS idx_health_metrics_user_id ON health_metrics(user_id);
    CREATE INDEX IF NOT EXISTS idx_health_metrics_type    ON health_metrics(type);
    CREATE INDEX IF NOT EXISTS idx_health_metrics_date    ON health_metrics(date);
  END IF;

  -- skills / skill_activities
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='skills') THEN
    CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='skill_activities') THEN
    CREATE INDEX IF NOT EXISTS idx_skill_activities_skill_id ON skill_activities(skill_id);
  END IF;
END$$;

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime for all tables
DO $$
BEGIN
  -- Check if publication exists, create if not
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END
$$;

-- Add tables to realtime publication (игнорируем если уже добавлены)
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['tasks','habits','goals','projects','user_stats','transactions','health_metrics','skills']
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
    EXCEPTION WHEN others THEN
      -- таблица уже в публикации или не существует — пропускаем
    END;
  END LOOP;
END$$;
