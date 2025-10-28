## Maximus Technologies — Week 2 Workbook (Raymond)

**Cohort:** AIpowered Developer Learning
**Trainee:** Raymond
**Week:** 2

**Dates:** Monday 27 Oct 2025 → Friday 31 Oct 2025 (Africa/Kampala)
**Version:** v1.0
**Mentor:** Paul / Maximus Technologies Mentors

---

## How to Use This Workbook

This is your source of truth for Week 2 scope, acceptance bars, artifacts, and daily checklists.

**Work issue first:** create/claim a Linear issue → branch → PR → Review Packet.

Submit one capstone PR by Friday EOD that aggregates the week’s work and links to your generated Review Packet.

---

## Week2 Theme

**Scale from “works” to “provably correct”.** You will add three new CLIs, harden two from Week1, wire Linear⇄GitHub, and produce trustworthy evidence (coverage + Review Packet) to pass the gate.

---

## Week2 Outcomes (What “Done” Means)

### Go/NoGo Gate — Must All Be True by Friday EOD (31 Oct 2025):

* Linear⇄GitHub integration in place with proof (screenshots + linked PRs) and branch naming feature/LIN-####-scope.
* Three new CLIs implemented with tests: **Quote, Expenses, ToDo**.
* Hardened Week1 CLIs: **Temperature** (case/identity/rounding) and **Stopwatch** (fake clock + negative paths).

**Coverage targets:**

* Quote ≥ 60% statements

* Expenses ≥ 50% statements

* ToDo ≥ 50% statements

* Stopwatch & Temperature: add tests to reach ≥ 50% statements each

* Branch protection enabled on development requiring green checks; proof screenshot in PR.

* Review Packet artifact published for the week:

  * `review-artifacts/index.html` (Coverage Index)
  * Per-CLI coverage HTML
  * `review.md` (what changed, how tested, risks, next steps)

* Capstone PR merged to development with: Review Packet link, Coverage Table, Linear issue links, and screenshots where noted.

---

## Daily Plan & Checklists

### Day1 — Mon 27 Oct

**Plumbing & Discipline**

**Goals:** Set up Linear workspace, connect to GitHub, enforce branch/PR discipline, and ready CI scaffolding.

**Tasks**

* Create/confirm Linear workspace (or team) for training week; ensure you have access.
* Create team (e.g., Training). Configure workflow states (Backlog → In Progress → In Review → Done). Some of these are already created and are detailed enough so you can confirm existence.
* Install Linear GitHub app (GitHub org level) and connect your repo; enable PR automation.
* Branch naming policy: `feature/LIN-####-short-scope`.
* Issue linking: include LIN-#### in PR title or body; verify Linear shows the PR & commits.
* Enable branch protection on development: require CI checks (build + tests + Review Packet generation).
* Add repo `.gitattributes` with `* text=auto` to normalize newlines.
* Seed a “Week2 Capstone” Linear epic (or parent issue); child issues per CLI and hygiene.
* Open a tiny plumbing PR proving checks pass; paste branch protection screenshot in PR.

**Evidence to capture**

* Screenshots: Linear⇄GitHub connection page; a PR autolinked in Linear; branch protection rules.

---

### Day2 — Tue 28 Oct

**Expenses & ToDo (Core + Tests)**

**Goals:** Build two CLIs with solid domain edges and measurable coverage.

**Expenses CLI**

* Commands/flags: `--month`, `--category`, input file (CSV/JSON) or inline sample.
* Validations: unknown month/category → nonzero exit + message; empty dataset handling.
* Output: totals by month/category; document rounding/formatting policy.
* Tests: table-driven authoring across months/categories; invalid month; malformed rows.

**ToDo CLI**

* Features: add, list, complete, `--dueToday` (local midnight boundary), priority semantics.
* Validations: duplicate ID/title guards; past-due behavior; empty list UX.
* Tests: boundary dates (yesterday/today/tomorrow); duplicate add; complete nonexistent → nonzero.

**Coverage**

* Expenses ≥ 50% statements; ToDo ≥ 50% statements.

---

### Day3 — Wed 29 Oct

**Stopwatch & Temperature Hardening**

**Stopwatch**

* Inject fake clock (clock provider) for deterministic tests.
* Negative paths: lap before start; double start; stop before start → nonzero exit.
* Optional: export simple run report (JSON) to enable golden tests later.

**Temperature**

* Accept lowercase units (`c`/`f`), normalize.
* Guard identical units (`--from == --to`) → nonzero exit + message.
* Rounding policy documented (e.g., 2dp) and asserted in tests (37C → 98.6F).

**Coverage**

* Stopwatch ≥ 50%; Temperature ≥ 50% statements.

---

### Day4 — Thu 30 Oct

**Quote CLI + Coverage Uplift**

**Quote CLI**

* Core: load quotes, filter by author or tag (case-insensitive), random pick when no filter.
* Validations: author/tag not found → nonzero exit + helpful message.
* Tests: filter by author/tag; empty dataset; deterministic seed for “random” path.

**Coverage**

* Quote ≥ 60% statements.

**Polish**

* Centralize flag parsing in `helpers/args.ts` and refactor CLIs to use it.
* Ensure README examples match real CLI output (copy from test snapshots).

---

### Day5 — Fri 31 Oct

**Capstone & Review Packet**

* Generate Coverage Index (`review-artifacts/index.html`) + per-CLI HTML reports.
* Write `review.md` (what changed, how tested, risks, next steps).
* Prepare Coverage Table (paste in PR):

```
CLI        | Statements % | Branches % | Functions % | Lines %
Expenses   |              |            |             |
ToDo       |              |            |             |
Stopwatch  |              |            |             |
Temperature|              |            |             |
Quote      |              |            |             |
```

* Capstone PR to development: title `feat(week-2): deliver CLIs + packet (LIN-####)`.
* PR body includes: Review Packet link, Coverage Table, screenshots (branch protection, Linear linking), and list of issues closed.
* Merge once checks are green.

---

## Technical Requirements & Patterns

### Linear ⇄ GitHub (Day1)

* Use the Linear GitHub app at org level; connect the training repo.
* Verify PRs autolink to the Linear issue when branch name contains `LIN-####` or PR body includes the issue reference.
* Use issue templates in Linear (Title: `CLI: Expenses – month/category` etc.) with clear acceptance criteria.

### CLI Architecture (All Days)

* Keep a pure core (library) and a thin CLI wrapper (arg parse + exit codes).
* Return nonzero on invalid flags/inputs; log a single, actionable error message.
* Time/date logic behind interfaces for easy stubbing in tests.

### Testing & Coverage

* Use table-driven tests for combinatorial inputs.
* Establish golden assertions (snapshot or string) only for stable, normalized output.
* Record coverage to `coverage/` and export HTML for the packet.

### CI & Branch Protection

* CI must run lint + tests + packet build on PRs to development.
* Enable branch protection requiring the CI job(s) to pass before merge.
* Upload Review Packet as a workflow artifact (and/or commit to a `review-artifacts/` path in the repo).

### PR Discipline

* Branch: `feature/LIN-####-short-scope`
* Title: `feat(scope): short description (LIN-####)`
* Body sections: What changed / How I tested (real CLI output blocks) / Artifacts (Coverage Index link) / Coverage Table / Screenshots (first time) / Linked issues.

---

## Deliverables (What to Submit)

* Screenshots proving Linear⇄GitHub sync and branch protection rules.
* Review Packet (link in PR):

  * `review-artifacts/index.html` (Coverage Index)
  * Per-CLI coverage HTML folders
  * `review.md` (summary)
* Capstone PR merged into development with all required content.

---

## Mentor Review Rubric (Pass/Revise)

### Discipline (Linear & PR hygiene)

* **Pass:** Branch & PR link correctly to Linear; screenshot evidence; branch protection enforced.
* **Revise:** Missing links/screenshots; adhoc branches; no protection.

### Correctness (CLIs)

* **Pass:** Required features + negative paths + helpful errors.
* **Revise:** Happy-path only; missing nonzero exits; vague errors.

### Tests & Coverage

* **Pass:** Targets met; tests readable & deterministic (fake clock, seeded RNG).
* **Revise:** Flaky tests; targets missed; untested edges.

### Artifacts

* **Pass:** Review Packet complete and linked in PR.
* **Revise:** Missing Coverage Index or `review.md`.

---

## Appendices

### A. Linear Setup Quick Steps (with Proofs)

* Open Linear → Workspace settings → Integrations → GitHub → Connect org + repo.
* Create team Training → Workflow states → Save.
* Create epic Week2 Capstone; add issues for each CLI & hygiene.
* Create branch from issue: `feature/LIN-1234-expenses-cli`.
* Open PR; confirm Linear shows PR/commits; take screenshot.
* Enable GitHub branch protection for development (require CI). Screenshot.

### B. CLI Exit Code Policy

* `0` success
* `1` invalid flags/inputs
* `2` runtime errors (I/O, parse)

Log exactly one actionable error line on failure.

### C. Coverage Commands (example)

```bash
# Run tests with coverage
pnpm test -- --coverage

# Open HTML report
xdg-open coverage/index.html || open coverage/index.html
```

### D. Review Packet Structure (example)

```
review-artifacts/
  index.html            # Coverage Index (links to per-CLI reports)
  expenses/coverage/...
  todo/coverage/...
  stopwatch/coverage/...
  temperature/coverage/...
  quote/coverage/...
review.md
```

### E. PR Body Template (copy/paste)

**What changed**

* Implemented <CLI/feature>

**How I tested**

* <commands + outputs>

**Artifacts**

* Coverage Index: <link>

**Coverage Table**

| CLI         | Stmts | Branches | Funcs | Lines |
| ----------- | ----: | -------: | ----: | ----: |
| Expenses    |       |          |       |       |
| ToDo        |       |          |       |       |
| Stopwatch   |       |          |       |       |
| Temperature |       |          |       |       |
| Quote       |       |          |       |       |

**Screenshots**

* Linear⇄GitHub link proof
* Branch protection rules

**Links**

* Linear issue(s): LIN-####

---

— End of Week2 Workbook (Raymond) —


