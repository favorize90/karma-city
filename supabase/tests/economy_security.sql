-- Karma economy security tests.
--
-- Every "attack" block below is something a signed-in user can do with the
-- public anon key and their own JWT. Each must fail. Every "allowed" block is
-- a path the web or iOS client relies on. Each must keep working.
--
-- Run with scripts/test-db.sh. A failure raises an exception and stops psql.

\set ON_ERROR_STOP on
\set QUIET on
-- Results go to NOTICE lines; discard the empty rows the void helpers return.
\o /dev/null

-- ============================================================
-- Fixtures (as the database owner)
-- ============================================================
insert into public.missions (id, title, description, full_description, category, coins, difficulty, active)
values
  ('m-park',     'Park aufräumen', 'd', 'd', 'environment', 50, 2, true),
  ('m-big',      'Großeinsatz',    'd', 'd', 'social',     400, 4, true),
  ('m-inactive', 'Vorbei',         'd', 'd', 'social',      50, 1, false);

insert into public.rewards (id, title, partner, coin_cost, description, category, active)
values
  ('r-coffee',   'Kaffee',  'Cafe Fromme',    30, 'd', 'food', true),
  ('r-bike',     'E-Bike',  'Radhaus',     10000, 'd', 'mobility', true),
  ('r-inactive', 'Alt',     'Cafe Fromme',     1, 'd', 'food', false);

insert into auth.users (id, email) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'alice@example.test'),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'bob@example.test');

-- Helpers. They run as the caller (SECURITY INVOKER), so the statement under
-- test is checked against the caller's privileges and policies.
create function pg_temp.must_fail(label text, stmt text) returns void
language plpgsql as $$
begin
  execute stmt;
  raise exception 'FAIL (attack succeeded): %', label using errcode = 'P0001';
exception
  when raise_exception then
    if sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'pass  %  [%]', label, sqlerrm;
  when others then
    raise notice 'pass  %  [%]', label, sqlerrm;
end $$;

create function pg_temp.must_affect_nothing(label text, stmt text) returns void
language plpgsql as $$
declare n integer;
begin
  execute stmt;
  get diagnostics n = row_count;
  if n > 0 then
    raise exception 'FAIL (attack changed % row(s)): %', n, label;
  end if;
  raise notice 'pass  %  [0 rows]', label;
exception
  when raise_exception then
    if sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'pass  %  [%]', label, sqlerrm;
  when others then
    raise notice 'pass  %  [%]', label, sqlerrm;
end $$;

create function pg_temp.expect(label text, ok boolean) returns void
language plpgsql as $$
begin
  if not coalesce(ok, false) then
    raise exception 'FAIL: %', label;
  end if;
  raise notice 'pass  %', label;
end $$;

grant execute on all functions in schema pg_temp to authenticated, anon;

-- ============================================================
-- Signed in as Alice
-- ============================================================
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000001';

\echo
\echo '── attacks on profiles'
select pg_temp.must_fail('set own coins',
  $$update public.profiles set coins = 999999 where id = auth.uid()$$);
select pg_temp.must_fail('set own level',
  $$update public.profiles set level = 'Platin' where id = auth.uid()$$);
select pg_temp.must_fail('set own total_coins_earned',
  $$update public.profiles set total_coins_earned = 999999 where id = auth.uid()$$);
select pg_temp.must_fail('set own missions_completed',
  $$update public.profiles set missions_completed = 999 where id = auth.uid()$$);
select pg_temp.must_affect_nothing('rename someone else',
  $$update public.profiles set display_name = 'pwned' where id = 'bbbbbbbb-0000-4000-8000-000000000002'$$);

\echo '── attacks on mission participation'
select pg_temp.must_fail('join with completed_at preset',
  $$insert into public.mission_participants (user_id, mission_id, completed_at, coins_earned)
    values (auth.uid(), 'm-park', now(), 500)$$);
select pg_temp.must_fail('join with qr_verified preset',
  $$insert into public.mission_participants (user_id, mission_id, qr_verified)
    values (auth.uid(), 'm-park', true)$$);
select pg_temp.must_fail('join on behalf of someone else',
  $$insert into public.mission_participants (user_id, mission_id)
    values ('bbbbbbbb-0000-4000-8000-000000000002', 'm-park')$$);
select pg_temp.must_fail('join an inactive mission',
  $$insert into public.mission_participants (user_id, mission_id) values (auth.uid(), 'm-inactive')$$);
select pg_temp.must_fail('join a mission that does not exist',
  $$insert into public.mission_participants (user_id, mission_id) values (auth.uid(), 'm-nope')$$);

\echo '── attacks on the ledger'
select pg_temp.must_fail('forge a bonus transaction',
  $$insert into public.karma_transactions (user_id, amount, kind) values (auth.uid(), 100000, 'bonus')$$);
select pg_temp.must_fail('mint a redemption code without paying',
  $$insert into public.reward_redemptions (user_id, reward_id, code)
    values (auth.uid(), 'r-bike', 'KC-FREE-BIKE')$$);

\echo
\echo '── allowed: onboarding'
update public.profiles
  set interests = '{environment,social}', district = 'Altstadt', onboarding_completed = true
  where id = auth.uid();
select pg_temp.expect('onboarding fields saved',
  (select onboarding_completed and district = 'Altstadt' from public.profiles where id = auth.uid()));

\echo '── allowed: join + complete a mission'
insert into public.mission_participants (user_id, mission_id) values (auth.uid(), 'm-park');

select pg_temp.must_fail('mark own participation completed directly',
  $$update public.mission_participants set completed_at = now(), coins_earned = 500
    where user_id = auth.uid()$$);

-- p_coins = 99999 must be ignored: the mission is worth 50.
select public.complete_mission('m-park', 99999);
select pg_temp.expect('mission pays its database value, not the client''s',
  (select coins = 50 and total_coins_earned = 50 and missions_completed = 1
   from public.profiles where id = auth.uid()));
select pg_temp.expect('participation records database coins',
  (select coins_earned = 50 and completed_at is not null
   from public.mission_participants where user_id = auth.uid() and mission_id = 'm-park'));
select pg_temp.expect('completion is not recorded as QR-verified',
  (select not qr_verified from public.mission_participants
   where user_id = auth.uid() and mission_id = 'm-park'));
select pg_temp.must_fail('complete the same mission twice',
  $$select public.complete_mission('m-park', 50)$$);
select pg_temp.must_fail('complete a mission never joined',
  $$select public.complete_mission('m-big', 400)$$);

\echo '── allowed: redeem a reward'
-- p_coin_cost = 0 must be ignored: the reward costs 30.
select pg_temp.expect('redemption returns a long, well-formed code',
  (select code ~ '^KC-[0-9A-F]{5}-[0-9A-F]{5}$' from public.redeem_reward('r-coffee', 0, 'gratis')));
select pg_temp.expect('reward charges its database price, not the client''s',
  (select coins = 20 from public.profiles where id = auth.uid()));
select pg_temp.expect('ledger shows the real price and title',
  (select amount = -30 and description = 'Eingelöst: Kaffee'
   from public.karma_transactions where user_id = auth.uid() and kind = 'spend_reward'));
select pg_temp.must_fail('redeem something unaffordable',
  $$select public.redeem_reward('r-bike', 0, 'x')$$);
select pg_temp.must_fail('redeem an inactive reward',
  $$select public.redeem_reward('r-inactive', 0, 'x')$$);
select pg_temp.must_fail('redeem a reward that does not exist',
  $$select public.redeem_reward('r-nope', 0, 'x')$$);
select pg_temp.must_fail('stamp own code as redeemed',
  $$update public.reward_redemptions set redeemed_at = now() where user_id = auth.uid()$$);

\echo
\echo '── level thresholds still apply'
insert into public.mission_participants (user_id, mission_id) values (auth.uid(), 'm-big');
select public.complete_mission('m-big', 0);
select pg_temp.expect('450 total earned → Silber',
  (select level = 'Silber' and total_coins_earned = 450 from public.profiles where id = auth.uid()));

-- ============================================================
-- Not signed in
-- ============================================================
reset role;
set role anon;
set request.jwt.claim.sub = '';

\echo
\echo '── anonymous'
select pg_temp.must_fail('anon calls redeem_reward',
  $$select public.redeem_reward('r-coffee', 0, 'x')$$);
select pg_temp.must_fail('anon calls complete_mission',
  $$select public.complete_mission('m-park', 0)$$);

reset role;
\echo
\echo 'all economy security tests passed'
