import { buildExpenseDataset, type ExpenseDataset, type RawExpenseRow } from './totals';

/**
 * CSV parser for expense data with RFC 4180 compliance.
 * Supports quoted fields, escaped quotes, and flexible header detection.
 */

export const MIN_EXPENSE_ROWS = 5;
export const MAX_EXPENSE_ROWS = 200;

export interface ExpenseCsvParseResult {
  dataset: ExpenseDataset;
  fatalErrors: string[];
  dataRowCount: number;
  validRowCount: number;
}

const REQUIRED_HEADERS = ['date', 'category', 'amount'] as const;
const OPTIONAL_HEADERS = ['currency'] as const;

type NormalizedHeader = (typeof REQUIRED_HEADERS)[number] | (typeof OPTIONAL_HEADERS)[number];

/**
 * Splits a CSV line respecting RFC 4180 quoted fields.
 * Handles:
 * - Quoted fields with commas: "Smith, John"
 * - Escaped quotes: "He said ""Hello"""
 * - Mixed quoted/unquoted: 2025-01-01,"Groceries, organic",42.50
 */
function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    // Handle quotes
    if (character === '"') {
      // Check for escaped quote ("")
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
      continue;
    }

    // Handle comma (field separator) only outside quotes
    if (character === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    // Accumulate character
    current += character;
  }

  // Push final field
  values.push(current);

  // Remove trailing \r (Windows line endings)
  return values.map((value) => value.replace(/\r$/, '').trim());
}

/**
 * Normalizes header name for comparison.
 */
function normalizeHeader(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Detects if a line appears to be a CSV header.
 */
function detectHeader(line: string): boolean {
  const normalized = line.toLowerCase();
  return normalized.includes('date') && normalized.includes('category') && normalized.includes('amount');
}

/**
 * Creates a map of normalized header names to column indices.
 */
function deriveHeaderMap(cells: readonly string[]): Map<NormalizedHeader, number> {
  const map = new Map<NormalizedHeader, number>();

  cells.forEach((cell, index) => {
    const normalized = normalizeHeader(cell) as NormalizedHeader;
    if (
      REQUIRED_HEADERS.includes(normalized as (typeof REQUIRED_HEADERS)[number]) ||
      OPTIONAL_HEADERS.includes(normalized as (typeof OPTIONAL_HEADERS)[number])
    ) {
      if (!map.has(normalized)) {
        map.set(normalized, index);
      }
    }
  });

  return map;
}

/**
 * Validates that all required headers are present.
 */
function validateHeaders(map: Map<NormalizedHeader, number>): string[] {
  const missing = REQUIRED_HEADERS.filter((header) => !map.has(header));
  if (missing.length === 0) {
    return [];
  }
  return [`CSV header missing required columns: ${missing.join(', ')}.`];
}

/**
 * Parses CSV content into expense data.
 *
 * Features:
 * - RFC 4180 compliant (handles quoted fields with commas)
 * - Automatic header detection (optional)
 * - Validates 5-200 row bounds
 * - Collects row-level validation issues
 * - Supports non-ASCII characters (café, naïve, etc.)
 *
 * @param contents - Raw CSV file contents
 * @returns Parse result with dataset, fatal errors, and row counts
 */
export function parseExpensesCsv(contents: string): ExpenseCsvParseResult {
  const trimmed = contents.trim();
  if (trimmed.length === 0) {
    return {
      dataset: { records: [], issues: [] },
      fatalErrors: ['CSV file is empty. Provide header and at least 5 data rows.'],
      dataRowCount: 0,
      validRowCount: 0,
    };
  }

  // Split into non-empty lines
  const rawLines = contents
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  if (rawLines.length === 0) {
    return {
      dataset: { records: [], issues: [] },
      fatalErrors: ['CSV file is empty. Provide header and at least 5 data rows.'],
      dataRowCount: 0,
      validRowCount: 0,
    };
  }

  // Detect header
  const [firstLine, ...rest] = rawLines;
  const hasHeader = detectHeader(firstLine);
  const dataLines = hasHeader ? rest : rawLines;
  const dataRowCount = dataLines.length;

  // Validate row count bounds
  if (dataRowCount < MIN_EXPENSE_ROWS || dataRowCount > MAX_EXPENSE_ROWS) {
    return {
      dataset: { records: [], issues: [] },
      fatalErrors: [
        `CSV must contain between ${MIN_EXPENSE_ROWS} and ${MAX_EXPENSE_ROWS} data rows (found ${dataRowCount}).`,
      ],
      dataRowCount,
      validRowCount: 0,
    };
  }

  let headerMap: Map<NormalizedHeader, number>;
  let rowOffset: number;

  if (hasHeader) {
    // Parse header line
    const headerCells = splitCsvLine(firstLine);
    headerMap = deriveHeaderMap(headerCells);

    // Validate required headers
    const headerErrors = validateHeaders(headerMap);
    if (headerErrors.length > 0) {
      return {
        dataset: { records: [], issues: [] },
        fatalErrors: headerErrors,
        dataRowCount,
        validRowCount: 0,
      };
    }

    rowOffset = 2; // Line 1 is header, data starts at line 2
  } else {
    // No header: assume date,category,amount[,currency] order
    headerMap = new Map([
      ['date', 0],
      ['category', 1],
      ['amount', 2],
      ['currency', 3],
    ]);
    rowOffset = 1; // Data starts at line 1
  }

  // Helper to get column index
  const columnFor = (header: NormalizedHeader): number | undefined => headerMap.get(header);

  // Parse data rows
  const rawRows: RawExpenseRow[] = dataLines.map((line, index) => {
    const cells = splitCsvLine(line);
    const lookup = (header: NormalizedHeader) => {
      const columnIndex = columnFor(header);
      return typeof columnIndex === 'number' ? cells[columnIndex] ?? '' : '';
    };

    return {
      date: lookup('date'),
      category: lookup('category'),
      amount: lookup('amount'),
      currency: columnFor('currency') !== undefined ? lookup('currency') : undefined,
      sourceRowNumber: rowOffset + index,
    };
  });

  // Build dataset (validates each row)
  const dataset = buildExpenseDataset(rawRows);

  return {
    dataset,
    fatalErrors: [],
    dataRowCount,
    validRowCount: dataset.records.length,
  };
}
