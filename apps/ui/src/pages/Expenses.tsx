import { type ChangeEvent, type Dispatch, type SetStateAction, useMemo, useRef, useState } from 'react';
import CategorySelector from '../components/expenses/CategorySelector';
import MonthSelector from '../components/expenses/MonthSelector';
import TotalsSummary from '../components/expenses/TotalsSummary';
import {
  buildCategoryOptions,
  buildMonthOptions,
  formatCurrency,
  hasActiveFilters,
  type ExpenseDataset,
  type ExpenseFilters,
  type ExpenseRecord,
  useExpenseView,
} from '../lib/expenses/totals';
import { parseExpensesCsv, type ExpenseCsvParseResult, MIN_EXPENSE_ROWS, MAX_EXPENSE_ROWS } from '../lib/expenses/csv';

/**
 * Reads a CSV file as text.
 * Uses modern File.text() API with fallback to FileReader for older browsers.
 */
async function readCsvFile(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read file.'));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
        return;
      }
      resolve(String(result ?? ''));
    };
    reader.readAsText(file);
  });
}

/**
 * Custom hook for managing expense filters.
 */
function useExpenseFilters(): [
  ExpenseFilters,
  Dispatch<SetStateAction<string | null>>,
  Dispatch<SetStateAction<string | null>>,
  () => void,
] {
  const [month, setMonth] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const filters = useMemo<ExpenseFilters>(() => ({ month, category }), [month, category]);

  const clearFilters = () => {
    setMonth(null);
    setCategory(null);
  };

  return [filters, setMonth, setCategory, clearFilters];
}

const EMPTY_DATASET: ExpenseCsvParseResult = {
  dataset: { records: [], issues: [] },
  fatalErrors: [],
  dataRowCount: 0,
  validRowCount: 0,
};

/**
 * Expenses overview page with CSV import, filtering, and totals summary.
 * Mirrors CLI functionality with deterministic rounding and inline data quality notices.
 *
 * Features:
 * - RFC 4180 compliant CSV parsing (handles quoted fields)
 * - Automatic header detection
 * - Real-time validation with inline error messages
 * - Disabled filters until data is uploaded (better UX)
 * - Three-tier empty state messaging
 * - Focus management after upload
 * - Deterministic 2dp rounding consistent with CLI
 */
function Expenses(): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [result, setResult] = useState<ExpenseCsvParseResult>(EMPTY_DATASET);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [filters, setMonth, setCategory, clearFilters] = useExpenseFilters();

  const dataset = result.dataset;
  const records = dataset.records;
  const issues = dataset.issues;

  const monthOptions = useMemo(() => buildMonthOptions(records), [records]);
  const categoryOptions = useMemo(() => buildCategoryOptions(records), [records]);

  const view = useExpenseView(records, filters);
  const hasFilteredData = view.records.length > 0;
  const hasValidRecords = records.length > 0;
  const filtersActive = hasActiveFilters(filters);

  // Three-tier empty state messaging for better UX
  const emptySummaryMessage = !hasUploaded
    ? 'Upload a CSV file to see totals.'
    : hasValidRecords
      ? 'No expenses found for the selected filters.'
      : 'No valid expenses were imported from the CSV.';

  const showNoMatchesMessage = hasUploaded && hasValidRecords && !hasFilteredData;
  const showNoValidRecordsMessage = hasUploaded && !hasValidRecords;

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    setIsParsing(true);
    setUploadError(null);
    try {
      const text = await readCsvFile(file);
      const parsed = parseExpensesCsv(text);

      if (parsed.fatalErrors.length > 0) {
        setUploadError(parsed.fatalErrors.join(' '));
        setResult(EMPTY_DATASET);
        setFileName(null);
        // Don't set hasUploaded for fatal errors - let user try again
      } else {
        setResult(parsed);
        setFileName(file.name);
        setHasUploaded(true);
        clearFilters();
      }
    } catch (error: unknown) {
      setResult(EMPTY_DATASET);
      setFileName(null);
      setUploadError(`Unable to read CSV file: ${(error as Error).message}`);
      // Don't set hasUploaded for read errors - let user try again
    } finally {
      setIsParsing(false);
      input.value = ''; // Reset input to allow re-upload of same file

      // Focus management: return focus to input after upload
      setTimeout(() => {
        fileInputRef.current?.focus();
      }, 0);
    }
  };

  return (
    <div className="expenses-page" role="main">
      <header className="expenses-page__header">
        <h1 className="expenses-page__title" data-testid="expenses-title">
          Expenses overview
        </h1>
        <p className="expenses-page__subtitle">
          Upload a CSV ({MIN_EXPENSE_ROWS}–{MAX_EXPENSE_ROWS} rows) with <code>date, category, amount[, currency]</code>. Supports RFC
          4180 quoted fields. Totals use deterministic two-decimal rounding consistent with the CLI.
        </p>
      </header>

      <section className="expenses-upload" aria-label="Upload expenses CSV">
        <label htmlFor="expenses-csv" className="expenses-upload__label">
          Upload expenses CSV
        </label>
        <input
          ref={fileInputRef}
          id="expenses-csv"
          name="expensesCsv"
          type="file"
          accept=".csv,text/csv"
          className="expenses-upload__input"
          onChange={handleFileUpload}
          aria-describedby="expenses-upload-help"
        />
        <p id="expenses-upload-help" className="expenses-upload__help">
          Provide between {MIN_EXPENSE_ROWS} and {MAX_EXPENSE_ROWS} rows. Invalid rows remain listed under data quality
          notices so you can correct the original file. Quoted fields with commas are supported (e.g., "Groceries,
          organic").
        </p>
        {fileName && hasValidRecords && (
          <p className="expenses-upload__meta" data-testid="expenses-upload-meta">
            Loaded {result.validRowCount} valid {result.validRowCount === 1 ? 'row' : 'rows'} from {fileName}.
          </p>
        )}
        {uploadError && (
          <p className="expenses-upload__error" role="alert" data-testid="expenses-upload-error">
            {uploadError}
          </p>
        )}
        {isParsing && (
          <p className="expenses-upload__status" role="status">
            Parsing upload…
          </p>
        )}
      </section>

      {issues.length > 0 && (
        <section className="expenses-alert" role="status" data-testid="expenses-issues">
          <h2 className="expenses-alert__title">Data quality notices</h2>
          <ul className="expenses-alert__list">
            {issues.map((issue) => (
              <li key={`${issue.rowNumber}-${issue.message}`} className="expenses-alert__item">
                {issue.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="expenses-controls" aria-label="Expenses filters">
        <MonthSelector
          options={monthOptions}
          value={filters.month ?? null}
          onChange={setMonth}
          disabled={!hasValidRecords}
        />
        <CategorySelector
          options={categoryOptions}
          value={filters.category ?? null}
          onChange={setCategory}
          disabled={!hasValidRecords}
        />
        {filtersActive && hasValidRecords && (
          <button
            type="button"
            className="expenses-controls__clear-btn"
            onClick={clearFilters}
            aria-label="Clear all filters"
          >
            Clear filters
          </button>
        )}
      </section>

      {showNoMatchesMessage && (
        <div className="expenses-error" role="alert" data-testid="expenses-error">
          No expenses found for the selected filters. Try a different month or category.
        </div>
      )}

      {showNoValidRecordsMessage && (
        <div className="expenses-error" role="alert" data-testid="expenses-error">
          No valid expenses were imported from the CSV. Fix the issues above and upload again.
        </div>
      )}

      <TotalsSummary summary={view.summary} hasData={hasFilteredData} emptyMessage={emptySummaryMessage} />

      <section className="expenses-table" aria-label="Filtered expenses">
        <h2 className="expenses-table__title">Filtered entries</h2>
        <table className="expenses-table__table">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Category</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>{renderExpenseRows(view.records, hasUploaded, hasValidRecords)}</tbody>
        </table>
      </section>
    </div>
  );
}

function renderExpenseRows(
  records: readonly ExpenseRecord[],
  hasUploaded: boolean,
  hasValidRecords: boolean,
): JSX.Element {
  if (!hasUploaded) {
    return (
      <tr>
        <td colSpan={3} className="expenses-table__empty" data-testid="expenses-empty-row">
          Upload a CSV to view expenses.
        </td>
      </tr>
    );
  }

  if (!hasValidRecords) {
    return (
      <tr>
        <td colSpan={3} className="expenses-table__empty" data-testid="expenses-empty-row">
          No valid expenses were imported. Check the notices above and re-upload.
        </td>
      </tr>
    );
  }

  if (records.length === 0) {
    return (
      <tr>
        <td colSpan={3} className="expenses-table__empty" data-testid="expenses-empty-row">
          No expenses match the current filters.
        </td>
      </tr>
    );
  }

  return (
    <>
      {records.map((record) => (
        <tr key={record.id}>
          <td>{record.date}</td>
          <td>{record.category}</td>
          <td>{formatCurrency(record.amount, record.currency)}</td>
        </tr>
      ))}
    </>
  );
}

export default Expenses;
