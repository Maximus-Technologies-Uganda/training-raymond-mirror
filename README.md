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
│   ├── hello/              # Hello CLI (greeting utility)
│   ├── stopwatch/          # Stopwatch CLI (timing utility)
│   └── temperature/        # Temperature Converter CLI
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

### 2. Stopwatch CLI
Tracks elapsed time with lap functionality.

**Usage:**
```bash
node src/stopwatch/index.js start
node src/stopwatch/index.js lap
node src/stopwatch/index.js stop
```

### 3. Temperature Converter CLI
Converts between Celsius and Fahrenheit.

**Usage:**
```bash
node src/temperature/index.js --from C --to F 32
node src/temperature/index.js --from F --to C 0
```

## Development Notes

- **Branch:** Features branch from `development`, open PRs for review
- **Tests:** Write tests before/alongside implementation (TDD)
- **Commits:** Small, focused commits with clear messages
- **CI:** All PRs must pass checks before merging

## Week 2 - Linear + GitHub Integration

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
node src/expenses/index.js --use-sample --month January
node src/expenses/index.js --use-sample --category Groceries
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