-- ============================================
-- INTEGRATIONS TABLE
-- ============================================

-- Create integrations table for external service connections
CREATE TABLE IF NOT EXISTS integrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  connected boolean DEFAULT false,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  config jsonb DEFAULT '{}'::jsonb,
  last_sync timestamptz,
  error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, type)
);

-- Enable RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own integrations"
  ON integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations"
  ON integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
  ON integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
  ON integrations FOR DELETE
  USING (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_type ON integrations(type);

-- ============================================
-- SYNC CONFLICTS TABLE (for manual resolution)
-- ============================================

CREATE TABLE IF NOT EXISTS sync_conflicts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  local_data jsonb NOT NULL,
  remote_data jsonb NOT NULL,
  local_version integer,
  remote_version integer,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'ignored')),
  resolution text CHECK (resolution IN ('local-wins', 'remote-wins', 'merge')),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

ALTER TABLE sync_conflicts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conflicts"
  ON sync_conflicts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can resolve their own conflicts"
  ON sync_conflicts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_sync_conflicts_user_id ON sync_conflicts(user_id);
CREATE INDEX idx_sync_conflicts_status ON sync_conflicts(status);
