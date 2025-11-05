import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import CategorySelector from '../components/expenses/CategorySelector';
import MonthSelector from '../components/expenses/MonthSelector';
import TotalsSummary from '../components/expenses/TotalsSummary';
import {
  buildCategoryOptions,
  buildMonthOptions,
  defaultExpensesDataset,
  formatCurrency,
  hasActiveFilters,
  type ExpenseFilters,
  type ExpenseRecord,
  useExpenseView,
} from '../lib/expenses/totals';

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

/**
 * Expenses overview page with filtering capabilities.
 * Mirrors CLI functionality with enhanced UX including clear filters button.
 */
function Expenses(): JSX.Element {
  const { records, issues } = defaultExpensesDataset;
  const [filters, setMonth, setCategory, clearFilters] = useExpenseFilters();

  const monthOptions = useMemo(() => buildMonthOptions(records), [records]);
  const categoryOptions = useMemo(() => buildCategoryOptions(records), [records]);

  const view = useExpenseView(records, filters);
  const hasData = view.records.length > 0;
  const filtersActive = hasActiveFilters(filters);

  return (
    <div className="expenses-page" role="main">
      <header className="expenses-page__header">
        <h1 className="expenses-page__title" data-testid="expenses-title">
          Expenses overview
        </h1>
        <p className="expenses-page__subtitle">
          Filter by month and category to mirror the CLI summary output. Totals update instantly.
        </p>
      </header>

      {issues.length > 0 && (
        <section className="expenses-alert" role="status" data-testid="expenses-issues">
          <h2 className="expenses-alert__title">Data quality notices</h2>
          <ul className="expenses-alert__list">
            {issues.map((issue) => (
              <li key={issue.index} className="expenses-alert__item">
                {issue.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="expenses-controls" aria-label="Expenses filters">
        <MonthSelector options={monthOptions} value={filters.month ?? null} onChange={setMonth} />
        <CategorySelector options={categoryOptions} value={filters.category ?? null} onChange={setCategory} />
        {filtersActive && (
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

      {!hasData && (
        <div className="expenses-error" role="alert" data-testid="expenses-error">
          No expenses found for the selected filters. Try a different month or category.
        </div>
      )}

      <TotalsSummary summary={view.summary} hasData={hasData} />

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
          <tbody>
            {renderExpenseRows(view.records)}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function renderExpenseRows(records: readonly ExpenseRecord[]): JSX.Element {
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
