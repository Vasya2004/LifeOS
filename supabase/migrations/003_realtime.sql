-- ============================================
-- REALTIME SETUP - Enable live subscriptions
-- ============================================

-- Enable realtime for all tables
BEGIN;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.skills;
ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.financial_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_data;

-- Create function to broadcast changes
CREATE OR REPLACE FUNCTION broadcast_change()
RETURNS TRIGGER AS $$
BEGIN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to all realtime tables (if not exists)
DO $$
BEGIN
    -- Goals
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'goals_realtime_trigger') THEN
        CREATE TRIGGER goals_realtime_trigger
        AFTER INSERT OR UPDATE OR DELETE ON public.goals
        FOR EACH ROW EXECUTE FUNCTION broadcast_change();
    END IF;

    -- Tasks
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tasks_realtime_trigger') THEN
        CREATE TRIGGER tasks_realtime_trigger
        AFTER INSERT OR UPDATE OR DELETE ON public.tasks
        FOR EACH ROW EXECUTE FUNCTION broadcast_change();
    END IF;

    -- Habits
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'habits_realtime_trigger') THEN
        CREATE TRIGGER habits_realtime_trigger
        AFTER INSERT OR UPDATE OR DELETE ON public.habits
        FOR EACH ROW EXECUTE FUNCTION broadcast_change();
    END IF;

    -- Skills
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'skills_realtime_trigger') THEN
        CREATE TRIGGER skills_realtime_trigger
        AFTER INSERT OR UPDATE OR DELETE ON public.skills
        FOR EACH ROW EXECUTE FUNCTION broadcast_change();
    END IF;
END $$;

COMMIT;
