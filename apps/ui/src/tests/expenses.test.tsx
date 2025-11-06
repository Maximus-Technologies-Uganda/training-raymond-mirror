import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Expenses from '../pages/Expenses';
import MonthSelector from '../components/expenses/MonthSelector';
import CategorySelector from '../components/expenses/CategorySelector';
import TotalsSummary from '../components/expenses/TotalsSummary';
import {
  buildExpenseView,
  defaultExpensesDataset,
  filterExpenseRecords,
  buildMonthOptions,
  buildCategoryOptions,
  hasActiveFilters,
  type ExpenseFilters,
  type ExpenseSelectorOption,
} from '../lib/expenses/totals';

const { records, issues } = defaultExpensesDataset;

describe('expenses totals logic', () => {
  interface Case {
    readonly name: string;
    readonly filters: ExpenseFilters;
    readonly expectedTotal: number;
    readonly expectedCategories: readonly string[];
  }

  const cases: readonly Case[] = [
    {
      name: 'all data',
      filters: {},
      expectedTotal: 232.1,
      expectedCategories: ['Entertainment', 'Groceries', 'Transport', 'Utilities'],
    },
    {
      name: 'filters by month',
      filters: { month: 'February' },
      expectedTotal: 132.1,
      expectedCategories: ['Groceries', 'Utilities'],
    },
    {
      name: 'filters by category',
      filters: { category: 'Groceries' },
      expectedTotal: 96.3,
      expectedCategories: ['Groceries'],
    },
    {
      name: 'no matches for month + category',
      filters: { month: 'January', category: 'Utilities' },
      expectedTotal: 0,
      expectedCategories: [],
    },
  ];

  test.each(cases)('buildExpenseView $name', ({ filters, expectedTotal, expectedCategories }) => {
    const view = buildExpenseView(records, filters);
    expect(view.summary.total).toBeCloseTo(expectedTotal, 2);
    expect(view.summary.totalsByCategory.map((entry) => entry.category)).toEqual(expectedCategories);
  });

  it('filters records consistently with summarize logic', () => {
    const filters: ExpenseFilters = { month: 'February', category: 'Utilities' };
    const filtered = filterExpenseRecords(records, filters);
    const view = buildExpenseView(records, filters);
    expect(filtered).toHaveLength(view.records.length);
    expect(filtered.map((record) => record.category)).toEqual(['Utilities']);
  });

  it('reports malformed rows', () => {
    expect(issues).toHaveLength(2);
    expect(issues[0].message).toMatch(/Row 6: date must use/);
    expect(issues[1].message).toMatch(/Row 7: category cannot be empty/);
  });

  it('hasActiveFilters returns true when filters are set', () => {
    expect(hasActiveFilters({ month: 'January' })).toBe(true);
    expect(hasActiveFilters({ category: 'Groceries' })).toBe(true);
    expect(hasActiveFilters({ month: 'January', category: 'Groceries' })).toBe(true);
  });

  it('hasActiveFilters returns false when no filters are set', () => {
    expect(hasActiveFilters({})).toBe(false);
    expect(hasActiveFilters({ month: null, category: null })).toBe(false);
    expect(hasActiveFilters({ month: '', category: '' })).toBe(false);
  });

  it('buildMonthOptions includes "All months" option', () => {
    const options = buildMonthOptions(records);
    expect(options[0]).toEqual({ label: 'All months', value: null });
    expect(options.length).toBeGreaterThan(1);
  });

  it('buildCategoryOptions includes "All categories" option', () => {
    const options = buildCategoryOptions(records);
    expect(options[0]).toEqual({ label: 'All categories', value: null });
    expect(options.length).toBeGreaterThan(1);
  });
});

describe('MonthSelector component', () => {
  const mockOptions: ExpenseSelectorOption[] = [
    { label: 'All months', value: null },
    { label: 'January', value: 'January' },
    { label: 'February', value: 'February' },
  ];

  it('renders all month options', () => {
    const mockOnChange = vi.fn();
    render(<MonthSelector options={mockOptions} value={null} onChange={mockOnChange} />);

    const select = screen.getByLabelText(/Filter expenses by month/i);
    const options = within(select).getAllByRole('option');

    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('All months');
    expect(options[1]).toHaveTextContent('January');
    expect(options[2]).toHaveTextContent('February');
  });

  it('calls onChange with selected value', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();

    render(<MonthSelector options={mockOptions} value={null} onChange={mockOnChange} />);

    const select = screen.getByLabelText(/Filter expenses by month/i);
    await user.selectOptions(select, 'February');

    expect(mockOnChange).toHaveBeenCalledWith('February');
  });

  it('calls onChange with null when "All months" is selected', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();

    render(<MonthSelector options={mockOptions} value="February" onChange={mockOnChange} />);

    const select = screen.getByLabelText(/Filter expenses by month/i);
    await user.selectOptions(select, '');

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });
});

describe('CategorySelector component', () => {
  const mockOptions: ExpenseSelectorOption[] = [
    { label: 'All categories', value: null },
    { label: 'Groceries', value: 'Groceries' },
    { label: 'Transport', value: 'Transport' },
  ];

  it('renders all category options', () => {
    const mockOnChange = vi.fn();
    render(<CategorySelector options={mockOptions} value={null} onChange={mockOnChange} />);

    const select = screen.getByLabelText(/Filter expenses by category/i);
    const options = within(select).getAllByRole('option');

    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('All categories');
    expect(options[1]).toHaveTextContent('Groceries');
    expect(options[2]).toHaveTextContent('Transport');
  });

  it('calls onChange with selected value', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();

    render(<CategorySelector options={mockOptions} value={null} onChange={mockOnChange} />);

    const select = screen.getByLabelText(/Filter expenses by category/i);
    await user.selectOptions(select, 'Groceries');

    expect(mockOnChange).toHaveBeenCalledWith('Groceries');
  });
});

describe('TotalsSummary component', () => {
  it('displays totals and breakdown when data exists', () => {
    const mockSummary = {
      total: 150.5,
      currency: 'USD',
      totalsByCategory: [
        { category: 'Groceries', amount: 100 },
        { category: 'Transport', amount: 50.5 },
      ],
    };

    render(<TotalsSummary summary={mockSummary} hasData={true} />);

    expect(screen.getByTestId('expenses-total')).toHaveTextContent(/Total:\s*\$150\.50/);
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(screen.getByText('$50.50')).toBeInTheDocument();
  });

  it('displays empty state when no data exists', () => {
    const mockSummary = {
      total: 0,
      currency: 'USD',
      totalsByCategory: [],
    };

    render(<TotalsSummary summary={mockSummary} hasData={false} />);

    expect(screen.getByTestId('expenses-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/No expenses found/i)).toBeInTheDocument();
  });
});

describe('Expenses page behaviour', () => {
  it('updates totals when filters change and shows inline errors', async () => {
    const user = userEvent.setup();
    render(<Expenses />);

    const monthSelect = screen.getByLabelText(/month/i);
    const categorySelect = screen.getByLabelText(/category/i);

    expect(screen.getByTestId('expenses-total')).toHaveTextContent(/Total:\s*\$232\.10/);
    expect(screen.queryByTestId('expenses-error')).toBeNull();

    await user.selectOptions(monthSelect, 'February');
    expect(screen.getByTestId('expenses-total')).toHaveTextContent(/Total:\s*\$132\.10/);

    await user.selectOptions(categorySelect, 'Utilities');
    expect(screen.getByTestId('expenses-total')).toHaveTextContent(/Total:\s*\$90\.00/);
    expect(screen.queryByTestId('expenses-error')).toBeNull();

    await user.selectOptions(monthSelect, 'January');
    expect(screen.getByTestId('expenses-empty-state')).toHaveTextContent('No expenses found');
    expect(screen.getByTestId('expenses-error')).toBeInTheDocument();
  });

  it('shows clear filters button when filters are active', async () => {
    const user = userEvent.setup();
    render(<Expenses />);

    // Initially no clear button
    expect(screen.queryByRole('button', { name: /Clear all filters/i })).toBeNull();

    // Select a month filter
    const monthSelect = screen.getByLabelText(/month/i);
    await user.selectOptions(monthSelect, 'February');

    // Clear button should appear - wait for it
    const clearButton = await screen.findByRole('button', { name: /Clear all filters/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('clears filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<Expenses />);

    // Set filters
    const monthSelect = screen.getByLabelText(/month/i) as HTMLSelectElement;
    const categorySelect = screen.getByLabelText(/category/i) as HTMLSelectElement;

    await user.selectOptions(monthSelect, 'February');
    await user.selectOptions(categorySelect, 'Groceries');

    expect(monthSelect.value).toBe('February');
    expect(categorySelect.value).toBe('Groceries');

    // Click clear button - wait for it to appear
    const clearButton = await screen.findByRole('button', { name: /Clear all filters/i });
    await user.click(clearButton);

    // Filters should be reset
    expect(monthSelect.value).toBe('');
    expect(categorySelect.value).toBe('');

    // Clear button should disappear
    expect(screen.queryByRole('button', { name: /Clear all filters/i })).toBeNull();
  });

  it('displays data quality notices for malformed rows', () => {
    render(<Expenses />);

    const noticesSection = screen.getByTestId('expenses-issues');
    expect(noticesSection).toBeInTheDocument();
    expect(within(noticesSection).getByText(/Data quality notices/i)).toBeInTheDocument();
  });
});
