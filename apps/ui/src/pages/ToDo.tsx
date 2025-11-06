/**
 * ToDo Page Component
 *
 * Team ToDo tracker page that reuses CLI business logic via @cli/shared imports.
 * Implements deterministic testing through clock injection and provides
 * comprehensive task management with filtering and completion tracking.
 *
 * Architecture:
 * - UI layer: React components and Date-based clocks
 * - Business logic: Imported from @cli/shared/todo (shared with CLI)
 * - Clock adapter: Bridges UI Date instances to CLI millisecond timestamps
 *
 * @module pages/ToDo
 */

import { useMemo, useState } from 'react';
import {
  addTodo,
  completeTodo,
  createInitialState,
  listTodos,
  type AddTodoInput,
  type ListFilters,
  type TodoDependencies,
  type TodoItem,
  type TodoState,
} from '@cli/shared/todo';
import TodoAddForm, { type TodoAddFormValues } from '../components/todo/TodoAddForm';
import TodoCompleteForm from '../components/todo/TodoCompleteForm';
import TodoFilters, { type TodoFiltersState } from '../components/todo/TodoFilters';
import TodoList, { type DueDescriptor, type TodoListItem } from '../components/todo/TodoList';
import {
  createSystemClock,
  differenceInDays,
  getErrorMessage,
  toDateOnly,
  toTodoClock,
  type UiClock,
} from '../lib/time/clock';

/**
 * Props for the ToDo page component.
 */
export interface ToDoProps {
  /**
   * Optional clock for deterministic testing.
   * Defaults to system clock in production.
   */
  clock?: UiClock;
}

/**
 * Default clock instance (system clock for production use).
 */
const DEFAULT_CLOCK = createSystemClock();

/**
 * Seeded initial state with sample todo items for demonstration.
 * Uses realistic dates relative to November 2025.
 */
const SEEDED_STATE = createInitialState({
  todos: [
    {
      id: '1',
      title: 'Prepare sprint review deck',
      priority: 'high',
      completed: false,
      createdAt: '2025-11-01T09:00:00.000Z',
      dueDate: '2025-11-02',
    },
    {
      id: '2',
      title: 'Reconcile October expenses',
      priority: 'med',
      completed: false,
      createdAt: '2025-11-02T10:00:00.000Z',
      dueDate: '2025-11-03',
    },
    {
      id: '3',
      title: 'Schedule team 1:1s',
      priority: 'low',
      completed: false,
      createdAt: '2025-11-02T11:30:00.000Z',
      dueDate: '2025-11-04',
    },
    {
      id: '4',
      title: 'Close security audit findings',
      priority: 'high',
      completed: true,
      createdAt: '2025-10-28T08:15:00.000Z',
      dueDate: '2025-10-30',
      completedAt: '2025-10-30T16:45:00.000Z',
    },
  ],
  nextId: 5,
});

/**
 * Default filter state: show all tasks, all priorities.
 */
const DEFAULT_FILTERS: TodoFiltersState = {
  showDueToday: false,
  priority: 'all',
};

/**
 * Team ToDo tracker page component.
 * Provides full CRUD operations for todo items with deterministic clock support.
 *
 * @example
 * ```tsx
 * // Production usage
 * <ToDo />
 *
 * // Testing with fixed clock
 * const clock = createFixedClock('2025-11-03T09:00:00Z');
 * <ToDo clock={clock} />
 * ```
 */
function ToDo({ clock }: ToDoProps): JSX.Element {
  const [state, setState] = useState<TodoState>(SEEDED_STATE);
  const [filters, setFilters] = useState<TodoFiltersState>(DEFAULT_FILTERS);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [clockInstance] = useState<UiClock>(clock ?? DEFAULT_CLOCK);

  // Convert UI clock to todo core clock
  const todoClock = useMemo(() => toTodoClock(clockInstance), [clockInstance]);
  const dependencies = useMemo<TodoDependencies>(
    () => ({ clock: todoClock }),
    [todoClock]
  );

  // Convert UI filters to core list filters
  const listFilters = useMemo<ListFilters>(() => {
    const result: ListFilters = {};
    if (filters.priority !== 'all') {
      result.priority = filters.priority;
    }
    if (filters.showDueToday) {
      result.dueToday = true;
    }
    return result;
  }, [filters]);

  // Get filtered and sorted todos from core
  const visibleTodos = useMemo(
    () => listTodos(state, listFilters, dependencies),
    [state, listFilters, dependencies]
  );

  // Enrich todos with due date descriptors
  const listItems = useMemo<TodoListItem[]>(
    () =>
      visibleTodos.map((todo) => ({
        todo,
        due: determineDueDescriptor(todo, clockInstance),
      })),
    [visibleTodos, clockInstance]
  );

  // Calculate summary metrics
  const summary = useMemo(() => buildSummary(state, dependencies), [state, dependencies]);

  /**
   * Handles adding a new todo item.
   * Validates input and updates state via core logic.
   */
  const handleAdd = (values: TodoAddFormValues): boolean => {
    setError(null);
    setMessage(null);
    try {
      const input: AddTodoInput = {
        title: values.title,
        priority: values.priority,
        dueDate: values.dueDate,
      };
      const result = addTodo(state, input, dependencies);
      setState(result.state);
      setMessage(`Added "${result.todo.title}" (#${result.todo.id}).`);
      return true;
    } catch (error_) {
      setError(getErrorMessage(error_));
      return false;
    }
  };

  /**
   * Handles completing a todo item (from list or form).
   * Idempotent - completing an already-completed item is a no-op.
   */
  const handleComplete = (id: string): boolean => {
    setError(null);
    setMessage(null);
    try {
      const result = completeTodo(state, id, dependencies);
      setState(result.state);
      if (state === result.state) {
        setMessage(`Task "${result.todo.title}" was already complete.`);
      } else {
        setMessage(`Marked "${result.todo.title}" as complete.`);
      }
      return true;
    } catch (error_) {
      setError(getErrorMessage(error_));
      return false;
    }
  };

  return (
    <div className="todo-page" role="main">
      <header className="todo-page__header">
        <h1 className="todo-page__title" data-testid="todo-title">
          Team ToDo tracker
        </h1>
        <p className="todo-page__subtitle">
          Add, review, and complete tasks with deterministic due-date boundaries
          mirroring the CLI rules.
        </p>
        <dl className="todo-summary">
          <div>
            <dt>Total</dt>
            <dd data-testid="todo-summary-total">{summary.total}</dd>
          </div>
          <div>
            <dt>Pending</dt>
            <dd data-testid="todo-summary-pending">{summary.pending}</dd>
          </div>
          <div>
            <dt>Completed</dt>
            <dd data-testid="todo-summary-completed">{summary.completed}</dd>
          </div>
          <div>
            <dt>Due today</dt>
            <dd data-testid="todo-summary-due-today">{summary.dueToday}</dd>
          </div>
        </dl>
      </header>

      {message && (
        <div
          className="todo-alert todo-alert--success"
          role="status"
          aria-live="polite"
          data-testid="todo-success"
        >
          {message}
        </div>
      )}
      {error && (
        <div
          className="todo-alert todo-alert--error"
          role="alert"
          aria-live="assertive"
          data-testid="todo-error"
        >
          {error}
        </div>
      )}

      <section className="todo-controls" aria-label="Task management controls">
        <TodoAddForm onSubmit={handleAdd} />
        <div className="todo-controls__secondary">
          <TodoFilters filters={filters} onChange={setFilters} />
          <TodoCompleteForm onComplete={handleComplete} />
        </div>
      </section>

      <section className="todo-list-wrapper" aria-label="Task list">
        <TodoList items={listItems} onComplete={handleComplete} />
      </section>
    </div>
  );
}

/**
 * Builds summary metrics for the dashboard.
 * Calculates totals using core filtering logic.
 */
function buildSummary(
  state: TodoState,
  deps: TodoDependencies
): { total: number; pending: number; completed: number; dueToday: number } {
  const pending = state.todos.filter((todo) => !todo.completed).length;
  const completed = state.todos.length - pending;
  const dueToday = listTodos(state, { dueToday: true }, deps).length;
  return {
    total: state.todos.length,
    pending,
    completed,
    dueToday,
  };
}

/**
 * Determines the due date descriptor for visual display.
 * Calculates day difference using UTC calendar boundaries.
 */
function determineDueDescriptor(todo: TodoItem, clock: UiClock): DueDescriptor | null {
  if (!todo.dueDate) {
    return null;
  }

  const today = toDateOnly(clock.now());
  const diff = differenceInDays(todo.dueDate, today);

  if (diff === 0) {
    return { label: 'Due today', tone: 'today' };
  }
  if (diff === 1) {
    return { label: 'Due tomorrow', tone: 'tomorrow' };
  }
  if (diff > 1) {
    return { label: `Due in ${diff} days`, tone: 'upcoming' };
  }
  if (diff === -1) {
    return { label: 'Due yesterday', tone: 'past' };
  }
  return { label: `${Math.abs(diff)} days overdue`, tone: 'overdue' };
}

export default ToDo;
