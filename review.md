# Week 2 Review Packet

## What Changed
- Implemented the Quote domain (`src/quote/core.ts`) with JSON/CSV parsing, author/tag filtering, seeded randomness, and formatting utilities.
- Added a dedicated Quote CLI (`src/cli/quote.ts`) with author/tag/seed/input flags, deterministic error handling, and file-loading abstractions.
- Centralized argument parsing helpers (`src/helpers/args.ts`) including string/number/date/month/enum validators and adopted them across existing CLIs.
- Updated existing CLIs (expenses, todo, stopwatch, temperature) to share the new helpers while preserving behaviour.
- Added comprehensive Quote unit tests and CLI tests plus refreshed existing expectations to reflect formatted outputs.
- Synced README examples with actual CLI outputs and created a reusable `data/quotes.json` sample file.
- Generated coverage reports for every CLI and aggregated links in `review-artifacts/index.html`.

## How It Was Tested
```bash
pnpm test
pnpm vitest run --coverage
```

## Risks
- The shared argument helpers are now a single dependency for all CLIs; future changes must maintain backwards-compatible validation messages.
- Deterministic random selection uses a basic LCG; if the quote dataset grows substantially we may revisit randomness quality.
- Real filesystem execution of the Quote CLI still depends on Node's `ts-node/esm` loader; tooling changes (e.g., using `tsx`) could simplify developer experience.

## Next Steps
- Capture CLI run outputs without relying on the experimental loader by introducing a compiled build or `tsx` runner.
- Expand Quote data fixtures and consider tagging taxonomy validation to prevent typos.
- Explore surfacing aggregate coverage metrics (e.g., Markdown badge) directly in the README.
