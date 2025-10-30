const QUOTE_ERROR_REASONS = new Set(['no-quotes', 'author-not-found', 'tag-not-found']);

export class QuoteError extends Error {
  constructor(message, reason) {
    super(message);
    this.name = 'QuoteError';
    if (reason && QUOTE_ERROR_REASONS.has(reason)) {
      this.reason = reason;
    }
  }
}

function createQuoteError(message, reason) {
  const error = new QuoteError(message, reason);
  error.reason = reason;
  return error;
}

export function normalizeQuotes(quotes) {
  if (!Array.isArray(quotes)) {
    return [];
  }

  const result = [];
  for (const entry of quotes) {
    if (typeof entry !== 'object' || entry === null) {
      continue;
    }

    const record = entry;
    const textSource = record.text ?? record.quote ?? record.body;
    if (typeof textSource !== 'string') {
      continue;
    }

    const text = textSource.trim();
    if (!text) {
      continue;
    }

    const rawAuthor = typeof record.author === 'string' ? record.author : '';
    const author = rawAuthor.trim() || 'Unknown';
    const tags = normalizeTags(record.tags);
    result.push({ text, author, tags });
  }

  return result;
}

function assertString(value, label) {
  if (typeof value !== 'string') {
    throw new Error(`${label} must be a string.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} cannot be empty.`);
  }
  return trimmed;
}

function detectFormat(raw, format) {
  if (format) {
    return format;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('Quotes input cannot be empty.');
  }
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return 'json';
  }
  return 'csv';
}

export function parseQuotes(rawInput, format) {
  const raw = assertString(rawInput, 'Quotes input');
  const detected = detectFormat(raw, format);
  if (detected === 'json') {
    return parseJsonQuotes(raw);
  }
  if (detected === 'csv') {
    return parseCsvQuotes(raw);
  }
  throw new Error('Unsupported quotes format.');
}

function parseJsonQuotes(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    throw new Error('Unable to parse quotes JSON input.');
  }

  if (!Array.isArray(data)) {
    throw new Error('Quotes JSON input must be an array.');
  }

  return data.map((entry, index) => normalizeQuote(entry, index));
}

function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function parseCsvQuotes(raw) {
  const rows = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (rows.length === 0) {
    return [];
  }

  const [firstLine] = rows;
  const hasHeader = /text/i.test(firstLine) && /author/i.test(firstLine);
  const startIndex = hasHeader ? 1 : 0;

  const quotes = [];
  for (let index = startIndex; index < rows.length; index += 1) {
    const columns = splitCsvLine(rows[index]).map((column) => column.trim());
    if (columns.length < 2) {
      throw new Error(`CSV row at index ${index} must include text and author.`);
    }

    const [text, author, tagsColumn = ''] = columns;
    quotes.push(normalizeQuote({ text, author, tags: tagsColumn }, index));
  }

  return quotes;
}

function normalizeQuote(entry, index) {
  if (typeof entry !== 'object' || entry === null) {
    throw new Error(`Quote at index ${index} must be an object.`);
  }

  const record = entry;
  const text = assertString(record.text ?? record.quote ?? record.body, 'Quote text');
  const author = assertString(record.author ?? 'Unknown', 'Quote author');
  const tags = normalizeTags(record.tags);

  return { text, author, tags };
}

function normalizeTags(value) {
  if (value === undefined || value === null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((tag) => String(tag).trim())
      .filter((tag) => tag.length > 0);
  }

  const text = String(value);
  if (!text.trim()) {
    return [];
  }

  return text
    .split(/[;|,]/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function filterNormalizedQuotes(quotes, filters = {}) {
  const normalizedAuthor = filters.author ? filters.author.trim().toLowerCase() : null;
  const normalizedTag = filters.tag ? filters.tag.trim().toLowerCase() : null;

  return quotes.filter((quote) => {
    const matchesAuthor =
      !normalizedAuthor || quote.author.trim().toLowerCase() === normalizedAuthor;
    const matchesTag =
      !normalizedTag || quote.tags.some((tag) => tag.trim().toLowerCase() === normalizedTag);
    return matchesAuthor && matchesTag;
  });
}

export function filterQuotes(quotes, filters = {}) {
  const normalized = normalizeQuotes(quotes);
  return filterNormalizedQuotes(normalized, filters);
}

function createSeededRandom(seed) {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 0x100000000;
    return state / 0x100000000;
  };
}

export function pickRandom(items, seed = null) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('No items to pick from');
  }

  const randomSource = seed === null || seed === undefined ? Math.random : createSeededRandom(Number(seed));
  const index = Math.floor(randomSource() * items.length) % items.length;
  return items[index];
}

export function selectQuote(quotes, options = {}) {
  const normalized = normalizeQuotes(quotes);

  if (normalized.length === 0) {
    throw createQuoteError('No quotes available.', 'no-quotes');
  }

  let filtered = normalized;

  if (options.author) {
    filtered = filterNormalizedQuotes(filtered, { author: options.author });
    if (filtered.length === 0) {
      throw createQuoteError(`No quotes found for author "${options.author}".`, 'author-not-found');
    }
  }

  if (options.tag) {
    filtered = filterNormalizedQuotes(filtered, { tag: options.tag });
    if (filtered.length === 0) {
      throw createQuoteError(`No quotes found with tag "${options.tag}".`, 'tag-not-found');
    }
  }

  if (filtered.length === 0) {
    throw createQuoteError('No quotes available.', 'no-quotes');
  }

  if (options.author || options.tag) {
    return filtered[0];
  }

  if (filtered.length === 1) {
    return filtered[0];
  }

  if (typeof options.random === 'function') {
    const value = options.random();
    const index = Math.floor(value * filtered.length) % filtered.length;
    return filtered[index];
  }

  return pickRandom(filtered, options.seed);
}

export function formatQuote(quote) {
  const tags = quote.tags.filter((tag) => tag.trim().length > 0);
  if (tags.length === 0) {
    return `"${quote.text}" — ${quote.author}`;
  }
  return `"${quote.text}" — ${quote.author} (tags: ${tags.join(', ')})`;
}
