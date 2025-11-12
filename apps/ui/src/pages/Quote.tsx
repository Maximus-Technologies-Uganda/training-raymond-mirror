import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
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

/**
 * Normalizes filter values by trimming whitespace and converting empty strings to null.
 * This ensures consistent filter behavior and proper URL parameter handling.
 */
function normalizeFilterValue(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/**
 * Normalizes seed values by trimming whitespace and using default seed for empty strings.
 * This ensures deterministic random selection even with blank seed inputs.
 */
function normalizeSeed(seed: string | undefined): string {
  if (seed === undefined || seed === null) {
    return DEFAULT_QUOTE_SEED;
  }
  const trimmed = seed.trim();
  return trimmed.length === 0 ? DEFAULT_QUOTE_SEED : trimmed;
}

/**
 * Parses URL query parameters for filters and seed.
 * Returns normalized filter values and raw seed value for hydrating component state from URL.
 */
function parseUrlParams(): { author: string | null; tag: string | null; seed: string } {
  if (typeof window === 'undefined') {
    return { author: null, tag: null, seed: '' };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    author: normalizeFilterValue(params.get('author')),
    tag: normalizeFilterValue(params.get('tag')),
    seed: params.get('seed') ?? '',
  };
}

function QuoteContent({ quotes, initialSeed }: QuoteProps): JSX.Element {
  const urlParams = parseUrlParams();
  const dataset = useMemo<readonly QuoteRecord[]>(() => (quotes ? [...quotes] : SAMPLE_QUOTES), [quotes]);

  // Ref for managing focus on author input (used for keyboard shortcuts and clear action)
  const authorInputRef = useRef<HTMLInputElement>(null);

  // Lazy initialization - only parse URL params once on mount
  const [filters, setFilters] = useState<QuoteFiltersState>(() => ({
    author: urlParams.author,
    tag: urlParams.tag,
  }));

  // Separate user input from effective seed value for better control
  // This allows us to show raw input while using normalized seed for calculations
  const [seedInput, setSeedInput] = useState<string>(() => initialSeed ?? urlParams.seed);
  const effectiveSeed = useMemo(() => normalizeSeed(seedInput), [seedInput]);

  // Sync filters to URL for shareable links
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams();
    const author = normalizeFilterValue(filters.author);
    const tag = normalizeFilterValue(filters.tag);

    if (author) params.set('author', author);
    if (tag) params.set('tag', tag);
    if (effectiveSeed !== DEFAULT_QUOTE_SEED) params.set('seed', effectiveSeed);

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [filters, effectiveSeed]);

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
    const rng = createSeededRandom(effectiveSeed);
    const index = rng.nextInt(filteredQuotes.length);
    return filteredQuotes[index];
  }, [filteredQuotes, filtersActive, effectiveSeed]);

  /**
   * Focuses the author input field with proper timing.
   * Uses requestAnimationFrame for smooth focus, with setTimeout fallback.
   */
  const focusAuthorFilter = useCallback(() => {
    const element = authorInputRef.current;
    if (!element) {
      return;
    }

    const focus = () => element.focus();
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(focus);
      return;
    }
    setTimeout(focus, 0);
  }, []);

  const handleAuthorChange = useCallback((value: string | null) => {
    setFilters((current) => ({ ...current, author: value }));
  }, []);

  const handleTagChange = useCallback((value: string | null) => {
    setFilters((current) => ({ ...current, tag: value }));
  }, []);

  const handleSeedChange = useCallback((value: string) => {
    setSeedInput(value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
    focusAuthorFilter();
  }, [focusAuthorFilter]);

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
        seed={seedInput}
        hasActiveFilters={filtersActive}
        authorInputRef={authorInputRef}
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
