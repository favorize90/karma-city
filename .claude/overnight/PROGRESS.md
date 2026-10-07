# Overnight loop — run journal

Append-only. One entry per iteration, newest at the bottom. This is the
test-and-fix history: in the morning it should tell you what changed, what
broke, what was patched, and what to distrust — without reading the diff.

Format:

```
## Iteration N — <UTC timestamp> — LANDED | ROLLED BACK | BLOCKED
- Item: <backlog item>
- Built: <what now exists that didn't before>
- Tester: <verdict, and the cause if it was red>
- Fixes: <what the fixer changed, per round — or "none needed">
- Commit: <sha or "none — rolled back">
- Next: <what the next iteration should know>
```

---

## Iteration 0 — setup — LANDED

- Item: stand up the overnight loop itself
- Built: `scripts/verify.sh` (typecheck → lint → build → smoke) and
  `scripts/smoke.mjs`; the `overnight-builder` / `overnight-tester` /
  `overnight-fixer` subagents; the `/overnight` conductor command; this
  journal, `GOAL.md` and `BACKLOG.md`.
- Tester: harness verified by hand against a clean tree.
- Fixes: none needed
- Commit: see `Add overnight multi-agent build/test/fix loop`
- Next: fill in the end state in `GOAL.md`, trim `BACKLOG.md` to tonight's
  work, then start the loop.

## Iteration 1 — 2026-10-07 — LANDED (attended, not by the loop)

- Item: make the Karma economy server-authoritative (security, done by hand)
- Built: migration `0007_server_authoritative_karma.sql`; SQL security
  suite `supabase/tests/economy_security.sql` with a Supabase shim;
  `scripts/test-db.sh`; a `db` stage in `scripts/verify.sh`. Web server
  actions now call the `complete_mission` / `redeem_reward` RPCs.
- Tester: against the pre-0007 schema nine direct-write attacks succeeded
  (set own coins/level/totals, join with completion preset, join inactive or
  missing missions, forge ledger rows, mint redemption codes), plus both RPCs
  took prices from the client (mission worth 50 paid 500; a 10,000-point
  reward redeemed for 0). After 0007 all 29 checks pass, each for the right
  reason. `verify.sh` green with the db stage. A regression probe that
  re-grants profile updates turns the db stage red.
- Fixes: `test-db.sh` mangled connection URLs with a `?query`; fixed.
- Commit: see `Make the Karma economy server-authoritative`
- Next: **0007 is not applied to production.** The live project
  (`jwztffvzmuegeihrrfep`) is not in the Supabase account connected to this
  session. Apply it there, then run one `/overnight` iteration attended
  before letting the loop run unattended. Set `TEST_DATABASE_URL` for loop
  runs so the db stage is not skipped.
