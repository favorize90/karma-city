-- ============================================================
-- Karma City — Initial Schema
-- Run this in Supabase SQL Editor (Project → SQL → New query)
-- ============================================================

-- Profiles: extends auth.users with public-facing user data
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  display_name text,
  avatar_seed text,
  district text,
  city_id text not null default 'soest',
  level text not null default 'Bronze' check (level in ('Bronze', 'Silber', 'Gold', 'Platin')),
  coins integer not null default 0,
  total_coins_earned integer not null default 0,
  interests text[] not null default '{}',
  missions_completed integer not null default 0,
  onboarding_completed boolean not null default false,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mission participation records (one row per user signup per mission)
create table if not exists public.mission_participants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id text not null,
  signed_up_at timestamptz not null default now(),
  completed_at timestamptz,
  coins_earned integer,
  qr_verified boolean not null default false,
  unique (user_id, mission_id)
);

-- Karma transactions: every coin earn/spend is logged for transparency
create table if not exists public.karma_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  kind text not null check (kind in ('earn_mission', 'spend_reward', 'bonus', 'adjustment')),
  reference_id text,
  description text,
  created_at timestamptz not null default now()
);

-- Reward redemptions
create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_id text not null,
  code text not null unique,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.mission_participants enable row level security;
alter table public.karma_transactions enable row level security;
alter table public.reward_redemptions enable row level security;

-- Profiles
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Leaderboard: allow anyone authenticated to read display_name, district, level, coins
drop policy if exists "profiles_leaderboard_select" on public.profiles;
create policy "profiles_leaderboard_select" on public.profiles
  for select to authenticated using (true);

-- Mission participants
drop policy if exists "participants_self_select" on public.mission_participants;
create policy "participants_self_select" on public.mission_participants
  for select using (auth.uid() = user_id);

drop policy if exists "participants_self_insert" on public.mission_participants;
create policy "participants_self_insert" on public.mission_participants
  for insert with check (auth.uid() = user_id);

drop policy if exists "participants_self_update" on public.mission_participants;
create policy "participants_self_update" on public.mission_participants
  for update using (auth.uid() = user_id);

-- Karma transactions (read-only for user, writes go through server)
drop policy if exists "transactions_self_select" on public.karma_transactions;
create policy "transactions_self_select" on public.karma_transactions
  for select using (auth.uid() = user_id);

-- Reward redemptions
drop policy if exists "redemptions_self_select" on public.reward_redemptions;
create policy "redemptions_self_select" on public.reward_redemptions
  for select using (auth.uid() = user_id);

drop policy if exists "redemptions_self_insert" on public.reward_redemptions;
create policy "redemptions_self_insert" on public.reward_redemptions
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- Trigger: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
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
    coalesce(new.raw_user_meta_data->>'avatar_seed', encode(gen_random_bytes(4), 'hex'))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Trigger: updated_at auto-bump
-- ============================================================
create or replace function public.bump_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.bump_updated_at();

-- ============================================================
-- Indices
-- ============================================================
create index if not exists profiles_city_coins_idx
  on public.profiles (city_id, coins desc);

create index if not exists transactions_user_created_idx
  on public.karma_transactions (user_id, created_at desc);

create index if not exists participants_user_idx
  on public.mission_participants (user_id);
