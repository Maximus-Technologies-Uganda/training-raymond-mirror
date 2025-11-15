# Slice A — Expenses: CSV Import + Totals View Polish

Status: Draft (Day 1 — Spec Kit)  
Owner: Raymond  
Related surfaces: CLI `src/cli/expenses.ts`, UI `apps/ui/src/pages/Expenses.tsx`

## Problem
Users need to upload a small CSV of expenses and quickly see month/category totals that match the CLI’s deterministic formatting. Invalid rows must be surfaced inline so users can correct data issues.

## Scope Boundaries
- CSV size: 5–200 rows
- Schema: `date,category,amount[,currency?]`
- Filters: Month, Category
- Totals: overall + by-month/category; currency formatting consistent with CLI
- UX: deterministic 2dp rounding policy documented in UI help
- Errors: malformed rows reported inline; empty dataset UX
- i18n: non‑ASCII category names supported

Out of scope:
- Large file streaming and pagination
- Multi-currency conversion
- Authentication or persistence

## Acceptance Rules
- [ ] CSV import (5–200 rows) with schema validation; malformed rows reported inline
- [ ] Month/category selectors; totals shown; rounding policy documented (2dp)
- [ ] Empty dataset UX; non‑ASCII category names supported
- [ ] Unit tests: table‑driven across months/categories + malformed rows
- [ ] Playwright smoke: upload sample CSV → select month/category → totals match fixture

## Reviewability & Evidence
- UI unit coverage for new/changed modules ≥ 50% (keep overall UI ≥ 80%).
- Playwright `@smoke` scenario for CSV happy path.
- a11y smoke (axe or equivalent) passes; labeled controls and table headers.
- Artifacts exported to `review-artifacts/` and linked from README.



