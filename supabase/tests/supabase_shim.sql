-- Minimal stand-in for the parts of Supabase the migrations depend on, so
-- they can be applied to a plain Postgres and tested without a cloud project.
--
-- Mirrors Supabase's defaults where they matter for security: anon and
-- authenticated get ALL on public tables, which is why RLS policies and
-- column grants are the only thing standing between a client and the data.

create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema auth;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb not null default '{}',
  email_confirmed_at timestamptz
);

-- Supabase reads the caller from the JWT; tests set the claim directly.
create function auth.uid() returns uuid
language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
