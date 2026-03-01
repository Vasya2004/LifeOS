-- ============================================
-- 006_projects.sql — Projects module (standalone, no goal dependency)
-- ============================================

CREATE TABLE IF NOT EXISTS projects (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core
  title        text NOT NULL,
  description  text NOT NULL DEFAULT '',
  status       text NOT NULL DEFAULT 'active'
               CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  priority     integer NOT NULL DEFAULT 3
               CHECK (priority BETWEEN 1 AND 5),

  -- Visual
  color        text NOT NULL DEFAULT '#6366f1',
  icon         text NOT NULL DEFAULT '🚀',

  -- Relations (optional)
  goal_id      uuid REFERENCES goals(id) ON DELETE SET NULL,
  area_id      uuid REFERENCES life_areas(id) ON DELETE SET NULL,

  -- Dates
  started_at   date NOT NULL DEFAULT CURRENT_DATE,
  deadline     date,
  completed_at date,

  -- Gamification
  xp_awarded   integer NOT NULL DEFAULT 0,

  -- Timestamps
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id     ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status       ON projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_goal_id      ON projects(goal_id) WHERE goal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_deadline     ON projects(deadline) WHERE deadline IS NOT NULL;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_projects_updated_at();

-- Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_own" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "projects_insert_own" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_update_own" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "projects_delete_own" ON projects
  FOR DELETE USING (auth.uid() = user_id);
