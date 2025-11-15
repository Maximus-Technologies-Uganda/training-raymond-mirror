# Slice B — To Do: Due Today Filter + Priority Badges

Status: Draft (Day 1 — Spec Kit)  
Owner: Raymond  
Related surfaces: CLI `src/cli/todo.ts`, UI `apps/ui/src/pages/ToDo.tsx`

## Problem
Users need to quickly find tasks that are due today and understand priorities at a glance. The UI must prevent duplicate inserts and show a helpful inline error when completing a non‑existent task.

## Scope Boundaries
- Filters: `dueToday` toggle uses local midnight calendar boundary.
- Priorities: `low | med | high`, displayed as badges; default sort by priority desc (high → low).
- Guard rails: duplicate add is rejected with error; completing non‑existent task shows inline error.
- a11y: toggle is keyboard navigable and labeled; alerts use proper roles.

Out of scope:
- Persistence beyond current in-memory (CLI storage remains for CLI).
- Multi-user collaboration and real-time sync.

## Acceptance Rules
- [ ] `dueToday` filter implemented using local midnight boundary; keyboard-navigable toggle (with label).
- [ ] Priority badges visible on list items; default sort by priority desc.
- [ ] Duplicate insert guard; completing a non-existent id → inline error message.
- [ ] Unit tests: yesterday/today/tomorrow boundaries; duplicate add; bad complete.
- [ ] Playwright smoke: add → filter today → complete → assert remaining list.

## Reviewability & Evidence
- UI unit coverage for new/changed modules ≥ 50% (overall UI stays ≥ 80%).
- Playwright `@smoke` for dueToday flow.
- a11y smoke (axe): controls labeled and operable via keyboard.
- Artifacts exported to `review-artifacts/` and linked from README.


