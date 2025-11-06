# Shared CLI Logic

This directory contains pure business logic extracted from CLI implementations that can be safely reused by both CLI and UI layers.

## Purpose

The shared logic structure enables:

1. **Code reuse** - UI components can import the same validation and business rules as CLIs
2. **Consistency** - Both CLI and UI execute identical logic, reducing bugs
3. **Testability** - Pure functions are easier to test in isolation
4. **Maintainability** - Changes to business rules propagate to both CLI and UI automatically

## Structure

Each CLI tool has a corresponding shared module that re-exports pure functions and types from the core implementation:

- **expenses.ts** - Re-exports from `src/expenses/core.js`
  - Expense parsing, filtering, summarization, and reporting
  - Types: ExpenseRecord, ExpenseFilters, ExpenseSummary, etc.

- **todo.ts** - Re-exports from `src/todo/core.js`
  - ToDo item management (add, complete, list)
  - Types: TodoItem, TodoState, Clock, etc.
  - Supports injected clocks for deterministic testing

- **quote.ts** - Re-exports from `src/quote/core.js`
  - Quote filtering and selection
  - Types: QuoteRecord, QuoteFilters, QuoteSelectionOptions, etc.
  - Supports seeded random number generation

- **index.ts** - Barrel export for convenient imports

## Usage

### In UI Components

```typescript
import { summarizeExpenses, type ExpenseSummary } from '@/cli/shared/expenses.js';
import { addTodo, type TodoState } from '@/cli/shared/todo.js';
import { selectQuote, type QuoteRecord } from '@/cli/shared/quote.js';
```

### Best Practices

1. **Import from shared, not CLI directly** - Always import from `src/cli/shared/` rather than directly from CLI entry points
2. **Use types** - Import TypeScript types alongside functions for better type safety
3. **Pass dependencies** - Functions accept dependencies (like Clock) rather than using globals
4. **Keep it pure** - Shared logic should be side-effect free where possible

## Testing

The shared logic itself is tested through the core modules. UI components that consume shared logic should:

- Use injected clocks for time-dependent logic (ToDo)
- Use seeded RNGs for random selection (Quote)
- Test with table-driven test cases
- Aim for ≥50% statement coverage per tool

## Phase 2 Status

**All tasks complete:**
- ✅ T010 - Shared pure logic structure created
- ✅ Proper TypeScript exports with types
- ✅ Documentation in place
- ✅ Ready for UI consumption in Phase 3+
