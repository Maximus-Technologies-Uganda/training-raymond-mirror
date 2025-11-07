## Week 3 Review Packet — UI + Reviewability

**Branch:** `development` (merged from `001-update-specify-md`)
**Release:** [v0.3.0 — Week 3: UI + Reviewability](https://github.com/Maximus-Technologies-Uganda/training-raymond/releases/tag/v0.3.0-week3)
**GitHub Pages:** [Coverage & demo](https://maximus-technologies-uganda.github.io/training-raymond/review-artifacts/index.html)
**Capstone PR:** [#144](https://github.com/Maximus-Technologies-Uganda/training-raymond/pull/144) (merged)

---

### What Changed
- Delivered responsive React UIs for Expenses, ToDo, and Quote with parity to existing CLI rules.
- Added deterministic validation paths (seeded RNG, injected clock) and mirrored inline error behaviour.
- Updated review artifacts: coverage exports, Playwright smoke, README “How to review me”, and coverage index refresh.

### How I Tested
- `npm run test:coverage` — CLI Vitest suite with v8 coverage thresholds enforced.
- `npm --prefix apps/ui run test:coverage` — UI Vitest + React Testing Library coverage export.
- `npm --prefix apps/ui run test:e2e -- --project=chromium --grep @smoke` — Playwright happy-path smokes (31/31 passing after tablist + focus adjustments).

### Coverage Table (Statements / Branches / Functions / Lines)

| Tool | Statements % | Branches % | Functions % | Lines % |
| --- | ---: | ---: | ---: | ---: |
| Expenses (CLI) | 86.11 | 73.68 | 90.91 | 86.11 |
| ToDo (CLI) | 72.43 | 59.76 | 75.86 | 72.43 |
| Quote (CLI) | 82.41 | 68.75 | 92.00 | 82.41 |
| Stopwatch (CLI) | 69.39 | 63.79 | 75.86 | 69.39 |
| Temperature (CLI) | 81.19 | 60.87 | 80.00 | 81.19 |
| Expenses (UI) | 89.09 | 88.42 | 92.59 | 89.09 |
| ToDo (UI) | 93.28 | 90.48 | 82.86 | 93.28 |
| Quote (UI) | 92.95 | 87.80 | 93.33 | 92.95 |

**Totals:** CLI statements 63.71% • UI statements 88.39% (above Constitutional gates)

### Artifact Index
- Review Packet Coverage Index: `review-artifacts/index.html`
- CLI Coverage HTML: `coverage/index.html`
- UI Coverage HTML: `review-artifacts/ui/unit/index.html`
- Playwright Smoke Report: `apps/ui/playwright/report/index.html`
- README “How to review me” box updated with Release + Pages links.

### Screenshots & Attachments
- Branch protection rules (updated screenshot attached in PR)
- Issue → branch → PR linking proof
- Pages deployment confirmation
- Release asset listing

### Risks & Follow-ups
- Monitor GitHub Pages publish latency; confirm link resolves post-release.
- Ensure automation uploads the Week 3 Review Packet ZIP on every CI run.
- Track UI accessibility audits in Week 4 (contrast and keyboard traps backlog).
- Monitor Playwright smoke stability after tablist/focus refinements; rerun when navigation or form flows change.

---

> Prepared for the Week 3 capstone PR. Update the metadata block above once Release, Pages, and PR links are live.

