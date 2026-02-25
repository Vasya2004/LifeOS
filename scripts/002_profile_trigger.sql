-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  -- Seed default achievements for the user
  insert into public.achievements (user_id, title, description, icon) values
    (new.id, 'First Steps', 'Complete your first task', 'footprints'),
    (new.id, 'Goal Setter', 'Create 5 goals', 'target'),
    (new.id, 'Streak Master', 'Maintain a 7-day streak', 'flame'),
    (new.id, 'Century Club', 'Complete 100 tasks', 'trophy'),
    (new.id, 'Data Driven', 'Track a metric for 30 days', 'chart-line'),
    (new.id, 'Challenger', 'Start your first challenge', 'swords'),
    (new.id, 'Level 10', 'Reach level 10', 'star'),
    (new.id, 'Perfect Week', 'Complete all tasks in a week', 'crown');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
