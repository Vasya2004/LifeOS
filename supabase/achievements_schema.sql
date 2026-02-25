-- ============================================
-- ACHIEVEMENTS MODULE - Hall of Fame
-- ============================================

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  
  -- Categorization
  category TEXT CHECK (category IN ('work', 'health', 'personal', 'skill', 'finance', 'relationships', 'other')),
  type TEXT CHECK (type IN ('micro', 'macro', 'breakthrough', 'moment')),
  
  -- Date & Time
  achievement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  achievement_time TIME,
  
  -- Emotional & Reflection
  emotion_tag TEXT CHECK (emotion_tag IN ('proud', 'relieved', 'excited', 'grateful', 'surprised', 'scared', 'joyful')),
  lesson_learned TEXT,
  
  -- Media
  media_urls TEXT[] DEFAULT '{}',
  cover_image_index INTEGER DEFAULT 0,
  
  -- Special Flags
  is_auto_generated BOOLEAN DEFAULT FALSE,
  is_time_capsule BOOLEAN DEFAULT FALSE,
  unlock_date TIMESTAMPTZ,
  is_favorite BOOLEAN DEFAULT FALSE,
  
  -- Visibility & Sharing
  is_private BOOLEAN DEFAULT TRUE,
  share_token TEXT,
  
  -- Gamification
  xp_awarded INTEGER DEFAULT 0,
  badge_icon TEXT DEFAULT 'award',
  badge_color TEXT DEFAULT '#6366f1',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict'))
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own achievements"
  ON achievements FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_achievements_user_date ON achievements(user_id, achievement_date DESC);
CREATE INDEX idx_achievements_type ON achievements(user_id, type);
CREATE INDEX idx_achievements_category ON achievements(user_id, category);
CREATE INDEX idx_achievements_favorite ON achievements(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_achievements_time_capsule ON achievements(user_id, unlock_date) WHERE is_time_capsule = TRUE;

-- ============================================
-- ACHIEVEMENT LINKS (connect to other modules)
-- ============================================
CREATE TABLE achievement_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_id UUID REFERENCES achievements ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  -- Link to source
  source_type TEXT CHECK (source_type IN ('goal', 'skill', 'habit', 'health', 'finance', 'task', 'manual')),
  source_id TEXT,
  source_title TEXT,
  
  -- Link metadata
  link_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE achievement_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own achievement links"
  ON achievement_links FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_achievement_links_achievement ON achievement_links(achievement_id);
CREATE INDEX idx_achievement_links_source ON achievement_links(user_id, source_type, source_id);

-- ============================================
-- ACHIEVEMENT COLLECTIONS (folders/tags)
-- ============================================
CREATE TABLE achievement_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT '#6366f1',
  
  is_default BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE achievement_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own collections"
  ON achievement_collections FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- ACHIEVEMENT TO COLLECTION MAPPING
-- ============================================
CREATE TABLE achievement_collection_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_id UUID REFERENCES achievements ON DELETE CASCADE NOT NULL,
  collection_id UUID REFERENCES achievement_collections ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  added_at TIMESTAMPTZ DEFAULT NOW(),
  note TEXT,
  
  UNIQUE(achievement_id, collection_id)
);

ALTER TABLE achievement_collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own collection items"
  ON achievement_collection_items FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- DEFAULT COLLECTIONS TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION create_default_achievement_collections()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO achievement_collections (user_id, name, description, icon, color, is_default, sort_order) VALUES
    (NEW.id, 'Все достижения', 'Все ваши победы в одном месте', 'trophy', '#6366f1', TRUE, 0),
    (NEW.id, 'Избранное', 'Особо значимые достижения', 'heart', '#ec4899', TRUE, 1),
    (NEW.id, 'Капсулы времени', 'Достижения с отложенным открытием', 'clock', '#f59e0b', TRUE, 2),
    (NEW.id, 'Микро-победы', 'Маленькие, но важные шаги', 'zap', '#22c55e', TRUE, 3),
    (NEW.id, 'Прорывы', 'Преодоление страхов и лимитов', 'star', '#8b5cf6', TRUE, 4);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to create default collections on user signup
CREATE TRIGGER on_auth_user_create_collections
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_achievement_collections();

-- ============================================
-- ACHIEVEMENT STATS (cached counters)
-- ============================================
CREATE TABLE achievement_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  
  total_count INTEGER DEFAULT 0,
  micro_count INTEGER DEFAULT 0,
  macro_count INTEGER DEFAULT 0,
  breakthrough_count INTEGER DEFAULT 0,
  moment_count INTEGER DEFAULT 0,
  
  favorite_count INTEGER DEFAULT 0,
  time_capsule_count INTEGER DEFAULT 0,
  time_capsule_unlocked_count INTEGER DEFAULT 0,
  
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_achievement_date DATE,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE achievement_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats"
  ON achievement_stats FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR ACHIEVEMENTS
-- ============================================

-- Update timestamps
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievement_collections_updated_at BEFORE UPDATE ON achievement_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initialize stats on user signup
CREATE OR REPLACE FUNCTION initialize_achievement_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO achievement_stats (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_create_achievement_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_achievement_stats();

-- ============================================
-- REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE achievement_links;
ALTER PUBLICATION supabase_realtime ADD TABLE achievement_collections;
ALTER PUBLICATION supabase_realtime ADD TABLE achievement_collection_items;
ALTER PUBLICATION supabase_realtime ADD TABLE achievement_stats;

-- ============================================
-- AUTO-GENERATE ACHIEVEMENTS FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION check_and_create_auto_achievements()
RETURNS TRIGGER AS $$
DECLARE
  milestone_achieved INTEGER;
BEGIN
  -- Check goal completion
  IF TG_TABLE_NAME = 'goals' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO achievements (
      user_id, title, description, category, type, 
      achievement_date, is_auto_generated, source_type, source_id,
      xp_awarded, badge_icon, badge_color
    ) VALUES (
      NEW.user_id, 
      'Цель достигнута: ' || NEW.title,
      COALESCE(NEW.description, 'Вы достигли важной цели!'),
      'personal',
      'macro',
      CURRENT_DATE,
      TRUE,
      'goal',
      NEW.id,
      100 + (NEW.priority * 25),
      'target',
      '#3b82f6'
    );
  END IF;
  
  -- Check skill level up
  IF TG_TABLE_NAME = 'skills' AND NEW.current_level > OLD.current_level THEN
    IF NEW.current_level IN (5, 10, 15, 20, 25) THEN
      INSERT INTO achievements (
        user_id, title, description, category, type,
        achievement_date, is_auto_generated,
        xp_awarded, badge_icon, badge_color
      ) VALUES (
        NEW.user_id,
        'Навык ' || NEW.name || ' достиг уровня ' || NEW.current_level,
        'Поздравляем с прокачкой навыка!',
        'skill',
        CASE 
          WHEN NEW.current_level >= 10 THEN 'macro'
          ELSE 'micro'
        END,
        CURRENT_DATE,
        TRUE,
        50 * NEW.current_level,
        'sparkles',
        NEW.color
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Triggers for auto-achievements need to be added manually after table creation
-- CREATE TRIGGER on_goal_completed
--   AFTER UPDATE ON goals
--   FOR EACH ROW EXECUTE FUNCTION check_and_create_auto_achievements();
