---
description: Run one iteration of the Karma City overnight loop (build → test → fix → commit).
allowed-tools: Agent, Read, Edit, Write, Bash, Glob, Grep
---

Run **exactly one iteration** of the overnight loop, then stop and report.
You are the loop conductor: you own git history and rollback, the subagents
own the code. Nobody is awake — never ask a question, decide and proceed.

Optional argument: $ARGUMENTS — if a backlog item is named there, work on
that one instead of the first open item.

## 0. Orient

Read, in this order:
- `.claude/overnight/GOAL.md` — end state and guardrails
- `.claude/overnight/BACKLOG.md` — the ordered work list
- the last ~60 lines of `.claude/overnight/PROGRESS.md` — what already happened

Confirm the tree is clean (`git status --short`) and you are on the branch
named in GOAL.md. If the tree is dirty from a crashed iteration, run
`git reset --hard HEAD` before starting — the last commit is green by
construction.

## 1. Stop conditions — check these first

Stop the loop and report `LOOP COMPLETE` if **either** holds:
- every `- [ ]` item in BACKLOG.md is now `- [x]` or `- [blocked]`, **and**
  `scripts/verify.sh` is green;
- more than 3 consecutive iterations ended in rollback (recorded in
  PROGRESS.md). Something structural is wrong; burning the night on it
  helps nobody.

## 2. Build

Pick the **first** unchecked backlog item (or the one in $ARGUMENTS).
Launch the `overnight-builder` subagent with:
- the item text verbatim,
- the relevant `NOTES:` from earlier PROGRESS entries touching the same area,
- the reminder that it implements one item and does not commit.

## 3. Test

Launch the `overnight-tester` subagent with the builder's full report.
It runs `scripts/verify.sh` and checks that the item actually works, not
just that the build passes.

## 4. Fix — at most 2 rounds

While the verdict is `RED` and fewer than 2 fix rounds have run:
- launch `overnight-fixer` with the tester's report verbatim,
- launch a fresh `overnight-tester` to confirm.

A `HARNESS` verdict is not a code failure: repair the harness yourself
(usually `npm ci`, a stale `.next/`, or a port already bound), then re-test.
That does not count as a fix round.

## 5. Land or roll back

**Green** →
```
git add -A
git commit -m "<imperative summary of the item>"
```
Mark the item `- [x]` in BACKLOG.md, append the PROGRESS entry (§6), commit
that as `Overnight loop: log iteration N`, then
`git push -u origin <branch from GOAL.md>` (retry 2s/4s/8s/16s on network
errors only).

**Still red after 2 fix rounds** → `git reset --hard HEAD`. Mark the item
`- [blocked]` in BACKLOG.md with a one-line reason, append the PROGRESS
entry, commit and push **only** those two files. The working tree must end
this iteration exactly as green as it started. A night of clean rollbacks is
a usable result; a night of broken commits is not.

## 6. Log the iteration

Append to `.claude/overnight/PROGRESS.md`:

```
## Iteration N — <UTC timestamp> — LANDED | ROLLED BACK | BLOCKED
- Item: <backlog item>
- Built: <builder's BUILT line>
- Tester: <verdict, and the cause if it was red>
- Fixes: <what the fixer changed, per round — or "none needed">
- Commit: <sha or "none — rolled back">
- Next: <what the next iteration should know>
```

This file is the test-and-fix history the human reads in the morning. Write
it for someone with zero context who wants to know what changed and what to
distrust.

## Hard rules

- Never push to `main`. Only the branch named in GOAL.md.
- Never commit red. The gates decide, not your judgement of the diff.
- Never weaken a gate, and reject any subagent report that did — treat a
  `@ts-ignore`, an eslint-disable, a deleted assertion or a removed smoke
  route as a **failed** iteration and roll back.
- Never add a backlog item mid-iteration. Discoveries go in the PROGRESS
  `Next:` line; the human triages them in the morning.
- One item per iteration. Scope creep at 3am is unreviewable by 8am.

## Report

Finish with a 5-line summary: item, verdict, commit sha, what the next
iteration will pick up, and whether the loop should keep running.
