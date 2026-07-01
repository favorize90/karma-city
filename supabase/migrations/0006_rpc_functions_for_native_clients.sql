-- RPC functions so native clients (iOS SwiftUI app) can run the same business
-- logic as the Next.js server actions, atomically and under auth.uid() checks.

-- Redeem a reward: checks balance, logs transaction, deducts coins.
create or replace function public.redeem_reward(
  p_reward_id text,
  p_coin_cost integer,
  p_title text
)
returns table (code text)
language plpgsql
security definer set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_coins integer;
  v_code text;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;
  if p_coin_cost is null or p_coin_cost < 0 then
    raise exception 'invalid cost';
  end if;

  select coins into v_coins from public.profiles where id = v_user for update;
  if v_coins is null or v_coins < p_coin_cost then
    raise exception 'Nicht genug Karma-Punkte';
  end if;

  v_code := 'KC-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 9000 + 1000)::text, 4, '0');

  insert into public.reward_redemptions (user_id, reward_id, code)
  values (v_user, p_reward_id, v_code);

  insert into public.karma_transactions (user_id, amount, kind, reference_id, description)
  values (v_user, -p_coin_cost, 'spend_reward', p_reward_id, 'Eingelöst: ' || p_title);

  update public.profiles set coins = coins - p_coin_cost where id = v_user;

  return query select v_code;
end;
$$;

-- Complete a mission: marks participation done, awards coins, bumps level.
create or replace function public.complete_mission(
  p_mission_id text,
  p_coins integer
)
returns void
language plpgsql
security definer set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_part_id uuid;
  v_total integer;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;
  if p_coins is null or p_coins < 0 or p_coins > 500 then
    raise exception 'invalid coins';
  end if;

  select id into v_part_id from public.mission_participants
  where user_id = v_user and mission_id = p_mission_id and completed_at is null
  for update;
  if v_part_id is null then
    raise exception 'Keine offene Anmeldung gefunden';
  end if;

  update public.mission_participants
  set completed_at = now(), coins_earned = p_coins, qr_verified = true
  where id = v_part_id;

  insert into public.karma_transactions (user_id, amount, kind, reference_id, description)
  values (v_user, p_coins, 'earn_mission', p_mission_id, 'Mission abgeschlossen');

  update public.profiles
  set coins = coins + p_coins,
      total_coins_earned = total_coins_earned + p_coins,
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

-- Only signed-in users may call these.
revoke execute on function public.redeem_reward(text, integer, text) from anon, public;
revoke execute on function public.complete_mission(text, integer) from anon, public;
grant execute on function public.redeem_reward(text, integer, text) to authenticated;
grant execute on function public.complete_mission(text, integer) to authenticated;
