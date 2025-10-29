const MONTHS = new Map<string, number>([
  ['jan', 1],
  ['january', 1],
  ['feb', 2],
  ['february', 2],
  ['mar', 3],
  ['march', 3],
  ['apr', 4],
  ['april', 4],
  ['may', 5],
  ['jun', 6],
  ['june', 6],
  ['jul', 7],
  ['july', 7],
  ['aug', 8],
  ['august', 8],
  ['sep', 9],
  ['sept', 9],
  ['september', 9],
  ['oct', 10],
  ['october', 10],
  ['nov', 11],
  ['november', 11],
  ['dec', 12],
  ['december', 12],
]);

const TWO_DECIMAL_FORMATTER = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export type ExpenseFormat = 'json' | 'csv';

export interface ExpenseRecord {
  date: Date;
  category: string;
  amount: number;
  sourceIndex: number;
}

export interface ExpenseFilters {
  month?: number | string | null;
  category?: string | null;
}

export interface ExpenseSummaryEntry {
  category: string;
  amount: number;
}

export interface ExpenseSummary {
  total: number;
  totalsByCategory: ExpenseSummaryEntry[];
}

export interface ExpenseReport {
  entries: ExpenseRecord[];
  summary: ExpenseSummary;
}

export function normalizeMonth(input: number | string | null | undefined): number | null {
  if (input === null || input === undefined) {
    return null;
  }

  if (typeof input === 'number') {
    if (Number.isInteger(input) && input >= 1 && input <= 12) {
      return input;
    }
    throw new Error('Month must be an integer between 1 and 12.');
  }

  const value = String(input).trim();
  if (value === '') {
    throw new Error('Month cannot be empty.');
  }

  if (/^\d+$/.test(value)) {
    const numeric = Number.parseInt(value, 10);
    if (numeric >= 1 && numeric <= 12) {
      return numeric;
    }
    throw new Error('Month must be an integer between 1 and 12.');
  }

  const normalized = value.toLowerCase();
  if (MONTHS.has(normalized)) {
    return MONTHS.get(normalized)!;
  }

  throw new Error('Invalid month value. Use Jan-Dec or 1-12.');
}

function assertString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

function parseAmount(raw: unknown, index: number): number {
  if (typeof raw === 'number') {
    if (Number.isFinite(raw)) {
      return raw;
    }
    throw new Error(`Amount at index ${index} must be a finite number.`);
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed === '') {
      throw new Error(`Amount at index ${index} cannot be empty.`);
    }
    const parsed = Number.parseFloat(trimmed);
    if (!Number.isFinite(parsed)) {
      throw new Error(`Amount at index ${index} must be numeric.`);
    }
    return parsed;
  }

  throw new Error(`Amount at index ${index} must be numeric.`);
}

function parseDate(value: unknown, index: number): Date {
  const str = assertString(value, 'Date');
  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date at index ${index}.`);
  }
  return parsed;
}

function detectFormat(raw: string): ExpenseFormat {
  const trimmed = raw.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return 'json';
  }
  return 'csv';
}

export function parseExpenses(rawInput: string, format?: ExpenseFormat): ExpenseRecord[] {
  const raw = assertString(rawInput, 'Input');
  const detected = format ?? detectFormat(raw);
  if (detected === 'json') {
    return parseJsonExpenses(raw);
  }
  if (detected === 'csv') {
    return parseCsvExpenses(raw);
  }
  throw new Error('Unsupported expenses format.');
}

function parseJsonExpenses(raw: string): ExpenseRecord[] {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    throw new Error('Unable to parse JSON input.');
  }

  if (!Array.isArray(data)) {
    throw new Error('JSON input must be an array.');
  }

  return data.map((entry, index) => {
    if (typeof entry !== 'object' || entry === null) {
      throw new Error(`Invalid JSON row at index ${index}.`);
    }

    const date = parseDate((entry as Record<string, unknown>).date, index);
    const category = assertString((entry as Record<string, unknown>).category, 'Category');
    const amount = parseAmount((entry as Record<string, unknown>).amount, index);
    return {
      date,
      category,
      amount,
      sourceIndex: index,
    };
  });
}

function parseCsvExpenses(raw: string): ExpenseRecord[] {
  const rows = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (rows.length === 0) {
    return [];
  }

  const [firstLine] = rows;
  const hasHeader = /date/i.test(firstLine) && /category/i.test(firstLine) && /amount/i.test(firstLine);
  const startIndex = hasHeader ? 1 : 0;

  const entries: ExpenseRecord[] = [];
  for (let index = startIndex; index < rows.length; index += 1) {
    const columns = rows[index].split(',').map((column) => column.trim());
    if (columns.length < 3) {
      throw new Error(`Malformed CSV row at line ${index + 1}.`);
    }
    const [date, category, amount] = columns;
    entries.push({
      date: parseDate(date, index),
      category: assertString(category, 'Category'),
      amount: parseAmount(amount, index),
      sourceIndex: index,
    });
  }

  return entries;
}

export function filterExpenses(records: readonly ExpenseRecord[], filters: ExpenseFilters = {}): ExpenseRecord[] {
  const month = filters.month !== undefined && filters.month !== null ? normalizeMonth(filters.month) : null;
  const category = typeof filters.category === 'string' ? filters.category.trim().toLowerCase() : null;

  return records.filter((record) => {
    const recordMonth = record.date.getMonth() + 1;
    const matchesMonth = month === null || recordMonth === month;
    const matchesCategory = category === null || record.category.toLowerCase() === category;
    return matchesMonth && matchesCategory;
  });
}

function roundCurrency(amount: number): number {
  return Number.parseFloat(TWO_DECIMAL_FORMATTER.format(amount));
}

export function summarizeExpenses(records: readonly ExpenseRecord[]): ExpenseSummary {
  const totals = new Map<string, number>();
  let totalAmount = 0;

  for (const record of records) {
    const key = record.category;
    const nextTotal = (totals.get(key) ?? 0) + record.amount;
    totals.set(key, nextTotal);
    totalAmount += record.amount;
  }

  const totalsByCategory = Array.from(totals.entries()).map(([category, amount]) => ({
    category,
    amount: roundCurrency(amount),
  }));

  totalsByCategory.sort((a, b) => a.category.localeCompare(b.category));

  return {
    total: roundCurrency(totalAmount),
    totalsByCategory,
  };
}

export function buildExpenseReport(records: readonly ExpenseRecord[], filters: ExpenseFilters = {}): ExpenseReport {
  const filtered = filterExpenses(records, filters);
  return {
    entries: filtered,
    summary: summarizeExpenses(filtered),
  };
}

export function formatExpenseEntry(entry: ExpenseRecord): string {
  const date = entry.date.toISOString().slice(0, 10);
  const amount = TWO_DECIMAL_FORMATTER.format(entry.amount);
  return `${date} | ${entry.category} | ${amount}`;
}

export function formatExpenseReport(report: ExpenseReport): string {
  const lines: string[] = [];
  lines.push(`Total: ${TWO_DECIMAL_FORMATTER.format(report.summary.total)}`);
  if (report.summary.totalsByCategory.length > 0) {
    lines.push('By category:');
    for (const { category, amount } of report.summary.totalsByCategory) {
      lines.push(`- ${category}: ${TWO_DECIMAL_FORMATTER.format(amount)}`);
    }
  }

  if (report.entries.length > 0) {
    lines.push('Entries:');
    for (const entry of report.entries) {
      lines.push(`  ${formatExpenseEntry(entry)}`);
    }
  }

  return lines.join('\n');
}
