/**
 * TodoAddForm Component
 *
 * Form for adding new todo items with title, priority, and optional due date.
 * Implements accessibility best practices including:
 * - Proper label associations
 * - Keyboard navigation
 * - ARIA attributes
 * - Focus management
 *
 * @module components/todo/TodoAddForm
 */

import { type FormEvent, useState } from 'react';
import type { TodoPriority } from '@cli/shared/todo';

/**
 * Input values for creating a new todo item.
 */
export interface TodoAddFormValues {
  title: string;
  priority: TodoPriority;
  dueDate?: string;
}

/**
 * Props for the TodoAddForm component.
 */
export interface TodoAddFormProps {
  /** Callback invoked on form submission. Returns true if successful. */
  onSubmit(values: TodoAddFormValues): boolean;
}

/**
 * Priority options with human-readable labels.
 */
const PRIORITY_OPTIONS: Array<{ value: TodoPriority; label: string }> = [
  { value: 'high', label: 'High' },
  { value: 'med', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

/**
 * Form component for adding new todo items.
 * Automatically resets form fields on successful submission.
 *
 * @example
 * ```tsx
 * <TodoAddForm
 *   onSubmit={(values) => {
 *     console.log('Adding todo:', values);
 *     return true; // Success
 *   }}
 * />
 * ```
 */
function TodoAddForm({ onSubmit }: TodoAddFormProps): JSX.Element {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('med');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const success = onSubmit({
      title,
      priority,
      dueDate: dueDate || undefined,
    });

    if (success) {
      // Reset form to default state
      setTitle('');
      setPriority('med');
      setDueDate('');
    }
  };

  return (
    <form
      className="todo-form"
      onSubmit={handleSubmit}
      aria-label="Add a new task"
    >
      <div className="todo-form__field">
        <label htmlFor="todo-title" className="todo-form__label">
          Title
        </label>
        <input
          id="todo-title"
          name="title"
          className="todo-form__input"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Plan sprint retrospective"
          required
          aria-required="true"
          data-testid="todo-title-input"
        />
      </div>

      <div className="todo-form__field">
        <label htmlFor="todo-priority" className="todo-form__label">
          Priority
        </label>
        <select
          id="todo-priority"
          name="priority"
          className="todo-form__input"
          value={priority}
          onChange={(event) => setPriority(event.target.value as TodoPriority)}
          aria-label="Task priority level"
          data-testid="todo-priority-select"
        >
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="todo-form__field">
        <label htmlFor="todo-due-date" className="todo-form__label">
          Due date
        </label>
        <input
          id="todo-due-date"
          name="dueDate"
          className="todo-form__input"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          aria-label="Task due date (optional)"
          data-testid="todo-due-date-input"
        />
      </div>

      <button
        type="submit"
        className="todo-form__submit"
        data-testid="todo-submit"
        aria-label="Add task to list"
      >
        Add task
      </button>
    </form>
  );
}

export default TodoAddForm;
