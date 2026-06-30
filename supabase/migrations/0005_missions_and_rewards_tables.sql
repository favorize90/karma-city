-- Phase 2: persist missions and rewards in the DB so everything in the app
-- can be sourced from one place instead of in-repo mock arrays.

create table if not exists public.missions (
  id text primary key,
  city_id text not null default 'soest',
  title text not null,
  description text not null,
  full_description text not null,
  category text not null check (category in ('social','environment','culture','elderly','food','digital')),
  coins integer not null,
  difficulty integer not null check (difficulty between 1 and 5),
  distance text,
  deadline text,
  organizer text,
  location text,
  participants_max integer not null default 0,
  image_seed text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.rewards (
  id text primary key,
  city_id text not null default 'soest',
  title text not null,
  partner text not null,
  coin_cost integer not null,
  description text not null,
  category text not null,
  image_seed text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.missions enable row level security;
alter table public.rewards enable row level security;

drop policy if exists "missions_public_read" on public.missions;
create policy "missions_public_read" on public.missions
  for select using (active = true);

drop policy if exists "rewards_public_read" on public.rewards;
create policy "rewards_public_read" on public.rewards
  for select using (active = true);

create index if not exists missions_city_active_idx
  on public.missions (city_id, active);
create index if not exists rewards_city_active_idx
  on public.rewards (city_id, active);

-- Soest seed data lives in the matching SQL on the live project so it can be
-- rerun safely; full inserts are tracked in the project history.
