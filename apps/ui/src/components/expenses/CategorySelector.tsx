import type { ChangeEvent } from 'react';
import type { ExpenseSelectorOption } from '../../lib/expenses/totals';

export interface CategorySelectorProps {
  options: readonly ExpenseSelectorOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

/**
 * Category filter selector component for expenses.
 * Provides accessible dropdown to filter expenses by category.
 */
function CategorySelector({ options, value, onChange, disabled = false }: CategorySelectorProps): JSX.Element {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value === '' ? null : event.target.value;
    onChange(nextValue);
  };

  return (
    <div className="expenses-filter">
      <label className="expenses-filter__label" htmlFor="category-filter">
        Category
      </label>
      <select
        id="category-filter"
        name="category"
        className="expenses-filter__select"
        value={value ?? ''}
        onChange={handleChange}
        aria-label="Filter expenses by category"
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

export default CategorySelector;
