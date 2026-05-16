-- Fix Supabase advisor warnings on the initial schema:
--   1. bump_updated_at function had a mutable search_path
--   2. handle_new_user + bump_updated_at could be RPC-called by clients
--
-- This migration pins search_path on bump_updated_at and revokes
-- direct EXECUTE so only triggers can invoke the SECURITY DEFINER fns.

create or replace function public.bump_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.bump_updated_at() from anon, authenticated, public;
