# Implementation Plan: Update specify.md + Week 3 delivery in 3 days (GitHub Projects)

**Branch**: `001-update-specify-md` | **Date**: 2025-11-03 | **Spec**: `C:\Users\RAYMOND\Desktop\Work Projects\training-raymond\specs\001-update-specify-md\spec.md`
**Input**: Feature specification and `README_Week3.md`

**Note**: This plan adapts Linear-specific workflow to GitHub Projects/Issues while preserving gates and reviewability outcomes.

## Summary

Deliver Week 3 outcomes in 3 days by: (Day 1) finalize SpecKit and scaffold UI + CI/Pages; (Day 2) implement Expenses UI with tests/coverage/smoke; (Day 3) implement ToDo + Quote UIs, raise reviewability (Release + Pages) and merge capstone PR. Use GitHub Projects and GitHub Issues in place of Linear with equivalent branch/commit linking (`feature/GH-####-scope`, Conventional Commits with `(GH-####)`).

## Technical Context

**Language/Version**: Node.js 18 (ES Modules)  
**Primary Dependencies**: React + Vite (UI), Vitest + React Testing Library (unit), Playwright (e2e smoke)  
**Storage**: N/A (in‑memory/demo datasets for UIs)  
**Testing**: Vitest (deterministic, injected clocks), Playwright smoke (one per tool)  
**Target Platform**: Node CLI + Web UI (GitHub Pages preview)  
**Project Type**: Web + CLI (UI under `apps/ui/`)  
**Performance Goals**: UI interactions feel instant (< 1s perceived)  
**Constraints**: CLI coverage ≥ 60% (statements/branches/functions/lines); UI coverage ≥ 50% statements per tool; no secrets committed  
**Scale/Scope**: 3 small tools (Expenses, ToDo, Quote) with parity UIs and tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Tests first (TDD) with Vitest; coverage ≥ 60% (statements/branches/functions/lines) for CLIs.
- CLI contract: text I/O (args/stdin → stdout; errors → stderr; exit codes set).
- ESM modules; `import.meta.url` guard; no external CLI frameworks.
- Core logic separated from CLI entry; functions are small, pure where possible.
- Branch discipline: `feature/GH-####-short-scope`, Conventional Commits `(GH-####)`.
- PRs target `development`; CI checks (lint + tests + coverage) must pass.
- Secrets are not committed; agent folders (`.cursor/`, `.claude/`, `.codex/`) ignored.
- If feature includes UI: React (Vite/Next allowed), UI unit coverage ≥ 50% per tool (Vitest + RTL), and one Playwright smoke test per tool.
- Capstone PRs include Review Packet Release + Pages links and a Coverage Table.

Status: Pass (adapted to GitHub Projects/Issues linking in place of Linear).

## Project Structure

### Documentation (this feature)

```text
specs/001-update-specify-md/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── contracts/           # Phase 1 output (/speckit.plan command)
```

### Source Code (repository root)

```text
apps/ui/
├── src/
│   ├── components/
│   ├── pages/
│   └── tests/
├── playwright/
└── vite.config.ts

src/cli/
├── expenses/
├── todo/
└── quote/

tests/
├── unit/
└── e2e/
```

**Structure Decision**: Use `apps/ui/` for the web app and keep CLIs under `src/cli/` with shared pure logic where feasible.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Linear → GitHub Projects mapping | Organization tool choice | Gates require linking; GitHub Issues linking satisfies intent |

---

## Phase 0: Outline & Research (same day)

Outputs at: `C:\Users\RAYMOND\Desktop\Work Projects\training-raymond\specs\001-update-specify-md\research.md`

- Resolve tooling selections (React + Vite, GitHub Pages) and mapping from Linear to GitHub Projects/Issues.
- Define coverage export shape and Review Packet contents.
- Decide deterministic testing patterns (seeded RNG, injected clocks).

## Phase 1: Design & Contracts (same day)

Outputs at: `C:\Users\RAYMOND\Desktop\Work Projects\training-raymond\specs\001-update-specify-md\data-model.md`, `contracts/`, `quickstart.md`

- Data model for Expenses, ToDo, Quote, and ReviewArtifacts.
- OpenAPI contracts for UI actions (summary, add/list/complete, quotes filter/random).
- Quickstart for GitHub Projects flow, branches/commits, CI, Pages, and Releases.

## Day-by-Day Execution Plan (3 days)

- Day 1: Finalize `/specify`, complete this `/plan`, scaffold `apps/ui/` (Vite React), install Vitest/RTL/Playwright, add CI jobs (lint + unit + coverage export, Playwright smoke), configure Pages, commit branch `feature/GH-####-scope`.
- Day 2: Implement Expenses UI + validation; add unit tests (table-driven) to ≥ 50% statements; add Playwright smoke; export coverage to `review-artifacts/`.
- Day 3: Implement ToDo + Quote UIs + tests + smoke; update README with "How to review me"; publish Release with Review Packet ZIP; open Capstone PR to `development` and merge with green checks.

## Constitution Re-check (post-design)

Pass with adaptation: GitHub Projects/Issues replace Linear while preserving traceability, branch discipline, commit tagging, and review artifacts.

Artifacts generated by this command:

- Plan: `C:\Users\RAYMOND\Desktop\Work Projects\training-raymond\specs\001-update-specify-md\plan.md`
- Research: `C:\Users\RAYMOND\Desktop\Work Projects\training-raymond\specs\001-update-specify-md\research.md`
- Data model: `C:\Users\RAYMOND\Desktop\Work Projects\training-raymond\specs\001-update-specify-md\data-model.md`
- Contracts: `C:\Users\RAYMOND\Desktop\Work Projects\training-raymond\specs\001-update-specify-md\contracts\openapi.yaml`
- Quickstart: `C:\Users\RAYMOND\Desktop\Work Projects\training-raymond\specs\001-update-specify-md\quickstart.md`


