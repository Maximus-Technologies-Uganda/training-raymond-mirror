# Training Raymond UI

Week 3 UI workspace for Expenses, ToDo, and Quote tools built with React + Vite.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development Scripts

```bash
# Lint TypeScript/TSX files
npm run lint

# Run unit tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage (≥50% threshold enforced)
npm run test:coverage

# Run Playwright e2e smoke tests
npm run test:e2e
```

## Project Structure

```
apps/ui/
├── src/
│   ├── main.tsx           # Application entry point
│   ├── App.tsx            # Root component
│   ├── setupTests.ts      # Vitest test setup
│   └── App.test.tsx       # Example unit test
├── playwright/
│   ├── tests/
│   │   └── smoke.spec.js  # E2E smoke tests (@smoke tag)
│   └── playwright.config.ts
├── coverage/              # Generated test coverage reports
├── dist/                  # Production build output
└── public/                # Static assets
```

## Testing Strategy

### Unit Tests (Vitest + React Testing Library)
- Located alongside source files (*.test.tsx)
- Use `@testing-library/react` for component testing
- Deterministic tests with injected clocks/seeds
- Coverage thresholds enforced: ≥50% statements/branches/functions/lines

### E2E Tests (Playwright)
- Smoke tests tagged with `@smoke`
- Run against production build (preview server)
- Chromium browser only in CI
- Located in `playwright/tests/`

## Coverage Requirements

All UI features must maintain:
- Statements: ≥50%
- Branches: ≥50%
- Functions: ≥50%
- Lines: ≥50%

Coverage reports are exported to `coverage/unit/index.html` and included in review artifacts.

## Tech Stack

- **Framework:** React 18 + Vite 5
- **Language:** TypeScript (strict mode)
- **Testing:** Vitest + React Testing Library
- **E2E:** Playwright
- **Linting:** ESLint + TypeScript ESLint
- **Styling:** CSS (to be expanded per feature requirements)

## CI/CD Integration

This workspace is integrated with GitHub Actions:
- **Lint + Unit Tests:** Runs on all PRs to `development`
- **Coverage Export:** Reports uploaded to `review-artifacts/ui/unit`
- **Playwright Smoke:** Runs on PRs with `@smoke` tag filter
- **GitHub Pages:** Builds deployed automatically on push to `development`

## Best Practices

1. **Test Determinism:** Use seeded RNG and injected clocks, never real Date/Math.random()
2. **Accessibility:** Label all controls, announce errors, keyboard navigation
3. **Validation:** Mirror CLI rules exactly; show inline errors
4. **Coverage:** Write tests before marking features complete
5. **Smoke Tests:** Tag happy-path e2e tests with `@smoke`

## Adding New Features

1. Create `/specify` → `/plan` → `/tasks` via SpecKit
2. Implement components with unit tests
3. Add Playwright smoke test with `@smoke` tag
4. Verify coverage meets ≥50% threshold
5. Export coverage to review artifacts
6. Link PR to Linear issue

## Troubleshooting

### Tests fail with "cannot find module"
```bash
# Clear cache and reinstall
rm -rf node_modules coverage dist
npm install
```

### Playwright fails to start
```bash
# Install browsers
npx playwright install chromium
```

### Coverage threshold not met
```bash
# Check detailed report
npm run test:coverage
open coverage/unit/index.html
```

## Related Documentation

- [Week 3 README](../../README_Week3.md) - Week scope and acceptance criteria
- [Tasks](../../specs/001-update-specify-md/tasks.md) - Implementation checklist
- [Vite Docs](https://vitejs.dev/) - Build tool documentation
- [Vitest Docs](https://vitest.dev/) - Testing framework
- [Playwright Docs](https://playwright.dev/) - E2E testing
