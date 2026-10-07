-- Make the Karma economy server-authoritative.
--
-- Until now every coin value came from the client, and RLS let signed-in
-- users write the economic columns directly with the public anon key:
--   * profiles_self_update had no column limit → set your own coins/level
--   * participants_self_insert/update        → mark any mission completed
--   * transactions_self_insert (0004)        → forge transaction history
--   * redemptions_self_insert                → mint redemption codes for free
--   * redeem_reward / complete_mission took cost and coins as arguments
--   * redemption codes had 9,000 possible values
--
-- After this migration clients can only write the fields a person may
-- legitimately edit. Every coin movement goes through the two SECURITY
-- DEFINER functions below, which read prices and rewards from the database.
--
-- The RPC signatures are unchanged so already-shipped iOS builds keep
-- working; p_coins, p_coin_cost and p_title are accepted and ignored.

-- ------------------------------------------------------------
-- profiles: presentation fields only
-- ------------------------------------------------------------
revoke update on public.profiles from anon, authenticated;
grant update (full_name, display_name, avatar_seed, district, interests, onboarding_completed)
  on public.profiles to authenticated;

-- ------------------------------------------------------------
-- mission_participants: joining is the only client write
-- ------------------------------------------------------------
drop policy if exists "participants_self_update" on public.mission_participants;

drop policy if exists "participants_self_insert" on public.mission_participants;
create policy "participants_self_insert" on public.mission_participants
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.missions m where m.id = mission_id and m.active)
  );

revoke insert, update, delete on public.mission_participants from anon, authenticated;
grant insert (user_id, mission_id) on public.mission_participants to authenticated;

-- ------------------------------------------------------------
-- karma_transactions + reward_redemptions: server-written only
-- ------------------------------------------------------------
drop policy if exists "transactions_self_insert" on public.karma_transactions;
revoke insert, update, delete on public.karma_transactions from anon, authenticated;

drop policy if exists "redemptions_self_insert" on public.reward_redemptions;
revoke insert, update, delete on public.reward_redemptions from anon, authenticated;

-- ------------------------------------------------------------
-- redeem_reward: cost and title come from the rewards table
-- ------------------------------------------------------------
create or replace function public.redeem_reward(
  p_reward_id text,
  p_coin_cost integer,  -- ignored; kept for iOS compatibility
  p_title text          -- ignored; kept for iOS compatibility
)
returns table (code text)
language plpgsql
security definer set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_cost integer;
  v_title text;
  v_coins integer;
  v_hex text;
  v_code text;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  select r.coin_cost, r.title into v_cost, v_title
  from public.rewards r
  where r.id = p_reward_id and r.active;
  if v_cost is null then
    raise exception 'Belohnung nicht verfügbar';
  end if;

  select p.coins into v_coins from public.profiles p where p.id = v_user for update;
  if v_coins is null or v_coins < v_cost then
    raise exception 'Nicht genug Karma-Punkte';
  end if;

  -- 40 random bits from the CSPRNG behind gen_random_uuid(). The first
  -- twelve hex digits of a v4 UUID carry no version bits.
  v_hex := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  v_code := 'KC-' || substr(v_hex, 1, 5) || '-' || substr(v_hex, 6, 5);

  insert into public.reward_redemptions (user_id, reward_id, code)
  values (v_user, p_reward_id, v_code);

  insert into public.karma_transactions (user_id, amount, kind, reference_id, description)
  values (v_user, -v_cost, 'spend_reward', p_reward_id, 'Eingelöst: ' || v_title);

  update public.profiles set coins = coins - v_cost where id = v_user;

  return query select v_code;
end;
$$;

-- ------------------------------------------------------------
-- complete_mission: coins come from the missions table
-- ------------------------------------------------------------
-- qr_verified is no longer set here: nothing is scanned on this path, and
-- recording it as verified would make the column meaningless once a real
-- check-in flow exists.
create or replace function public.complete_mission(
  p_mission_id text,
  p_coins integer  -- ignored; kept for iOS compatibility
)
returns void
language plpgsql
security definer set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_coins integer;
  v_part_id uuid;
  v_total integer;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  select m.coins into v_coins
  from public.missions m
  where m.id = p_mission_id and m.active;
  if v_coins is null then
    raise exception 'Mission nicht verfügbar';
  end if;

  select mp.id into v_part_id from public.mission_participants mp
  where mp.user_id = v_user and mp.mission_id = p_mission_id and mp.completed_at is null
  for update;
  if v_part_id is null then
    raise exception 'Keine offene Anmeldung gefunden';
  end if;

  update public.mission_participants
  set completed_at = now(), coins_earned = v_coins
  where id = v_part_id;

  insert into public.karma_transactions (user_id, amount, kind, reference_id, description)
  values (v_user, v_coins, 'earn_mission', p_mission_id, 'Mission abgeschlossen');

  update public.profiles
  set coins = coins + v_coins,
      total_coins_earned = total_coins_earned + v_coins,
      missions_completed = missions_completed + 1
  where id = v_user
  returning total_coins_earned into v_total;

  update public.profiles set level =
    case
      when v_total >= 1200 then 'Platin'
      when v_total >= 700 then 'Gold'
      when v_total >= 300 then 'Silber'
      else 'Bronze'
    end
  where id = v_user;
end;
$$;

revoke execute on function public.redeem_reward(text, integer, text) from anon, public;
revoke execute on function public.complete_mission(text, integer) from anon, public;
grant execute on function public.redeem_reward(text, integer, text) to authenticated;
grant execute on function public.complete_mission(text, integer) to authenticated;
