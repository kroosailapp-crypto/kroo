-- Public share links: a profile is only viewable by non-registered visitors
-- when its owner has explicitly turned sharing on. Off by default.
alter table public.boat_profiles add column if not exists is_public boolean not null default false;
alter table public.crew_profiles add column if not exists is_public boolean not null default false;
