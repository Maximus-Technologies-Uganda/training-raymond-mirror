import Quote from './Quote';

/**
 * Quote page for surfacing curated quotes with deterministic random selection.
 * Router-compatible wrapper for the Quote explorer page.
 * Delegates to the rich Quote component introduced in Phase 5.
 */
export function QuotePage(): JSX.Element {
  return <Quote />;
}
