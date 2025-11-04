# Data Model: Week 3 UIs (Expenses, ToDo, Quote)

**Created**: 2025-11-03

## Entities

### ExpenseRecord
- id: string
- date: ISO date string (YYYY-MM-DD)
- month: string (Jan–Dec)
- category: string
- amount: number (two decimals)
- currency: string (ISO 4217)

Validation
- amount ≥ 0; currency present; category and month known; date valid.

### ExpenseTotals
- month: string
- category: string
- totalAmount: number
- currency: string

Rules
- Summed from ExpenseRecord filtered by month and/or category; formatting policy mirrors CLI.

### ToDoItem
- id: string (UUID)
- title: string (1–140 chars)
- dueDate: ISO date string (optional)
- priority: one of [low, medium, high]
- completed: boolean

Validation
- No duplicates by (normalized title); completing nonexistent id → error; dueToday computed using injected clock (local midnight).

### Quote
- id: string
- author: string
- text: string
- tags: string[]

Rules
- Filter by author (case-insensitive) or by tag; when no filters, a deterministic random pick (seeded) is allowed.

### ReviewArtifact (for planning)
- coverageIndexPath: string
- releaseUrl: string
- pagesUrl: string

## Relationships
- ExpenseRecord → ExpenseTotals (derived aggregation)
- ToDoItem (list) supports add/list/complete transitions
- Quote supports filter/query views

## State Transitions (ToDo)
- add(title, dueDate?, priority) → ToDoItem
- complete(id) → ToDoItem.completed = true (id must exist)
- list(filter?) → ToDoItem[]

## Derived/Computed
- dueToday(items, clock) → ToDoItem[] where dueDate is today by injected clock
- expenseTotals(records, month?, category?) → ExpenseTotals


