# Maximus Technologies — Week 3 README (Raymond)

**Cohort:** AI‑powered Developer Learning • **Trainee:** Raymond • **Week:** 3  
**Dates:** Monday **3 Nov 2025** → Friday **7 Nov 2025** (Africa/Kampala)  
**Version:** v1.0 • **Mentor:** Paul / Maximus Technologies Mentors

---

## Purpose

This README is the single source of truth for **Week 3** scope, acceptance bars, artifacts, and daily checklists. It also contains a reviewer guide so mentors can verify outcomes quickly.

> **Workflow mantra:** _Issue-first._ Create/claim a Linear issue → branch → PR → **Review Packet**. Ship **one capstone PR by Friday EOD** that aggregates the week’s work and links to the generated Review Packet.

---

## Week 3 Theme — UI, SpecKit & Reviewability

Build **reviewable UIs** for your existing CLIs. Drive the work via **SpecKit** (`/specify → /plan → /tasks`) and raise your **evidence bar** (coverage, e2e smoke, Releases, Pages) so reviewers can verify everything fast.

> ### How to review me (Week 3 placeholder)
> - **Release (Packet):** _TBD — link will point to the Week 3 Review Packet once generated._
> - **GitHub Pages:** _TBD — GitHub Pages deployment will surface the Coverage Index & UI demo._
> - **Capstone PR:** _TBD — Week 3 capstone PR will summarize coverage tables, screenshots, and links._
>
> _Replace the TBD items with live links as soon as Phase 3+ deliverables are available._

---

## Go/No‑Go Gate (All must be true by **Fri 7 Nov EOD**)

- **Week 2 finishers** complete and evidenced (see **Day 0** below).
- **UI for three tools** (Expenses, ToDo, Quote) built in a small React app (Vite or Next OK) with:
  - Deterministic **unit tests** (Vitest + RTL) and **UI statements coverage ≥ 50% per tool**.
  - **Playwright** smoke: one happy‑path e2e per tool.
  - **Input validation** mirrors CLI rules (non‑zero/inline error equivalents).
- **SpecKit discipline**: `/specify` (problem + rules), `/plan` (design + test plan), `/tasks` (implementation steps) added/updated for each tool.
- **Reviewability uplift** complete:
  - **GitHub Release** with the **Review Packet** ZIP (coverage HTML + `review.md` + e2e report).
  - **GitHub Pages** (or Cloud Run preview) exposing **Coverage Index** and **UI demo link(s)**.
  - **README** contains a **“How to review me”** box that points to Releases/Pages and lists Week 3 artifacts.
- **Linear discipline**: issues link to PRs; branches follow `feature/LIN-####-scope`; PR screenshots prove the linking.
- **Branch protection** on `development` still enforced; **green checks required**.
- **Capstone PR** merged to `development` including: Review Packet link, **Coverage Table (CLI + UI)**, Pages/preview links, Linear screenshots.

---

## Day 0 — Mon 3 Nov (Close Week 2 gaps)

**Goal:** Close Week 2 reviewability gaps before touching Week 3 features.

### Tasks
- Publish a **Release** containing Week 2 **Review Packet** (`review-artifacts/` ZIP).
- Update **README** with a **“How to review me”** box (Release link → Coverage Index + list of Week 2 CLIs).
- Capstone PR evidence: paste **branch‑protection screenshot**, **Linear autolink proof**, **Coverage table**, and **Packet link**.

### Evidence to capture
- Screenshot of the Release showing the Packet asset.
- README diff snippet with the new review box.
- PR body screenshots (branch protection, Linear link) + Coverage table rendered.

---

## Daily Plan & Checklists

### **Day 1 — Mon 3 Nov: SpecKit & UI Foundations**

**Goals:** Lock the plan before code; scaffold the UI project; wire CI for tests/Pages.

**Tasks**
- **SpecKit**: create/update `/specify`, `/plan`, `/tasks` for **Expenses UI**, **ToDo UI**, **Quote UI**. Each `/plan` must include an explicit **test plan (unit + e2e)** and **accessibility** notes.
- **Scaffold UI app** (Vite React or Next). Commit to `apps/ui/` (or `ui/`) with baseline routes/components.
- **Testing harness**: Vitest + React Testing Library; Playwright installed with **one blank smoke test**.
- **CI jobs**:
  1. Lint + unit tests + coverage export to `review-artifacts/`.
  2. **Playwright smoke** on PRs to `development`.
- **Pages/Preview**: Configure **GitHub Pages** (or Cloud Run) to publish **Coverage Index** and a **UI demo** (passwordless or demo creds).

**Proof**
- Screenshots: Pages settings/URL; CI green checks; SpecKit diffs.

---

### **Day 2 — Tue 4 Nov: Expenses UI (+ tests)**

**Goals:** Ship a minimal, testable **Expenses UI** mirroring **CLI rules**.

**Tasks**
- **UI**: month + category selectors; totals by month/category; decimal/format policy aligns with CLI.
- **Validation**: unknown month/category → **inline error**; **empty dataset UX**.
- **Unit tests (Vitest/RTL)**: table‑driven cases across months/categories; malformed rows.
- **Coverage target**: **≥ 50% statements** for Expenses UI.
- **Playwright smoke**: select month/category → totals render.

**Proof**
- Coverage HTML for Expenses UI; Playwright artifact; screenshots.

---

### **Day 3 — Wed 5 Nov: ToDo UI (+ tests)**

**Goals:** Mirror CLI semantics with **deterministic date boundaries**.

**Tasks**
- **UI**: add/list/complete; **dueToday** (local midnight boundary); **priorities**.
- **Validation**: duplicate guards; complete nonexistent item → error; **empty state UX**.
- **Unit tests**: yesterday/today/tomorrow boundaries; duplicate add; bad complete.
- **Coverage target**: **≥ 50% statements** for ToDo UI.
- **Playwright smoke**: add → list → complete → assert render.

**Proof**
- Coverage HTML for ToDo UI; e2e artifact; screenshots.

---

### **Day 4 — Thu 6 Nov: Quote UI (+ tests) & Reviewability**

**Goals:** Finish the third UI and raise reviewability.

**Tasks**
- **UI**: filter by **author/tag** (case‑insensitive); **random pick when no filter**; empty dataset UX.
- **Validation**: author/tag not found → inline message.
- **Unit tests**: author/tag filters; empty dataset; **seeded RNG** for determinism.
- **Coverage target**: **≥ 50% statements** for Quote UI.
- **Playwright smoke**: apply filter → result consistent with seeded data.
- **README refresh**: add Week 3 **“How to review me”** with Pages/preview links and Release link to the Packet.

**Proof**
- Coverage HTML for Quote UI; e2e artifact; README diff.

---

### **Day 5 — Fri 7 Nov: Capstone & Review Packet**

- Export **Coverage Index** (CLI + UI) to `review-artifacts/index.html`; ensure per‑tool HTML present.
- Update **`review.md`** with this week’s changes, **test coverage summary**, **risks**, **next steps**.
- Prepare **Coverage Table** (paste in PR):

| Tool | Statements % | Branches % | Functions % | Lines % |
|---|---:|---:|---:|---:|
| Expenses (CLI) |  |  |  |  |
| ToDo (CLI) |  |  |  |  |
| Stopwatch (CLI) |  |  |  |  |
| Temperature (CLI) |  |  |  |  |
| Quote (CLI) |  |  |  |  |
| Expenses (UI) |  |  |  |  |
| ToDo (UI) |  |  |  |  |
| Quote (UI) |  |  |  |  |

- **GitHub Release**: attach the new **Week 3 Review Packet** ZIP (Coverage HTML, Playwright report, `review.md`).
- **Capstone PR** to `development`: title `feat(week3): UI + SpecKit + reviewability (LIN####)`; body includes **Packet/Pages links**, **Coverage Table**, **Linear screenshots**.  
- Merge when **checks are green**.

---

## Technical Requirements & Patterns

### SpecKit discipline
- **`/specify`**: problem statement, scope, user stories, **acceptance rules**.
- **`/plan`**: UI flows, state shape, **test plan (unit + e2e)**, accessibility notes, risks.
- **`/tasks`**: granular steps; each task links to PRs/commits.

### UI architecture
- **Pure core logic** shared between CLI/UI where practical.
- **Thin view components**; container components own data/IO.
- **Determinism**: inject clocks/seeds; mock network/IO.
- **Accessibility**: label controls, announce errors, keyboard focus order.

### Testing
- **Unit**: Vitest + RTL; table‑driven tests; **no real time/date — use injected clock**.
- **e2e smoke**: Playwright with deterministic fixtures; one happy path per tool.
- **Coverage**: collect **separate coverage for CLI and UI**; export HTML to `review-artifacts/` with an index.

### CI & Reviewability
- **Branch protection**: require lint, unit tests, e2e smoke, and **packet‑build** before merge.
- **Releases**: every capstone PR publishes a **Packet ZIP**.
- **Pages/Preview**: Coverage Index + demo links surfaced in README’s **How to review me**.

### PR Discipline
- **Branch**: `feature/LIN-####-short-scope`  
- **Title**: `feat(scope): short description (LIN-####)`  
- **Body**: _What changed_ / _How I tested_ (real outputs) / _Artifacts_ (Release & Pages links) / **Coverage Table** / **Screenshots** (Linear + branch protection) / **Linked issues**.

---

## Deliverables (What to Submit)

- **Screenshots**: Release asset, Pages URL, Linear link proof, branch‑protection rules.
- **Review Packet**: Coverage HTML (CLI + UI), Playwright report, `review.md` (summary).
- **Capstone PR merged** into `development` with Coverage Table and artifact links.

---

## Mentor Review Rubric (Pass/Revise)

**Discipline (SpecKit, Linear, PR hygiene)**  
- **Pass**: Issues → branches → PRs; Screenshots in PR; SpecKit updated for each tool.  
- **Revise**: Missing links/screens; ad‑hoc branches; stale specs.

**Correctness (UI parity with CLI)**  
- **Pass**: UI mirrors CLI rules; helpful inline errors; seeded/clocked determinism.  
- **Revise**: Happy‑path only; mismatched validation; flaky behavior.

**Tests & Coverage**  
- **Pass**: Targets met (UI ≥ 50%); deterministic unit + e2e smoke; readable tests.  
- **Revise**: Targets missed; lack of smoke; brittle tests.

**Artifacts & Reviewability**  
- **Pass**: Release with Packet; Pages/preview; README review box current.  
- **Revise**: Missing Release/Pages; hard‑to‑find artifacts.

---

## “How to review this project (Week 3)” (Copy/Paste Box)

> ### How to review this project (Week 3)
> - **Release (Packet):** Download the **Review Packet ZIP** from the latest Release → open `review-artifacts/index.html`.
> - **Live demo:** Visit **GitHub Pages** (link below) for the UI demo.
> - **What changed:** See the **Week 3 Capstone PR** body for coverage, screenshots, and links.

Add this box near the top of your repo README and keep links fresh each day.

---

## Appendices

### A. Playwright smoke (sample spec)
```ts
import { test, expect } from '@playwright/test';

test('expenses happy path', async ({ page }) => {
  await page.goto(process.env.UI_BASE_URL!);
  await page.getByLabel('Month').selectOption('March');
  await page.getByLabel('Category').selectOption('Utilities');
  await expect(page.getByTestId('total')).toHaveText('$120.50');
});
```

### B. Coverage commands
```bash
# Unit tests with coverage (CLI + UI)
pnpm test -- --coverage

# Playwright smoke (CI)
pnpm exec playwright test --project=chromium --grep @smoke

# Open coverage locally
xdg-open coverage/index.html || open coverage/index.html
```

### C. PR body template (copy/paste)
**What changed**  
- Implemented Week 3 UIs + SpecKit + reviewability uplift

**How I tested**  
- Unit + Playwright smoke; links below

**Artifacts**  
- Release (Packet): <link>  
- Pages (Coverage Index & demo): <link>

**Coverage Table (CLI + UI)**  
| Tool | Stmts | Branches | Funcs | Lines |
| --- | ---:| ---:| ---:| ---:|
| Expenses (CLI) |  |  |  |  |
| ToDo (CLI) |  |  |  |  |
| Stopwatch (CLI) |  |  |  |  |
| Temperature (CLI) |  |  |  |  |
| Quote (CLI) |  |  |  |  |
| Expenses (UI) |  |  |  |  |
| ToDo (UI) |  |  |  |  |
| Quote (UI) |  |  |  |  |

**Screenshots**  
- Branch protection rules  
- Linear autolink proof

**Links**  
- Linear issue(s): LIN####

---

> _End of Week 3 README (Raymond)_
