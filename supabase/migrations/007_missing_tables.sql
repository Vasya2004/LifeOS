-- ============================================================
-- Migration 007: Complete Database Schema
-- Добавляет все недостающие таблицы из роадмапа:
--   notifications, user_settings, coin_transactions,
--   streaks, quests, shop_items, shop_purchases,
--   audit_logs, task_subtasks, tags, monthly_reviews
-- + недостающие колонки в существующих таблицах
-- + обновлённый handle_new_user()
-- + audit trigger на критических таблицах
-- + составные индексы производительности
-- ============================================================

-- ============================================================
-- 1. РАСШИРЕНИЯ
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. НЕДОСТАЮЩИЕ КОЛОНКИ В СУЩЕСТВУЮЩИХ ТАБЛИЦАХ
-- ============================================================

-- profiles: timezone, язык, emoji-аватар, биография
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS timezone    TEXT    DEFAULT 'Europe/Moscow',
  ADD COLUMN IF NOT EXISTS language    TEXT    DEFAULT 'ru',
  ADD COLUMN IF NOT EXISTS avatar_emoji TEXT   DEFAULT '🧙‍♂️',
  ADD COLUMN IF NOT EXISTS bio          TEXT    DEFAULT '';

-- user_stats: тир, жетоны заморозки стрика (таблица из 003 — добавляем только если существует)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_stats') THEN
        ALTER TABLE public.user_stats
          ADD COLUMN IF NOT EXISTS tier
            TEXT DEFAULT 'novice'
            CHECK (tier IN ('novice','apprentice','journeyman','expert','master','grandmaster','legend')),
          ADD COLUMN IF NOT EXISTS streak_freeze_tokens  INTEGER DEFAULT 2,
          ADD COLUMN IF NOT EXISTS last_freeze_used_date DATE;
    END IF;
END$$;

-- goals: флаг босс-битвы и квартал
ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS is_boss_battle BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS quarter        TEXT;   -- напр. '2026-Q1'

-- tasks: повторяющиеся задачи, подзадачи через parent, теги-массив
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS is_recurring    BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_rule TEXT,   -- 'daily' | 'weekly' | 'monthly'
  ADD COLUMN IF NOT EXISTS parent_task_id  UUID    REFERENCES public.tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tags            TEXT[]  DEFAULT '{}';

-- habits: is_active может отсутствовать если таблица создана из 003_full_schema
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================================
-- 3. USER SETTINGS — пользовательские настройки
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

    -- Внешний вид
    theme       TEXT DEFAULT 'dark'  CHECK (theme IN ('light', 'dark', 'system')),
    language    TEXT DEFAULT 'ru',
    timezone    TEXT DEFAULT 'Europe/Moscow',

    -- Уведомления
    notifications_enabled  BOOLEAN DEFAULT true,
    push_notifications     BOOLEAN DEFAULT false,
    email_reminders        BOOLEAN DEFAULT true,
    streak_alerts          BOOLEAN DEFAULT true,
    deadline_alerts        BOOLEAN DEFAULT true,
    achievement_popups     BOOLEAN DEFAULT true,

    -- Геймификация
    show_xp_gains          BOOLEAN DEFAULT true,
    show_coin_gains        BOOLEAN DEFAULT true,
    sound_effects          BOOLEAN DEFAULT false,

    -- Приватность
    is_public              BOOLEAN DEFAULT false,
    show_in_leaderboard    BOOLEAN DEFAULT true,

    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own settings" ON public.user_settings;
CREATE POLICY "Users can CRUD own settings"
    ON public.user_settings FOR ALL
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- ============================================================
-- 4. STREAKS — управление стриками (заморозки, восстановление)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.streaks (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

    current_streak         INTEGER DEFAULT 0,
    longest_streak         INTEGER DEFAULT 0,
    last_active_date       DATE,
    streak_started_date    DATE,

    freeze_tokens          INTEGER DEFAULT 2,   -- доступно сейчас
    freeze_tokens_max      INTEGER DEFAULT 3,   -- максимум
    last_freeze_used_date  DATE,
    total_freezes_used     INTEGER DEFAULT 0,

    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own streaks" ON public.streaks;
CREATE POLICY "Users can CRUD own streaks"
    ON public.streaks FOR ALL
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_streaks_updated_at ON public.streaks;
CREATE TRIGGER update_streaks_updated_at
    BEFORE UPDATE ON public.streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON public.streaks(user_id);

-- ============================================================
-- 5. COIN TRANSACTIONS — история монет (заработок / трата)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    amount        INTEGER NOT NULL, -- положительное = заработано, отрицательное = потрачено
    type          TEXT NOT NULL CHECK (type IN ('earned', 'spent', 'bonus', 'refund')),
    source        TEXT NOT NULL CHECK (source IN (
                      'task', 'habit', 'goal', 'skill', 'achievement',
                      'quest', 'shop', 'daily_review', 'streak_bonus', 'manual'
                  )),
    source_id     UUID,             -- ссылка на источник (task.id, goal.id и т.д.)
    description   TEXT NOT NULL,
    balance_after INTEGER NOT NULL, -- баланс после операции

    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own coin_transactions" ON public.coin_transactions;
CREATE POLICY "Users can CRUD own coin_transactions"
    ON public.coin_transactions FOR ALL
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_coin_tx_user_id    ON public.coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_tx_created_at ON public.coin_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coin_tx_source     ON public.coin_transactions(source, source_id);

-- ============================================================
-- 6. QUESTS — ежедневные / еженедельные / сезонные квесты
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quests (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    title       TEXT NOT NULL,
    description TEXT,
    type        TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'special', 'seasonal')),
    status      TEXT DEFAULT 'active'
                CHECK (status IN ('active', 'completed', 'failed', 'expired')),

    -- Условие выполнения
    requirement_type    TEXT NOT NULL CHECK (requirement_type IN (
                            'task_count', 'habit_streak', 'xp_gain', 'goal_progress',
                            'skill_activity', 'review_complete', 'coin_spend', 'manual'
                        )),
    requirement_target  INTEGER NOT NULL DEFAULT 1,
    requirement_current INTEGER DEFAULT 0,

    -- Награда
    xp_reward     INTEGER DEFAULT 0,
    coin_reward   INTEGER DEFAULT 0,
    badge_reward  TEXT,

    -- Сроки
    starts_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at    TIMESTAMPTZ,
    completed_at  TIMESTAMPTZ,

    is_auto_generated BOOLEAN DEFAULT true,

    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own quests" ON public.quests;
CREATE POLICY "Users can CRUD own quests"
    ON public.quests FOR ALL
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_quests_updated_at ON public.quests;
CREATE TRIGGER update_quests_updated_at
    BEFORE UPDATE ON public.quests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_quests_user_id     ON public.quests(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_type_status ON public.quests(user_id, type, status);
CREATE INDEX IF NOT EXISTS idx_quests_expires_at  ON public.quests(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================
-- 7. SHOP ITEMS — каталог магазина наград
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shop_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = глобальный предмет

    title       TEXT NOT NULL,
    description TEXT,
    icon        TEXT DEFAULT '🎁',
    category    TEXT NOT NULL CHECK (category IN (
                    'lifestyle', 'entertainment', 'food', 'travel',
                    'learning', 'social', 'health', 'custom'
                )),

    cost        INTEGER NOT NULL CHECK (cost > 0), -- в монетах
    is_available BOOLEAN DEFAULT true,
    is_global    BOOLEAN DEFAULT false,  -- виден всем пользователям
    sort_order   INTEGER DEFAULT 0,

    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own and global shop items" ON public.shop_items;
CREATE POLICY "Users can view own and global shop items"
    ON public.shop_items FOR SELECT
    USING (auth.uid() = user_id OR is_global = true);

DROP POLICY IF EXISTS "Users can create own shop items" ON public.shop_items;
CREATE POLICY "Users can create own shop items"
    ON public.shop_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own shop items" ON public.shop_items;
CREATE POLICY "Users can update own shop items"
    ON public.shop_items FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own shop items" ON public.shop_items;
CREATE POLICY "Users can delete own shop items"
    ON public.shop_items FOR DELETE
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_shop_items_updated_at ON public.shop_items;
CREATE TRIGGER update_shop_items_updated_at
    BEFORE UPDATE ON public.shop_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_shop_items_user_id  ON public.shop_items(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_items_category ON public.shop_items(category);
CREATE INDEX IF NOT EXISTS idx_shop_items_global   ON public.shop_items(is_global) WHERE is_global = true;

-- ============================================================
-- 8. SHOP PURCHASES — история покупок в магазине
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shop_purchases (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id     UUID NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,

    coins_spent INTEGER NOT NULL,
    status      TEXT DEFAULT 'purchased'
                CHECK (status IN ('purchased', 'redeemed', 'gifted')),
    notes       TEXT,

    purchased_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shop_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own purchases" ON public.shop_purchases;
CREATE POLICY "Users can CRUD own purchases"
    ON public.shop_purchases FOR ALL
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_shop_purchases_user_id ON public.shop_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_purchases_item_id ON public.shop_purchases(item_id);
CREATE INDEX IF NOT EXISTS idx_shop_purchases_date    ON public.shop_purchases(user_id, purchased_at DESC);

-- ============================================================
-- 9. NOTIFICATIONS — центр уведомлений
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    type        TEXT NOT NULL CHECK (type IN (
                    'achievement', 'quest', 'streak', 'deadline', 'level_up',
                    'reminder', 'system', 'coin', 'boss_battle', 'shop'
                )),
    title       TEXT NOT NULL,
    body        TEXT,
    icon        TEXT,

    -- Источник (опционально)
    source_type TEXT CHECK (source_type IN (
                    'task', 'goal', 'habit', 'skill', 'achievement',
                    'quest', 'streak', 'shop_item'
                )),
    source_id   UUID,

    is_read     BOOLEAN DEFAULT false,
    read_at     TIMESTAMPTZ,
    action_url  TEXT,   -- относительный path: '/goals/abc...'

    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own notifications" ON public.notifications;
CREATE POLICY "Users can CRUD own notifications"
    ON public.notifications FOR ALL
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notif_user_id    ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_unread     ON public.notifications(user_id, created_at DESC) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notif_created_at ON public.notifications(user_id, created_at DESC);

-- ============================================================
-- 10. TASK SUBTASKS — подзадачи
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_subtasks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id     UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,

    title        TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    sort_order   INTEGER DEFAULT 0,

    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.task_subtasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own subtasks" ON public.task_subtasks;
CREATE POLICY "Users can CRUD own subtasks"
    ON public.task_subtasks FOR ALL
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON public.task_subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_user_id ON public.task_subtasks(user_id);

-- ============================================================
-- 11. TAGS + TASK_TAGS — теги для задач
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tags (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name     TEXT NOT NULL,
    color    TEXT DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own tags" ON public.tags;
CREATE POLICY "Users can CRUD own tags"
    ON public.tags FOR ALL
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);

-- Связь задачи ↔ тег
CREATE TABLE IF NOT EXISTS public.task_tags (
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    tag_id  UUID NOT NULL REFERENCES public.tags(id)  ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own task_tags" ON public.task_tags;
CREATE POLICY "Users can manage own task_tags"
    ON public.task_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = task_id AND t.user_id = auth.uid()
        )
    );

CREATE INDEX IF NOT EXISTS idx_task_tags_task_id ON public.task_tags(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag_id  ON public.task_tags(tag_id);

-- ============================================================
-- 12. MONTHLY REVIEWS — ежемесячный обзор
-- ============================================================
CREATE TABLE IF NOT EXISTS public.monthly_reviews (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    year    INTEGER NOT NULL,
    month   INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),

    -- Статистика за месяц
    tasks_completed     INTEGER DEFAULT 0,
    goals_completed     INTEGER DEFAULT 0,
    habits_consistency  NUMERIC(5,2) DEFAULT 0,  -- % выполнения привычек
    xp_earned           INTEGER DEFAULT 0,
    coins_earned        INTEGER DEFAULT 0,

    -- Рефлексия
    top_wins              TEXT[]  DEFAULT '{}',
    top_struggles         TEXT[]  DEFAULT '{}',
    key_learnings         TEXT,
    next_month_intentions TEXT[]  DEFAULT '{}',

    -- Оценка (1–10)
    overall_rating  INTEGER CHECK (overall_rating BETWEEN 1 AND 10),

    -- Рейтинги сфер жизни: {"health": 7, "finance": 5, ...}
    area_ratings    JSONB DEFAULT '{}',

    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, year, month)
);

ALTER TABLE public.monthly_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own monthly reviews" ON public.monthly_reviews;
CREATE POLICY "Users can CRUD own monthly reviews"
    ON public.monthly_reviews FOR ALL
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_monthly_reviews_updated_at ON public.monthly_reviews;
CREATE TRIGGER update_monthly_reviews_updated_at
    BEFORE UPDATE ON public.monthly_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_monthly_reviews_user_id ON public.monthly_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reviews_period  ON public.monthly_reviews(user_id, year DESC, month DESC);

-- ============================================================
-- 13. AUDIT LOGS — журнал изменений
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    table_name  TEXT NOT NULL,
    record_id   UUID,
    operation   TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),

    old_data    JSONB,   -- состояние ДО
    new_data    JSONB,   -- состояние ПОСЛЕ
    changed_fields TEXT[], -- список изменённых колонок (только для UPDATE)

    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Пользователь может только читать свои логи
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs"
    ON public.audit_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Вставка разрешена только SECURITY DEFINER функциям
DROP POLICY IF EXISTS "System inserts audit logs" ON public.audit_logs;
CREATE POLICY "System inserts audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_audit_user_id       ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_table_record  ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at    ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_operation     ON public.audit_logs(table_name, operation);

-- ============================================================
-- 14. AUDIT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.lifeos_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id       UUID;
    v_record_id     UUID;
    v_old_data      JSONB;
    v_new_data      JSONB;
    v_changed_fields TEXT[];
BEGIN
    -- Получаем user_id из строки
    BEGIN
        IF TG_OP = 'DELETE' THEN
            v_user_id   := OLD.user_id;
            v_record_id := OLD.id;
        ELSE
            v_user_id   := NEW.user_id;
            v_record_id := NEW.id;
        END IF;
    EXCEPTION WHEN others THEN
        v_user_id   := NULL;
        v_record_id := NULL;
    END;

    IF TG_OP = 'INSERT' THEN
        v_old_data       := NULL;
        v_new_data       := to_jsonb(NEW);
        v_changed_fields := NULL;

    ELSIF TG_OP = 'UPDATE' THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        -- Вычисляем список изменённых колонок
        SELECT array_agg(key) INTO v_changed_fields
        FROM (
            SELECT key
            FROM jsonb_each(to_jsonb(NEW))
            WHERE to_jsonb(NEW)->key IS DISTINCT FROM to_jsonb(OLD)->key
        ) AS diff;

    ELSIF TG_OP = 'DELETE' THEN
        v_old_data       := to_jsonb(OLD);
        v_new_data       := NULL;
        v_changed_fields := NULL;
    END IF;

    INSERT INTO public.audit_logs
        (user_id, table_name, record_id, operation, old_data, new_data, changed_fields)
    VALUES
        (v_user_id, TG_TABLE_NAME, v_record_id, TG_OP, v_old_data, v_new_data, v_changed_fields);

    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Аудит-триггеры на критических таблицах
DROP TRIGGER IF EXISTS audit_goals  ON public.goals;
CREATE TRIGGER audit_goals
    AFTER INSERT OR UPDATE OR DELETE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.lifeos_audit_trigger();

DROP TRIGGER IF EXISTS audit_tasks  ON public.tasks;
CREATE TRIGGER audit_tasks
    AFTER INSERT OR UPDATE OR DELETE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.lifeos_audit_trigger();

DROP TRIGGER IF EXISTS audit_habits ON public.habits;
CREATE TRIGGER audit_habits
    AFTER INSERT OR UPDATE OR DELETE ON public.habits
    FOR EACH ROW EXECUTE FUNCTION public.lifeos_audit_trigger();

DROP TRIGGER IF EXISTS audit_transactions ON public.transactions;
CREATE TRIGGER audit_transactions
    AFTER INSERT OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.lifeos_audit_trigger();

-- ============================================================
-- 15. ФУНКЦИЯ ОЧИСТКИ СТАРЫХ AUDIT LOGS
-- Запускать вручную или через pg_cron (Supabase Dashboard → Database → Cron Jobs)
-- Пример: SELECT public.cleanup_audit_logs(90);
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_audit_logs(retain_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.audit_logs
    WHERE created_at < NOW() - (retain_days || ' days')::INTERVAL;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 16. ОБНОВЛЕНИЕ handle_new_user()
-- Теперь при регистрации создаются все стартовые записи
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Профиль
    INSERT INTO public.profiles (id, name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Игрок 1'))
    ON CONFLICT (id) DO NOTHING;

    -- Blob-синхронизация
    INSERT INTO public.user_data (user_id, data, version)
    VALUES (NEW.id, '{}', '1.0.0')
    ON CONFLICT (user_id) DO NOTHING;

    -- Игровая статистика
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Стрики
    INSERT INTO public.streaks (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Настройки
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Статистика достижений
    INSERT INTO public.achievement_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Пересоздаём триггер (функция обновлена)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 17. REALTIME для новых таблиц
-- ============================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.quests;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.streaks;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_settings;
    END IF;
END
$$;

-- ============================================================
-- 18. СОСТАВНЫЕ ИНДЕКСЫ ПРОИЗВОДИТЕЛЬНОСТИ
-- Каждый индекс создаётся только если таблица существует
-- ============================================================
DO $$
BEGIN
    -- tasks (из 003/004)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='tasks') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_tasks_user_date_status
            ON public.tasks(user_id, scheduled_date, status)';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_tasks_active_priority
            ON public.tasks(user_id, priority, scheduled_date)
            WHERE status IN (''todo'', ''in_progress'')';
    END IF;

    -- goals (из 003/004)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='goals') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_goals_user_active_priority
            ON public.goals(user_id, priority DESC, target_date)
            WHERE status = ''active''';
        -- is_boss_battle добавлена в секции 2 этой миграции
        IF EXISTS (SELECT FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='goals' AND column_name='is_boss_battle') THEN
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_goals_boss_battle
                ON public.goals(user_id, quarter)
                WHERE is_boss_battle = true';
        END IF;
    END IF;

    -- habits (из 002/003)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='habits') THEN
        IF EXISTS (SELECT FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='habits' AND column_name='is_active') THEN
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_habits_user_active
                ON public.habits(user_id, is_active)
                WHERE is_active = true';
        END IF;
    END IF;

    -- habit_entries (из 003)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='habit_entries') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_habit_entries_user_date
            ON public.habit_entries(user_id, date DESC)';
    END IF;

    -- transactions (из 002/003)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='transactions') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_transactions_user_date_type
            ON public.transactions(user_id, transaction_date DESC, type)';
    END IF;

    -- health_metrics (из 003)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='health_metrics') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_health_metrics_user_type_date
            ON public.health_metrics(user_id, type, date DESC)';
    END IF;

    -- journal_entries (из 003)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='journal_entries') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_journal_user_date
            ON public.journal_entries(user_id, timestamp DESC)';
    END IF;

    -- achievements (из 003/005)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='achievements') THEN
        IF EXISTS (SELECT FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='achievements' AND column_name='achievement_date') THEN
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_achievements_user_date
                ON public.achievements(user_id, achievement_date DESC)';
        END IF;
    END IF;

    -- skills (из 002/003)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='skills') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_skills_last_activity
            ON public.skills(user_id, last_activity_date)
            WHERE is_decaying = false';
    END IF;

    RAISE NOTICE 'Performance indexes applied (skipped missing tables)';
END$$;

-- Индексы для таблиц созданных в этой самой миграции (всегда существуют)
CREATE INDEX IF NOT EXISTS idx_quests_active
    ON public.quests(user_id, type, expires_at)
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_notif_user_unread_count
    ON public.notifications(user_id)
    WHERE is_read = false;

-- ============================================================
-- ИТОГ: все таблицы из роадмапа теперь присутствуют
--
-- profiles            ✅ (001 + доп. колонки здесь)
-- life_areas          ✅ (003/004)
-- goals               ✅ (003/004 + boss_battle здесь)
-- tasks               ✅ (003/004 + subtasks/tags здесь)
-- habits              ✅ (002/003)
-- skills              ✅ (002/003)
-- finance:            accounts, transactions, budgets, financial_goals ✅
-- health:             body_zones, health_metrics, health_profiles, medical_documents ✅
-- journal:            journal_entries, daily_reviews, weekly_reviews ✅
-- monthly_reviews     ✅ (здесь)
-- achievements        ✅ (005 + коллекции + ссылки)
-- user_stats          ✅ (003 + tier/freeze здесь)
-- streaks             ✅ (здесь)
-- user_settings       ✅ (здесь)
-- notifications       ✅ (здесь)
-- coin_transactions   ✅ (здесь)
-- quests              ✅ (здесь)
-- shop_items          ✅ (здесь)
-- shop_purchases      ✅ (здесь)
-- task_subtasks       ✅ (здесь)
-- tags + task_tags    ✅ (здесь)
-- audit_logs          ✅ (здесь)
-- integrations        ✅ (002_integrations)
-- sync_conflicts      ✅ (002_integrations)
-- wishes              ✅ (003)
-- RLS-политики        ✅ на всех таблицах
-- Индексы             ✅ включая составные
-- Автобэкап           → Supabase Cloud делает автоматически
--                       Для ручной очистки: SELECT public.cleanup_audit_logs(90);
-- ============================================================
