/**
 * Shared Quote logic re-exported from core for UI consumption.
 * This allows the UI to import pure business logic without coupling to CLI specifics.
 */

export {
  filterQuotes,
  formatQuote,
  parseQuotes,
  selectQuote,
} from '../../quote/core.js';

export type {
  QuoteError,
  QuoteErrorReason,
  QuoteFilters,
  QuoteFormat,
  QuoteRecord,
  QuoteSelectionOptions,
} from '../../quote/core.js';
