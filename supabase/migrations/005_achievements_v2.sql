-- ============================================
-- Migration 005: Achievements — full schema
-- ============================================

-- ============================================
-- ACHIEVEMENTS TABLE (base + v2 columns)
-- ============================================
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    type TEXT CHECK (type IN ('micro', 'macro', 'breakthrough', 'moment')),
    achievement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    achievement_time TIME,
    emotion_tag TEXT CHECK (emotion_tag IN ('proud', 'relieved', 'excited', 'grateful', 'surprised', 'scared', 'joyful')),
    lesson_learned TEXT,
    media_urls TEXT[] NOT NULL DEFAULT '{}',
    cover_image_index INTEGER NOT NULL DEFAULT 0,
    is_auto_generated BOOLEAN NOT NULL DEFAULT false,
    is_time_capsule BOOLEAN NOT NULL DEFAULT false,
    unlock_date DATE,
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    is_private BOOLEAN NOT NULL DEFAULT true,
    share_token TEXT,
    xp_awarded INTEGER NOT NULL DEFAULT 0,
    badge_icon TEXT,
    badge_color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own achievements" ON public.achievements;
CREATE POLICY "Users can view own achievements"
    ON public.achievements FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own achievements" ON public.achievements;
CREATE POLICY "Users can create own achievements"
    ON public.achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own achievements" ON public.achievements;
CREATE POLICY "Users can update own achievements"
    ON public.achievements FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own achievements" ON public.achievements;
CREATE POLICY "Users can delete own achievements"
    ON public.achievements FOR DELETE
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_achievements_updated_at ON public.achievements;
CREATE TRIGGER update_achievements_updated_at
    BEFORE UPDATE ON public.achievements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON public.achievements(type);
CREATE INDEX IF NOT EXISTS idx_achievements_achievement_date ON public.achievements(achievement_date);
CREATE INDEX IF NOT EXISTS idx_achievements_is_favorite ON public.achievements(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_achievements_is_time_capsule ON public.achievements(user_id, is_time_capsule);

-- ============================================
-- Achievement Stats table (per-user counters)
-- ============================================
CREATE TABLE IF NOT EXISTS public.achievement_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    total_count INTEGER NOT NULL DEFAULT 0,
    micro_count INTEGER NOT NULL DEFAULT 0,
    macro_count INTEGER NOT NULL DEFAULT 0,
    breakthrough_count INTEGER NOT NULL DEFAULT 0,
    moment_count INTEGER NOT NULL DEFAULT 0,
    favorite_count INTEGER NOT NULL DEFAULT 0,
    time_capsule_count INTEGER NOT NULL DEFAULT 0,
    time_capsule_unlocked_count INTEGER NOT NULL DEFAULT 0,
    current_streak_days INTEGER NOT NULL DEFAULT 0,
    longest_streak_days INTEGER NOT NULL DEFAULT 0,
    last_achievement_date DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.achievement_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD their own achievement_stats" ON public.achievement_stats;
CREATE POLICY "Users can CRUD their own achievement_stats"
    ON public.achievement_stats FOR ALL
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_achievement_stats_user_id ON public.achievement_stats(user_id);

-- ============================================
-- Achievement Collections table
-- ============================================
CREATE TABLE IF NOT EXISTS public.achievement_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL DEFAULT 'folder',
    color TEXT NOT NULL DEFAULT '#6366f1',
    is_default BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.achievement_collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD their own achievement_collections" ON public.achievement_collections;
CREATE POLICY "Users can CRUD their own achievement_collections"
    ON public.achievement_collections FOR ALL
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_achievement_collections_user_id ON public.achievement_collections(user_id);

-- ============================================
-- Achievement Links table (source references)
-- ============================================
CREATE TABLE IF NOT EXISTS public.achievement_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('goal', 'skill', 'habit', 'health', 'finance', 'task', 'manual')),
    source_id TEXT,
    source_title TEXT,
    link_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.achievement_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD their own achievement_links" ON public.achievement_links;
CREATE POLICY "Users can CRUD their own achievement_links"
    ON public.achievement_links FOR ALL
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_achievement_links_achievement_id ON public.achievement_links(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievement_links_user_id ON public.achievement_links(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_links_source ON public.achievement_links(source_type, source_id);

-- ============================================
-- Junction table: achievement ↔ collection
-- ============================================
CREATE TABLE IF NOT EXISTS public.achievement_collection_items (
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    collection_id UUID REFERENCES public.achievement_collections(id) ON DELETE CASCADE NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (achievement_id, collection_id)
);

ALTER TABLE public.achievement_collection_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own collection items" ON public.achievement_collection_items;
CREATE POLICY "Users can manage their own collection items"
    ON public.achievement_collection_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.achievements a
            WHERE a.id = achievement_id AND a.user_id = auth.uid()
        )
    );
