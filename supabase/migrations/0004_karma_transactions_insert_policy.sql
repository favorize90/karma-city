-- The initial schema only granted SELECT on karma_transactions; the redeem
-- and complete-mission server actions insert into it under the authenticated
-- role, so they need an INSERT policy with a self-check.

drop policy if exists "transactions_self_insert" on public.karma_transactions;
create policy "transactions_self_insert" on public.karma_transactions
  for insert with check (auth.uid() = user_id);
