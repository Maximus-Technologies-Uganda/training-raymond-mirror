/**
 * TodoCompleteForm Component
 *
 * Form for marking todo items as complete by ID.
 * Provides an alternative completion method alongside inline list actions.
 *
 * @module components/todo/TodoCompleteForm
 */

import { type FormEvent, useState } from 'react';

/**
 * Props for the TodoCompleteForm component.
 */
export interface TodoCompleteFormProps {
  /** Callback invoked when user submits a todo ID. Returns true if successful. */
  onComplete(id: string): boolean;
}

/**
 * Form component for marking todo items complete by ID.
 * Automatically clears the input field on successful completion.
 *
 * @example
 * ```tsx
 * <TodoCompleteForm
 *   onComplete={(id) => {
 *     console.log('Completing todo:', id);
 *     return true; // Success
 *   }}
 * />
 * ```
 */
function TodoCompleteForm({ onComplete }: TodoCompleteFormProps): JSX.Element {
  const [id, setId] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedId = id.trim();
    if (!trimmedId) {
      return; // Ignore empty submissions
    }

    const success = onComplete(trimmedId);
    if (success) {
      setId(''); // Clear input on success
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow form submission via Enter key
    if (event.key === 'Enter') {
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <form
      className="todo-complete"
      onSubmit={handleSubmit}
      aria-label="Complete a task by id"
    >
      <div className="todo-complete__field">
        <label htmlFor="todo-complete-id" className="todo-complete__label">
          Complete by id
        </label>
        <input
          id="todo-complete-id"
          name="id"
          type="text"
          className="todo-complete__input"
          value={id}
          onChange={(event) => setId(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter task id"
          aria-label="Task ID to mark complete"
          data-testid="todo-complete-input"
        />
      </div>
      <button
        type="submit"
        className="todo-complete__submit"
        disabled={!id.trim()}
        aria-label={id.trim() ? `Mark task ${id.trim()} complete` : 'Enter task ID to complete'}
        data-testid="todo-complete-submit"
      >
        Complete task
      </button>
    </form>
  );
}

export default TodoCompleteForm;
