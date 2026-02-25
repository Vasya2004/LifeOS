-- ============================================
-- LifeOS Database Schema
-- ============================================

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Игрок 1',
  avatar_url TEXT,
  vision TEXT DEFAULT '',
  mission TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  onboarding_completed BOOLEAN DEFAULT FALSE
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- LIFE AREAS
-- ============================================
CREATE TABLE life_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'circle',
  color TEXT DEFAULT '#6366f1',
  vision TEXT DEFAULT '',
  current_level INTEGER DEFAULT 1 CHECK (current_level BETWEEN 1 AND 10),
  target_level INTEGER DEFAULT 10 CHECK (target_level BETWEEN 1 AND 10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict')),
  local_id TEXT -- для связи с localStorage
);

ALTER TABLE life_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own areas"
  ON life_areas FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_areas_user_id ON life_areas(user_id);

-- ============================================
-- CORE VALUES
-- ============================================
CREATE TABLE core_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  importance INTEGER DEFAULT 3 CHECK (importance BETWEEN 1 AND 5),
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced',
  local_id TEXT
);

ALTER TABLE core_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own values"
  ON core_values FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- GOALS
-- ============================================
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  area_id UUID REFERENCES life_areas ON DELETE SET NULL,
  type TEXT DEFAULT 'outcome' CHECK (type IN ('outcome', 'process')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'dropped')),
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  target_date DATE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  related_values UUID[] DEFAULT '{}',
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced',
  local_id TEXT
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own goals"
  ON goals FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(user_id, status);

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES goals ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  duration INTEGER, -- в минутах
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  energy_cost TEXT DEFAULT 'medium' CHECK (energy_cost IN ('low', 'medium', 'high')),
  energy_type TEXT DEFAULT 'mental' CHECK (energy_type IN ('physical', 'mental', 'emotional', 'creative')),
  completed_at TIMESTAMPTZ,
  actual_duration INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced',
  local_id TEXT
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_tasks_user_date ON tasks(user_id, scheduled_date);
CREATE INDEX idx_tasks_status ON tasks(user_id, status);

-- ============================================
-- HABITS
-- ============================================
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  area_id UUID REFERENCES life_areas ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'custom')),
  target_days INTEGER[] DEFAULT '{1,2,3,4,5}',
  target_count INTEGER DEFAULT 3,
  energy_impact INTEGER DEFAULT 0,
  energy_type TEXT DEFAULT 'physical',
  streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced',
  local_id TEXT
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own habits"
  ON habits FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- HABIT ENTRIES
-- ============================================
CREATE TABLE habit_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced',
  UNIQUE(habit_id, date)
);

ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own habit entries"
  ON habit_entries FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- SKILLS
-- ============================================
CREATE TABLE skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT 'star',
  color TEXT DEFAULT '#6366f1',
  category TEXT DEFAULT 'other',
  current_level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  xp_needed INTEGER DEFAULT 3,
  total_xp_earned INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  is_decaying BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced',
  local_id TEXT
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own skills"
  ON skills FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- SKILL ACTIVITIES
-- ============================================
CREATE TABLE skill_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID REFERENCES skills ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  xp_amount INTEGER NOT NULL CHECK (xp_amount BETWEEN 1 AND 3),
  activity_type TEXT DEFAULT 'practice' CHECK (activity_type IN ('theory', 'practice', 'result')),
  proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced'
);

ALTER TABLE skill_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own skill activities"
  ON skill_activities FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- USER STATS
-- ============================================
CREATE TABLE user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  xp_to_next INTEGER DEFAULT 1000,
  coins INTEGER DEFAULT 0,
  total_coins_earned INTEGER DEFAULT 0,
  total_coins_spent INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  total_tasks_completed INTEGER DEFAULT 0,
  total_goals_achieved INTEGER DEFAULT 0,
  total_projects_completed INTEGER DEFAULT 0,
  total_habit_completions INTEGER DEFAULT 0,
  total_deep_work_hours INTEGER DEFAULT 0,
  total_focus_sessions INTEGER DEFAULT 0,
  avg_daily_tasks FLOAT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced'
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- FINANCE - ACCOUNTS
-- ============================================
CREATE TABLE accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'cash' CHECK (type IN ('cash', 'bank', 'investment', 'crypto', 'debt')),
  balance DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'wallet',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced',
  local_id TEXT
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own accounts"
  ON accounts FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- FINANCE - TRANSACTIONS
-- ============================================
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts ON DELETE CASCADE NOT NULL,
  type TEXT DEFAULT 'expense' CHECK (type IN ('income', 'expense', 'transfer')),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  transaction_date DATE NOT NULL,
  related_goal_id UUID REFERENCES goals ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced',
  local_id TEXT
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date);

-- ============================================
-- HEALTH - BODY ZONES
-- ============================================
CREATE TABLE body_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  icon TEXT DEFAULT 'circle',
  status TEXT DEFAULT 'green' CHECK (status IN ('green', 'yellow', 'red')),
  notes TEXT DEFAULT '',
  last_checkup DATE,
  position_x INTEGER DEFAULT 50,
  position_y INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced'
);

ALTER TABLE body_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own body zones"
  ON body_zones FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- SYNC QUEUE (for offline-first)
-- ============================================
CREATE TABLE sync_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('insert', 'update', 'delete')),
  record_id TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  processed_at TIMESTAMPTZ
);

ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own sync queue"
  ON sync_queue FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update timestamps function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_life_areas_updated_at BEFORE UPDATE ON life_areas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create user stats on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Игрок 1'));
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE life_areas;
ALTER PUBLICATION supabase_realtime ADD TABLE goals;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE habits;
ALTER PUBLICATION supabase_realtime ADD TABLE skills;
ALTER PUBLICATION supabase_realtime ADD TABLE user_stats;
