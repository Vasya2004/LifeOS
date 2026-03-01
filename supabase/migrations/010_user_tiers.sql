-- ============================================================
-- 010: User Tiers Reference Table
-- Stores tier definitions (levels 1-7) previously hardcoded
-- in lib/level-calculation.ts — now in DB for flexibility.
-- ============================================================

CREATE TABLE IF NOT EXISTS user_tiers (
  id          SMALLINT PRIMARY KEY,          -- tier index 1..7
  name        TEXT NOT NULL,
  min_level   SMALLINT NOT NULL,
  color       TEXT NOT NULL,
  gradient    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Read-only for all authenticated users (reference data)
ALTER TABLE user_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tiers"
  ON user_tiers FOR SELECT
  TO authenticated
  USING (true);

-- Seed the 7 tiers (mirrors TIER_CONFIGS in lib/level-calculation.ts)
INSERT INTO user_tiers (id, name, min_level, color, gradient) VALUES
  (1, 'Новичок',  1,  'hsl(var(--muted-foreground))',  'from-slate-400 to-slate-600'),
  (2, 'Ученик',   5,  'hsl(210, 80%, 55%)',             'from-blue-400 to-blue-600'),
  (3, 'Адепт',    10, 'hsl(270, 70%, 60%)',             'from-purple-400 to-purple-600'),
  (4, 'Ветеран',  20, 'hsl(25, 90%, 55%)',              'from-orange-400 to-orange-600'),
  (5, 'Эксперт',  30, 'hsl(0, 75%, 55%)',               'from-red-400 to-red-600'),
  (6, 'Мастер',   40, 'hsl(45, 90%, 50%)',              'from-yellow-400 to-amber-500'),
  (7, 'Легенда',  50, 'hsl(280, 80%, 65%)',             'from-violet-400 via-pink-500 to-amber-400')
ON CONFLICT (id) DO UPDATE SET
  name      = EXCLUDED.name,
  min_level = EXCLUDED.min_level,
  color     = EXCLUDED.color,
  gradient  = EXCLUDED.gradient;

-- Index for min_level lookups (e.g. "find tier for level 25")
CREATE INDEX IF NOT EXISTS idx_user_tiers_min_level ON user_tiers (min_level);
