# Week 4 — Spec-Driven Product Slices + Figma Integration

**Cohort**: AI Powered Developer Learning
**Trainee**: Raymond
**Week**: 4 (Nov 10-14, 2025)
**Theme**: Spec-driven development, Figma integration, and production deployment

---

## 📐 Design System

**Figma Design System**: [Week 4 UI Designs](https://www.figma.com/make/vHyEbwViJEEhxDf9wfqZd1/Week-4-training-Raymond?node-id=0-1&p=f&t=Uo8MjuZ0VBPzPjcS-0)

This week follows a design-first workflow with:
- **Design Tokens**: Complete color palette, spacing scale, typography, border radius, and shadows extracted from existing CSS
- **Component Inventory**: Documented UI components including buttons, inputs, badges, alerts, cards, tables, and navigation
- **User Flow Screens**: Annotated designs for all 3 product slices showing Week 4 feature enhancements

**Design Documentation**:
- [Figma Setup Guide](figma-setup-guide.md) - Step-by-step instructions for creating design files
- [Design Tokens Reference](design-tokens.md) - Complete token system (colors, spacing, typography, shadows)
- [Figma Checklist](figma-checklist.md) - Progress tracking for design work

---

## 🎯 Week 4 Product Slices

All three slices are **fully implemented and tested** with comprehensive coverage.

### Slice A — Expenses: CSV Import + Totals View Polish

**User Value**: Upload expense CSV files and view category/month totals with deterministic formatting.

**Implementation**: [specs/slice-a-expenses-csv/](../specs/slice-a-expenses-csv/)
- ✅ **Tasks**: [tasks.md](../specs/slice-a-expenses-csv/tasks.md) - Status: **Completed (Day 1)**
- ✅ CSV import with schema validation (5-200 rows, RFC 4180 compliance)
- ✅ Inline error messages for malformed rows
- ✅ Month/category filtering with dynamic selectors
- ✅ Deterministic 2-decimal rounding (consistent with CLI)
- ✅ Empty dataset UX with helpful messages
- ✅ Non-ASCII category support (e.g., Café, Groceries)

**Tests**:
- ✅ **Unit**: 466 lines (table-driven: valid/invalid CSV, bounds, filters, rounding, non-ASCII)
- ✅ **Playwright @smoke**: 8 tests (upload → filter → totals workflow)
- ✅ **Axe a11y**: Accessibility compliance verified

**Files**:
- UI: [apps/ui/src/pages/Expenses.tsx](../apps/ui/src/pages/Expenses.tsx)
- Parser: [apps/ui/src/lib/expenses/csv.ts](../apps/ui/src/lib/expenses/csv.ts)
- Tests: [apps/ui/src/tests/expenses.test.tsx](../apps/ui/src/tests/expenses.test.tsx)
- E2E: [apps/ui/playwright/tests/expenses.smoke.spec.ts](../apps/ui/playwright/tests/expenses.smoke.spec.ts)

---

### Slice B — ToDo: Due Today Filter + Priority Badges

**User Value**: Quickly identify today's tasks and prioritize work with visual badges.

**Implementation**: [specs/slice-b-todo-filter/](../specs/slice-b-todo-filter/)
- ✅ **Tasks**: [tasks.md](../specs/slice-b-todo-filter/tasks.md) - Status: **Completed (Day 1)**
- ✅ "Due Today" filter (local midnight boundary via clock adapter)
- ✅ Priority badges (HIGH/MED/LOW) with color-coding
- ✅ Default sort by priority descending
- ✅ Duplicate insert guard (case-insensitive title matching)
- ✅ Non-existent ID completion → inline error (no crash)
- ✅ Keyboard-navigable filter toggle

**Tests**:
- ✅ **Unit**: 250+ lines (date boundaries, priority sorting, duplicates, error paths)
- ✅ **Playwright @smoke**: 7 tests (add → filter today → complete workflow)
- ✅ **Axe a11y**: Keyboard navigation verified

**Files**:
- UI: [apps/ui/src/pages/ToDo.tsx](../apps/ui/src/pages/ToDo.tsx)
- Components: [apps/ui/src/components/todo/](../apps/ui/src/components/todo/)
- Tests: [apps/ui/src/tests/todo.test.tsx](../apps/ui/src/tests/todo.test.tsx)
- E2E: [apps/ui/playwright/tests/todo.smoke.spec.ts](../apps/ui/playwright/tests/todo.smoke.spec.ts)

---

### Slice C — Quote: Author/Tag Search + Random Pick (Seeded)

**User Value**: Find inspirational quotes by author or tag, or get a deterministic random quote.

**Implementation**: [specs/slice-c-quote-search/](../specs/slice-c-quote-search/)
- ✅ **Tasks**: [tasks.md](../specs/slice-c-quote-search/tasks.md) - Status: **Completed (Day 5)**
- ✅ Case-insensitive author search
- ✅ Case-insensitive tag filtering
- ✅ Deterministic seeded random selection (reproducible for E2E tests)
- ✅ URL state sync (author/tag/seed persisted in query params)
- ✅ Clear filters action with focus management
- ✅ Empty state + no-match messages

**Tests**:
- ✅ **Unit**: Comprehensive (filters, seeded random, empty states)
- ✅ **Playwright @smoke**: 6 tests (author search, tag filter, seeded random reproducibility)
- ✅ **Axe a11y**: ARIA attributes verified

**Files**:
- UI: [apps/ui/src/pages/Quote.tsx](../apps/ui/src/pages/Quote.tsx)
- Logic: [apps/ui/src/lib/quote/view.ts](../apps/ui/src/lib/quote/view.ts)
- Tests: [apps/ui/src/tests/quote.test.tsx](../apps/ui/src/tests/quote.test.tsx)
- E2E: [apps/ui/playwright/tests/quote.smoke.spec.ts](../apps/ui/playwright/tests/quote.smoke.spec.ts)

---

## 🧪 Testing Summary

### Unit Tests (Vitest + React Testing Library)
- **Expenses**: 466 lines (comprehensive table-driven tests)
- **ToDo**: 250+ lines (clock injection, boundaries, filters)
- **Quote**: Comprehensive (filters, seeded RNG, URL sync)

**Coverage Targets**:
- ✅ UI: ≥ 80% statements overall
- ✅ CLI: ≥ 60% statements aggregate
- ✅ Per-module: ≥ 50% for changed files

### End-to-End Tests (Playwright)
- **Total**: 26 E2E tests
  - 21 `@smoke` tests (critical path workflows)
  - 5 `@a11y` tests (axe accessibility compliance)

**Run Commands**:
```bash
cd apps/ui

# All smoke tests
npm run test:e2e -- --project=chromium --grep @smoke

# Accessibility tests
npm run test:e2e -- --project=chromium --grep @a11y

# Unit tests with coverage
npm run test:coverage
```

### Accessibility (a11y)
- ✅ **Axe-core integration**: [@axe-core/playwright](https://www.npmjs.com/package/@axe-core/playwright)
- ✅ **Tests**: [apps/ui/playwright/tests/a11y.smoke.spec.ts](../apps/ui/playwright/tests/a11y.smoke.spec.ts)
- ✅ **Coverage**: All 3 pages + interactive states
- ✅ **WCAG Compliance**: Labeled form controls, keyboard focus order, inline errors

---

## 📂 Week 4 Directory Structure

```
training-raymond/
├── docs/
│   ├── week4-README.md           # This file
│   ├── figma-setup-guide.md      # Complete Figma setup instructions
│   ├── design-tokens.md          # Design token reference
│   ├── figma-checklist.md        # Progress tracking checklist
│   └── journals/
│       └── week4_workbook.readme # Week 4 workbook (scope, acceptance, daily plan)
├── specs/
│   ├── slice-a-expenses-csv/
│   │   ├── specify.md            # Problem statement & acceptance criteria
│   │   ├── plan.md               # Design, UI flows, test plan
│   │   └── tasks.md              # Implementation tasks (T001-T006) ✅ COMPLETED
│   ├── slice-b-todo-filter/
│   │   ├── specify.md
│   │   ├── plan.md
│   │   └── tasks.md              # Tasks (T007-T012) ✅ COMPLETED
│   └── slice-c-quote-search/
│       ├── specify.md
│       ├── plan.md
│       └── tasks.md              # Tasks (T013-T018) ✅ COMPLETED
└── apps/ui/
    ├── src/
    │   ├── pages/                # Expenses, ToDo, Quote pages
    │   ├── components/           # Reusable UI components
    │   ├── lib/                  # Business logic
    │   └── tests/                # Unit tests
    └── playwright/
        └── tests/                # E2E smoke + a11y tests
```

---

## 🚀 Running the Application

### Development Mode
```bash
cd apps/ui
npm install
npm run dev
# Opens http://localhost:5173
```

### Production Build
```bash
npm run build
npm run preview
# Opens http://localhost:4173
```

### Test All Features
1. **Expenses**: Upload [apps/ui/playwright/fixtures/expenses-sample.csv](../apps/ui/playwright/fixtures/expenses-sample.csv)
2. **ToDo**: Add tasks with priorities, filter by "Due today"
3. **Quote**: Search by author (e.g., "Maya Angelou"), try different seeds

---

## 📋 Week 4 Acceptance Criteria

### ✅ Figma Integration
- [x] Component inventory created and documented
- [x] User flow screens for all 3 slices
- [x] Design tokens extracted from CSS
- [x] Figma link added to documentation
- [x] Naming consistency (Figma ↔ Code)

### ✅ Product Slices Implementation
- [x] All 3 slices shipped with full functionality
- [x] Spec Kit updated per slice (/specify → /plan → /tasks)
- [x] UI mirrors CLI business logic
- [x] Inline error handling for edge cases

### ✅ Testing & Coverage
- [x] Unit tests: UI ≥ 80% overall, ≥ 50% per changed module
- [x] Unit tests: CLI ≥ 60% aggregate
- [x] Playwright smoke tests per slice (@smoke tags)
- [x] Accessibility: axe a11y smoke tests in CI

### ✅ Accessibility
- [x] Labeled form controls (all inputs have associated labels)
- [x] Inline error messages (visible and announced)
- [x] Keyboard focus order (tab navigation works correctly)
- [x] ARIA attributes (roles, labels, describedby)
- [x] Axe a11y CI checks passing

### 🔄 Reviewability (In Progress)
- [ ] GitHub Release published with Review Packet
- [ ] GitHub Pages updated (Coverage Index + UI demo)
- [ ] README "How to review me (Week 4)" section
- [ ] Coverage Table (CLI + UI) in PR
- [ ] Screenshots (Branch protection, Project board, Issue links)

---

## 🔗 Related Documentation

- **Main README**: [README.md](../README.md)
- **Week 3 Review**: [docs/review.md](review.md)
- **Week 4 Workbook**: [docs/journals/week4_workbook.readme](journals/week4_workbook.readme)
- **Figma Setup**: [docs/figma-setup-guide.md](figma-setup-guide.md)
- **Design Tokens**: [docs/design-tokens.md](design-tokens.md)

---

## 📊 Task Completion Status

| Slice | Tasks | Status | Tests | A11y |
|-------|-------|--------|-------|------|
| **A - Expenses** | T001-T006 | ✅ Complete | ✅ 466 lines + 8 E2E | ✅ Axe |
| **B - ToDo** | T007-T012 | ✅ Complete | ✅ 250+ lines + 7 E2E | ✅ Axe |
| **C - Quote** | T013-T018 | ✅ Complete | ✅ Comprehensive + 6 E2E | ✅ Axe |

**Total**: 18 tasks across 3 slices - **All Complete** ✅

---

## 🎓 Key Learnings

### Design-First Workflow
- Documenting existing UI in Figma retroactively is valid
- Design tokens extracted from CSS provide consistency
- Screenshot + annotation approach saves time while maintaining clarity

### Spec-Driven Development
- Spec Kit (/specify → /plan → /tasks) keeps implementation focused
- Task markdown files track progress and provide reviewability
- Acceptance criteria prevent scope creep

### Testing Strategy
- Table-driven unit tests catch edge cases early
- Playwright @smoke tags identify critical path tests
- Axe a11y integration ensures WCAG compliance automatically
- Deterministic testing (seeded RNG, injected clocks) enables reproducible E2E tests

### Accessibility Practices
- ARIA attributes improve screen reader experience
- Keyboard navigation must be tested explicitly
- Inline error messages need both visual and semantic markup
- Focus management matters (e.g., focus input after clearing filters)

---

## 👨‍🏫 For Reviewers

### Quick Review Path
1. **View Designs**: [Figma Link](https://www.figma.com/make/vHyEbwViJEEhxDf9wfqZd1/Week-4-training-Raymond?node-id=0-1&p=f&t=Uo8MjuZ0VBPzPjcS-0)
2. **Check Tasks**: Review [specs/](../specs/) for all 3 slices (all marked complete)
3. **Run Tests**: `cd apps/ui && npm run test:e2e -- --grep @smoke`
4. **Try UI**: `npm run dev` and test all 3 features
5. **Verify A11y**: `npm run test:e2e -- --grep @a11y`

### Evidence of Completion
- ✅ Figma file with component inventory + 3 user flows
- ✅ All task files updated (Status: Completed)
- ✅ 26 E2E tests passing (21 @smoke + 5 @a11y)
- ✅ Unit test coverage meets targets
- ✅ UI implementation matches spec requirements

---

**Week 4 Status**: Implementation Complete ✅ | Reviewability Artifacts In Progress 🔄

Last Updated: Nov 14, 2025
