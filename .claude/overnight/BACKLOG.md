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

## Tonight

Ordered so the tester can see what the loop changes before the loop changes
it. The signed-in smoke test comes first: without it every `/app/*` route
only has to "redirect or render" and a broken dashboard still passes.

- [ ] **Smoke test covers the signed-in path.**
      `scripts/smoke.mjs` currently accepts a redirect on every `/app/*`
      route, so a logged-in regression is invisible. Add a mode that signs in
      with a seeded test account when `SMOKE_TEST_EMAIL` /
      `SMOKE_TEST_PASSWORD` are set, and assert the dashboard renders.
      Verify: with credentials set, `/app` returns 200 and contains the
      Karma balance; without them, the run skips that block and stays green.

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

## Needs a human first

Blocked on a product or security decision, not on code. The loop skips
these; they come back once the decision is written into the item.

- [blocked] **Partner terminal validates a real redemption code.**
      There is no partner role yet, so any signed-in user could stamp any
      code. Decide who counts as a partner (table of partner accounts per
      business? invite codes?) before building validation on top.

- [blocked] **Partner terminal stats come from the database.**
      Depends on the item above — "the signed-in partner" doesn't exist yet.

- [blocked] **Missions need a real proof of completion.**
      Since 0007, `complete_mission` pays the mission's database value and no
      longer claims `qr_verified`, but a user can still self-report any
      mission they joined. Decide the proof (QR code at the location,
      organizer confirms, time window) before building it.

- [blocked] **Leaderboard exposes every profile column to every user.**
      `profiles_leaderboard_select` lets any signed-in user read all profiles
      in full, including `full_name`, `interests` and `district`. Decide which
      fields are public, then expose only those (a view or column grants).
