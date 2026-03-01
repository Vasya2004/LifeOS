-- ============================================================
-- 009: User Backups Table
-- Stores automated daily snapshots of user data (JSON)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_backups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version     TEXT NOT NULL,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Each user can only access their own backups
ALTER TABLE user_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own backups"
  ON user_backups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own backups"
  ON user_backups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own backups"
  ON user_backups FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast per-user lookup sorted by date
CREATE INDEX IF NOT EXISTS idx_user_backups_user_created
  ON user_backups (user_id, created_at DESC);
