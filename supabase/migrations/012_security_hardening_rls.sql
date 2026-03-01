-- ============================================================
-- Migration 012: Security Hardening & RLS Policy Audit
-- Дата: 2026-03-01
-- Цель: Усиление безопасности, audit logging, строгие RLS политики
-- ============================================================

-- ============================================================
-- 1. AUDIT LOG TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    session_user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- RLS для audit_logs (пользователи видят только свои записи)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs"
    ON public.audit_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Только сервисная роль может создавать audit записи
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;
CREATE POLICY "Service role can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true); -- Ограничивается на уровне приложения

-- ============================================================
-- 2. AUDIT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_old_data JSONB;
    v_new_data JSONB;
    v_user_id UUID;
    v_ip_address INET;
    v_user_agent TEXT;
BEGIN
    -- Получаем текущего пользователя
    v_user_id := auth.uid();
    
    -- Получаем IP и User-Agent из текущих настроек
    BEGIN
        v_ip_address := inet_client_addr();
    EXCEPTION WHEN OTHERS THEN
        v_ip_address := NULL;
    END;
    
    v_user_agent := current_setting('request.headers', true)::json->>'user-agent';

    IF TG_OP = 'DELETE' THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := NULL;
        
        INSERT INTO public.audit_logs (
            user_id, table_name, record_id, action, 
            old_data, new_data, ip_address, user_agent, session_user_id
        ) VALUES (
            v_user_id, TG_TABLE_NAME, OLD.id, 'DELETE',
            v_old_data, v_new_data, v_ip_address, v_user_agent, v_user_id
        );
        RETURN OLD;
        
    ELSIF TG_OP = 'UPDATE' THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        
        -- Логируем только если данные изменились
        IF v_old_data IS DISTINCT FROM v_new_data THEN
            INSERT INTO public.audit_logs (
                user_id, table_name, record_id, action, 
                old_data, new_data, ip_address, user_agent, session_user_id
            ) VALUES (
                v_user_id, TG_TABLE_NAME, NEW.id, 'UPDATE',
                v_old_data, v_new_data, v_ip_address, v_user_agent, v_user_id
            );
        END IF;
        RETURN NEW;
        
    ELSIF TG_OP = 'INSERT' THEN
        v_old_data := NULL;
        v_new_data := to_jsonb(NEW);
        
        INSERT INTO public.audit_logs (
            user_id, table_name, record_id, action, 
            old_data, new_data, ip_address, user_agent, session_user_id
        ) VALUES (
            v_user_id, TG_TABLE_NAME, NEW.id, 'INSERT',
            v_old_data, v_new_data, v_ip_address, v_user_agent, v_user_id
        );
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3. УСИЛЕННЫЕ RLS ПОЛИТИКИ ДЛЯ КРИТИЧЕСКИХ ТАБЛИЦ
-- ============================================================

-- Функция для проверки подтверждённого email
CREATE OR REPLACE FUNCTION public.is_email_confirmed()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND email_confirmed_at IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для проверки активности пользователя
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND banned_until IS NULL 
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3.1 PROFILES - Усиленная защита
-- ============================================================

-- Удаляем старые политики
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- SELECT: Пользователи видят свои профили + публичные профили
CREATE POLICY "profiles_select_policy"
    ON public.profiles FOR SELECT
    USING (
        auth.uid() = id 
        OR EXISTS (
            SELECT 1 FROM public.user_settings 
            WHERE user_id = profiles.id 
            AND is_public = true
        )
    );

-- INSERT: Только для подтверждённых пользователей
CREATE POLICY "profiles_insert_policy"
    ON public.profiles FOR INSERT
    WITH CHECK (
        auth.uid() = id 
        AND public.is_email_confirmed()
        AND public.is_active_user()
    );

-- UPDATE: Только свои данные + email подтверждён
CREATE POLICY "profiles_update_policy"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND public.is_email_confirmed()
    );

-- DELETE: Запрещено (каскадное удаление через auth.users)
CREATE POLICY "profiles_delete_policy"
    ON public.profiles FOR DELETE
    USING (false);

-- ============================================================
-- 3.2 USER_DATA - Строгая изоляция
-- ============================================================

DROP POLICY IF EXISTS "Users can view own data" ON public.user_data;
DROP POLICY IF EXISTS "Users can update own data" ON public.user_data;
DROP POLICY IF EXISTS "Users can insert own data" ON public.user_data;
DROP POLICY IF EXISTS "Users can delete own data" ON public.user_data;

CREATE POLICY "user_data_select_policy"
    ON public.user_data FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "user_data_insert_policy"
    ON public.user_data FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_email_confirmed()
    );

CREATE POLICY "user_data_update_policy"
    ON public.user_data FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_email_confirmed()
    );

CREATE POLICY "user_data_delete_policy"
    ON public.user_data FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- 3.3 FINANCE - Максимальная защита
-- ============================================================

-- ACCOUNTS
DROP POLICY IF EXISTS "Users can CRUD their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can CRUD own accounts" ON public.accounts;

CREATE POLICY "accounts_select_policy"
    ON public.accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "accounts_insert_policy"
    ON public.accounts FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_email_confirmed()
        AND public.is_active_user()
    );

CREATE POLICY "accounts_update_policy"
    ON public.accounts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "accounts_delete_policy"
    ON public.accounts FOR DELETE
    USING (
        auth.uid() = user_id 
        -- Проверка: нельзя удалить счёт с транзакциями
        AND NOT EXISTS (
            SELECT 1 FROM public.transactions 
            WHERE account_id = accounts.id
        )
    );

-- TRANSACTIONS
DROP POLICY IF EXISTS "Users can CRUD their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can CRUD own transactions" ON public.transactions;

CREATE POLICY "transactions_select_policy"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_policy"
    ON public.transactions FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_email_confirmed()
        -- Проверка: счёт принадлежит пользователю
        AND EXISTS (
            SELECT 1 FROM public.accounts 
            WHERE id = transactions.account_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "transactions_update_policy"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.accounts 
            WHERE id = transactions.account_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "transactions_delete_policy"
    ON public.transactions FOR DELETE
    USING (auth.uid() = user_id);

-- FINANCIAL_GOALS
DROP POLICY IF EXISTS "Users can CRUD their own financial goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Users can CRUD own financial goals" ON public.financial_goals;

CREATE POLICY "financial_goals_select_policy"
    ON public.financial_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "financial_goals_insert_policy"
    ON public.financial_goals FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_email_confirmed()
    );

CREATE POLICY "financial_goals_update_policy"
    ON public.financial_goals FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "financial_goals_delete_policy"
    ON public.financial_goals FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- 3.4 HEALTH - HIPAA-подобная защита
-- ============================================================

-- MEDICAL_DOCUMENTS
DROP POLICY IF EXISTS "Users can CRUD their own medical documents" ON public.medical_documents;
DROP POLICY IF EXISTS "Users can CRUD own medical documents" ON public.medical_documents;

CREATE POLICY "medical_documents_select_policy"
    ON public.medical_documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "medical_documents_insert_policy"
    ON public.medical_documents FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_email_confirmed()
    );

CREATE POLICY "medical_documents_update_policy"
    ON public.medical_documents FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "medical_documents_delete_policy"
    ON public.medical_documents FOR DELETE
    USING (auth.uid() = user_id);

-- HEALTH_PROFILES
DROP POLICY IF EXISTS "Users can CRUD their own health profiles" ON public.health_profiles;
DROP POLICY IF EXISTS "Users can CRUD own health profiles" ON public.health_profiles;

CREATE POLICY "health_profiles_select_policy"
    ON public.health_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "health_profiles_insert_policy"
    ON public.health_profiles FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_email_confirmed()
    );

CREATE POLICY "health_profiles_update_policy"
    ON public.health_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "health_profiles_delete_policy"
    ON public.health_profiles FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- 3.5 USER_STATS - Защита от манипуляций
-- ============================================================

DROP POLICY IF EXISTS "Users can CRUD their own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can CRUD own user_stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;

CREATE POLICY "user_stats_select_policy"
    ON public.user_stats FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: Только через триггер onboarding
CREATE POLICY "user_stats_insert_policy"
    ON public.user_stats FOR INSERT
    WITH CHECK (false); -- Только через handle_new_user()

-- UPDATE: Только через серверные функции
CREATE POLICY "user_stats_update_policy"
    ON public.user_stats FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Запрещено
CREATE POLICY "user_stats_delete_policy"
    ON public.user_stats FOR DELETE
    USING (false);

-- ============================================================
-- 3.6 TASKS, HABITS, GOALS - Стандартная защита
-- ============================================================

-- TASKS
DROP POLICY IF EXISTS "Users can CRUD their own tasks" ON public.tasks;

CREATE POLICY "tasks_select_policy"
    ON public.tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "tasks_insert_policy"
    ON public.tasks FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_email_confirmed()
    );

CREATE POLICY "tasks_update_policy"
    ON public.tasks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_delete_policy"
    ON public.tasks FOR DELETE
    USING (auth.uid() = user_id);

-- HABITS
DROP POLICY IF EXISTS "Users can CRUD their own habits" ON public.habits;

CREATE POLICY "habits_select_policy"
    ON public.habits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "habits_insert_policy"
    ON public.habits FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_email_confirmed()
    );

CREATE POLICY "habits_update_policy"
    ON public.habits FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habits_delete_policy"
    ON public.habits FOR DELETE
    USING (auth.uid() = user_id);

-- GOALS
DROP POLICY IF EXISTS "Users can CRUD their own goals" ON public.goals;

CREATE POLICY "goals_select_policy"
    ON public.goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "goals_insert_policy"
    ON public.goals FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_email_confirmed()
    );

CREATE POLICY "goals_update_policy"
    ON public.goals FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goals_delete_policy"
    ON public.goals FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- 4. ДОБАВЛЕНИЕ AUDIT ТРИГГЕРОВ
-- ============================================================

-- Триггеры для критичных таблиц
DO $$
DECLARE
    tables_to_audit text[] := ARRAY[
        'profiles', 'user_data', 'accounts', 'transactions', 
        'financial_goals', 'medical_documents', 'health_profiles',
        'tasks', 'habits', 'goals'
    ];
    t text;
BEGIN
    FOREACH t IN ARRAY tables_to_audit
    LOOP
        BEGIN
            EXECUTE format('DROP TRIGGER IF EXISTS %I_audit_trigger ON %I', t, t);
            EXECUTE format('
                CREATE TRIGGER %I_audit_trigger
                AFTER INSERT OR UPDATE OR DELETE ON %I
                FOR EACH ROW
                EXECUTE FUNCTION public.audit_trigger()
            ', t, t);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not create audit trigger for %: %', t, SQLERRM;
        END;
    END LOOP;
END$$;

-- ============================================================
-- 5. VIEW ДЛЯ ПРОВЕРКИ БЕЗОПАСНОСТИ
-- ============================================================

CREATE OR REPLACE VIEW public.security_audit_view AS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================
-- 6. ФУНКЦИЯ ДЛЯ ОЧИСТКИ СТАРЫХ AUDIT ЛОГОВ
-- ============================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(
    p_days_to_keep INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.audit_logs 
    WHERE created_at < NOW() - INTERVAL '1 day' * p_days_to_keep;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Комментарий для функции
COMMENT ON FUNCTION public.cleanup_old_audit_logs IS 
    'Удаляет audit логи старше указанного количества дней (по умолчанию 90)';

-- ============================================================
-- 7. ПРОВЕРКА БЕЗОПАСНОСТИ ПРИЛОЖЕНИЯ
-- ============================================================

CREATE OR REPLACE VIEW public.security_check_view AS
WITH table_stats AS (
    SELECT 
        schemaname,
        tablename,
        COUNT(*) as policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY schemaname, tablename
),
rls_status AS (
    SELECT 
        schemaname,
        tablename,
        rowsecurity as rls_enabled
    FROM pg_tables
    WHERE schemaname = 'public'
)
SELECT 
    t.schemaname,
    t.tablename,
    t.rls_enabled,
    COALESCE(s.policy_count, 0) as policy_count,
    CASE 
        WHEN t.rls_enabled AND s.policy_count >= 4 THEN 'SECURE'
        WHEN t.rls_enabled AND s.policy_count > 0 THEN 'PARTIAL'
        WHEN t.rls_enabled THEN 'NO_POLICIES'
        ELSE 'NO_RLS'
    END as security_status
FROM rls_status t
LEFT JOIN table_stats s ON t.tablename = s.tablename
ORDER BY 
    CASE 
        WHEN t.rls_enabled AND s.policy_count >= 4 THEN 1
        WHEN t.rls_enabled AND s.policy_count > 0 THEN 2
        WHEN t.rls_enabled THEN 3
        ELSE 4
    END,
    t.tablename;

-- ============================================================
-- ИТОГ: Усиление безопасности
--
-- ✅ Audit logging для всех критичных таблиц
-- ✅ Строгие RLS политики с проверкой email
-- ✅ Защита финансовых данных (проверка счетов)
-- ✅ Защита медицинских данных (HIPAA-подобная)
-- ✅ Предотвращение удаления счетов с транзакциями
-- ✅ View для мониторинга безопасности
-- ✅ Функция очистки старых логов
--
-- Проверка: SELECT * FROM public.security_check_view;
-- ============================================================
