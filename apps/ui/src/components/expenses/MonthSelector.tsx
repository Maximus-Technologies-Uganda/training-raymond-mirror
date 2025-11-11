import type { ChangeEvent } from 'react';
import type { ExpenseSelectorOption } from '../../lib/expenses/totals';

export interface MonthSelectorProps {
  options: readonly ExpenseSelectorOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

/**
 * Month filter selector component for expenses.
 * Provides accessible dropdown to filter expenses by month.
 */
function MonthSelector({ options, value, onChange, disabled = false }: MonthSelectorProps): JSX.Element {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value === '' ? null : event.target.value;
    onChange(nextValue);
  };

  return (
    <div className="expenses-filter">
      <label className="expenses-filter__label" htmlFor="month-filter">
        Month
      </label>
      <select
        id="month-filter"
        name="month"
        className="expenses-filter__select"
        value={value ?? ''}
        onChange={handleChange}
        aria-label="Filter expenses by month"
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option.label} value={option.value ?? ''}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default MonthSelector;
