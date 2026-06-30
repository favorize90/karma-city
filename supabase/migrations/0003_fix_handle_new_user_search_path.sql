-- The earlier search_path hardening pinned the function to `public`, but
-- `gen_random_bytes` lives in the `extensions` schema in Supabase. With a
-- tight search_path the function failed at insert time and blocked signups.
--
-- Switch the avatar seed to a builtin (md5 of the new user id) so the
-- function has no extension dependency and can stay tightly pinned.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name, display_name, avatar_seed)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(coalesce(new.email, 'gast'), '@', 1)
    ),
    coalesce(new.raw_user_meta_data->>'avatar_seed', substr(md5(new.id::text), 1, 8))
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated, public;
