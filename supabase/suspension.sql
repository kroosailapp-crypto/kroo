-- Account suspension.
--
-- A suspended user can still log in (they see a banner on their profile with a
-- link to contact us), but their profile and regattas are hidden from everyone
-- else, and they can't message or apply. Replaces the old auth-level "ban",
-- which blocked login entirely.

create table if not exists public.user_suspensions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  suspended_at timestamptz not null default now(),
  suspended_by uuid
);
alter table public.user_suspensions enable row level security;

drop policy if exists "Users can see their own suspension" on public.user_suspensions;
create policy "Users can see their own suspension" on public.user_suspensions
  for select using (auth.uid() = user_id);
-- No insert/update/delete policies: only the service role (admin API) writes.

create or replace function public.is_suspended(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_suspensions where user_id = p_user);
$$;
grant execute on function public.is_suspended(uuid) to anon, authenticated;

-- Hide suspended users' profiles and regattas from everyone except themselves.
drop policy if exists crew_select on public.crew_profiles;
create policy crew_select on public.crew_profiles
  for select using (auth.uid() = id or not public.is_suspended(id));

drop policy if exists boat_select on public.boat_profiles;
create policy boat_select on public.boat_profiles
  for select using (auth.uid() = id or not public.is_suspended(id));

drop policy if exists regattas_select on public.regattas;
create policy regattas_select on public.regattas
  for select using (auth.uid() = boat_id or not public.is_suspended(boat_id));

-- Positions follow their regatta (the subquery is itself filtered by the policy above).
drop policy if exists positions_select on public.regatta_positions;
create policy positions_select on public.regatta_positions
  for select using (exists (select 1 from public.regattas r where r.id = regatta_positions.regatta_id));

-- Messaging: suspended users can't send or receive new messages.
create or replace function public.can_send_message(p_sender uuid, p_receiver uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select
    not public.is_suspended(p_sender) and not public.is_suspended(p_receiver)
    and (
      exists (
        select 1 from public.messages m
        where (m.sender_id = p_sender and m.receiver_id = p_receiver)
           or (m.sender_id = p_receiver and m.receiver_id = p_sender)
      )
      or exists (
        select 1 from public.invitations i join public.regattas r on r.id = i.regatta_id
        where r.boat_id = p_sender and i.crew_id = p_receiver and i.status in ('applied', 'accepted')
      )
      or exists (
        select 1 from public.invitations i join public.regattas r on r.id = i.regatta_id
        where r.boat_id = p_receiver and i.crew_id = p_sender
          and ((i.initiated_by = 'boat' and i.status in ('pending', 'applied', 'accepted')) or i.status = 'accepted')
      )
    );
$$;
revoke all on function public.can_send_message(uuid, uuid) from public, anon, authenticated;

-- Suspended users can't apply or invite either.
create or replace function public.enforce_invitation_rules() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  is_boat boolean;
begin
  if uid is null then return new; end if; -- service role / dashboard

  if public.is_suspended(uid) then
    raise exception 'Your account is suspended';
  end if;

  is_boat := exists (select 1 from public.regattas r where r.id = new.regatta_id and r.boat_id = uid);

  if tg_op = 'INSERT' then
    if is_boat then
      if new.status <> 'pending' then raise exception 'Boats can only send invitations'; end if;
      new.initiated_by := 'boat';
    elsif uid = new.crew_id then
      if new.status <> 'applied' then raise exception 'Sailors can only apply'; end if;
      new.initiated_by := 'crew';
    end if;
    return new;
  end if;

  new.initiated_by := old.initiated_by;

  if new.status is distinct from old.status then
    if is_boat then
      if new.status in ('pending', 'declined', 'withdrawn') then
        raise exception 'Invalid status change';
      end if;
      if new.status = 'accepted' and old.status <> 'applied' then
        raise exception 'You can only select sailors who applied';
      end if;
      if new.status = 'applied' and old.status <> 'accepted' then
        raise exception 'Invalid status change';
      end if;
    elsif uid = new.crew_id then
      if new.status in ('pending', 'accepted') then
        raise exception 'Invalid status change';
      end if;
    end if;
  end if;
  return new;
end $$;

-- Carry over anyone suspended the old way (auth ban), and let them log in again.
insert into public.user_suspensions (user_id)
  select id from auth.users where banned_until is not null and banned_until > now()
  on conflict do nothing;
update auth.users set banned_until = null where banned_until is not null and banned_until > now();
