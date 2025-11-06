import { useMemo, useState, useCallback, useEffect } from 'react';
import type { QuoteRecord } from '@cli/shared/quote';
import QuoteFilters from '../components/quote/QuoteFilters';
import QuoteResult from '../components/quote/QuoteResult';
import { QuoteErrorBoundary } from '../components/quote/ErrorBoundary';
import { createSeededRandom } from '../lib/random/seeded';
import {
  DEFAULT_QUOTE_SEED,
  applyFilters,
  buildAuthorOptions,
  buildTagOptions,
  hasActiveFilters,
  type QuoteFiltersState,
} from '../lib/quote/view';
import { SAMPLE_QUOTES } from '../lib/quote/sampleData';

export interface QuoteProps {
  quotes?: readonly QuoteRecord[];
  initialSeed?: string;
}

const DEFAULT_FILTERS: QuoteFiltersState = {
  author: null,
  tag: null,
};

function normalizeSeed(seed: string | undefined): string {
  if (!seed) {
    return DEFAULT_QUOTE_SEED;
  }
  const trimmed = seed.trim();
  return trimmed.length === 0 ? DEFAULT_QUOTE_SEED : trimmed;
}

function parseUrlParams(): { author: string | null; tag: string | null; seed: string } {
  if (typeof window === 'undefined') {
    return { author: null, tag: null, seed: DEFAULT_QUOTE_SEED };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    author: params.get('author') || null,
    tag: params.get('tag') || null,
    seed: params.get('seed') || DEFAULT_QUOTE_SEED,
  };
}

function QuoteContent({ quotes, initialSeed }: QuoteProps): JSX.Element {
  const urlParams = parseUrlParams();
  const dataset = useMemo<readonly QuoteRecord[]>(() => (quotes ? [...quotes] : SAMPLE_QUOTES), [quotes]);

  const [filters, setFilters] = useState<QuoteFiltersState>({
    author: urlParams.author,
    tag: urlParams.tag,
  });
  const [seed, setSeed] = useState<string>(initialSeed ?? urlParams.seed);

  // Sync filters to URL for shareable links
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.author) params.set('author', filters.author);
    if (filters.tag) params.set('tag', filters.tag);
    if (seed !== DEFAULT_QUOTE_SEED) params.set('seed', seed);

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [filters, seed]);

  const authorOptions = useMemo(() => buildAuthorOptions(dataset), [dataset]);
  const tagOptions = useMemo(() => buildTagOptions(dataset), [dataset]);
  const filteredQuotes = useMemo(() => applyFilters(dataset, filters), [dataset, filters]);
  const filtersActive = hasActiveFilters(filters);

  const selectedQuote = useMemo(() => {
    if (filtersActive) {
      return filteredQuotes.length > 0 ? filteredQuotes[0] : null;
    }
    if (filteredQuotes.length === 0) {
      return null;
    }
    const rng = createSeededRandom(normalizeSeed(seed));
    const index = rng.nextInt(filteredQuotes.length);
    return filteredQuotes[index];
  }, [filteredQuotes, filtersActive, seed]);

  const handleAuthorChange = useCallback((value: string | null) => {
    setFilters((current) => ({ ...current, author: value }));
  }, []);

  const handleTagChange = useCallback((value: string | null) => {
    setFilters((current) => ({ ...current, tag: value }));
  }, []);

  const handleSeedChange = useCallback((value: string) => {
    setSeed(normalizeSeed(value));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  return (
    <div className="quote-page" role="main" data-testid="quote-page">
      <header className="quote-page__header">
        <h1 className="quote-page__title">Quote explorer</h1>
        <p className="quote-page__subtitle">
          Filter by author or tag, or use the deterministic seed to surface a repeatable random quote.
        </p>
      </header>

      <QuoteFilters
        authorOptions={authorOptions}
        tagOptions={tagOptions}
        author={filters.author}
        tag={filters.tag}
        seed={seed}
        hasActiveFilters={filtersActive}
        onAuthorChange={handleAuthorChange}
        onTagChange={handleTagChange}
        onSeedChange={handleSeedChange}
        onClearFilters={handleClearFilters}
      />

      <QuoteResult
        filteredQuotes={filteredQuotes}
        selectedQuote={selectedQuote}
        hasActiveFilters={filtersActive}
        totalQuotes={dataset.length}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}

/**
 * Quote explorer page with error boundary, URL state persistence,
 * and deterministic random selection.
 */
function Quote(props: QuoteProps): JSX.Element {
  return (
    <QuoteErrorBoundary>
      <QuoteContent {...props} />
    </QuoteErrorBoundary>
  );
}

export default Quote;
