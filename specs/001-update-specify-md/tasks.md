# Tasks: Week 3 delivery in 3 days (GitHub Projects)

Feature: Update specify.md + Week 3 UI delivery • Branch: `001-update-specify-md`
Spec: `C:\Users\RAYMOND\Desktop\Work Projects\training-raymond\specs\001-update-specify-md\spec.md`
Plan: `C:\Users\RAYMOND\Desktop\Work Projects\training-raymond\specs\001-update-specify-md\plan.md`

---

## Phase 1 — Setup (project initialization)

- [ ] T001 Create UI project folder `apps/ui/` with Vite React scaffold
- [ ] T002 Add unit test harness (Vitest + React Testing Library) in `apps/ui/`
- [ ] T003 Add Playwright with one blank smoke test in `apps/ui/playwright/`
- [ ] T004 Configure GitHub Pages publish pipeline placeholder in `.github/workflows/pages.yml`
- [ ] T005 Add CI job for lint + unit + coverage export to `review-artifacts/` in `.github/workflows/ci.yml`
- [ ] T006 Add CI job to run Playwright smoke on PRs to `development` in `.github/workflows/ci.yml`
- [ ] T007 Create coverage index placeholder `review-artifacts/index.html`
- [ ] T008 Add README review box placeholder in `README_Week3.md`
- [ ] T009 Create GitHub Project issues from this tasks.md (GH CLI helper script) in `scripts/gh-import-tasks.ps1`

## Phase 2 — Foundational (blocking prerequisites)

- [ ] T010 Create shared pure logic structure under `src/cli/` for reuse in UI (no code yet)
- [ ] T011 Define base UI routes/pages placeholders in `apps/ui/src/pages/`
- [ ] T012 Define base UI components placeholders in `apps/ui/src/components/`
- [ ] T013 Wire deterministic testing helpers (seeded RNG and injected clock) in `apps/ui/src/tests/helpers.ts`
- [ ] T014 Ensure branch protection and required checks documented in `README_Week3.md`

---

## Phase 3 — [US1] Expenses UI (Priority P1)

Goal: Minimal Expenses UI mirroring CLI rules; deterministic tests; coverage ≥ 50% statements.
Independent test: Selecting month/category shows correct totals; malformed rows handled.

- [ ] T015 [US1] Implement Expenses route `apps/ui/src/pages/Expenses.tsx`
- [ ] T016 [US1] Implement components: selectors and totals `apps/ui/src/components/expenses/`
- [ ] T017 [US1] Implement validation for unknown month/category (inline error) `apps/ui/src/pages/Expenses.tsx`
- [ ] T018 [US1] Import or implement core totals logic mirroring CLI `apps/ui/src/lib/expenses/totals.ts`
- [ ] T019 [P] [US1] Unit tests (table‑driven) for months/categories/malformed rows `apps/ui/src/tests/expenses.test.tsx`
- [ ] T020 [US1] Playwright smoke: select month/category → totals render `apps/ui/playwright/expenses.smoke.spec.ts`
- [ ] T021 [US1] Export UI coverage HTML and add to `review-artifacts/` (CI ensures)

---

## Phase 4 — [US2] ToDo UI (Priority P2)

Goal: Add/list/complete with deterministic date boundaries; coverage ≥ 50% statements.
Independent test: yesterday/today/tomorrow boundaries behave by injected clock; duplicate guards enforced.

- [ ] T022 [US2] Implement ToDo route `apps/ui/src/pages/ToDo.tsx`
- [ ] T023 [US2] Implement components for list/add/complete `apps/ui/src/components/todo/`
- [ ] T024 [US2] Duplicate guard + errors for complete nonexistent item `apps/ui/src/pages/ToDo.tsx`
- [ ] T025 [US2] Injected clock utility for dueToday logic `apps/ui/src/lib/time/clock.ts`
- [ ] T026 [P] [US2] Unit tests for yesterday/today/tomorrow, duplicate add, bad complete `apps/ui/src/tests/todo.test.tsx`
- [ ] T027 [US2] Playwright smoke: add → list → complete `apps/ui/playwright/todo.smoke.spec.ts`
- [ ] T028 [US2] Export UI coverage HTML and add to `review-artifacts/`

---

## Phase 5 — [US3] Quote UI (Priority P3)

Goal: Filter by author/tag (case‑insensitive), random pick when no filter; coverage ≥ 50% statements.
Independent test: filter results correct; deterministic random via seed.

- [ ] T029 [US3] Implement Quote route `apps/ui/src/pages/Quote.tsx`
- [ ] T030 [US3] Implement components for filters/result `apps/ui/src/components/quote/`
- [ ] T031 [US3] Deterministic random pick (seeded RNG) `apps/ui/src/lib/random/seeded.ts`
- [ ] T032 [P] [US3] Unit tests for author/tag filters, empty dataset, seeded RNG `apps/ui/src/tests/quote.test.tsx`
- [ ] T033 [US3] Playwright smoke: apply filter → expect deterministic result `apps/ui/playwright/quote.smoke.spec.ts`
- [ ] T034 [US3] Export UI coverage HTML and add to `review-artifacts/`

---

## Phase 6 — Polish & Reviewability

- [X] T035 Update README “How to review me” box with actual Release/Pages links `README_Week3.md`
- [X] T036 Generate Coverage Index (CLI + UI) to `review-artifacts/index.html`
- [X] T037 Build Review Packet ZIP and attach to Release `review-artifacts/`
- [X] T038 Capstone PR to `development` with Coverage Table, links, and screenshots `docs/review.md`

---

## Dependencies (story order)

1) US1 Expenses → 2) US2 ToDo → 3) US3 Quote → 4) Polish

## Parallel execution examples

- While implementing Expenses UI page (T015–T018), tests (T019) can proceed in parallel [P].
- For ToDo (T022–T025), unit tests (T026) in parallel [P].
- For Quote (T029–T031), unit tests (T032) in parallel [P].

## Implementation strategy

- MVP is US1 (Expenses UI): ship with tests, smoke, coverage; then expand to US2 and US3.
- Keep validations and happy paths only; avoid scope creep beyond README acceptance.

---

## Import to GitHub Issues (optional)

Use GH CLI to create Issues from this checklist and add to your Project:

```powershell
$ORG = "Maximus-Technologies-Uganda"
$REPO = "Maximus-Technologies-Uganda/training-raymond"
$PROJECT = 4
$TASKS = "specs/001-update-specify-md/tasks.md"

$lines = Get-Content $TASKS
$items = @()
foreach ($line in $lines) {
  if ($line -match '^\s*-\s*\[\s\]\s*(T\d{3}.*)$') { $items += $Matches[1].Trim() }
}

foreach ($i in $items) {
  $title = $i
  $out = gh issue create -R $REPO -t $title -b "Created from SpecKit tasks.md" -l "week3,speckit"
  $url = ($out | Select-Object -Last 1).Trim()
  gh project item-add --owner $ORG --number $PROJECT --url $url | Out-Null
}
```

Or run the helper script (recommended):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/gh-import-tasks.ps1 -Org "Maximus-Technologies-Uganda" -Repo "Maximus-Technologies-Uganda/training-raymond" -ProjectNumber 4 -TasksPath "specs/001-update-specify-md/tasks.md"
```

## Auto-mark Project items Done on merge

- A workflow `.github/workflows/project-auto-done.yml` is included. It marks the related Project item `Status=Done` whenever an Issue is closed (e.g., via PR merge with `Closes #123`).
- Required once: add a repo secret `GH_TOKEN` with a PAT that has write access to Organization Projects (Projects v2). Update `ORG` and `PROJECT_NUMBER` in the workflow if needed.


