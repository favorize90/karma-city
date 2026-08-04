# Overnight loop — kickoff brief

This is the brief the loop reads at the top of every iteration. Everything
here is binding on every agent in the loop. Edit this file before you start
a run; do not edit it during one.

---

## The project

**Karma City** — a civic-engagement app for Soest. Citizens complete real
community missions (tree planting, digital help for seniors, pond cleanup),
earn Karma coins by having a partner scan their QR code, and redeem those
coins for rewards from local partners.

Stack: Next.js 14 (App Router, TypeScript, Tailwind) · Supabase (auth,
Postgres, RLS) · Capacitor iOS shell · a native SwiftUI client in
`ios-native/`. UI copy is German.

## The end state for this run

> **Replace this paragraph before every run.** Vague goals stop the loop
> early — "a playable world you can walk around in" beats "a game".
> Describe what a person can *do* when the run is finished, not what code
> exists.

A signed-in citizen can complete the full loop end to end against real
Supabase data: browse missions → join one → have a partner scan their code
→ see the Karma balance increase → redeem a reward — with every screen
covered by the smoke test and no mock data left in the path.

## Definition of done

The loop stops when **both** are true:

1. Every item in `BACKLOG.md` is `- [x]` or `- [blocked]`.
2. `scripts/verify.sh` is green — typecheck, lint, production build, and the
   route smoke test all pass on the committed tree.

## Guardrails

Non-negotiable for every agent in the loop:

- **Branch:** commit and push only to `claude/overnight-multi-agent-loop-j6p306`.
  Never `main`.
- **Never commit red.** `scripts/verify.sh` decides. If it can't be made
  green in two fix rounds, roll back to the last green commit and mark the
  item `- [blocked]`.
- **Never weaken a gate to make it pass.** No `@ts-ignore`, no
  eslint-disable, no deleting an assertion, no dropping a route from the
  smoke list. Removing the thing that caught the problem disarms every
  remaining iteration of the night.
- **Migrations are append-only.** Existing files in `supabase/migrations/`
  may already be applied to a live database — add a new numbered file
  instead of editing one.
- **No new runtime dependencies** without recording the reason in
  `PROGRESS.md`. Dev tooling is fine; a package in the shipped bundle is a
  decision the human makes.
- **Never touch secrets.** `.env.local` is read-only to the loop and must
  never be committed, echoed into a log, or pasted into a report.
- **No destructive git.** No force-push, no history rewrite, no branch
  deletion. `git reset --hard HEAD` for rollback is the one exception.
- **German UI copy.** Match the tone already in `src/app/page.tsx`.

## Working conventions

- Server components by default; `"use client"` only where interaction needs it.
- `@/` path alias, Tailwind utilities, no CSS modules.
- Data access goes through `src/lib/db/queries.ts` and
  `src/lib/db/actions.ts` — components don't call Supabase directly.
- One backlog item per iteration. Discoveries go in the PROGRESS `Next:`
  line, never straight into the backlog.
