/**
 * Shared Expenses logic re-exported from core for UI consumption.
 * This allows the UI to import pure business logic without coupling to CLI specifics.
 */

export {
  buildExpenseReport,
  filterExpenses,
  formatExpenseReport,
  parseExpenses,
  summarizeExpenses,
} from '../../expenses/core.js';

export type {
  ExpenseFilters,
  ExpenseFormat,
  ExpenseRecord,
  ExpenseReport,
  ExpenseSummary,
  ExpenseSummaryEntry,
} from '../../expenses/core.js';
