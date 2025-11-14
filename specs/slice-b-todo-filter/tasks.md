# Slice B — Tasks (To Do: dueToday + Priority)

Status: Completed (Day 1)

## Build
- [x] T007 Add "Due today" toggle with visible label and keyboard focus order (local midnight boundary via clock adapter).
- [x] T008 Add priority badges (High/Med/Low) and default sort by priority desc; stable order within same priority.
- [x] T009 Implement duplicate insert guard (case-insensitive title) with inline error message.
- [x] T010 Completing a non‑existent id surfaces inline error without crashing.

## Tests
- [x] T011 Unit tests: yesterday/today/tomorrow boundaries, priority sorting, duplicates rejected, bad complete error path.

## CI & Artifacts
- [x] T012 Playwright `@smoke` (add → filter today → complete) + axe a11y; export UI coverage and Playwright report to `review-artifacts/` and update README review box.

## Documentation



