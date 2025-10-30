/**
 * Quote core: filter by author/tag (case-insensitive) and select deterministically when seeded.
 * Pure module: no I/O.
 */

function toLowerSafe(value) {
  return typeof value === 'string' ? value.toLowerCase() : value;
}

export function normalizeQuotes(quotes) {
  if (!Array.isArray(quotes)) return [];
  return quotes
    .filter((q) => q && (q.text || q.quote || q.body))
    .map((q) => {
      const text = q.text ?? q.quote ?? q.body ?? '';
      const author = q.author ?? 'Unknown';
      let tags = q.tags ?? [];
      if (typeof tags === 'string') {
        // Split on comma or pipe, trim spaces
        tags = tags
          .split(/[|,]/)
          .map((t) => t.trim())
          .filter(Boolean);
      }
      if (!Array.isArray(tags)) tags = [];
      return { text, author, tags };
    });
}

export function filterQuotes(quotes, { author, tag } = {}) {
  const lcAuthor = toLowerSafe(author);
  const lcTag = toLowerSafe(tag);
  const normalized = normalizeQuotes(quotes);

  let filtered = normalized;
  if (lcAuthor) {
    filtered = filtered.filter((q) => toLowerSafe(q.author) === lcAuthor);
  }
  if (lcTag) {
    filtered = filtered.filter((q) => q.tags.some((t) => toLowerSafe(t) === lcTag));
  }
  return filtered;
}

function mulberry32(seed) {
  // Convert seed to 32-bit unsigned
  let t = (seed >>> 0) || 0x9e3779b9;
  return function next() {
    t += 0x6d2b79f5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickRandom(items, seed = null) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('No items to pick from');
  }
  const rand = seed == null ? Math.random : mulberry32(Number(seed));
  const idx = Math.floor(rand() * items.length);
  return items[idx];
}

export function selectQuote(quotes, { author, tag, seed } = {}) {
  const normalized = normalizeQuotes(quotes);
  if (normalized.length === 0) {
    throw new Error('No quotes available');
  }

  const filtered = filterQuotes(normalized, { author, tag });
  if (filtered.length === 0) {
    throw new Error('No quotes found for the given filter');
  }

  // If filter applied, pick from filtered; else pick from all
  const pool = author || tag ? filtered : normalized;
  return pickRandom(pool, seed);
}
