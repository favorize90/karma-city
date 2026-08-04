# Overnight backlog

Ordered work list. The loop takes the **first** `- [ ]` item each iteration
and does nothing else that iteration.

States: `- [ ]` open · `- [x]` landed and green · `- [blocked]` rolled back,
reason on the line below.

Rules for whoever edits this file (a human, before the run starts):
- One item = one commit = roughly one to two hours of work. If you can't
  describe how you'd verify it in one sentence, it's too big — split it.
- Order matters. Dependencies go first; the loop does not reorder.
- Every item needs its own **Verify:** line. That line is what the tester
  checks beyond the build passing.

---

## Seeded from the current state of the repo

These are real gaps found in the tree, ordered so each builds on the last.
Replace or reorder them to match what you actually want built tonight.

- [ ] **Partner terminal validates a real redemption code.**
      `src/app/partner/page.tsx` scans a code and jumps straight to a success
      screen; nothing is checked against the database. Look up the scanned
      code in `redemptions`, reject unknown or already-redeemed codes with a
      German error state, and stamp `redeemed_at` on success.
      Verify: an unknown code shows the error state; a valid code can only
      be redeemed once.

- [ ] **Partner terminal stats come from the database.**
      The three counters in the terminal header are hardcoded (`83`, etc.).
      Read them for the signed-in partner instead.
      Verify: the counters change after a redemption lands.

- [ ] **Admin dashboard reads real data.**
      `src/app/admin/page.tsx` imports `missions`, `communityMembers`,
      `communityStats` and a local `mockPartners` array from
      `src/data/mockData`. Move each onto the query layer in
      `src/lib/db/queries.ts`.
      Verify: `/admin` renders with no import from `@/data/mockData`.

- [ ] **Onboarding suggests real missions.**
      `src/app/app/onboarding/page.tsx` picks from the mock mission list.
      Use the same city-scoped query the missions page uses.
      Verify: the wizard offers missions that exist in the database.

- [ ] **Profile achievements are computed, not mocked.**
      `src/app/app/profile/page.tsx` renders `achievements` from mockData.
      Derive them from the user's real mission and karma history.
      Verify: a fresh account shows zero unlocked achievements.

- [ ] **Keep only types in `src/data/mockData.ts`.**
      Once the pages above are converted, the file should export
      `Mission`, `MissionCategory`, `categoryLabels`, `categoryColors` and
      `levelConfig` — no seed rows.
      Verify: `grep -rn "from \"@/data/mockData\"" src/` returns only type
      and label imports.

- [ ] **Smoke test covers the signed-in path.**
      `scripts/smoke.mjs` currently accepts a redirect on every `/app/*`
      route, so a logged-in regression is invisible. Add a mode that signs in
      with a seeded test account when `SMOKE_TEST_EMAIL` /
      `SMOKE_TEST_PASSWORD` are set, and assert the dashboard renders.
      Verify: with credentials set, `/app` returns 200 and contains the
      Karma balance; without them, the run skips that block and stays green.
