import { QuotePlaceholder } from '../components/index.js';

/**
 * Quote page for surfacing curated quotes with deterministic random selection.
 * This page will eventually provide category filtering and seeded random picking.
 */
export function QuotePage(): JSX.Element {
  return (
    <section aria-labelledby="quote-heading" className="page">
      <header className="page-header">
        <h2 id="quote-heading">Quote</h2>
        <p>
          Surface curated quotes with deterministic random selection. This placeholder provides the
          route scaffolding for future Quote UI work.
        </p>
      </header>
      <QuotePlaceholder />
    </section>
  );
}
