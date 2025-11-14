# Slice C — Quote: Author/Tag Search + Seeded Random

Status: Draft (Day 1 — Spec Kit)  
Owner: Raymond  
Related surfaces: CLI `src/cli/quote.ts`, UI `apps/ui/src/pages/Quote.tsx`

## Problem
Users want to find quotes by author or tag, or browse a random quote in a reproducible way for demos/tests. Empty datasets and no‑match queries should have clear, inline feedback.

## Scope Boundaries
- Filters: author and tag, both case‑insensitive.
- Random selection when no filters are active; seeded RNG for deterministic e2e.
- URL sync: author/tag/seed reflected in the URL for shareable links.
- Empty dataset UX when no quotes are available or filters return none.

Out of scope:
- External API calls and persistence.
- Advanced search syntax (AND/OR across multiple tags).

## Acceptance Rules
- [ ] Case‑insensitive author/tag filters; not found → inline message.
- [ ] Random when no filter; seeded RNG for deterministic e2e.
- [ ] Empty dataset UX.
- [ ] Unit tests: author/tag filters; empty dataset; seeded random.
- [ ] Playwright smoke: search by author → result matches fixture; random path reproducible.

## Reviewability & Evidence
- UI unit coverage for new/changed modules ≥ 50% (overall UI ≥ 80%).
- Playwright `@smoke` for author filter and seeded random path.
- a11y smoke (axe): labeled inputs/selects; error/info messages announced.
- Artifacts exported to `review-artifacts/` and linked from README.


