import { ExpensesPlaceholder } from '../components/index.js';

/**
 * Expenses page for tracking spending summaries that mirror the CLI.
 * This page will eventually provide filtering by month/category and display totals.
 */
export function ExpensesPage(): JSX.Element {
  return (
    <section aria-labelledby="expenses-heading" className="page">
      <header className="page-header">
        <h2 id="expenses-heading">Expenses</h2>
        <p>
          Track spending summaries that mirror the CLI. This placeholder confirms routing structure
          before detailed UI work begins.
        </p>
      </header>
      <ExpensesPlaceholder />
    </section>
  );
}
