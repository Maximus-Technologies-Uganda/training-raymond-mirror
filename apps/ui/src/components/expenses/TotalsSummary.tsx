import type { ExpenseSummary } from '../../lib/expenses/totals';
import { formatCurrency } from '../../lib/expenses/totals';

export interface TotalsSummaryProps {
  summary: ExpenseSummary;
  hasData: boolean;
  emptyMessage?: string;
}

/**
 * Displays expense totals and breakdown by category.
 * Shows empty state when no data matches the current filters.
 */
function TotalsSummary({ summary, hasData, emptyMessage }: TotalsSummaryProps): JSX.Element {
  if (!hasData) {
    return (
      <section className="expenses-summary" aria-live="polite" data-testid="expenses-empty-state">
        <h2 className="expenses-summary__title">Totals</h2>
        <p className="expenses-summary__empty">{emptyMessage ?? 'No expenses found for the selected filters.'}</p>
      </section>
    );
  }

  return (
    <section className="expenses-summary" aria-live="polite">
      <h2 className="expenses-summary__title">Totals</h2>
      <p className="expenses-summary__total" data-testid="expenses-total">
        Total:&nbsp;
        <strong>{formatCurrency(summary.total, summary.currency)}</strong>
      </p>
      <div className="expenses-summary__breakdown">
        <h3 className="expenses-summary__subtitle">By category</h3>
        <dl className="expenses-summary__list">
          {summary.totalsByCategory.map((entry) => (
            <div className="expenses-summary__item" key={entry.category}>
              <dt className="expenses-summary__item-label">{entry.category}</dt>
              <dd className="expenses-summary__item-value">
                {formatCurrency(entry.amount, summary.currency)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default TotalsSummary;
