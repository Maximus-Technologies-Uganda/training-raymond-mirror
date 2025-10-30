import { describe, it, expect } from 'vitest';
import { normalizeQuotes, filterQuotes, pickRandom, selectQuote } from '../../src/quote/core.js';

const SAMPLE = [
  { text: 'The only way out is through.', author: 'Robert Frost', tags: ['perseverance', 'life'] },
  { text: 'Still I rise.', author: 'Maya Angelou', tags: ['hope', 'resilience'] },
  { text: 'Be yourself; everyone else is already taken.', author: 'Oscar Wilde', tags: 'humor, life' },
  { quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle', tags: ['excellence'] },
];

describe('quote core', () => {
  it('normalizes quotes with varied shapes', () => {
    const n = normalizeQuotes(SAMPLE);
    expect(n).toHaveLength(4);
    expect(n[2].tags).toEqual(['humor', 'life']);
    expect(n[0]).toEqual({ text: 'The only way out is through.', author: 'Robert Frost', tags: ['perseverance', 'life'] });
  });

  it('filters by author case-insensitively', () => {
    const f = filterQuotes(SAMPLE, { author: 'maya angelou' });
    expect(f).toHaveLength(1);
    expect(f[0].author).toBe('Maya Angelou');
  });

  it('filters by tag case-insensitively', () => {
    const f = filterQuotes(SAMPLE, { tag: 'LiFe' });
    expect(f.map((q) => q.author).sort()).toEqual(['Oscar Wilde', 'Robert Frost']);
  });

  it('selects deterministically with seed', () => {
    const q1 = selectQuote(SAMPLE, { seed: 42 });
    const q2 = selectQuote(SAMPLE, { seed: 42 });
    expect(q1.text).toBe(q2.text);
  });

  it('errors when no quotes available', () => {
    expect(() => selectQuote([], {})).toThrow(/No quotes available/);
  });

  it('errors when filter yields none', () => {
    expect(() => selectQuote(SAMPLE, { author: 'No One' })).toThrow(/No quotes found/);
  });

  it('pickRandom throws on empty input', () => {
    expect(() => pickRandom([])).toThrow('No items');
  });
});
