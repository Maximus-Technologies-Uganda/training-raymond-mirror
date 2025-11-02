<!--
Sync Impact Report

Version change: 1.0.0 -> 1.1.0
Modified principles:
  - Branching, Commits, and CI Gates → now references Linear keys (e.g., LIN-####)
Added principles:
  - Reviewability & Evidence
Added sections:
  - UI & E2E Testing Standards
  - Review Artifacts & Publishing
Templates requiring updates:
  - .specify/templates/plan-template.md  ✅ updated
  - .specify/templates/tasks-template.md ✅ updated
  - .specify/templates/spec-template.md  ✅ no changes
Follow-ups: none
-->

# training-raymond Constitution

## Core Principles

### Test-First Development (NON-NEGOTIABLE)
- All work MUST follow TDD. Write or extend tests before implementation and
  iterate Red → Green → Refactor.
- Tests MUST run with Vitest; minimum thresholds are 60% for statements,
  branches, functions, and lines (enforced in `vitest.config.js`).
- Core logic MUST be exportable and tested directly; prefer testing functions
  over end-to-end stdout snapshots.
- Every PR MUST keep tests passing and thresholds met.

Rationale: Tests define behavior, enable safe refactors, and act as executable
documentation.

### CLI as Contract (Text I/O, Deterministic)
- Every domain capability MUST be invokable as a CLI entry point.
- Use text I/O contracts: args/stdin → stdout for results, stderr for errors;
  exit codes communicate failure modes.
- No external CLI frameworks; parse `process.argv` manually for consistency and
  learning goals.
- Use ESM and the `import.meta.url` guard to prevent auto-execution on import.
- Prefer JSON output behind a flag when machine consumption is expected.

Rationale: Deterministic text contracts keep tools composable and testable.

### Small, Pure, Maintainable Modules (ESM + TS-friendly)
- Keep functions pure where possible; separate core logic from CLI glue.
- Follow repository style: 2-space indent, single quotes, semicolons; prefer
  small, named functions and early returns.
- Avoid deep nesting and hidden global state. The stopwatch uses an explicit
  class-based instance where state is required.
- TypeScript CLIs MUST compile/run via `node --loader ts-node/esm` when used.

Rationale: Simplicity improves readability, reuse, and testability.

### Branching, Commits, and CI Gates
- Work happens on feature branches: `feature/RAY-###-short-scope`; PRs target
  `development` only.
- Use Conventional Commits (`type: description (RAY-###)`).
- CI checks (lint + tests + coverage) MUST pass before merge; branches MUST be
  up-to-date.

Rationale: Traceability and automation keep quality high and releases safe.

### Reviewability & Evidence
- Each significant milestone MUST produce verifiable artifacts:
  - A GitHub Release containing a Review Packet ZIP (coverage HTML and key
    reports under `review-artifacts/`).
  - A public preview (GitHub Pages or equivalent) exposing a Coverage Index and
    demo links when UI is present.
- The main `README` MUST include a “How to review me” box with links to the
  Release/Pages and a short checklist.

Rationale: Reviewers verify outcomes quickly; artifacts prove quality.

### Security & Secrets Hygiene
- Never commit secrets. Use environment variables (e.g., `GITHUB_TOKEN`,
  `GH_TOKEN`) or locally ignored `.env` files.
- Agent folders MAY contain credentials and MUST be ignored: `.cursor/`,
  `.claude/`, `.codex/`.
- Binary tools placed in this repo for convenience (e.g., `uv.exe`, `uvx.exe`)
  MUST remain untracked (ignored in `.gitignore`).

Rationale: Prevent accidental credential leakage and keep the repo portable.

## Additional Constraints
- Runtime: Node.js 18+ with ES Modules (`"type": "module"`).
- Install with `npm install` (not `npm ci`) to accommodate repo constraints.
- Keep dependencies minimal; prioritize standard library and simple utilities.
- Lint via `npm run lint`; adhere to existing ESLint rules.

## UI & E2E Testing Standards
- UI stack: React (Vite or Next allowed) committed under `ui/` or `apps/ui/`.
- Unit tests MUST be deterministic (seeded RNG, injected clocks, no real time).
- UI code MUST reach ≥ 50% statements coverage per tool (measured via Vitest +
  RTL) and include at least one Playwright “happy path” smoke test per tool.
- Validation logic in UI MUST mirror CLI rules (inline errors for invalid
  inputs; clear empty-state UX).

## Development Workflow & Quality Gates
1. Create/assign Linear ticket → branch from `development` using required
   naming.
2. Write tests first; ensure they fail.
3. Implement minimal code to pass tests; refactor with tests green.
4. Run `npm test` and `npm run lint`; meet coverage thresholds.
5. Open PR to `development` with Conventional Commit title and body sections
   (What changed, How tested, Coverage, Related issues). Include links to the
   Release/Pages when applicable. CI MUST pass.
6. Merge via PR only when all gates are satisfied.

## Review Artifacts & Publishing
- Coverage HTML (CLI and UI) MUST be exported to `review-artifacts/` and
  indexed (e.g., `review-artifacts/index.html`).
- Capstone PRs MUST attach a Coverage Table in the PR body and link to the
  Review Packet Release and Pages/preview.

## Governance
- This constitution supersedes conflicting guidance in other docs.
- Compliance: Reviewers MUST verify PRs meet principles and quality gates.
- Amendments: Propose changes via PR modifying this file; include rationale,
  impact, and migration notes if applicable.
- Versioning: Semantic versioning of the constitution
  - MAJOR for breaking governance changes or removed principles
  - MINOR for added principles/sections or substantial expansions
  - PATCH for clarifications that don’t change intent

**Version**: 1.1.0 | **Ratified**: 2025-11-02 | **Last Amended**: 2025-11-02
