import { useMemo } from 'react';

type CurrencyCode = string;

export interface RawExpenseRow {
  date: unknown;
  category: unknown;
  amount: unknown;
  currency?: CurrencyCode;
  /**
   * Original 1-indexed row number from the uploaded CSV.
   * Used to surface validation messages that align with the user's spreadsheet.
   */
  sourceRowNumber?: number;
}

export interface ExpenseIssue {
  rowNumber: number;
  message: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  monthNumber: number;
  monthName: string;
  category: string;
  amount: number;
  currency: CurrencyCode;
  sourceIndex: number;
}

export interface ExpenseFilters {
  month?: string | null;
  category?: string | null;
}

export interface ExpenseSummaryEntry {
  category: string;
  amount: number;
}

export interface ExpenseSummary {
  total: number;
  currency: CurrencyCode;
  totalsByCategory: ExpenseSummaryEntry[];
}

export interface ExpenseDataset {
  records: ExpenseRecord[];
  issues: ExpenseIssue[];
}

export interface ExpenseView {
  records: ExpenseRecord[];
  summary: ExpenseSummary;
}

const MONTH_LABELS: readonly string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const CURRENCY_FALLBACK: CurrencyCode = 'USD';

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: CURRENCY_FALLBACK,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Deterministic rounding to 2 decimal places.
 * Uses locale formatting to ensure consistent rounding behavior across platforms.
 * This matches the CLI's rounding policy.
 *
 * Examples:
 * - roundToCents(10.005) → 10.01
 * - roundToCents(39.845) → 39.85
 * - roundToCents(42.504) → 42.50
 */
export function roundToCents(value: number): number {
  return Number.parseFloat(
    value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    }),
  );
}

/**
 * Resolves the row number for error messages.
 * Uses sourceRowNumber if available, otherwise falls back to 1-indexed position.
 */
function resolveRowNumber(row: RawExpenseRow, index: number): number {
  if (typeof row.sourceRowNumber === 'number' && Number.isFinite(row.sourceRowNumber)) {
    return row.sourceRowNumber;
  }
  return index + 1;
}

function parseDate(
  input: unknown,
  rowNumber: number,
): { isoDate: string; monthNumber: number; monthName: string } {
  if (typeof input !== 'string') {
    throw new Error(`Row ${rowNumber}: date must be an ISO string.`);
  }

  const trimmed = input.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error(`Row ${rowNumber}: date must use YYYY-MM-DD format.`);
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Row ${rowNumber}: date is invalid.`);
  }

  const monthNumber = parsed.getUTCMonth() + 1;
  const monthName = MONTH_LABELS[monthNumber - 1];
  return { isoDate: trimmed, monthNumber, monthName };
}

function parseCategory(input: unknown, rowNumber: number): string {
  if (typeof input !== 'string') {
    throw new Error(`Row ${rowNumber}: category must be a string.`);
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new Error(`Row ${rowNumber}: category cannot be empty.`);
  }

  return trimmed;
}

function parseAmount(input: unknown, rowNumber: number): number {
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) {
      throw new Error(`Row ${rowNumber}: amount must be finite.`);
    }
    return input;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.length === 0) {
      throw new Error(`Row ${rowNumber}: amount cannot be empty.`);
    }
    const parsed = Number.parseFloat(trimmed);
    if (!Number.isFinite(parsed)) {
      throw new Error(`Row ${rowNumber}: amount must be numeric.`);
    }
    return parsed;
  }

  throw new Error(`Row ${rowNumber}: amount must be numeric.`);
}

function parseCurrency(input: CurrencyCode | undefined): CurrencyCode {
  if (!input) {
    return CURRENCY_FALLBACK;
  }
  const value = String(input).trim();
  return value.length > 0 ? value : CURRENCY_FALLBACK;
}

export function buildExpenseDataset(rows: readonly RawExpenseRow[]): ExpenseDataset {
  const issues: ExpenseIssue[] = [];
  const records: ExpenseRecord[] = [];

  rows.forEach((row, index) => {
    const rowNumber = resolveRowNumber(row, index);
    try {
      const { isoDate, monthNumber, monthName } = parseDate(row.date, rowNumber);
      const category = parseCategory(row.category, rowNumber);
      const amount = parseAmount(row.amount, rowNumber);
      const currency = parseCurrency(row.currency);
      records.push({
        id: `expense-${rowNumber}`,
        date: isoDate,
        monthNumber,
        monthName,
        category,
        amount,
        currency,
        sourceIndex: rowNumber,
      });
    } catch (error: unknown) {
      issues.push({ rowNumber, message: (error as Error).message });
    }
  });

  return { records, issues };
}

export const SAMPLE_EXPENSE_ROWS: readonly RawExpenseRow[] = [
  { date: '2025-01-05', category: 'Groceries', amount: 54.2, currency: 'USD' },
  { date: '2025-01-15', category: 'Transport', amount: 18.3, currency: 'USD' },
  { date: '2025-02-01', category: 'Groceries', amount: 42.1, currency: 'USD' },
  { date: '2025-02-07', category: 'Utilities', amount: 90.0, currency: 'USD' },
  { date: '2025-03-12', category: 'Entertainment', amount: 27.5, currency: 'USD' },
  { date: 'invalid-date', category: 'Groceries', amount: 10, currency: 'USD' },
  { date: '2025-02-22', category: '', amount: 11.25, currency: 'USD' },
];

export const defaultExpensesDataset = buildExpenseDataset(SAMPLE_EXPENSE_ROWS);

function normalizeFilterValue(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function filterExpenseRecords(records: readonly ExpenseRecord[], filters: ExpenseFilters = {}): ExpenseRecord[] {
  const monthFilter = normalizeFilterValue(filters.month);
  const categoryFilter = normalizeFilterValue(filters.category);

  return records.filter((record) => {
    const monthMatches = monthFilter ? record.monthName.toLowerCase() === monthFilter.toLowerCase() : true;
    const categoryMatches = categoryFilter
      ? record.category.toLowerCase() === categoryFilter.toLowerCase()
      : true;
    return monthMatches && categoryMatches;
  });
}

export function summarizeExpenses(records: readonly ExpenseRecord[]): ExpenseSummary {
  const currency = records[0]?.currency ?? CURRENCY_FALLBACK;

  // Use Map for efficient category lookup (case-insensitive)
  const categoryTotals = new Map<string, ExpenseSummaryEntry>();

  records.forEach((record) => {
    const key = record.category.toLowerCase();
    const existing = categoryTotals.get(key);
    if (existing) {
      existing.amount += record.amount;
      return;
    }
    categoryTotals.set(key, { category: record.category, amount: record.amount });
  });

  // Apply deterministic rounding and sort by category name
  const totalsByCategory = Array.from(categoryTotals.values())
    .map((entry) => ({
      category: entry.category,
      amount: roundToCents(entry.amount),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));

  // Calculate total with deterministic rounding
  const total = roundToCents(records.reduce((sum, record) => sum + record.amount, 0));

  return {
    total,
    currency,
    totalsByCategory,
  };
}

export function buildExpenseView(records: readonly ExpenseRecord[], filters: ExpenseFilters = {}): ExpenseView {
  const filtered = filterExpenseRecords(records, filters);
  return {
    records: filtered,
    summary: summarizeExpenses(filtered),
  };
}

export function formatCurrency(amount: number, currency: CurrencyCode = CURRENCY_FALLBACK): string {
  const formatter = currency === CURRENCY_FALLBACK
    ? CURRENCY_FORMATTER
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return formatter.format(roundToCents(amount));
}

export function getAvailableMonths(records: readonly ExpenseRecord[]): string[] {
  const unique = new Map<number, string>();
  records.forEach((record) => {
    if (!unique.has(record.monthNumber)) {
      unique.set(record.monthNumber, record.monthName);
    }
  });
  return Array.from(unique.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, label]) => label);
}

export function getAvailableCategories(records: readonly ExpenseRecord[]): string[] {
  const unique = new Set<string>();
  records.forEach((record) => {
    unique.add(record.category);
  });
  return Array.from(unique.values()).sort((a, b) => a.localeCompare(b));
}

export interface ExpenseSelectorOption {
  label: string;
  value: string | null;
}

export function buildMonthOptions(records: readonly ExpenseRecord[]): ExpenseSelectorOption[] {
  const months = getAvailableMonths(records);
  return [{ label: 'All months', value: null }, ...months.map((label) => ({ label, value: label }))];
}

export function buildCategoryOptions(records: readonly ExpenseRecord[]): ExpenseSelectorOption[] {
  const categories = getAvailableCategories(records);
  return [{ label: 'All categories', value: null }, ...categories.map((label) => ({ label, value: label }))];
}

export function useExpenseView(records: readonly ExpenseRecord[], filters: ExpenseFilters): ExpenseView {
  return useMemo(() => buildExpenseView(records, filters), [records, filters.month, filters.category]);
}

/**
 * Check if any filters are currently active
 */
export function hasActiveFilters(filters: ExpenseFilters): boolean {
  return Boolean(normalizeFilterValue(filters.month) || normalizeFilterValue(filters.category));
}
