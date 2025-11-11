# AGENT.md

This file gives AI coding agents the essential context to work effectively in this repository.

## Project Overview

Training project for Raymond delivering:
- Week 1–2: Node.js CLIs (ES Modules) with Vitest tests and CI discipline
- Week 3: React UI for the tools with Playwright smoke tests and review artifacts
- Week 4: Spec‑driven product slices, Figma integration, Projects automation, publishing

Core tools/domains:
- Hello (greeting)
- Stopwatch (timing with laps)
- Temperature (C/F)
- Expenses (parse/filter/summarize)
- ToDo (tasks with priorities and due dates)
- Quote (author/tag search with seeded random)

## Essential Commands (root)

```bash
npm install
npm run lint
npm test
npm run test:coverage     # CLI coverage (v8)
```

## UI workspace (apps/ui)

```bash
cd apps/ui
npm install
npm run dev               # http://localhost:5173
npm run build
npm run preview

# Unit tests + coverage (Vitest + RTL)
npm run test:coverage

# Playwright smoke (chromium only)
npm run test:e2e -- --project=chromium --grep @smoke
```

## What we’re building in Week 4

Spec‑driven product slices with tests, a11y smoke, and review artifacts:

- Slice A — Expenses: CSV Import + Totals View polish
  - CSV import (5–200 rows) with schema validation; malformed rows inline
  - Month/category selectors; totals; rounding policy 2dp documented
  - Empty dataset UX; non‑ASCII category names
  - Unit tests: table-driven months/categories + malformed rows
  - Playwright @smoke: upload → select → totals match fixture

- Slice B — To Do: dueToday filter + Priority badges
  - dueToday (local midnight boundary); keyboard‑navigable toggle
  - Priority badges; default sort by priority desc
  - Duplicate insert guard; complete non‑existent → inline error
  - Unit tests: date boundaries; duplicate add; bad complete
  - Playwright @smoke: add → filter today → complete → assert list

- Slice C — Quote: Author/tag search + Seeded random
  - Case‑insensitive author/tag filters; not found → inline message
  - Random when no filter; seeded RNG for deterministic e2e
  - Empty dataset UX
  - Unit tests: filters, empty dataset, seeded random
  - Playwright @smoke: author search equals fixture; seeded random reproducible

## Project Structure (high level)

```
apps/ui/
  src/components/…       # UI components (expenses/todo/quote)
  src/pages/…            # Expenses, ToDo, Quote pages
  playwright/…           # E2E tests + report
  scripts/export-coverage.mjs

specs/
  slice-a-expenses-csv/  # specify.md, plan.md, tasks.md
  slice-b-todo-filter/
  slice-c-quote-search/

.github/workflows/
  ci.yml                  # CLI + UI checks + artifacts
  checks.yml              # basic checks
  project-in-review.yml   # PR opened → Status: PR Review
  project-done-on-merge-main.yml  # PR merged to development → Status: Done
```

## Architecture & Patterns

- ES Modules: `"type": "module"` in package.json
- CLIs: export pure/testable functions, `main()`, `import.meta.url` guard, manual argv parsing
- UI: React + Vite, deterministic tests (seeded RNG, injected clock), accessibility labeling
- Spec Kit per slice: `/specify` (problem & acceptance), `/plan` (flows/state/test plan/a11y), `/tasks` (granular)

## Testing Targets (Week 4)

- CLI coverage (aggregate): ≥ 60% statements
- UI coverage overall: ≥ 80% statements; per changed module: ≥ 50% statements minimum
- E2E: at least one Playwright @smoke per slice
- a11y: one axe (or equivalent) smoke per route in CI

## CI & Publishing

- Branch protection on `development`: require lint, unit, e2e @smoke, a11y, packet build
- Review Artifacts:
  - Coverage HTML exported to `review-artifacts/`
  - Playwright report exported under `review-artifacts/ui/e2e/`
- Release: capstone PR publishes Review Packet ZIP
- Pages/Preview: Coverage Index + demo link(s) surfaced in README “How to review me”

## GitHub Projects Discipline

- Branch: `feature/gh-<issue>-short-scope` (e.g., `feature/gh-148-expenses-upload`)
- PRs: include “Closes #<issue>” lines or include T‑codes (T001…) in title/body
- Automation:
  - PR opened → Status: PR Review
  - PR merged into `development` → Status: Done (auto‑derives issues via “Closes #…”, branch GH‑123, or T‑codes)
- Secret required for Projects v2 automation: `GH_TOKEN` (PAT with repo, read:org, project)

## Agent Notes

- Prefer `npm install` over `npm ci` (repo constraints)
- Keep UI and CLI logic deterministic; mirror CLI validation in UI
- Update Spec Kit and tasks for each slice; link PRs and issues
- Ensure accessibility: labeled controls, focus management, table headers
- Tests import and verify exported functions (prefer unit logic over end-to-end CLI stdout)

## Code Style

- Linting: ESLint via `npm run lint`
- Conventions:
  - 2-space indentation, single quotes, required semicolons
  - Prefer small, focused functions with clear names
  - Avoid deep nesting; use early returns

## Branching, Commits, and PRs

- Branch naming (Linear integration): `feature/RAY-###-short-scope` (e.g., `feature/RAY-3-expenses-cli`)
- Conventional Commits for messages: `type: description (RAY-###)`
  - feat | fix | docs | test | chore | refactor
- PR title format: `feat(scope): short description (RAY-###)`
- PR body should include: What changed, How tested (commands), Coverage, Related issues

## CI & Protections

- PRs must pass lint, tests, and coverage checks before merging to `development`
- Branch protection requires PRs and up-to-date branches
- The repo mirrors to a public mirror on changes to `development`

## Notes for Agents

- Prefer `npm install` over `npm ci` for this repo.
- When adding features, include/extend tests in `tests/` and keep CLIs’ core logic pure and exportable.
- Follow the existing CLI structure and update documentation where relevant (`README.md`, `docs/`).

---

For more detailed guidance tailored to a specific assistant, see `CLAUDE.md`.






