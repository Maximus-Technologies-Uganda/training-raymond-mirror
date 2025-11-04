/**
 * Shared ToDo logic re-exported from core for UI consumption.
 * This allows the UI to import pure business logic without coupling to CLI specifics.
 */

export {
  addTodo,
  completeTodo,
  createInitialState,
  describeTodos,
  formatTodo,
  listTodos,
  serializeState,
} from '../../todo/core.js';

export type {
  AddTodoInput,
  Clock,
  ListFilters,
  TodoDependencies,
  TodoItem,
  TodoPriority,
  TodoState,
} from '../../todo/core.js';
