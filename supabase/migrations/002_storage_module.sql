-- ============================================
-- STORAGE MODULE - Хранилище Данных
-- Knowledge Application System with Organized Storage
-- ============================================

-- ============================================
-- FOLDERS/CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.storage_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_folder_id UUID REFERENCES public.storage_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('insights', 'contacts', 'resources', 'templates', 'custom')),
  icon TEXT DEFAULT '📁',
  color TEXT DEFAULT '#6366f1',
  description TEXT,
  sort_order INT DEFAULT 0,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.storage_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own folders"
  ON public.storage_folders FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- LEARNING SOURCES
-- ============================================
CREATE TABLE IF NOT EXISTS public.learning_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.storage_folders(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('book', 'course', 'article', 'video', 'mentor', 'podcast', 'event')),
  title TEXT NOT NULL,
  author TEXT,
  url TEXT,
  status TEXT CHECK (status IN ('planned', 'in_progress', 'completed', 'abandoned')) DEFAULT 'planned',
  progress_percent INT DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  started_at DATE,
  completed_at DATE,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learning_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own learning sources"
  ON public.learning_sources FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CONTACTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.storage_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.storage_folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  company TEXT,
  position TEXT,
  email TEXT,
  phone TEXT,
  social_links JSONB DEFAULT '{}',
  category TEXT CHECK (category IN ('mentor', 'colleague', 'friend', 'client', 'partner', 'other')),
  last_contact_date DATE,
  next_followup_date DATE,
  notes TEXT,
  relationship_strength INT CHECK (relationship_strength BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.storage_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own contacts"
  ON public.storage_contacts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INSIGHTS (Key takeaways with action plan)
-- ============================================
CREATE TABLE IF NOT EXISTS public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.storage_folders(id) ON DELETE SET NULL,
  source_id UUID REFERENCES public.learning_sources(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  application_plan TEXT NOT NULL,
  related_skill_id UUID,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'in_action', 'completed', 'archived')) DEFAULT 'pending',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_action_date TIMESTAMPTZ
);

ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own insights"
  ON public.insights FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- RESOURCES
-- ============================================
CREATE TABLE IF NOT EXISTS public.storage_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.storage_folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('file', 'link', 'document', 'image', 'video')) DEFAULT 'link',
  url TEXT,
  file_path TEXT,
  file_size INT,
  mime_type TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.storage_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own resources"
  ON public.storage_resources FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- DEFAULT FOLDERS CREATION
-- ============================================
CREATE OR REPLACE FUNCTION public.create_default_storage_folders()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.storage_folders (user_id, name, type, icon, color, description, is_system, sort_order) VALUES
    (NEW.id, 'Инсайты', 'insights', '💡', '#fbbf24', 'Ключевые выводы с планом применения', true, 1),
    (NEW.id, 'Контакты', 'contacts', '👥', '#3b82f6', 'Полезные знакомства и связи', true, 2),
    (NEW.id, 'Ресурсы', 'resources', '📚', '#22c55e', 'Полезные материалы и ссылки', true, 3),
    (NEW.id, 'Источники', 'custom', '🎯', '#8b5cf6', 'Книги, курсы, статьи для изучения', true, 4),
    (NEW.id, 'Шаблоны', 'templates', '📋', '#ec4899', 'Повторяемые процессы и шаблоны', true, 5);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_storage'
  ) THEN
    CREATE TRIGGER on_auth_user_created_storage
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.create_default_storage_folders();
  END IF;
END
$$;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_storage_folders_user_id ON public.storage_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sources_user_id ON public.learning_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON public.insights(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_contacts_user_id ON public.storage_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_resources_user_id ON public.storage_resources(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_status ON public.insights(status);
CREATE INDEX IF NOT EXISTS idx_insights_priority ON public.insights(priority);
CREATE INDEX IF NOT EXISTS idx_learning_sources_status ON public.learning_sources(status);

-- ============================================
-- UPDATE TRIGGERS
-- ============================================
CREATE TRIGGER update_storage_folders_updated_at
  BEFORE UPDATE ON public.storage_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_sources_updated_at
  BEFORE UPDATE ON public.learning_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insights_updated_at
  BEFORE UPDATE ON public.insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storage_contacts_updated_at
  BEFORE UPDATE ON public.storage_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storage_resources_updated_at
  BEFORE UPDATE ON public.storage_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
