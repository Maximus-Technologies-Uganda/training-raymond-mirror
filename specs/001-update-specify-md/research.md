# Research: Week 3 delivery (GitHub Projects)

**Created**: 2025-11-03

## Decisions

1. UI Framework: Vite + React
- Rationale: Fastest DX for a small multi-tool UI; zero SSR needs; simple GitHub Pages deploy.
- Alternatives: Next.js (heavier, SSR not needed), CRA (deprecated tooling).

2. Hosting/Preview: GitHub Pages
- Rationale: Built-in; easy to wire from CI; satisfies public preview requirement.
- Alternatives: Cloud Run/Netlify/Vercel (extra accounts/config).

3. Issue Tracking: GitHub Projects + Issues (replace Linear)
- Rationale: Matches user tools; supports issue→branch→PR linking, automation, and screenshots for evidence.
- Alternatives: Linear (not used for this repo); Trello (weaker PR linking).

4. Branch/Commit Convention
- Rationale: Preserve traceability: `feature/GH-####-short-scope`; Conventional Commits with trailing `(GH-####)`.
- Alternatives: Keep Linear keys (inapplicable).

5. Coverage & Artifacts
- Rationale: Export HTML coverage for CLI and UI to `review-artifacts/`; build an index for quick reviewer access; package in Release ZIP.
- Alternatives: Text-only reports (harder for reviewers).

6. Deterministic Testing
- Rationale: Inject clocks and use seeded RNG for UI where applicable; avoid real time.
- Alternatives: Real time → flakiness.

## Clarifications Resolved
- Using GitHub Projects/Issues is a policy adaptation, not a gate violation. All linking/traceability and commit/branch discipline remain enforced with `GH-####`.
- Pages is acceptable as a “public preview” equivalent per Constitution.

## Open Risks
- Pages publish latency: mitigate by running only on `development` and for tagged releases.
- Time constraints: keep UI scope minimal (happy paths + required validations only).


