-- Two levels of account restriction, both stored in user_suspensions:
--   suspended : can log in, sees only their profile with a suspension banner
--   banned    : can't log in at all (also enforced with an auth ban)
-- Both are hidden from other users and blocked from messaging / applying.
alter table public.user_suspensions add column if not exists status text not null default 'suspended';
alter table public.user_suspensions drop constraint if exists user_suspensions_status_check;
alter table public.user_suspensions add constraint user_suspensions_status_check check (status in ('suspended', 'banned'));
