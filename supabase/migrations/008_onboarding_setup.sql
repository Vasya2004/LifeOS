-- ============================================================
-- Migration 008: Onboarding Setup
-- Обеспечивает создание всех стартовых записей при регистрации
-- ============================================================

-- ============================================================
-- 1. УБЕЖДАЕМСЯ, ЧТО ВСЕ ТАБЛИЦЫ СУЩЕСТВУЮТ
-- ============================================================

-- user_stats (если не создана в 003)
CREATE TABLE IF NOT EXISTS public.user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    xp_to_next INTEGER DEFAULT 100,
    coins INTEGER DEFAULT 0,
    total_coins_earned INTEGER DEFAULT 0,
    total_coins_spent INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    total_tasks_completed INTEGER DEFAULT 0,
    total_goals_achieved INTEGER DEFAULT 0,
    total_projects_completed INTEGER DEFAULT 0,
    total_habit_completions INTEGER DEFAULT 0,
    total_deep_work_hours INTEGER DEFAULT 0,
    total_focus_sessions INTEGER DEFAULT 0,
    avg_daily_tasks NUMERIC(3,1),
    tier TEXT DEFAULT 'novice' CHECK (tier IN ('novice','apprentice','journeyman','expert','master','grandmaster','legend')),
    streak_freeze_tokens INTEGER DEFAULT 2,
    last_freeze_used_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own user_stats" ON public.user_stats;
CREATE POLICY "Users can CRUD own user_stats"
    ON public.user_stats FOR ALL
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);

-- streaks (если не создана в 007)
CREATE TABLE IF NOT EXISTS public.streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    streak_started_date DATE,
    freeze_tokens INTEGER DEFAULT 2,
    freeze_tokens_max INTEGER DEFAULT 3,
    last_freeze_used_date DATE,
    total_freezes_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own streaks" ON public.streaks;
CREATE POLICY "Users can CRUD own streaks"
    ON public.streaks FOR ALL
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON public.streaks(user_id);

-- user_settings (если не создана в 007)
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'ru',
    timezone TEXT DEFAULT 'Europe/Moscow',
    notifications_enabled BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT false,
    email_reminders BOOLEAN DEFAULT true,
    streak_alerts BOOLEAN DEFAULT true,
    deadline_alerts BOOLEAN DEFAULT true,
    achievement_popups BOOLEAN DEFAULT true,
    show_xp_gains BOOLEAN DEFAULT true,
    show_coin_gains BOOLEAN DEFAULT true,
    sound_effects BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    show_in_leaderboard BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own settings" ON public.user_settings;
CREATE POLICY "Users can CRUD own settings"
    ON public.user_settings FOR ALL
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- achievement_stats (если не создана в 005)
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

DROP POLICY IF EXISTS "Users can CRUD own achievement_stats" ON public.achievement_stats;
CREATE POLICY "Users can CRUD own achievement_stats"
    ON public.achievement_stats FOR ALL
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_achievement_stats_user_id ON public.achievement_stats(user_id);

-- profiles (убеждаемся что есть onboarding_completed)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Moscow',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'ru',
  ADD COLUMN IF NOT EXISTS avatar_emoji TEXT DEFAULT '🧙‍♂️',
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';

-- ============================================================
-- 2. ОБНОВЛЁННАЯ ФУНКЦИЯ ONBOARDING
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_profile_exists BOOLEAN;
    v_stats_exists BOOLEAN;
    v_streaks_exists BOOLEAN;
    v_settings_exists BOOLEAN;
    v_achievement_stats_exists BOOLEAN;
BEGIN
    -- Проверяем существование профиля
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = NEW.id) INTO v_profile_exists;
    
    -- Создаём профиль если не существует
    IF NOT v_profile_exists THEN
        INSERT INTO public.profiles (
            id, 
            name, 
            avatar_emoji,
            timezone,
            language,
            bio,
            onboarding_completed
        )
        VALUES (
            NEW.id, 
            COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Игрок 1'),
            COALESCE(NEW.raw_user_meta_data->>'avatar_emoji', '🧙‍♂️'),
            COALESCE(NEW.raw_user_meta_data->>'timezone', 'Europe/Moscow'),
            COALESCE(NEW.raw_user_meta_data->>'language', 'ru'),
            '',
            false
        );
    END IF;

    -- Создаём/обновляем blob-синхронизацию
    INSERT INTO public.user_data (user_id, data, version)
    VALUES (NEW.id, '{}', '1.0.0')
    ON CONFLICT (user_id) DO UPDATE 
    SET version = EXCLUDED.version 
    WHERE user_data.user_id = EXCLUDED.user_id;

    -- Проверяем и создаём user_stats
    SELECT EXISTS(SELECT 1 FROM public.user_stats WHERE user_id = NEW.id) INTO v_stats_exists;
    IF NOT v_stats_exists THEN
        INSERT INTO public.user_stats (
            user_id,
            level,
            xp,
            xp_to_next,
            coins,
            total_coins_earned,
            total_coins_spent,
            current_streak,
            longest_streak,
            total_tasks_completed,
            total_goals_achieved,
            total_projects_completed,
            total_habit_completions,
            total_deep_work_hours,
            total_focus_sessions,
            tier,
            streak_freeze_tokens
        )
        VALUES (
            NEW.id,
            1,           -- level
            0,           -- xp
            100,         -- xp_to_next
            100,         -- coins (стартовый бонус)
            100,         -- total_coins_earned
            0,           -- total_coins_spent
            0,           -- current_streak
            0,           -- longest_streak
            0,           -- total_tasks_completed
            0,           -- total_goals_achieved
            0,           -- total_projects_completed
            0,           -- total_habit_completions
            0,           -- total_deep_work_hours
            0,           -- total_focus_sessions
            'novice',    -- tier
            2            -- streak_freeze_tokens
        );
    END IF;

    -- Проверяем и создаём streaks
    SELECT EXISTS(SELECT 1 FROM public.streaks WHERE user_id = NEW.id) INTO v_streaks_exists;
    IF NOT v_streaks_exists THEN
        INSERT INTO public.streaks (
            user_id,
            current_streak,
            longest_streak,
            freeze_tokens,
            freeze_tokens_max,
            total_freezes_used
        )
        VALUES (
            NEW.id,
            0,  -- current_streak
            0,  -- longest_streak
            2,  -- freeze_tokens (стартовые)
            3,  -- freeze_tokens_max
            0   -- total_freezes_used
        );
    END IF;

    -- Проверяем и создаём user_settings
    SELECT EXISTS(SELECT 1 FROM public.user_settings WHERE user_id = NEW.id) INTO v_settings_exists;
    IF NOT v_settings_exists THEN
        INSERT INTO public.user_settings (
            user_id,
            theme,
            language,
            timezone,
            notifications_enabled,
            push_notifications,
            email_reminders,
            streak_alerts,
            deadline_alerts,
            achievement_popups,
            show_xp_gains,
            show_coin_gains,
            sound_effects,
            is_public,
            show_in_leaderboard
        )
        VALUES (
            NEW.id,
            'dark',             -- theme
            'ru',               -- language
            'Europe/Moscow',    -- timezone
            true,               -- notifications_enabled
            false,              -- push_notifications
            true,               -- email_reminders
            true,               -- streak_alerts
            true,               -- deadline_alerts
            true,               -- achievement_popups
            true,               -- show_xp_gains
            true,               -- show_coin_gains
            false,              -- sound_effects
            false,              -- is_public
            true                -- show_in_leaderboard
        );
    END IF;

    -- Проверяем и создаём achievement_stats
    SELECT EXISTS(SELECT 1 FROM public.achievement_stats WHERE user_id = NEW.id) INTO v_achievement_stats_exists;
    IF NOT v_achievement_stats_exists THEN
        INSERT INTO public.achievement_stats (
            user_id,
            total_count,
            micro_count,
            macro_count,
            breakthrough_count,
            moment_count,
            favorite_count,
            time_capsule_count,
            time_capsule_unlocked_count,
            current_streak_days,
            longest_streak_days
        )
        VALUES (
            NEW.id,
            0,  -- total_count
            0,  -- micro_count
            0,  -- macro_count
            0,  -- breakthrough_count
            0,  -- moment_count
            0,  -- favorite_count
            0,  -- time_capsule_count
            0,  -- time_capsule_unlocked_count
            0,  -- current_streak_days
            0   -- longest_streak_days
        );
    END IF;

    -- Логируем успешное создание onboarding-записей
    RAISE NOTICE 'LifeOS onboarding completed for user: %', NEW.id;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Логируем ошибку но не прерываем создание пользователя
        RAISE WARNING 'LifeOS onboarding error for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3. ТРИГГЕР НА СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ
-- ============================================================

-- Удаляем старый триггер если есть
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Создаём новый триггер
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. ФУНКЦИЯ ДЛЯ РУЧНОГО ЗАПУСКА ONBOARDING
-- ============================================================

-- Функция для принудительного создания onboarding-записей
-- Использование: SELECT public.run_onboarding_for_user('user-uuid-here');
CREATE OR REPLACE FUNCTION public.run_onboarding_for_user(p_user_id UUID)
RETURNS TABLE (
    table_name TEXT,
    created BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_profile_exists BOOLEAN;
    v_stats_exists BOOLEAN;
    v_streaks_exists BOOLEAN;
    v_settings_exists BOOLEAN;
    v_achievement_stats_exists BOOLEAN;
BEGIN
    -- Проверяем существование пользователя
    IF NOT EXISTS(SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
        RETURN QUERY SELECT 
            'error'::TEXT, 
            false::BOOLEAN, 
            'User not found'::TEXT;
        RETURN;
    END IF;

    -- Проверяем и создаём профиль
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = p_user_id) INTO v_profile_exists;
    IF NOT v_profile_exists THEN
        INSERT INTO public.profiles (id, name, avatar_emoji, onboarding_completed)
        VALUES (p_user_id, 'Игрок 1', '🧙‍♂️', false);
        RETURN QUERY SELECT 'profiles'::TEXT, true::BOOLEAN, 'Created'::TEXT;
    ELSE
        RETURN QUERY SELECT 'profiles'::TEXT, false::BOOLEAN, 'Already exists'::TEXT;
    END IF;

    -- Проверяем и создаём user_data
    IF NOT EXISTS(SELECT 1 FROM public.user_data WHERE user_id = p_user_id) THEN
        INSERT INTO public.user_data (user_id, data, version)
        VALUES (p_user_id, '{}', '1.0.0');
    END IF;

    -- Проверяем и создаём user_stats
    SELECT EXISTS(SELECT 1 FROM public.user_stats WHERE user_id = p_user_id) INTO v_stats_exists;
    IF NOT v_stats_exists THEN
        INSERT INTO public.user_stats (user_id, level, xp, xp_to_next, coins, streak_freeze_tokens)
        VALUES (p_user_id, 1, 0, 100, 100, 2);
        RETURN QUERY SELECT 'user_stats'::TEXT, true::BOOLEAN, 'Created'::TEXT;
    ELSE
        RETURN QUERY SELECT 'user_stats'::TEXT, false::BOOLEAN, 'Already exists'::TEXT;
    END IF;

    -- Проверяем и создаём streaks
    SELECT EXISTS(SELECT 1 FROM public.streaks WHERE user_id = p_user_id) INTO v_streaks_exists;
    IF NOT v_streaks_exists THEN
        INSERT INTO public.streaks (user_id, freeze_tokens, freeze_tokens_max)
        VALUES (p_user_id, 2, 3);
        RETURN QUERY SELECT 'streaks'::TEXT, true::BOOLEAN, 'Created'::TEXT;
    ELSE
        RETURN QUERY SELECT 'streaks'::TEXT, false::BOOLEAN, 'Already exists'::TEXT;
    END IF;

    -- Проверяем и создаём user_settings
    SELECT EXISTS(SELECT 1 FROM public.user_settings WHERE user_id = p_user_id) INTO v_settings_exists;
    IF NOT v_settings_exists THEN
        INSERT INTO public.user_settings (user_id)
        VALUES (p_user_id);
        RETURN QUERY SELECT 'user_settings'::TEXT, true::BOOLEAN, 'Created'::TEXT;
    ELSE
        RETURN QUERY SELECT 'user_settings'::TEXT, false::BOOLEAN, 'Already exists'::TEXT;
    END IF;

    -- Проверяем и создаём achievement_stats
    SELECT EXISTS(SELECT 1 FROM public.achievement_stats WHERE user_id = p_user_id) INTO v_achievement_stats_exists;
    IF NOT v_achievement_stats_exists THEN
        INSERT INTO public.achievement_stats (user_id)
        VALUES (p_user_id);
        RETURN QUERY SELECT 'achievement_stats'::TEXT, true::BOOLEAN, 'Created'::TEXT;
    ELSE
        RETURN QUERY SELECT 'achievement_stats'::TEXT, false::BOOLEAN, 'Already exists'::TEXT;
    END IF;

    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. REALTIME ДЛЯ НОВЫХ ТАБЛИЦ
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.streaks;
        EXCEPTION WHEN OTHERS THEN
            -- Таблица уже в публикации
        END;
        
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.user_settings;
        EXCEPTION WHEN OTHERS THEN
            -- Таблица уже в публикации
        END;
        
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.user_stats;
        EXCEPTION WHEN OTHERS THEN
            -- Таблица уже в публикации
        END;
        
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.achievement_stats;
        EXCEPTION WHEN OTHERS THEN
            -- Таблица уже в публикации
        END;
    END IF;
END
$$;

-- ============================================================
-- ИТОГ: onboarding настроен
--
-- При регистрации создаются:
-- ✅ profiles          — профиль пользователя
-- ✅ user_data         — blob для синхронизации
-- ✅ user_stats        — игровая статистика (уровень, XP, монеты)
-- ✅ streaks           — стрики и токены заморозки
-- ✅ user_settings     — настройки пользователя
-- ✅ achievement_stats — статистика достижений
--
-- Дополнительно:
-- ✅ Функция run_onboarding_for_user() для ручного запуска
-- ✅ Поддержка REALTIME для всех onboarding-таблиц
-- ============================================================
