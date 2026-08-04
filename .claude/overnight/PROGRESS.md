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
