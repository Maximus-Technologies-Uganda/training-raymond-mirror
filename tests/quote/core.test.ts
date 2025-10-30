import { describe, expect, it } from 'vitest';
import {
  filterQuotes,
  formatQuote,
  parseQuotes,
  QuoteRecord,
  selectQuote,
} from '../../src/quote/core.js';

const SAMPLE_QUOTES_JSON = JSON.stringify([
  {
    text: 'Success is liking yourself, liking what you do, and liking how you do it.',
    author: 'Maya Angelou',
    tags: ['inspiration', 'success'],
  },
  {
    text: 'We cannot solve problems with the kind of thinking we employed when we came up with them.',
    author: 'Albert Einstein',
    tags: ['inspiration', 'thinking'],
  },
]);

const SAMPLE_QUOTES_CSV = `text,author,tags\n"Do not wait to strike till the iron is hot; but make it hot by striking.",William Butler Yeats,inspiration;action\n"It always seems impossible until it is done.",Nelson Mandela,inspiration;perseverance`;

describe('quote core', () => {
  it('parses JSON quotes with tags', () => {
    const quotes = parseQuotes(SAMPLE_QUOTES_JSON, 'json');
    expect(quotes).toHaveLength(2);
    expect(quotes[0].author).toBe('Maya Angelou');
    expect(quotes[0].tags).toEqual(['inspiration', 'success']);
  });

  it('parses CSV quotes and trims whitespace', () => {
    const quotes = parseQuotes(SAMPLE_QUOTES_CSV, 'csv');
    expect(quotes).toHaveLength(2);
    expect(quotes[0].text.startsWith('Do not wait')).toBe(true);
    expect(quotes[0].tags).toEqual(['inspiration', 'action']);
  });

  it('filters quotes by author and tag case-insensitively', () => {
    const quotes = parseQuotes(SAMPLE_QUOTES_JSON, 'json');
    const filtered = filterQuotes(quotes, { author: 'maya angelou', tag: 'SUCCESS' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].author).toBe('Maya Angelou');
  });

  it('selects a deterministic quote using a seed when no filters are provided', () => {
    const quotes = parseQuotes(SAMPLE_QUOTES_JSON, 'json');
    const quote = selectQuote(quotes, { seed: 42 });
    expect(formatQuote(quote)).toBe('"Success is liking yourself, liking what you do, and liking how you do it." — Maya Angelou (tags: inspiration, success)');
  });

  it('throws a helpful error when author is not found', () => {
    const quotes: QuoteRecord[] = parseQuotes(SAMPLE_QUOTES_JSON, 'json');
    expect(() => selectQuote(quotes, { author: 'Unknown' })).toThrow('No quotes found for author "Unknown".');
  });
});
