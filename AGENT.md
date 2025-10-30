# AGENT.md

This file gives AI coding agents the essential context to work effectively in this repository.

## Project Overview

Training project for Raymond implementing three Node.js CLIs (ES Modules) with Vitest tests and basic CI discipline. The CLIs are:
- Hello (greeting utility)
- Stopwatch (timing with laps)
- Temperature Converter (C/F)

## Essential Commands

```bash
npm install            # Install dependencies (use this, not `npm ci`)
npm run dev            # Run hello CLI with hot reload
npm start              # Run hello CLI once
npm test               # Run tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
npm run lint           # Lint src and tests directories
```

## Running CLIs

```bash
# Hello CLI
node src/hello/index.js --name <name> --shout

# Stopwatch CLI
node src/stopwatch/index.js start|lap|stop

# Temperature Converter CLI
node src/temperature/index.js --from C|F --to C|F <value>
```

## Project Structure

```
src/
├── hello/              # Hello CLI (formatGreeting, argv parsing)
├── stopwatch/          # Stopwatch class: start/lap/stop
└── temperature/        # convertTemperature(), convertCtoF(), convertFtoC()

tests/                  # Vitest test suite (\*.test.js)
docs/                   # Journals, workbooks, review packet
```

## Architecture & Patterns

- ES Modules: `"type": "module"` in `package.json`.
- CLI pattern per tool:
  1. Export pure/testable functions
  2. Define `main()` for CLI execution
  3. Use `import.meta.url` guard to prevent auto-execution on import
  4. Manual `process.argv` parsing (no external CLI libs)
- Stateful component: Stopwatch uses a class-based singleton to maintain timing state.

## Testing

- Framework: Vitest (`@vitest/coverage-v8`)
- Commands: see Essential Commands
- Coverage thresholds (enforced in `vitest.config.js`): 60% for statements/branches/functions/lines
- Tests import and verify exported functions (prefer unit logic over end-to-end CLI stdout)

## Code Style

- Linting: ESLint via `npm run lint`
- Conventions:
  - 2-space indentation, single quotes, required semicolons
  - Prefer small, focused functions with clear names
  - Avoid deep nesting; use early returns

## Branching, Commits, and PRs

- Branch naming (Linear integration): `feature/RAY-###-short-scope` (e.g., `feature/RAY-3-expenses-cli`)
- Conventional Commits for messages: `type: description (RAY-###)`
  - feat | fix | docs | test | chore | refactor
- PR title format: `feat(scope): short description (RAY-###)`
- PR body should include: What changed, How tested (commands), Coverage, Related issues

## CI & Protections

- PRs must pass lint, tests, and coverage checks before merging to `development`
- Branch protection requires PRs and up-to-date branches
- The repo mirrors to a public mirror on changes to `development`

## Notes for Agents

- Prefer `npm install` over `npm ci` for this repo.
- When adding features, include/extend tests in `tests/` and keep CLIs’ core logic pure and exportable.
- Follow the existing CLI structure and update documentation where relevant (`README.md`, `docs/`).

---

For more detailed guidance tailored to a specific assistant, see `CLAUDE.md`.




