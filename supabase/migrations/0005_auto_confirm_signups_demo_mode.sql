-- DEMO MODE: auto-confirm every new signup so no confirmation mail is needed.
-- Rationale: Supabase's built-in SMTP is rate-limited and the dashboard Site-URL
-- was never configured, so confirmation links redirected to localhost. For the
-- pilot/demo phase we confirm accounts at insert time instead.
-- REMOVE this trigger before production go-live (or configure custom SMTP +
-- proper redirect URLs and drop it then).

create or replace function public.auto_confirm_new_user()
returns trigger
language plpgsql
security definer set search_path = public, pg_temp
as $$
begin
  new.email_confirmed_at = coalesce(new.email_confirmed_at, now());
  return new;
end;
$$;

drop trigger if exists on_auth_user_autoconfirm on auth.users;
create trigger on_auth_user_autoconfirm
  before insert on auth.users
  for each row execute procedure public.auto_confirm_new_user();

revoke execute on function public.auto_confirm_new_user() from anon, authenticated, public;
