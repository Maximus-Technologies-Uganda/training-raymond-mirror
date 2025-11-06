import type { QuoteRecord } from '@cli/shared/quote';
import { formatTags } from '../../lib/quote/view';

export interface QuoteResultProps {
  filteredQuotes: readonly QuoteRecord[];
  selectedQuote: QuoteRecord | null;
  hasActiveFilters: boolean;
  totalQuotes: number;
  onClearFilters: () => void;
}

function renderQuoteListItem(quote: QuoteRecord, index: number): JSX.Element {
  return (
    <li key={`${quote.author}-${index}`} className="quote-result__item" data-testid={`quote-item-${index}`}>
      <figure>
        <blockquote className="quote-result__blockquote">"{quote.text}"</blockquote>
        <figcaption className="quote-result__caption">
          <span className="quote-result__author">— {quote.author}</span>
          <span className="quote-result__tags" data-testid={`quote-tags-${index}`}>
            Tags: {formatTags(quote.tags)}
          </span>
        </figcaption>
      </figure>
    </li>
  );
}

function renderFeaturedQuote(quote: QuoteRecord): JSX.Element {
  return (
    <figure className="quote-result__featured-card">
      <blockquote className="quote-result__blockquote">"{quote.text}"</blockquote>
      <figcaption className="quote-result__caption">
        <span className="quote-result__author">— {quote.author}</span>
        <span className="quote-result__tags" data-testid="quote-tags-featured">
          Tags: {formatTags(quote.tags)}
        </span>
      </figcaption>
    </figure>
  );
}

export function QuoteResult({
  filteredQuotes,
  selectedQuote,
  hasActiveFilters,
  totalQuotes,
  onClearFilters,
}: QuoteResultProps): JSX.Element {
  if (filteredQuotes.length === 0 && totalQuotes === 0) {
    return (
      <div className="quote-result__empty" role="alert" data-testid="quote-empty-state">
        <p className="quote-result__empty-title">No quotes available</p>
        <p className="quote-result__empty-hint">Add quotes to the dataset to begin exploring.</p>
      </div>
    );
  }

  if (hasActiveFilters && filteredQuotes.length === 0) {
    return (
      <div className="quote-result__empty" role="status" data-testid="quote-no-results">
        <p className="quote-result__empty-title">No quotes match the current filters</p>
        <button type="button" className="quote-result__empty-action" onClick={onClearFilters}>
          Clear all filters
        </button>
        <p className="quote-result__empty-hint">
          Try selecting a different author or tag, or browse all {totalQuotes} quotes.
        </p>
      </div>
    );
  }

  if (hasActiveFilters) {
    return (
      <section className="quote-result" aria-live="polite">
        <header className="quote-result__header">
          <h2 className="quote-result__title" data-testid="quote-results-title">
            Filtered quotes ({filteredQuotes.length})
          </h2>
          <p className="quote-result__subtitle">Results update instantly as you adjust filters.</p>
        </header>
        <ul className="quote-result__list" data-testid="quote-filtered-list">
          {filteredQuotes.map((quote, index) => renderQuoteListItem(quote, index))}
        </ul>
      </section>
    );
  }

  if (!selectedQuote) {
    return (
      <div className="quote-result__empty" role="status" data-testid="quote-empty-state">
        <p className="quote-result__empty-title">Unable to select a quote</p>
        <p className="quote-result__empty-hint">Adjust the seed or add more quotes to the dataset.</p>
      </div>
    );
  }

  return (
    <section className="quote-result" aria-live="polite">
      <header className="quote-result__header">
        <h2 className="quote-result__title" data-testid="quote-featured-title">
          Featured quote (seeded)
        </h2>
        <p className="quote-result__subtitle">Adjust the random seed to deterministically surface a different quote.</p>
      </header>
      <div className="quote-result__featured" data-testid="quote-featured">
        {renderFeaturedQuote(selectedQuote)}
      </div>
    </section>
  );
}

export default QuoteResult;
