# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a training project for the Foundations + CI Discipline track, focusing on building CLI tools with TDD methodology, Linear integration, and CI/CD practices. The repository demonstrates proper branch management, commit conventions, and automated workflows.

## Essential Commands

### Development
```bash
npm install           # Install dependencies (use this, not npm ci)
npm run dev          # Run hello CLI with hot reload
npm test             # Run all tests once
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run lint         # Lint src and tests directories
```

### Running CLIs
```bash
# Hello CLI
node src/hello/index.js --name <name> --shout

# Stopwatch CLI
node src/stopwatch/index.js start|lap|stop

# Temperature Converter CLI
node src/temperature/index.js --from C|F --to C|F <value>
```

## Architecture

### Module Structure
- **ES Modules**: Project uses `"type": "module"` in package.json
- **CLI Pattern**: Each CLI exports testable functions and includes a `main()` function that only runs when executed directly using `import.meta.url` check
- **Stateful vs Stateless**: Stopwatch uses a class-based singleton pattern to maintain state across commands; Hello and Temperature are stateless functions

### Code Organization
```
src/
├── hello/index.js        # Argument parsing, formatGreeting()
├── stopwatch/index.js    # Stopwatch class with start/lap/stop
└── temperature/index.js  # convertTemperature(), convertCtoF(), convertFtoC()
```

Each CLI follows this pattern:
1. Export core functions for testing
2. Define `main()` for CLI execution
3. Use `import.meta.url` guard to prevent auto-execution during imports
4. Parse `process.argv` manually (no external CLI libraries)

### Testing Strategy
- **Framework**: Vitest with v8 coverage provider
- **Coverage Thresholds**: 60% minimum for statements/branches/functions/lines (enforced in CI)
- **Test Location**: `tests/` directory with `*.test.js` files
- Tests import and verify exported functions, not CLI output

## Branch & Commit Discipline

### Branch Naming (Required for Linear Integration)
```
feature/RAY-###-short-scope
```
Example: `feature/RAY-3-expenses-cli`

### Commit Messages (Conventional Commits)
```
type: description (RAY-###)
```

Types:
- `feat` - New functionality
- `fix` - Bug fixes
- `docs` - Documentation
- `test` - Tests
- `chore` - Maintenance (deps, config)
- `refactor` - Code restructuring

### PR Title Format
```
feat(scope): short description (RAY-###)
```

### PR Body Template
```markdown
## What changed
- Bullet points of changes

## How I tested
```bash
# Test commands
```

## Coverage
- Statements: X%
- Branches: X%

## Related Issues
Closes RAY-###
```

## CI/CD Workflows

### Branch Protection (development branch)
- PRs required before merging
- `checks` workflow must pass (lint + test + coverage)
- Branches must be up to date

### Active Workflows
1. **checks.yml** - Runs on PRs to development (lint + test)
2. **mirror-push.yml** - Syncs to public mirror repo
3. **release-artifacts.yml** - Creates review packages

## Code Style

### ESLint Configuration
- 2-space indentation
- Single quotes
- Semicolons required
- Unused vars as warnings
- ES2021 + Node environment

### Important Notes
- Use `npm install` (not `npm ci`) - documented workaround for sync issues
- The repository is mirrored to `training-raymond-mirror` for public visibility
- Development happens on `development` branch, not `main`
- All PRs must link to Linear issues using `RAY-###` format
