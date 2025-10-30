import { normalizeMonth } from '../helpers/args.js';

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

export { normalizeMonth };

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
      throw new Error(`CSV row at index ${index} must have date, category, and amount.`);
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

function filterByMonth(records: ExpenseRecord[], month: number | null): ExpenseRecord[] {
  if (month === null) {
    return records;
  }
  return records.filter((record) => record.date.getUTCMonth() + 1 === month);
}

function filterByCategory(records: ExpenseRecord[], category: string | null): ExpenseRecord[] {
  if (!category) {
    return records;
  }
  const normalized = category.toLowerCase();
  return records.filter((record) => record.category.toLowerCase() === normalized);
}

export function filterExpenses(records: ExpenseRecord[], filters: ExpenseFilters = {}): ExpenseRecord[] {
  const month = filters.month !== undefined && filters.month !== null ? normalizeMonth(filters.month) : null;
  const category = filters.category ? String(filters.category).trim() : null;
  return filterByCategory(filterByMonth(records, month), category);
}

export function summarizeExpenses(records: ExpenseRecord[]): ExpenseSummary {
  const total = records.reduce((sum, record) => sum + record.amount, 0);
  const totalsByCategory = records.reduce<ExpenseSummaryEntry[]>((acc, record) => {
    const existing = acc.find((entry) => entry.category.toLowerCase() === record.category.toLowerCase());
    if (existing) {
      existing.amount += record.amount;
      return acc;
    }
    return [...acc, { category: record.category, amount: record.amount }];
  }, []);
  return { total, totalsByCategory };
}

export function buildExpenseReport(records: ExpenseRecord[], filters: ExpenseFilters = {}): ExpenseReport {
  const filtered = filterExpenses(records, filters);
  const total = filtered.reduce((sum, record) => sum + record.amount, 0);

  const totalsByCategory = filtered.reduce<ExpenseSummaryEntry[]>((acc, record) => {
    const existing = acc.find((entry) => entry.category.toLowerCase() === record.category.toLowerCase());
    if (existing) {
      existing.amount += record.amount;
      return acc;
    }
    return [...acc, { category: record.category, amount: record.amount }];
  }, []);

  return {
    entries: filtered,
    summary: {
      total,
      totalsByCategory,
    },
  };
}

function formatCurrency(value: number): string {
  return `$${TWO_DECIMAL_FORMATTER.format(value)}`;
}

export function formatExpenseReport(report: ExpenseReport): string {
  if (report.entries.length === 0) {
    return 'No expenses found.';
  }

  const lines: string[] = [];
  for (const record of report.entries) {
    lines.push(
      `${record.date.toISOString().slice(0, 10)} – ${record.category}: ${formatCurrency(record.amount)}`,
    );
  }

  lines.push('');
  lines.push('Summary:');
  lines.push(`  Total: ${formatCurrency(report.summary.total)}`);
  for (const entry of report.summary.totalsByCategory) {
    lines.push(`  ${entry.category}: ${formatCurrency(entry.amount)}`);
  }

  return lines.join('\n');
}
