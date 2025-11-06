# Quickstart: Week 3 delivery (GitHub Projects)

**Branch**: `001-update-specify-md` • **Spec**: `specs/001-update-specify-md/spec.md`

## 1) GitHub Projects & Issues
- Create a Project (Week 3) and add Issues for: Expenses UI, ToDo UI, Quote UI, Reviewability.
- Use branch names: `feature/GH-####-short-scope` (use the Issue number).
- Use Conventional Commits: `feat(scope): description (GH-####)`.

## 2) UI scaffold
- Create `apps/ui/` (Vite + React), commit baseline routes/components.
- Install testing: Vitest + React Testing Library; Playwright.

## 3) CI jobs
- Lint + unit + coverage export to `review-artifacts/`.
- Playwright smoke on PRs to `development`.
- Publish Pages for Coverage Index + UI demo.

## 4) Implement by day
- Day 1: finalize SpecKit; scaffold UI; CI + Pages.
- Day 2: Expenses UI + tests + smoke; coverage ≥ 50%.
- Day 3: ToDo + Quote UIs + tests + smoke; README review box; Release Packet; Capstone PR.

## 5) Review Packet & Release
- Export coverage HTML (CLI + UI) and index to `review-artifacts/`.
- Create Release with Review Packet ZIP (coverage HTML, Playwright report, `review.md`).
- Update README “How to review me” links to Release + Pages.

## 6) Capstone PR
- Target: `development`.
- Title: `feat(week3): UI + SpecKit + reviewability (GH-####)`.
- Body: What changed / How I tested / Artifacts links / Coverage Table / Screenshots (branch protection + issue linking).


