# Slice B — Implementation Plan (To Do: dueToday + Priority)

Status: Draft (Day 1)  
Owner: Raymond

## UI Flow
1. User adds tasks with title, optional priority and due date.
2. User toggles “Due today” to filter tasks whose `dueDate` equals today (local calendar midnight boundary).
3. List renders tasks sorted by priority (high → med → low) then by createdAt/id.
4. Completing a task updates the list and summary counts.
5. Duplicate add attempts surface inline error; completing non‑existent id shows inline error.

## State Shapes (UI)
```ts
type Priority = 'low' | 'med' | 'high';

interface Todo {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
  createdAt: string;   // ISO
  completedAt?: string;
  dueDate?: string;    // YYYY-MM-DD
}

interface TodoFiltersState {
  showDueToday: boolean;
  priority: 'all' | Priority;
}
```

## Calendar Boundary
- Use UI clock adapter already in `apps/ui/src/lib/time/clock.ts`.
- Convert Date.now() to a date-only string; compare `dueDate` to today.

## Accessibility Notes
- Toggle/checkbox labeled (“Due today”) and reachable by keyboard.
- Add/complete forms have explicit labels and `aria-live` status regions for messages.
- Badges use semantic text; color alone is not the sole indicator (include text).

## Test Plan
### Unit (Vitest + RTL)
- Boundary cases: yesterday / today / tomorrow detection (inject fixed clock).
- Sorting: priority desc; stable for equal priorities.
- Duplicate add rejection (same title, case-insensitive).
- Complete non-existent id error message path.

### E2E (Playwright, tag `@smoke`)
- Add task (High, due today) → toggle “due today” → task appears → complete → list updates & summary reflects.

### Accessibility (axe smoke)
- No violations on To Do page with toggle, forms, alerts.

## Risks & Mitigations
- Date handling across TZ: rely on date-only comparison via clock adapter, not raw ms.
- Duplicate definition: keep rule simple (same title string, case-insensitive).

## Traceability
- CLI mirror: `src/cli/todo.ts` (priority, dueToday, duplicate/complete semantics).
- UI: `apps/ui/src/pages/ToDo.tsx`, components under `apps/ui/src/components/todo/`.


