<!--
Sync Impact Report

Version change: 1.2.0 -> 1.3.0
Updated sections:
  - Branching, Commits, and CI Gates (GitHub Issues / GH-####, Projects v2 automation)
  - UI & E2E Testing Standards (Week 4 coverage targets + a11y smoke)
  - Reviewability & Evidence (Release with Review Packet + Pages/Preview)
Added sections:
  - Spec Kit Discipline (per-slice trio: specify/plan/tasks)
  - Figma Discipline (component inventory + flows + tokens; link in README/PR)
-->

# training-raymond Constitution

## Core Principles

### Test‑First Development (NON‑NEGOTIABLE)
- All work MUST follow TDD (Red → Green → Refactor).
- Tests MUST run with Vitest; minimum thresholds are 60% for statements, branches, functions, and lines (enforced in `vitest.config.js`).
- Core logic MUST be exportable and tested directly; prefer unit tests over stdout snapshots.
- Every PR MUST keep tests passing and thresholds met.

Rationale: Tests define behavior, enable safe refactors, and act as executable documentation.

### CLI as Contract (Text I/O, Deterministic)
- Every domain capability MUST be invokable as a CLI entry point.
- Use text I/O contracts: args/stdin → stdout for results, stderr for errors; exit codes communicate failure modes.
- No external CLI frameworks; parse `process.argv` manually.
- Use ESM and the `import.meta.url` guard to prevent auto‑execution on import.
- Prefer JSON output behind a flag when machine consumption is expected.

Rationale: Deterministic text contracts keep tools composable and testable.

### Small, Pure, Maintainable Modules (ESM + TS‑friendly)
- Keep functions small/pure where possible; separate core logic from CLI glue.
- Follow repository style; avoid deep nesting and hidden global state.
- TypeScript CLIs MUST run via `node --loader ts-node/esm` when used.

Rationale: Simplicity improves readability, reuse, and testability.

### Branching, Commits, and CI Gates
- Work happens on feature branches targeting `development`.
- Branch naming (GitHub Projects): `feature/GH-####-short-scope` or `feature/gh-####-short-scope`.
- Conventional Commits: `type: description (GH-####)`.
- CI checks (lint + tests + coverage + e2e @smoke + a11y smoke + review packet) MUST pass before merge; branches MUST be up‑to‑date.
- Projects v2 Automation:
  - PR opened → move linked items to Status “PR Review”.
  - PR merged into `development` → move linked items to Status “Done”.
  - Linked items determined via: closing keywords (“Closes #123”), branch name `gh-123`, or T‑codes (T001…) in PR title/body.
  - Requires repo secret `GH_TOKEN` (PAT with repo, read:org, project).

Rationale: Traceability and automation keep quality high and releases safe.

### Reviewability & Evidence
- Each milestone MUST produce verifiable artifacts:
  - GitHub Release containing a Review Packet ZIP (coverage HTML and key reports under `review-artifacts/`).
  - A public preview (GitHub Pages or equivalent) exposing a Coverage Index and demo links when UI is present.
- The main `README` MUST include a “How to review me” box with links to the Release and Pages.

Rationale: Reviewers verify outcomes quickly; artifacts prove quality.

### Security & Secrets Hygiene
- Never commit secrets. Use environment variables (e.g., `GITHUB_TOKEN`, `GH_TOKEN`) or ignored `.env` files.
- Agent folders MUST be ignored: `.cursor/`, `.claude/`, `.codex/`.

Rationale: Prevent credential leakage and keep the repo portable.

## Additional Constraints
- Runtime: Node.js 18+ with ES Modules.
- Keep dependencies minimal; prefer stdlib/simple utilities.
- Lint via `npm run lint`; adhere to existing ESLint rules.

## UI & E2E Testing Standards (Week 4)
- UI stack: React (Vite) under `apps/ui/`.
- Unit tests MUST be deterministic (seeded RNG, injected clocks).
- Coverage targets:
  - UI overall: ≥ 80% statements
  - Per changed UI module: ≥ 50% statements minimum
  - CLI aggregate: ≥ 60% statements
- E2E: at least one Playwright “happy path” @smoke per slice/tool.
- Accessibility: at least one axe (or equivalent) a11y smoke per route in CI; controls labeled; focus management; proper table semantics.

## Spec Kit Discipline (per slice)
- `/specify`: problem, scope boundaries, acceptance rules.
- `/plan`: UI flows, state shapes, test plan (unit + e2e + a11y), risks.
- `/tasks`: granular, importable checklist; two labels applied on creation: `week4,speckit`.
- Slices in Week 4:
  - Slice A — Expenses: CSV Import + Totals polish
  - Slice B — To Do: dueToday + Priority badges
  - Slice C — Quote: Author/tag + Seeded random

## Figma Discipline (UI present)
- Maintain a Figma file with:
  - Component inventory (buttons, inputs, selects, tables, badges, alerts)
  - Design tokens (colors, spacing, radii, shadows, typography)
  - User flows for each slice (Expenses CSV, ToDo, Quote)
- Link the Figma file in README and the capstone PR.

## Development Workflow & Quality Gates
1. Create/assign a GitHub Issue (GH‑####) → branch from `development` using required naming.
2. Write tests first; ensure they fail.
3. Implement minimal code to pass tests; refactor with tests green.
4. Run `npm test`, `npm run lint`, UI coverage (apps/ui), Playwright @smoke + a11y; meet thresholds.
5. Open PR to `development` with Conventional Commit title and body sections (What changed, How tested, Coverage table, Linked issues, Artifacts).
6. Merge via PR after all gates pass; Project automation updates status.

## Review Artifacts & Publishing
- Coverage HTML (CLI + UI) MUST be exported to `review-artifacts/` and indexed.
- Capstone PRs MUST attach a Coverage Table and link to the latest Release Review Packet and Pages/preview.

## Governance
- This constitution supersedes conflicting guidance in other docs.
- Compliance: Reviewers MUST verify PRs meet principles and quality gates.
- Amendments: Propose changes via PR editing this file with rationale and impact.
- Versioning: Semantic versioning for the constitution.

**Version**: 1.3.0 | **Ratified**: 2025‑11‑02 | **Last Amended**: 2025‑11‑03

