-- Messaging rules (anti-spam).
--
--  * A boat can start a conversation with a sailor who applied to one of its
--    positions (or was selected).
--  * A sailor can start a conversation with a boat that invited them to a
--    regatta, or that selected them for a position.
--  * Once either side has written, the other side can always reply.
--  * Conversations that already exist keep working.
--
-- Enforced here in the database so it can't be bypassed from the client.

-- 1. Remember who started each invitation (boat invited vs sailor applied).
alter table public.invitations add column if not exists initiated_by text not null default 'boat';
alter table public.invitations drop constraint if exists invitations_initiated_by_check;
alter table public.invitations add constraint invitations_initiated_by_check check (initiated_by in ('boat', 'crew'));

-- 2. Stop either side from forging the state that unlocks messaging.
--    Sailors can only apply / decline / cancel; only the boat can select.
--    Boats can only invite (pending) and select / unselect (applied <-> accepted).
create or replace function public.enforce_invitation_rules() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  is_boat boolean;
begin
  if uid is null then return new; end if; -- service role / dashboard

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

drop trigger if exists trigger_enforce_invitation_rules on public.invitations;
create trigger trigger_enforce_invitation_rules
  before insert or update on public.invitations
  for each row execute function public.enforce_invitation_rules();

-- 3. The messaging rule itself.
create or replace function public.can_send_message(p_sender uuid, p_receiver uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select
    -- conversation already started: both sides can keep writing
    exists (
      select 1 from public.messages m
      where (m.sender_id = p_sender and m.receiver_id = p_receiver)
         or (m.sender_id = p_receiver and m.receiver_id = p_sender)
    )
    -- boat -> sailor: the sailor applied (or was selected)
    or exists (
      select 1 from public.invitations i join public.regattas r on r.id = i.regatta_id
      where r.boat_id = p_sender and i.crew_id = p_receiver and i.status in ('applied', 'accepted')
    )
    -- sailor -> boat: the boat invited them, or selected them
    or exists (
      select 1 from public.invitations i join public.regattas r on r.id = i.regatta_id
      where r.boat_id = p_receiver and i.crew_id = p_sender
        and ((i.initiated_by = 'boat' and i.status in ('pending', 'applied', 'accepted')) or i.status = 'accepted')
    );
$$;
revoke all on function public.can_send_message(uuid, uuid) from public, anon, authenticated;

create or replace function public.enforce_message_rules() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if; -- service role (e.g. admin broadcast)
  if not public.can_send_message(new.sender_id, new.receiver_id) then
    raise exception 'You can only message people you are connected with through an invitation or application.'
      using errcode = 'P0001', hint = 'messaging_not_allowed';
  end if;
  return new;
end $$;

drop trigger if exists trigger_enforce_message_rules on public.messages;
create trigger trigger_enforce_message_rules
  before insert on public.messages
  for each row execute function public.enforce_message_rules();

-- 4. Which users can the signed-in user message right now? (drives the UI)
create or replace function public.messageable_users() returns setof uuid
language sql stable security definer set search_path = public as $$
  select u from (
    select receiver_id as u from public.messages where sender_id = auth.uid()
    union select sender_id from public.messages where receiver_id = auth.uid()
    union select i.crew_id from public.invitations i join public.regattas r on r.id = i.regatta_id where r.boat_id = auth.uid()
    union select r.boat_id from public.invitations i join public.regattas r on r.id = i.regatta_id where i.crew_id = auth.uid()
  ) c
  where u is not null and auth.uid() is not null and public.can_send_message(auth.uid(), u);
$$;
revoke all on function public.messageable_users() from public, anon;
grant execute on function public.messageable_users() to authenticated;
