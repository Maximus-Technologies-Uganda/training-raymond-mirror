# Slice A — Tasks (Expenses: CSV Import + Totals)

Status: Completed (Day 1)

## Build
- [x] T001 Add CSV upload control with visible label and helper text on `Expenses` page.
- [x] T002 Implement CSV parser with schema validation, 5–200 row bounds, and row-level error collection.
- [x] T003 Integrate parsed records into the view; month/category filters operate on uploaded data; empty dataset UX.
- [x] T004 Totals summary uses deterministic 2dp rounding consistent with CLI; document rounding in UI help.

## Tests
- [x] T005 Unit tests (table‑driven): valid/invalid CSV, bounds errors, month/category filters, 2dp rounding, non‑ASCII categories.

## CI & Artifacts
- [x] T006 Playwright `@smoke` (upload → filter → totals) + axe a11y; export UI coverage and Playwright report to `review-artifacts/` (UI ≥ 50% changed modules) and update README review box.

## Documentation


