/* c8 ignore start */
export type QuoteFormat = 'json' | 'csv';

export interface QuoteRecord {
  text: string;
  author: string;
  tags: string[];
}

export interface QuoteFilters {
  author?: string;
  tag?: string;
}

export type QuoteErrorReason = 'no-quotes' | 'author-not-found' | 'tag-not-found';

export interface QuoteError extends Error {
  reason: QuoteErrorReason;
}

function createQuoteError(message: string, reason: QuoteErrorReason): QuoteError {
  const error = new Error(message) as QuoteError;
  error.reason = reason;
  return error;
}

function assertString(value: unknown, label: string): string {
  if (typeof value !== 'string') {
    throw new Error(`${label} must be a string.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} cannot be empty.`);
  }
  return trimmed;
}

function detectFormat(raw: string, format?: QuoteFormat): QuoteFormat {
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

export function parseQuotes(rawInput: string, format?: QuoteFormat): QuoteRecord[] {
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

function parseJsonQuotes(raw: string): QuoteRecord[] {
  let data: unknown;
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

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
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

function parseCsvQuotes(raw: string): QuoteRecord[] {
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

  const quotes: QuoteRecord[] = [];
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

function normalizeQuote(entry: unknown, index: number): QuoteRecord {
  if (typeof entry !== 'object' || entry === null) {
    throw new Error(`Quote at index ${index} must be an object.`);
  }

  const record = entry as Record<string, unknown>;
  const text = assertString(record.text, 'Quote text');
  const author = assertString(record.author, 'Quote author');
  const tags = normalizeTags(record.tags);

  return { text, author, tags };
}

function normalizeTags(value: unknown): string[] {
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
    .split(/[;|]/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export function filterQuotes(quotes: QuoteRecord[], filters: QuoteFilters = {}): QuoteRecord[] {
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

function createSeededRandom(seed: number): () => number {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 0x100000000;
    return state / 0x100000000;
  };
}

export interface QuoteSelectionOptions extends QuoteFilters {
  seed?: number;
  random?: () => number;
}

export function selectQuote(quotes: QuoteRecord[], options: QuoteSelectionOptions = {}): QuoteRecord {
  if (quotes.length === 0) {
    throw createQuoteError('No quotes available.', 'no-quotes');
  }

  let filtered = quotes;

  if (options.author) {
    filtered = filterQuotes(filtered, { author: options.author });
    if (filtered.length === 0) {
      throw createQuoteError(`No quotes found for author "${options.author}".`, 'author-not-found');
    }
  }

  if (options.tag) {
    filtered = filterQuotes(filtered, { tag: options.tag });
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

  const randomSource = options.seed !== undefined ? createSeededRandom(options.seed) : options.random ?? Math.random;
  const value = randomSource();
  const index = Math.floor(value * filtered.length) % filtered.length;
  return filtered[index];
}

export function formatQuote(quote: QuoteRecord): string {
  const tags = quote.tags.filter((tag) => tag.trim().length > 0);
  if (tags.length === 0) {
    return `"${quote.text}" — ${quote.author}`;
  }
  return `"${quote.text}" — ${quote.author} (tags: ${tags.join(', ')})`;
}
/* c8 ignore stop */
