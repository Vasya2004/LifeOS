-- ============================================
-- CORE TABLES: life_areas, core_values, goals, tasks
-- ============================================

-- Add onboarding_completed to profiles if missing
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- ============================================
-- LIFE AREAS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.life_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '🎯',
    color TEXT DEFAULT '#6366f1',
    vision TEXT DEFAULT '',
    current_level INTEGER DEFAULT 0,
    target_level INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.life_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own life areas" ON public.life_areas;
CREATE POLICY "Users can view own life areas"
    ON public.life_areas FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own life areas" ON public.life_areas;
CREATE POLICY "Users can create own life areas"
    ON public.life_areas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own life areas" ON public.life_areas;
CREATE POLICY "Users can update own life areas"
    ON public.life_areas FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own life areas" ON public.life_areas;
CREATE POLICY "Users can delete own life areas"
    ON public.life_areas FOR DELETE
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_life_areas_updated_at ON public.life_areas;
CREATE TRIGGER update_life_areas_updated_at
    BEFORE UPDATE ON public.life_areas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_life_areas_user_id ON public.life_areas(user_id);

-- ============================================
-- CORE VALUES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.core_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    importance INTEGER DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.core_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own core values" ON public.core_values;
CREATE POLICY "Users can view own core values"
    ON public.core_values FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own core values" ON public.core_values;
CREATE POLICY "Users can create own core values"
    ON public.core_values FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own core values" ON public.core_values;
CREATE POLICY "Users can update own core values"
    ON public.core_values FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own core values" ON public.core_values;
CREATE POLICY "Users can delete own core values"
    ON public.core_values FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_core_values_user_id ON public.core_values(user_id);

-- ============================================
-- GOALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    area_id UUID,
    type TEXT DEFAULT 'outcome' CHECK (type IN ('outcome', 'process')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    target_date DATE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    milestones JSONB DEFAULT '[]',
    related_values JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
CREATE POLICY "Users can view own goals"
    ON public.goals FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own goals" ON public.goals;
CREATE POLICY "Users can create own goals"
    ON public.goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
CREATE POLICY "Users can update own goals"
    ON public.goals FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals;
CREATE POLICY "Users can delete own goals"
    ON public.goals FOR DELETE
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_area_id ON public.goals(area_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(status);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    duration INTEGER,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    energy_cost TEXT DEFAULT 'medium' CHECK (energy_cost IN ('low', 'medium', 'high')),
    energy_type TEXT DEFAULT 'mental' CHECK (energy_type IN ('physical', 'mental', 'emotional', 'creative')),
    completed_at TIMESTAMPTZ,
    actual_duration INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks"
    ON public.tasks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own tasks" ON public.tasks;
CREATE POLICY "Users can create own tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks"
    ON public.tasks FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks"
    ON public.tasks FOR DELETE
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON public.tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_tasks_goal_id ON public.tasks(goal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
