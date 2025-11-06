/**
 * TodoFilters Component
 *
 * Provides filtering controls for the todo list:
 * - Filter by priority (all, high, medium, low)
 * - Filter to show only tasks due today
 *
 * @module components/todo/TodoFilters
 */

import { type ChangeEvent } from 'react';
import type { TodoPriority } from '@cli/shared/todo';

/**
 * Filter state for todo list display.
 */
export interface TodoFiltersState {
  /** Whether to show only tasks due today */
  showDueToday: boolean;
  /** Priority filter (all or specific priority) */
  priority: 'all' | TodoPriority;
}

/**
 * Props for the TodoFilters component.
 */
export interface TodoFiltersProps {
  /** Current filter state */
  filters: TodoFiltersState;
  /** Callback invoked when filters change */
  onChange(filters: TodoFiltersState): void;
}

/**
 * Available priority filter options with display labels.
 */
const PRIORITY_OPTIONS: Array<{ value: 'all' | TodoPriority; label: string }> = [
  { value: 'all', label: 'All priorities' },
  { value: 'high', label: 'High' },
  { value: 'med', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

/**
 * Filter controls for todo list display.
 * Updates are applied immediately as users interact with controls.
 *
 * @example
 * ```tsx
 * const [filters, setFilters] = useState<TodoFiltersState>({
 *   showDueToday: false,
 *   priority: 'all'
 * });
 *
 * <TodoFilters filters={filters} onChange={setFilters} />
 * ```
 */
function TodoFilters({ filters, onChange }: TodoFiltersProps): JSX.Element {
  const handleDueTodayChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, showDueToday: event.target.checked });
  };

  const handlePriorityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...filters,
      priority: event.target.value as 'all' | TodoPriority,
    });
  };

  return (
    <section className="todo-filters" aria-label="Task filters">
      <label className="todo-filters__checkbox">
        <input
          type="checkbox"
          checked={filters.showDueToday}
          onChange={handleDueTodayChange}
          aria-label="Show only tasks due today"
          data-testid="todo-filter-due-today"
        />
        <span>Show tasks due today</span>
      </label>

      <label className="todo-filters__select">
        <span className="todo-filters__label">Priority</span>
        <select
          value={filters.priority}
          onChange={handlePriorityChange}
          aria-label="Filter by priority level"
          data-testid="todo-filter-priority"
        >
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}

export default TodoFilters;
