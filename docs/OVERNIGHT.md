# The overnight loop

Three agents pass work between each other until the backlog is empty and the
gates are green. You start it once and go to bed.

```
        ┌────────────────────────────────────────────────┐
        │  /overnight  (conductor — owns git + rollback) │
        └────────────────────────────────────────────────┘
                 │            │             │
                 ▼            ▼             ▼
           ┌─────────┐  ┌──────────┐  ┌─────────┐
           │ builder │→ │  tester  │→ │  fixer  │─┐
           └─────────┘  └──────────┘  └─────────┘ │
                             ▲                    │
                             └────────────────────┘
                              re-test (max 2 rounds)
                                    │
                     green → commit + push │ red → git reset --hard
```

The point isn't a clever prompt. It's the handoff: each agent's report is
the next agent's input, so work compounds across the night instead of
resetting every prompt.

## The pieces

| File | Role |
| --- | --- |
| `.claude/overnight/GOAL.md` | Kickoff brief: end state, done-definition, guardrails. **Edit before every run.** |
| `.claude/overnight/BACKLOG.md` | Ordered work list. One item per iteration. |
| `.claude/overnight/PROGRESS.md` | Append-only journal — the test-and-fix history you read in the morning. |
| `.claude/agents/overnight-*.md` | The three roles, each with a narrow job and a fixed report format. |
| `.claude/commands/overnight.md` | One iteration: build → test → fix → land or roll back. |
| `scripts/verify.sh` | The success condition: typecheck → lint → build → smoke. |
| `scripts/smoke.mjs` | Boots the production build and walks the real routes. |

## Starting a run

```bash
npm ci                    # the loop assumes node_modules exists
npm run verify            # confirm you're starting from green
```

1. Rewrite the **end state** paragraph in `GOAL.md`. Be specific about what
   a person can *do* when it's finished — vague goals make the loop stop
   early, and "the app builds" is not a goal.
2. Trim `BACKLOG.md` to tonight's work, in dependency order, each item with
   its own `Verify:` line.
3. Start the loop:

```
/loop 25m /overnight
```

`/loop` re-fires `/overnight` on an interval; each firing runs exactly one
build→test→fix→commit cycle and stops. At ~25 minutes an iteration, a
12-hour night is roughly 25–30 items attempted. Stop it any time with
`/loop stop`; it also stops itself when the backlog is done or after three
consecutive rollbacks.

To watch a single iteration before trusting the night with it, just run
`/overnight` once.

## What keeps it safe

The loop is unattended, so the guardrails matter more than the speed:

- **Every commit is green.** `scripts/verify.sh` decides, not an agent's
  judgement of its own diff.
- **Rollback beats a broken commit.** Two failed fix rounds → `git reset
  --hard HEAD` and the item is marked `- [blocked]`. You wake up to a
  working tree and a list of what didn't work, never to a broken build.
- **Gates can't be weakened.** All three agents are forbidden from
  `@ts-ignore`, eslint-disables, deleted assertions and dropped smoke
  routes, and the conductor treats a diff containing one as a failed
  iteration. This is the rule that matters most: an agent that disarms the
  gate at 2am makes every hour after it worthless.
- **Branch-scoped.** Commits go to `claude/overnight-multi-agent-loop-j6p306`
  only — never `main`.
- **Roles are separated for a reason.** The tester can't edit files, so it
  can't "fix" a failure by making it invisible. The builder can't commit, so
  nothing lands untested.

## In the morning

```bash
cat .claude/overnight/PROGRESS.md      # what was built, broke, got fixed
git log --oneline main..HEAD           # one commit per landed item
grep -n "blocked" .claude/overnight/BACKLOG.md
```

Blocked items are the honest output of the night — read the reason, decide
whether to re-scope them or do them yourself.

## Tuning it

- **Iterations run too long / hit context limits** — items are too big.
  Split until each is one commit's worth.
- **Everything rolls back** — the gates are failing for a reason unrelated
  to the work (missing `.env.local`, stale `.next/`, a port in use). Run
  `npm run verify` yourself before the next run.
- **Green builds, useless features** — tighten the `Verify:` lines. The
  tester is explicitly told to fail a green build whose item doesn't
  actually work, but it can only check what the item told it to check.
- **The smoke test is the weak spot.** It walks routes as an anonymous
  visitor; auth-gated pages only assert "redirects or renders". The last
  backlog item fixes that.
