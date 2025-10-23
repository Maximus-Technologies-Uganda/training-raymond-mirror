# Week 1 Workbook — Raymond Suuna(Setup Edition)

**Source PDF:** Raymond Week 1 Workbook — Setup Edition (full Step‑by‑step).pdf. fileciteturn0file0

---

## Purpose
Raymond sets up everything end-to-end so mentors can review daily with hard evidence (PRs, CI, artifacts). This workbook mirrors John’s updated workbook with clearer, step-by-step setup.

## Track & Mentor
- **Track:** Foundations + CI Discipline  
- **Mentor:** Paul Mwanje  
- **Repo (private):** training-raymond  
- **Mirror (public):** training-raymond-mirror (read-only)  
- **Default branch:** `development` (protected)  
- **Dates in PDF:** 10/09/2025

---

## Objectives — What “Good” Looks Like by Friday
- End-to-end GitHub flow: feature branch → PR → Quality Gate green → review → merge to `development` → mirror auto-updates.
- Three CLIs shipped via PRs: `hello`, `stopwatch`, `temperature-converter` (or `todo` if time permits) with docs & tests.
- Daily journals with timestamps and evidence links (PRs, CI runs, artifacts, screenshots).
- Repo guardrails: branch protection on `development`, required checks, PR template, labels, minimal CI.

---

# Pre‑Flight (Day 0) — One‑Time Setup
**Goal:** Create private source repo + public mirror and enforce guardrails so reviews rely on evidence, not opinion.

### A) Repo Location & Naming
**Preferred Option (transfer existing personal repo):**
1. GitHub → Your repo → Settings → General → Danger Zone → Transfer ownership.
2. Type the repo name to confirm, choose destination `Maximus-Technologies-Uganda` (example).
3. Keep visibility Private.
4. After transfer, go to Settings → General → Repository name and rename appropriately (e.g., `training-prince`).
5. Update local git remote:
```bash
git remote -v
git remote set-url origin git@github.com:Maximus-Technologies-Uganda/training-prince.git
git fetch origin
```
6. Ensure access by pushing a tiny non-code change on a new branch and opening a PR.

**Alternative (no personal repo):**
- Create private org repo `training-prince` (empty).
- Create public org repo `training-prince-mirror` (empty; Actions disabled initially).

### B) Default Branch & Protection (private repo)
- Set default branch to `development`.
- Settings → Branches → Add rule for `development`:
  - Require a pull request before merging (1 reviewer).
  - Dismiss stale approvals.
  - Require status checks (CI must pass).
  - Restrict who can push (optional).

### C) Labels (private repo)
Create the labels:
- `needs-review-packet`
- `Training`
- `Review`
- `Blocked`

### D) Minimal Project Files (initial commit)
Add:
- `README.md`
- `.gitignore`
- `package.json`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/workflows/checks.yml`
- `/docs/journals/.gitkeep`
- `/docs/workbooks/.gitkeep`
- `/docs/review-packet-week1.md`
- `/tests/.gitkeep`
- `/src/hello/index.js`

### E) Node & Scripts
- Install Node LTS.
- In `package.json` add scripts: `dev`, `test`, `lint`, `start` (CLIs run via node).
- Choose a test runner (Vitest or Jest). Ensure `npm test` exits non-zero on failure.

### F) CI — Minimal Quality Gate (private repo)
Create `.github/workflows/checks.yml` that runs on PRs to `development`:

```yaml
name: checks
on:
  pull_request:
    branches: [ development ]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm test
```

### G) Mirror — Push‑Only Automation (optional in Week 1)
- Add a workflow that on push to `development` force-pushes to the public mirror using a repo-scoped token or deploy key. Trainees should not push to the mirror directly. Enable at end of Week 1 if desired.

### H) Evidence Discipline (Daily)
Each day include:
- PR URL
- CI run URL
- Commit hash(es)
- Artifact URL(s)
- Time spent (hh:mm)
- Notes/Blockers
- 1 screenshot

---

# Daily Plan (with Measurable Evidence)
Follow a consistent rhythm. Keep PRs small (≤300 LOC), run tests locally before pushing, and capture evidence as you go.

## Daily Rhythm & Checklist (Mon–Fri)
**Morning plan (09:00–09:20 EAT)**
- Open today's journal file in `/docs/journals/YYYY-MM-DD.md`.
- Write 2–4 concrete tasks with time estimates. Link open issues.

**Build blocks (09:20–12:30 & 14:00–16:30 EAT)**
- Create small feature branch from `development` per task.
- Implement + write tests. Keep CLI core pure; I/O thin.
- Push early; open a draft PR once tests pass locally.

**Midday check (12:30 EAT)**
- Update journal with branch name, PR link, test count, blockers.

**EOD hand‑off (by 18:00 EAT)**
- Convert draft PRs to ready for review. Ensure checks are green.
- Update journal with PR/CI links, screenshot, and “What I learned”.
- Update the Review Packet with today's PRs + CI snapshots.

**Evidence to capture daily:** PR URL · CI run URL · commit SHA(s) · test count (today/total) · time spent · 1 screenshot · notes/blockers.

---

# Week Plan — Day-by-Day

## Day 1 — Bootstrap & Hello
**Deliverables:**
- Node/Git configured; repo bootstrapped.
- "Hello, World" with 1 passing unit test on PR; CI green.

**Steps:**
```bash
git checkout -b chore/bootstrap development
npm init -y
# add test runner (Vitest/Jest) and scripts: test, test:watch, lint
# create /src/hello/index.js and /tests/sanity.test.js
git add .
git commit -m "bootstrap project"
git push --set-upstream origin chore/bootstrap
# open PR to development
```

**DoD:** PR open to `development` with template filled; 1 test passing locally & in CI; README explains install/run/test.

## Day 2 — Hello CLI (Args & Flags)
**Deliverables:**
- CLI accepts `--name` (or positional) and `--shout`.
- 2–3 tests for name provided/missing; shout on/off.
- README usage examples.

**Notes:**
- Keep business logic pure (`formatGreeting(name, shout)`), thin CLI wrapper reads `process.argv`.

## Day 3 — Stopwatch CLI (TDD)
**Deliverables:**
- Commands: `start`, `lap`, `stop` → print total + laps.
- ≥3 tests including negative test (lap before start).

**Design:**
- Core pure module with `start()`, `lap()`, `stop()`, `elapsedMs()`, `formatTime(ms)` and thin CLI wrapper.

## Day 4 — Temperature Converter CLI (Validation)
**Deliverables:**
- Flags: `--from <C|F>` and `--to <C|F>`; reject illegal combos with clear errors.
- ≥3 tests for conversions and invalid flags.
- README examples including error cases.

## Day 5 — Consolidation & Capstone PR
**Deliverables:**
- Polish tests/docs across CLIs; optional tag `v0.1.0`.
- Capstone PR labeled `needs-review-packet` referencing `/docs/review-packet-week1.md`.

**Steps:**
- Tighten error messages, edge cases, help text.
- Add/finish tests to reach ≥5 total this week.
- Update Review Packet with PR links, CI screenshots, demo video link.
- Open Capstone PR to `development` → checks green → add label `needs-review-packet`.

---

# Acceptance Criteria (Pass Week 1)
- Four PRs total (bootstrap, hello-cli, stopwatch, temp) + capstone.
- `checks` workflow green on all PRs.
- Branch protection enabled on `development` (screenshot).
- Journals (Day 1–5) contain timestamps and all evidence links.
- (Optional) Mirror shows merged commit after `development` merge.

---

# Templates (Copy‑Paste)

## PR Template — `.github/PULL_REQUEST_TEMPLATE.md`
```
## Summary
What & why (user impact)

## Scope
Issues/links

## How it works
Key decisions & tradeoffs; notable functions

## Screenshots / Demos
If applicable

## Test Plan
- [ ] Unit tests passing locally & in CI

## AI Usage
Prompts that materially changed your approach (summarize)

## Checklist
- [ ] Small, focused diff
- [ ] Lint/tests green
- [ ] README/docs updated
```

## Review Packet — `/docs/review-packet-week1.md`
Structure:
- Scope & Links (Bootstrap PR, Hello CLI PR, Stopwatch PR, Temp Converter PR, Capstone PR)
- CI Snapshots (links/screenshots to checks runs)
- Diff Summary (3–7 bullets)
- Open Issues / Risks
- Rubric (100 points total)
  - Correctness (30)
  - Code Quality (20)
  - Tests (15)
  - Product Thinking (15)
  - CI Hygiene (10)
  - Docs/PR Notes (10)
- Mentor Decision (Promote / Hold / Remediate + notes)

## Daily Journal — `/docs/journals/YYYY-MM-DD.md`
```
# Journal — YYYY-MM-DD

## Goals for Today
- [ ] Task 1 (est. 60m)
- [ ] Task 2 (est. 90m)

## Prompts I used (5–10)
- "<prompt 1>" → key learning

## Commands / Steps I tried
- `node src/hello --name John`
- `npm test`

## PRs & CI
- PR: <url> — CI: <url/screenshot>

## Bugs & Fixes
Symptom → root cause → fix

## What I learned (1–3 bullets)
- ...

## Plan for Tomorrow
- ...
```

---

# Mentor Review Cadence (Daily)
- Open Review Packet (if present) → skim PR links & CI
- Fast rubric score (out of 100)
- Write Mentor Note (3× good, 3× improve, ≤5 non-negotiables)
- If off-track, open a blocking issue assigned to Prince

---

# Quick Reference — Branch Protection UI Steps
Settings → Branches → Add rule for `development`:
- Require PRs, 1 reviewer, dismiss stale approvals
- Require status checks → add checks
- (Optional) Restrict who can push

# Quick Reference — Evidence Discipline
Always include PR URL · CI run URL · commit SHA · artifact URL(s) · time spent · 1 screenshot.

---

## Notes & Observations
- The workbook emphasizes evidence-driven reviews: PRs + CI screenshots + timestamps are core.
- Focus on small PRs, TDD for CLIs, and separation of pure logic vs I/O for testability.
- Mirror automation is optional for Week 1 and should be guarded (push-only).

---

*Markdown generated from the uploaded PDF.* fileciteturn0file0
