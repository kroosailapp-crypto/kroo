-- Hard-block banned users at the auth layer.
-- Supabase calls this after the password is verified and before it issues a
-- session (login AND token refresh). Returning an error refuses the session.
-- Wrong passwords never reach this, so a ban can't be discovered by guessing.
-- Enable under Auth > Hooks > Custom Access Token (or config.toml
-- [auth.hook.custom_access_token] uri = "pg-functions://postgres/public/custom_access_token_hook").
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  is_banned boolean := false;
begin
  -- Fail open: if anything goes wrong here, never lock everybody out.
  begin
    select exists (
      select 1 from public.user_suspensions
      where user_id = (event->>'user_id')::uuid and status = 'banned'
    ) into is_banned;
  exception when others then
    return event;
  end;

  if is_banned then
    return jsonb_build_object(
      'error', jsonb_build_object('http_code', 403, 'message', 'This account has been banned.')
    );
  end if;
  return event;
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;

-- Kill every existing session of a user (called when an admin bans them) so the
-- ban takes effect on their next refresh rather than whenever they next sign in.
create or replace function public.revoke_user_sessions(uid uuid)
returns void
language sql
security definer
set search_path = public, auth
as $$
  delete from auth.sessions where user_id = uid;
$$;
revoke execute on function public.revoke_user_sessions(uuid) from authenticated, anon, public;
grant execute on function public.revoke_user_sessions(uuid) to service_role;
