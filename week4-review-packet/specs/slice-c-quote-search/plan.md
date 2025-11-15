# Slice C — Implementation Plan (Quote: Filters + Seeded Random)

Status: Draft (Day 1)  
Owner: Raymond

## UI Flow
1. User opens Quotes page (dataset seeded from `SAMPLE_QUOTES`).
2. User enters Author (text) and/or selects Tag (dropdown).
3. If filters are active:
   - Show the first matching quote (or “No quotes found” inline message).
4. If no filters:
   - Show a “random” quote selected via seeded RNG for reproducibility.
5. Author/tag/seed are reflected in the URL for shareable states.
6. “Clear filters” resets author/tag and leaves seed unchanged.

## State Shapes
```ts
interface QuoteFiltersState {
  author: string | null;
  tag: string | null;
}
// `seed: string` kept separately and normalized to a non-empty value.
```

## Deterministic Random
- Use `apps/ui/src/lib/random/seeded.ts` (Mulberry32) to generate a repeatable sequence.
- Normalize empty seeds to a default constant to avoid entropy.

## Accessibility Notes
- Filters have visible labels and `aria-label` where necessary.
- Empty result uses `role="status"` or `role="alert"` depending on context.
- Focus is returned to the author input after “Clear filters”.

## Test Plan
### Unit (Vitest + RTL)
- Author filter (case‑insensitive) matches expected items.
- Tag filter (case‑insensitive) matches expected items.
- Empty dataset behavior (render empty state).
- Seeded random selection returns the same item for a given seed.

### E2E (Playwright, tag `@smoke`)
- Search by author → visible result equals fixture data.
- Random path with specific seed → same quote across runs.

### Accessibility (axe smoke)
- No violations with filters, clear action, and empty state.

## Risks & Mitigations
- Data variability: rely on a fixed sample dataset for tests.
- URL sync edge cases: sanitize/normalize seed and strip empty params.

## Traceability
- CLI mirror: `src/cli/quote.ts`.
- UI: `apps/ui/src/pages/Quote.tsx`, components under `apps/ui/src/components/quote/`, random util at `apps/ui/src/lib/random/seeded.ts`.


