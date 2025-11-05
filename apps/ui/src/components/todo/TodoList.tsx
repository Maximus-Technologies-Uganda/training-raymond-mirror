/**
 * TodoList Component
 *
 * Displays a list of todo items with due date indicators and completion actions.
 * Implements accessibility features including:
 * - Semantic HTML structure
 * - Keyboard navigation
 * - Screen reader support
 * - Visual indicators for due dates
 *
 * @module components/todo/TodoList
 */

import type { TodoItem } from '@cli/shared/todo';

/**
 * Visual tone for due date indicators based on urgency.
 */
export type DueDateTone = 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'past';

/**
 * Descriptor for todo due date with label and visual tone.
 */
export interface DueDescriptor {
  label: string;
  tone: DueDateTone;
}

/**
 * Todo item enriched with due date display information.
 */
export interface TodoListItem {
  todo: TodoItem;
  due: DueDescriptor | null;
}

/**
 * Props for the TodoList component.
 */
export interface TodoListProps {
  /** Array of todo items with due date descriptors */
  items: TodoListItem[];
  /** Callback invoked when user clicks to complete a todo */
  onComplete(id: string): void;
}

/**
 * Formats priority value for display with proper capitalization.
 */
function formatPriority(priority: TodoItem['priority']): string {
  return priority === 'med' ? 'Medium' : priority.charAt(0).toUpperCase() + priority.slice(1);
}

/**
 * Formats ISO timestamp for human-readable display.
 */
function formatIsoDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value; // Fallback to raw string if invalid
  }
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Displays a list of todo items with visual indicators and completion controls.
 * Shows an empty state when no items match current filters.
 *
 * @example
 * ```tsx
 * const items: TodoListItem[] = todos.map(todo => ({
 *   todo,
 *   due: calculateDueDescriptor(todo, clock)
 * }));
 *
 * <TodoList
 *   items={items}
 *   onComplete={(id) => console.log('Complete todo:', id)}
 * />
 * ```
 */
function TodoList({ items, onComplete }: TodoListProps): JSX.Element {
  if (items.length === 0) {
    return (
      <div
        className="todo-empty"
        role="status"
        aria-live="polite"
        data-testid="todo-empty"
      >
        All caught up! Adjust filters or add a new task to get started.
      </div>
    );
  }

  return (
    <ul className="todo-list" aria-label="Current tasks">
      {items.map(({ todo, due }) => (
        <li
          key={todo.id}
          className="todo-list__item"
          data-testid={`todo-item-${todo.id}`}
        >
          <div className="todo-list__content">
            <div className="todo-list__headline">
              <span className="todo-list__title">{todo.title}</span>
              <span
                className={`todo-list__priority todo-list__priority--${todo.priority}`}
                aria-label={`Priority: ${formatPriority(todo.priority)}`}
              >
                {formatPriority(todo.priority).toUpperCase()}
              </span>
              {due && (
                <span
                  className={`todo-list__due todo-list__due--${due.tone}`}
                  aria-label={`Due: ${due.label}`}
                  data-testid={`todo-due-${todo.id}`}
                >
                  {due.label}
                </span>
              )}
              {todo.completed && (
                <span
                  className="todo-list__status"
                  aria-label="Status: Completed"
                  data-testid={`todo-status-${todo.id}`}
                >
                  Completed
                </span>
              )}
            </div>
            <dl className="todo-list__meta">
              <div>
                <dt>Created</dt>
                <dd>{formatIsoDate(todo.createdAt)}</dd>
              </div>
              {todo.dueDate && (
                <div>
                  <dt>Due</dt>
                  <dd>{todo.dueDate}</dd>
                </div>
              )}
              {todo.completedAt && (
                <div>
                  <dt>Completed</dt>
                  <dd>{formatIsoDate(todo.completedAt)}</dd>
                </div>
              )}
            </dl>
          </div>
          <button
            type="button"
            className="todo-list__complete"
            onClick={() => onComplete(todo.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onComplete(todo.id);
              }
            }}
            disabled={todo.completed}
            aria-label={
              todo.completed
                ? `Task "${todo.title}" is already complete`
                : `Mark task "${todo.title}" complete`
            }
          >
            {todo.completed ? 'Done' : 'Mark complete'}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default TodoList;
