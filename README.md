# training-raymond

A training project for Raymond implementing three command-line tools during Week 1 of the Foundations + CI Discipline track.

## Quick Start

### Installation
```bash
npm install
```

### Running CLIs
```bash
node src/hello/index.js --name Raymond --shout

# TypeScript CLIs – run with Node's ts-node loader
node --loader ts-node/esm src/cli/expenses.ts --sample --month Feb
node --loader ts-node/esm src/cli/todo.ts list
node --loader ts-node/esm src/cli/stopwatch.ts status
node --loader ts-node/esm src/cli/temperature.ts --from c --to f --value 37
node --loader ts-node/esm src/cli/quote.ts --input data/quotes.json --author "Maya Angelou"
```

### Testing
```bash
npm test          # Run tests once
npm run test:watch # Watch mode
```

### Linting
```bash
npm run lint
```

## Project Structure

```
├── src/
│   ├── cli/                # CLI entry points (expenses, todo, stopwatch, temperature, quote)
│   ├── expenses/           # Expenses domain core (parsing, filtering, summaries)
│   ├── hello/              # Hello CLI (greeting utility)
│   ├── helpers/            # Shared helpers (argument parsing & validation)
│   ├── quote/              # Quote domain core (parsing, selection)
│   ├── stopwatch/          # Stopwatch domain core (timing logic)
│   ├── temperature/        # Temperature conversion domain core
│   └── todo/               # Todo domain core
├── tests/                  # Test suite
├── docs/
│   ├── journals/          # Daily work journals
│   ├── workbooks/         # Workbook references
│   └── review-packet-week1.md
├── package.json
└── README.md
```

## Week 1 CLIs

### 1. Hello CLI
Greets users by name with optional shout mode.

**Usage:**
```bash
node src/hello/index.js                    # Greets "World"
node src/hello/index.js --name Raymond     # Greets Raymond
node src/hello/index.js --name John --shout # Shouts
```

### 2. Expenses CLI
Parses CSV/JSON inputs, filters by month/category, and prints summaries.

**Usage:**
```bash
node --loader ts-node/esm src/cli/expenses.ts --sample --month Feb
```

_Output:_

```
2025-02-01 – Groceries: $42.10
2025-02-07 – Utilities: $90.00

Summary:
  Total: $132.10
  Groceries: $42.10
  Utilities: $90.00
```

### 3. ToDo CLI
Manages todos with priorities, due dates, and completion tracking.

**Usage:**
```bash
node --loader ts-node/esm src/cli/todo.ts add --title "Pay bills" --priority high
```

_Output:_

```
Added todo 1: Pay bills
```

```bash
node --loader ts-node/esm src/cli/todo.ts list
```

_Output:_

```
No todos found.
```

### 4. Stopwatch CLI
Tracks elapsed time with injectable clocks and lap management.

**Usage:**
```bash
node --loader ts-node/esm src/cli/stopwatch.ts start
```

_Output:_

```
Stopwatch started.
```

```bash
node --loader ts-node/esm src/cli/stopwatch.ts lap --label Warmup
```

_Output:_

```
Lap #1: 0ms
```

### 5. Temperature Converter CLI
Converts between Celsius and Fahrenheit with normalized units and rounding.

**Usage:**
```bash
node --loader ts-node/esm src/cli/temperature.ts --from c --to f --value 37
```

_Output:_

```
37°C = 98.60°F
```

### 6. Quote CLI
Displays inspirational quotes with author and tag filters plus deterministic randomness via seeds.

**Usage:**
```bash
node --loader ts-node/esm src/cli/quote.ts --input data/quotes.json --author "Maya Angelou"
```

_Output:_

```
"Success is liking yourself, liking what you do, and liking how you do it." — Maya Angelou (tags: inspiration, success)
```

## Development Notes

- **Branch:** Features branch from `development`, open PRs for review
- **Tests:** Write tests before/alongside implementation (TDD)
- **Commits:** Small, focused commits with clear messages
- **CI:** All PRs must pass checks before merging

## Week 2 - Linear + GitHub Integration

See the Week 2 workbook: [docs/workbooks/Raymond_Week2_Workbook.md](docs/workbooks/Raymond_Week2_Workbook.md)

### Branch Naming & PR Discipline

All features must follow this naming convention to integrate with Linear:

**Branch Pattern:**
```
feature/RAY-###-short-scope
```

Where:
- `RAY-###` = Linear issue ID (e.g., RAY-1, RAY-3, RAY-5)
- `short-scope` = Brief description in kebab-case (e.g., `expenses-cli`, `integration-proof`)

**Example Branches:**
```bash
feature/RAY-1-integration-proof
feature/RAY-3-expenses-cli
feature/RAY-4-todo-cli
feature/RAY-6-temperature-hardening
```

**Commit Message Pattern:**
```
type: description (RAY-###)
```

Where `type` should align with the [Conventional Commits](https://www.conventionalcommits.org/) vocabulary so the automation can categorize work correctly:

- `feat` – New user-facing functionality
- `fix` – Bug fixes or regressions
- `docs` – Documentation-only updates
- `test` – Adding or improving automated tests
- `chore` – Repository maintenance (deps, scripts, config)
- `refactor` – Code changes that neither fix a bug nor add a feature

Examples:
```
feat: implement Expenses CLI with month/category filters (RAY-3)
test: add comprehensive Expenses unit tests (RAY-3)
docs: update README with CLI usage examples (RAY-3)
```

**PR Title & Body:**

Title:
```
feat(scope): short description (RAY-###)
```

Example:
```
feat(expenses): implement month/category filtering (RAY-3)
```

Body (use this template):
```
## What changed
- Implemented Expenses CLI core logic
- Added CSV/JSON parsing
- Created comprehensive unit tests

## How I tested
```bash
npx ts-node src/cli/expenses.ts --sample --month January
npx ts-node src/cli/expenses.ts --sample --category Groceries
```

## Coverage
- Statements: 52%
- Branches: 48%

## Related Issues
Closes RAY-3
```

### CI & Branch Protection

- All PRs to `development` must pass the `checks` workflow (lint + tests + coverage)
- Branch protection is enabled on `development`:
  - ✅ Require PR before merging
  - ✅ Require status checks to pass (checks workflow)
  - ✅ Require branches to be up to date before merging
- Direct pushes to `development` are blocked

### Why this matters

Properly linking Linear issues to branches, commits, and PRs gives the team live status visibility and reduces manual status updates. Conventional commit types feed release-notes tooling, while the `RAY-###` identifier keeps work traceable back to Linear. Combined with branch protection and CI enforcement, the integration keeps the roadmap accurate and ensures only reviewed, verified changes get merged.

### Step-by-step: linking Linear issues to your work

Follow this checklist each time you pick up a Linear ticket so the integration stitches everything together automatically:

1. **Assign yourself the Linear issue** and move it to “In Progress.” This lets Linear watch for matching Git activity.
2. **Create the Git branch from `development`** using the Linear key inside the branch name (for example, `feature/RAY-14-expenses-cli`). When the first push lands, Linear will detect and display the branch in the issue sidebar.
3. **Include the Linear key in every commit message** using the Conventional Commit pattern (`feat: add CSV parser (RAY-14)`). Linear links commits as soon as they appear on the remote branch.
4. **Reference the issue in your PR title and body.** Use the title pattern `feat(expenses): add filters (RAY-14)` and add a `Closes RAY-14` line in the body. When you open the PR, GitHub shows the Linear issue in the right-hand panel and marks it as “In Review.”
5. **Paste the PR URL back into Linear** if the automatic link hasn’t appeared yet. The issue will transition to “Review” and display the PR status directly on the ticket.
6. **Merge only after checks pass.** Once the PR is merged, Linear moves the issue to “Done” and attaches the merge commit so the roadmap stays up to date.

By repeating these steps, every branch, commit, and PR stays bi-directionally linked with its Linear issue—no manual spreadsheet updates required.

---

## Dependencies

- **vitest** - Testing framework
- **eslint** - Code linting (optional)

## Track Info

- **Track:** Foundations + CI Discipline
- **Mentor:** Paul Mwanje
- **Duration:** Week 1 (5 days)
- **Mirror:** This repo is mirrored to [training-raymond-mirror](https://github.com/Maximus-Technologies-Uganda/training-raymond-mirror)

## 👨‍🏫 For Mentors & Reviewers

### 📦 Download Review Package
Get a complete, self-contained package with all work and artifacts:

- **[Download Latest Release](https://github.com/Maximus-Technologies-Uganda/training-raymond/releases/latest)** - Ready-to-review ZIP package
- **[Review Packet](docs/review-packet-week1.md)** - Detailed assessment and rubric
- **[Public Mirror](https://github.com/Maximus-Technologies-Uganda/training-raymond-mirror)** - Live public repository

### Quick Review Process
1. Download the review package from releases
2. Extract and run installation script:
   ```bash
   # Linux/Mac
   ./install.sh
   
   # Windows
   install.bat
   ```
3. Verify all tests pass: `npm test`
4. Test the CLIs manually (see examples above)
5. Review the review packet for detailed assessment

### Package Contents
- ✅ Complete source code (3 CLIs)
- ✅ 14 unit tests (100% passing)
- ✅ Installation scripts for all platforms
- ✅ Documentation and daily journals
- ✅ ESLint configuration and results
- ✅ All configuration files

### Continuous Updates
The public mirror is automatically synchronized whenever changes are pushed to the `development` branch. No manual action needed!

---