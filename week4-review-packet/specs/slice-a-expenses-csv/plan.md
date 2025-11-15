# Slice A — Implementation Plan (Expenses: CSV Import + Totals)

Status: Draft (Day 1)  
Owner: Raymond

## UI Flow
1. User lands on Expenses page.
2. User uploads a CSV (5–200 rows).
3. App parses and validates schema; malformed rows collected with line numbers and reasons.
4. If errors exist, show inline “Data quality notices” and allow continuing with valid rows.
5. User selects Month and Category via selectors.
6. Totals card updates immediately (overall + filtered), with 2dp rounding policy documented in help text.
7. Table lists filtered entries; empty state message shown when no matches.

## State Shapes
```ts
type CsvIssue = { index: number; message: string };

interface CsvUploadState {
  file: File | null;
  records: Array<{
    id: string;
    date: string;          // ISO date (YYYY-MM-DD)
    category: string;      // may contain non-ASCII
    amount: number;
    currency?: string;     // default inferred or provided
  }>;
  issues: CsvIssue[];      // schema/parse validations with row index
  loading: boolean;
}

interface ExpenseFilters {
  month: string | null;    // normalized month key, e.g. '2025-02'
  category: string | null;
}
```

## Rounding & Formatting
- Display amounts with deterministic rounding to exactly 2 decimal places.
- Currency formatting mirrors CLI `formatExpenseReport()` logic; prefer shared util if feasible.

## Accessibility Notes
- File input is associated with a visible `<label>`.
- Filters have labels and `aria-label` descriptions.
- Table headers use `<th scope="col">` and empty states use `role="alert"`.
- Issues list uses `role="status"` and is keyboard navigable.
- Focus is returned to the file button after successful upload.

## Test Plan
### Unit (Vitest + RTL)
- CSV parsing:
  - valid sample (5–200 rows within bounds)
  - rejects <5 or >200 with clear error
  - schema: missing/extra columns, wrong types
- Filters:
  - table-driven by month and category
  - non‑ASCII category names pass through
- Totals:
  - rounding to 2dp
  - aggregate correctness with mixed rows

### E2E (Playwright, tag `@smoke`)
- Upload valid CSV → select month/category → totals match fixture.
- Display of inline issues for malformed CSV lines.
- Empty dataset UX when filters exclude all rows.

### Accessibility (axe smoke)
- No critical violations on Expenses page after upload, filter change, and empty state.

## Risks & Mitigations
- CSV variability: constrain to a documented schema and surface errors with row numbers.
- Large files: upper bound at 200 rows; show error and abort parse for performance.
- Currency variability: treat as display-only; no conversion in Slice A.

## Traceability
- CLI mirror: `src/cli/expenses.ts` (formatting/rules).
- UI: `apps/ui/src/pages/Expenses.tsx`, components under `apps/ui/src/components/expenses/`.


