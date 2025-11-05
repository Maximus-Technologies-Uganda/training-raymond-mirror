import { filterQuotes, type QuoteRecord } from '@cli/shared/quote';

export interface QuoteFiltersState {
  author: string | null;
  tag: string | null;
}

export interface QuoteOption {
  label: string;
  value: string | null;
}

export const DEFAULT_QUOTE_SEED = 'quote-ui-demo-seed';

function normalizeFilter(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function hasActiveFilters(filters: QuoteFiltersState): boolean {
  return Boolean(normalizeFilter(filters.author) || normalizeFilter(filters.tag));
}

export function applyFilters(quotes: readonly QuoteRecord[], filters: QuoteFiltersState): QuoteRecord[] {
  const author = normalizeFilter(filters.author);
  const tag = normalizeFilter(filters.tag);

  if (!author && !tag) {
    return [...quotes];
  }

  return filterQuotes([...quotes], {
    author: author ?? undefined,
    tag: tag ?? undefined,
  });
}

function buildUniqueList(values: readonly string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter((value) => value.length > 0))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function buildAuthorOptions(quotes: readonly QuoteRecord[]): QuoteOption[] {
  const authors = buildUniqueList(quotes.map((quote) => quote.author));
  return [{ label: 'All authors', value: null }, ...authors.map((author) => ({ label: author, value: author }))];
}

export function buildTagOptions(quotes: readonly QuoteRecord[]): QuoteOption[] {
  const tags = buildUniqueList(quotes.flatMap((quote) => quote.tags));
  return [{ label: 'All tags', value: null }, ...tags.map((tag) => ({ label: tag, value: tag }))];
}

export function formatTags(tags: readonly string[]): string {
  if (tags.length === 0) {
    return 'No tags';
  }
  return tags.join(', ');
}
