import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Expenses from '../pages/Expenses';
import MonthSelector from '../components/expenses/MonthSelector';
import CategorySelector from '../components/expenses/CategorySelector';
import TotalsSummary from '../components/expenses/TotalsSummary';
import {
  buildExpenseView,
  buildMonthOptions,
  buildCategoryOptions,
  filterExpenseRecords,
  formatCurrency,
  hasActiveFilters,
  roundToCents,
  summarizeExpenses,
  type ExpenseFilters,
  type ExpenseSelectorOption,
} from '../lib/expenses/totals';
import { parseExpensesCsv, MIN_EXPENSE_ROWS, MAX_EXPENSE_ROWS } from '../lib/expenses/csv';

// Sample CSV with realistic data including edge cases
const SAMPLE_CSV = `date,category,amount,currency
2025-01-05,Groceries,54.2,USD
2025-01-15,Transport,18.3,USD
2025-02-01,Groceries,42.1,USD
2025-02-07,Utilities,90,USD
2025-03-12,Entertainment,27.5,USD
2025-03-14,Café,12.345,USD
2025-02-15,Travel,10.005,USD
invalid-date,Groceries,10,USD
2025-02-22,,11.25,USD`;

// CSV with RFC 4180 quoted fields (commas, quotes, special chars)
const QUOTED_CSV = `date,category,amount,currency
2025-01-01,"Groceries, organic",42.50,USD
2025-01-02,"O'Reilly Books",29.99,USD
2025-01-03,Normal,10.00,USD
2025-01-04,"Value with ""quotes""",15.00,USD
2025-01-05,"Café & Restaurant",25.00,USD`;

// Minimal valid CSV without header
const MINIMAL_CSV = `2025-01-01,Groceries,10
2025-01-02,Groceries,20
2025-01-03,Utilities,30
2025-01-04,Travel,40
2025-01-05,Café,50`;

describe('CSV Parser with RFC 4180 compliance', () => {
  it('parses valid CSV with header and tracks row numbers correctly', () => {
    const result = parseExpensesCsv(SAMPLE_CSV);

    expect(result.fatalErrors).toEqual([]);
    expect(result.dataRowCount).toBe(9);
    expect(result.validRowCount).toBe(7);
    expect(result.dataset.records).toHaveLength(7);
    expect(result.dataset.issues).toHaveLength(2);

    // Verify first record
    expect(result.dataset.records[0]).toMatchObject({
      date: '2025-01-05',
      category: 'Groceries',
      amount: 54.2,
      currency: 'USD',
    });

    // Verify non-ASCII support
    expect(result.dataset.records.some((record) => record.category === 'Café')).toBe(true);

    // Verify row numbers in error messages match CSV line numbers (header is row 1, data starts at row 2)
    expect(result.dataset.issues[0].message).toMatch(/Row 9: date must use YYYY-MM-DD format\./);
    expect(result.dataset.issues[1].message).toMatch(/Row 10: category cannot be empty\./);
  });

  it('handles RFC 4180 quoted fields with commas and special characters', () => {
    const result = parseExpensesCsv(QUOTED_CSV);

    expect(result.fatalErrors).toEqual([]);
    expect(result.validRowCount).toBe(5);
    expect(result.dataset.records).toHaveLength(5);
    expect(result.dataset.issues).toHaveLength(0);

    // Verify quoted field with comma
    expect(result.dataset.records[0].category).toBe('Groceries, organic');

    // Verify quoted field with apostrophe
    expect(result.dataset.records[1].category).toBe("O'Reilly Books");

    // Verify normal unquoted field still works
    expect(result.dataset.records[2].category).toBe('Normal');

    // Verify escaped quotes
    expect(result.dataset.records[3].category).toBe('Value with "quotes"');

    // Verify non-ASCII with special char
    expect(result.dataset.records[4].category).toBe('Café & Restaurant');
  });

  it('parses CSV without header line (automatic detection)', () => {
    const result = parseExpensesCsv(MINIMAL_CSV);

    expect(result.fatalErrors).toEqual([]);
    expect(result.validRowCount).toBe(5);
    expect(result.dataset.records).toHaveLength(5);
    expect(result.dataset.issues).toHaveLength(0);

    // Verify data parsed correctly
    expect(result.dataset.records[0]).toMatchObject({
      date: '2025-01-01',
      category: 'Groceries',
      amount: 10,
    });

    // Verify non-ASCII category
    expect(result.dataset.records[4].category).toBe('Café');
  });

  it('rejects CSV with fewer than 5 rows', () => {
    const tooSmall = MINIMAL_CSV.split('\n').slice(0, 3).join('\n');
    const result = parseExpensesCsv(tooSmall);

    expect(result.fatalErrors).toHaveLength(1);
    expect(result.fatalErrors[0]).toMatch(/between 5 and 200 data rows/);
    expect(result.validRowCount).toBe(0);
  });

  it('rejects CSV with more than 200 rows', () => {
    const rows = Array.from({ length: 201 }, (_, index) => `2025-01-01,Item ${index + 1},1`);
    const csv = `date,category,amount\n${rows.join('\n')}`;
    const result = parseExpensesCsv(csv);

    expect(result.fatalErrors).toHaveLength(1);
    expect(result.fatalErrors[0]).toMatch(/between 5 and 200 data rows/);
    expect(result.validRowCount).toBe(0);
  });

  it('rejects empty CSV', () => {
    const result = parseExpensesCsv('');

    expect(result.fatalErrors).toHaveLength(1);
    expect(result.fatalErrors[0]).toMatch(/CSV file is empty/);
  });

  it('works without header when columns are in order', () => {
    // Without header, parser assumes date, category, amount order
    const noHeader = `2025-01-01,Groceries,10\n2025-01-02,Transport,20\n2025-01-03,Food,30\n2025-01-04,Travel,40\n2025-01-05,Utilities,50`;
    const result = parseExpensesCsv(noHeader);

    expect(result.fatalErrors).toHaveLength(0);
    expect(result.validRowCount).toBe(5);
  });
});

describe('Deterministic rounding and totals', () => {
  it('applies deterministic 2dp rounding consistently', () => {
    const { dataset } = parseExpensesCsv(SAMPLE_CSV);
    const summary = summarizeExpenses(dataset.records);

    // Total should be deterministically rounded
    expect(summary.total).toBe(254.45);

    // Category totals should be rounded
    const categories = summary.totalsByCategory.reduce<Record<string, number>>(
      (acc, entry) => ({ ...acc, [entry.category]: entry.amount }),
      {},
    );

    expect(categories.Groceries).toBe(96.3);
    expect(categories.Travel).toBe(10.01); // 10.005 rounds to 10.01
    expect(categories.Café).toBe(12.35); // 12.345 rounds to 12.35
  });

  it('roundToCents function works correctly for edge cases', () => {
    expect(roundToCents(10.005)).toBe(10.01);
    expect(roundToCents(10.004)).toBe(10.00);
    expect(roundToCents(39.845)).toBe(39.85);
    expect(roundToCents(42.504)).toBe(42.50);
    expect(roundToCents(0.555)).toBe(0.56);
  });

  it('formatCurrency applies rounding', () => {
    expect(formatCurrency(10.005)).toBe('$10.01');
    expect(formatCurrency(39.845)).toBe('$39.85');
    expect(formatCurrency(100)).toBe('$100.00');
  });
});

describe('Filtering and view logic', () => {
  it('builds consistent views with filters', () => {
    const { dataset } = parseExpensesCsv(SAMPLE_CSV);
    const filters: ExpenseFilters = { month: 'February', category: 'Travel' };
    const filtered = filterExpenseRecords(dataset.records, filters);
    const view = buildExpenseView(dataset.records, filters);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].category).toBe('Travel');
    expect(view.summary.total).toBe(10.01);
  });

  it('hasActiveFilters detects filter state correctly', () => {
    expect(hasActiveFilters({ month: 'January' })).toBe(true);
    expect(hasActiveFilters({ category: 'Groceries' })).toBe(true);
    expect(hasActiveFilters({ month: 'January', category: 'Groceries' })).toBe(true);
    expect(hasActiveFilters({})).toBe(false);
    expect(hasActiveFilters({ month: null, category: null })).toBe(false);
    expect(hasActiveFilters({ month: '', category: '' })).toBe(false);
  });

  it('builds selector options including non-ASCII categories', () => {
    const { dataset } = parseExpensesCsv(SAMPLE_CSV);
    const monthOptions = buildMonthOptions(dataset.records);
    const categoryOptions = buildCategoryOptions(dataset.records);

    expect(monthOptions.map((option) => option.label)).toContain('February');
    expect(categoryOptions.map((option) => option.label)).toContain('Café');
  });
});

describe('MonthSelector component', () => {
  const mockOptions: ExpenseSelectorOption[] = [
    { label: 'All months', value: null },
    { label: 'January', value: 'January' },
    { label: 'February', value: 'February' },
  ];

  it('renders all month options and supports disabling', () => {
    const mockOnChange = vi.fn();
    render(<MonthSelector options={mockOptions} value={null} onChange={mockOnChange} disabled />);

    const select = screen.getByLabelText(/filter expenses by month/i) as HTMLSelectElement;
    expect(select.disabled).toBe(true);

    const options = within(select).getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('All months');
    expect(options[1]).toHaveTextContent('January');
  });

  it('calls onChange with selected value', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();
    render(<MonthSelector options={mockOptions} value={null} onChange={mockOnChange} />);

    const select = screen.getByLabelText(/filter expenses by month/i);
    await user.selectOptions(select, 'February');

    expect(mockOnChange).toHaveBeenCalledWith('February');
  });

  it('calls onChange with null when "All months" is selected', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();
    render(<MonthSelector options={mockOptions} value="February" onChange={mockOnChange} />);

    const select = screen.getByLabelText(/filter expenses by month/i);
    await user.selectOptions(select, '');

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });
});

describe('CategorySelector component', () => {
  const mockOptions: ExpenseSelectorOption[] = [
    { label: 'All categories', value: null },
    { label: 'Groceries', value: 'Groceries' },
    { label: 'Café', value: 'Café' },
  ];

  it('renders all category options including non-ASCII and supports disabling', () => {
    const mockOnChange = vi.fn();
    render(<CategorySelector options={mockOptions} value={null} onChange={mockOnChange} disabled />);

    const select = screen.getByLabelText(/filter expenses by category/i) as HTMLSelectElement;
    expect(select.disabled).toBe(true);

    const options = within(select).getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('All categories');
    expect(options[1]).toHaveTextContent('Groceries');
    expect(options[2]).toHaveTextContent('Café');
  });

  it('calls onChange with selected value', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();
    render(<CategorySelector options={mockOptions} value={null} onChange={mockOnChange} />);

    const select = screen.getByLabelText(/filter expenses by category/i);
    await user.selectOptions(select, 'Groceries');

    expect(mockOnChange).toHaveBeenCalledWith('Groceries');
  });
});

describe('TotalsSummary component', () => {
  it('displays totals and breakdown with rounded amounts', () => {
    const mockSummary = {
      total: 150.55,
      currency: 'USD',
      totalsByCategory: [
        { category: 'Groceries', amount: 100.004 },
        { category: 'Transport', amount: 50.546 },
      ],
    };

    render(<TotalsSummary summary={mockSummary} hasData={true} />);

    expect(screen.getByTestId('expenses-total')).toHaveTextContent(/Total:\s*\$150\.55/);
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(screen.getByText('$50.55')).toBeInTheDocument();
  });

  it('displays custom empty state message', () => {
    const mockSummary = {
      total: 0,
      currency: 'USD',
      totalsByCategory: [],
    };

    render(<TotalsSummary summary={mockSummary} hasData={false} emptyMessage="Upload a CSV to begin." />);

    expect(screen.getByTestId('expenses-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/Upload a CSV to begin\./i)).toBeInTheDocument();
  });
});

describe('Expenses page with CSV upload', () => {
  const createCsvFile = (content: string, name = 'expenses.csv') => new File([content], name, { type: 'text/csv' });

  it('starts with disabled filters until upload', () => {
    render(<Expenses />);

    expect(screen.getByLabelText(/filter expenses by month/i)).toBeDisabled();
    expect(screen.getByLabelText(/filter expenses by category/i)).toBeDisabled();
    expect(screen.getByTestId('expenses-empty-row')).toHaveTextContent(/Upload a CSV to view expenses/i);
    expect(screen.getByTestId('expenses-empty-state')).toHaveTextContent(/Upload a CSV file to see totals/i);
  });

  it('uploads CSV, displays data with inline issues, and enables filters', async () => {
    const user = userEvent.setup();
    render(<Expenses />);

    const fileInput = screen.getByLabelText(/upload expenses csv/i, { selector: 'input' });
    await user.upload(fileInput, createCsvFile(SAMPLE_CSV, 'sample.csv'));

    // Wait for upload to complete
    expect(await screen.findByTestId('expenses-upload-meta')).toHaveTextContent('Loaded 7 valid rows from sample.csv');
    expect(screen.getByTestId('expenses-total')).toHaveTextContent(/Total:\s*\$254\.45/);

    // Verify filters are enabled
    expect(screen.getByLabelText(/filter expenses by month/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/filter expenses by category/i)).not.toBeDisabled();

    // Verify data quality issues are displayed
    const issues = screen.getByTestId('expenses-issues');
    expect(issues).toBeInTheDocument();
    expect(within(issues).getAllByRole('listitem')).toHaveLength(2);
    expect(within(issues).getByText(/Row 9/)).toBeInTheDocument();
    expect(within(issues).getByText(/Row 10/)).toBeInTheDocument();
  });

  it('uploads CSV with quoted fields correctly', async () => {
    const user = userEvent.setup();
    render(<Expenses />);

    const fileInput = screen.getByLabelText(/upload expenses csv/i, { selector: 'input' });
    await user.upload(fileInput, createCsvFile(QUOTED_CSV, 'quoted.csv'));

    expect(await screen.findByTestId('expenses-upload-meta')).toHaveTextContent('Loaded 5 valid rows from quoted.csv');
    expect(screen.getByTestId('expenses-total')).toHaveTextContent(/Total:\s*\$122\.49/);

    // Verify no issues (all quoted fields parsed correctly)
    expect(screen.queryByTestId('expenses-issues')).not.toBeInTheDocument();
  });

  it('filters totals after upload and shows proper error messages', async () => {
    const user = userEvent.setup();
    render(<Expenses />);

    const fileInput = screen.getByLabelText(/upload expenses csv/i, { selector: 'input' });
    await user.upload(fileInput, createCsvFile(SAMPLE_CSV));

    await waitFor(() => {
      expect(screen.getByTestId('expenses-total')).toHaveTextContent(/Total:\s*\$254\.45/);
    });

    const monthSelect = screen.getByLabelText(/month/i);
    const categorySelect = screen.getByLabelText(/category/i);

    // Apply month filter
    await user.selectOptions(monthSelect, 'February');
    expect(screen.getByTestId('expenses-total')).toHaveTextContent(/Total:\s*\$142\.11/);

    // Apply category filter
    await user.selectOptions(categorySelect, 'Groceries');
    expect(screen.getByTestId('expenses-total')).toHaveTextContent(/Total:\s*\$42\.10/);

    // Filter with no matches
    await user.selectOptions(monthSelect, 'March');
    await user.selectOptions(categorySelect, 'Utilities');
    expect(screen.getByTestId('expenses-error')).toHaveTextContent(/No expenses found for the selected filters/);
    expect(screen.getByTestId('expenses-empty-row')).toHaveTextContent(/No expenses match the current filters/);
  });

  it('clears filters after applying them', async () => {
    const user = userEvent.setup();
    render(<Expenses />);

    const fileInput = screen.getByLabelText(/upload expenses csv/i, { selector: 'input' });
    await user.upload(fileInput, createCsvFile(SAMPLE_CSV));

    await waitFor(() => {
      expect(screen.getByTestId('expenses-total')).toHaveTextContent(/Total:\s*\$254\.45/);
    });

    const monthSelect = screen.getByLabelText(/month/i) as HTMLSelectElement;
    const categorySelect = screen.getByLabelText(/category/i) as HTMLSelectElement;

    await user.selectOptions(monthSelect, 'February');
    await user.selectOptions(categorySelect, 'Travel');

    const clearButton = await screen.findByRole('button', { name: /Clear all filters/i });
    await user.click(clearButton);

    expect(monthSelect.value).toBe('');
    expect(categorySelect.value).toBe('');
    expect(screen.queryByRole('button', { name: /Clear all filters/i })).not.toBeInTheDocument();
  });

  it('shows upload error for out-of-bounds files', async () => {
    const user = userEvent.setup();
    render(<Expenses />);

    const fileInput = screen.getByLabelText(/upload expenses csv/i, { selector: 'input' });
    const invalidFile = createCsvFile('date,category,amount\n2025-01-01,Only,1\n2025-01-02,Two,2');
    await user.upload(fileInput, invalidFile);

    expect(await screen.findByTestId('expenses-upload-error')).toHaveTextContent(/between 5 and 200 data rows/);
    // After failed upload with fatal error, empty row shows different message
    expect(screen.getByTestId('expenses-empty-row')).toHaveTextContent(/Upload a CSV to view expenses/i);
    expect(screen.getByLabelText(/filter expenses by month/i)).toBeDisabled();
  });

  it('shows error when no valid records are imported', async () => {
    const user = userEvent.setup();
    render(<Expenses />);

    const allInvalidCsv = `date,category,amount
invalid-date,Cat1,10
invalid-date,Cat2,20
invalid-date,Cat3,30
invalid-date,Cat4,40
invalid-date,Cat5,50`;

    const fileInput = screen.getByLabelText(/upload expenses csv/i, { selector: 'input' });
    await user.upload(fileInput, createCsvFile(allInvalidCsv));

    await waitFor(() => {
      expect(screen.getByTestId('expenses-error')).toHaveTextContent(/No valid expenses were imported/);
    });

    expect(screen.getByTestId('expenses-empty-row')).toHaveTextContent(/No valid expenses were imported/);
  });
});
