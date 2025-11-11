/* c8 ignore start */
export type TodoPriority = 'low' | 'med' | 'high';

export interface Clock {
  now(): number;
}

export interface TodoItem {
  id: string;
  title: string;
  priority: TodoPriority;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  completedAt?: string;
}

export interface TodoState {
  todos: TodoItem[];
  nextId: number;
}

export interface AddTodoInput {
  title: string;
  priority?: string;
  dueDate?: string;
}

export interface TodoDependencies {
  clock?: Clock;
}

const PRIORITIES: ReadonlySet<TodoPriority> = new Set(['low', 'med', 'high']);

export function createInitialState(raw: unknown): TodoState {
  if (!raw || typeof raw !== 'object') {
    return { todos: [], nextId: 1 };
  }

  const record = raw as { todos?: unknown; nextId?: unknown };
  const todos = Array.isArray(record.todos)
    ? record.todos.map(normalizeStoredTodo)
    : [];
  const nextId = typeof record.nextId === 'number' && Number.isInteger(record.nextId) && record.nextId > 0
    ? record.nextId
    : determineNextId(todos);
  return { todos, nextId };
}

function determineNextId(todos: TodoItem[]): number {
  if (todos.length === 0) {
    return 1;
  }
  const highest = todos.reduce((acc, todo) => Math.max(acc, Number.parseInt(todo.id, 10) || 0), 0);
  return highest + 1;
}

function normalizeStoredTodo(todo: unknown): TodoItem {
  if (!todo || typeof todo !== 'object') {
    throw new Error('Stored todo must be an object.');
  }

  const record = todo as Record<string, unknown>;
  const normalized: TodoItem = {
    id: String(record.id ?? ''),
    title: String(record.title ?? '').trim(),
    priority: String(record.priority ?? 'med').toLowerCase() as TodoPriority,
    completed: Boolean(record.completed),
    createdAt: String(record.createdAt ?? new Date().toISOString()),
  };

  if (!normalized.id) {
    throw new Error('Stored todo is missing an id.');
  }
  if (!normalized.title) {
    throw new Error('Stored todo is missing a title.');
  }
  if (!PRIORITIES.has(normalized.priority)) {
    throw new Error('Stored todo has an invalid priority.');
  }

  if (record.dueDate) {
    normalized.dueDate = validateDueDate(record.dueDate);
  }

  if (record.completedAt) {
    normalized.completedAt = new Date(String(record.completedAt)).toISOString();
  }

  return normalized;
}

export function serializeState(state: TodoState): string {
  return JSON.stringify(state, null, 2);
}

function validateTitle(title: unknown): string {
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error('Title must be a non-empty string.');
  }
  return title.trim();
}

function validatePriority(priority: unknown = 'med'): TodoPriority {
  const value = String(priority).toLowerCase();
  if (!PRIORITIES.has(value as TodoPriority)) {
    throw new Error('Priority must be one of low, med, or high.');
  }
  return value as TodoPriority;
}

function validateDueDate(input: unknown): string {
  const value = String(input).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Due date must use YYYY-MM-DD format.');
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid due date.');
  }
  return value;
}

function findDuplicateTitle(state: TodoState, title: string): TodoItem | undefined {
  const normalized = title.toLowerCase();
  return state.todos.find((todo) => todo.title.toLowerCase() === normalized);
}

export function addTodo(state: TodoState, input: AddTodoInput, deps: TodoDependencies = {}): { state: TodoState; todo: TodoItem } {
  const title = validateTitle(input.title);
  if (findDuplicateTitle(state, title)) {
    throw new Error('A todo with the same title already exists.');
  }

  const priority = validatePriority(input.priority);
  const dueDate = input.dueDate ? validateDueDate(input.dueDate) : undefined;

  const now = deps.clock?.now ? new Date(deps.clock.now()) : new Date();
  const createdAt = now.toISOString();

  const id = String(state.nextId);
  const todo: TodoItem = {
    id,
    title,
    priority,
    completed: false,
    createdAt,
  };

  if (dueDate) {
    todo.dueDate = dueDate;
  }

  const nextState: TodoState = {
    todos: [...state.todos, todo],
    nextId: state.nextId + 1,
  };

  return { state: nextState, todo };
}

export function completeTodo(state: TodoState, id: string, deps: TodoDependencies = {}): { state: TodoState; todo: TodoItem } {
  const targetId = String(id);
  const index = state.todos.findIndex((todo) => todo.id === targetId);
  if (index === -1) {
    throw new Error('Todo not found.');
  }

  const now = deps.clock?.now ? new Date(deps.clock.now()) : new Date();
  const completedAt = now.toISOString();

  const todo = state.todos[index];
  if (todo.completed) {
    return { state, todo };
  }

  const updated: TodoItem = { ...todo, completed: true, completedAt };
  const todos = [...state.todos];
  todos[index] = updated;
  return { state: { todos, nextId: state.nextId }, todo: updated };
}

function toDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isDueToday(todo: TodoItem, clock?: Clock): boolean {
  if (!todo.dueDate) {
    return false;
  }
  const now = clock?.now ? new Date(clock.now()) : new Date();
  return todo.dueDate === toDateOnly(now);
}

export interface ListFilters {
  priority?: string;
  dueDate?: string;
  dueToday?: boolean;
}

export function listTodos(state: TodoState, filters: ListFilters = {}, deps: TodoDependencies = {}): TodoItem[] {
  const itemsWithIndex = state.todos.map((todo, index) => ({ todo, index }));
  let result = [...itemsWithIndex];

  if (filters.priority) {
    const priority = validatePriority(filters.priority);
    result = result.filter(({ todo }) => todo.priority === priority);
  }

  if (filters.dueDate) {
    const dueDate = validateDueDate(filters.dueDate);
    result = result.filter(({ todo }) => todo.dueDate === dueDate);
  }

  if (filters.dueToday) {
    result = result.filter(({ todo }) => isDueToday(todo, deps.clock));
  }

  result.sort((a, b) => {
    if (a.todo.completed !== b.todo.completed) {
      return a.todo.completed ? 1 : -1;
    }
    if (a.todo.priority === b.todo.priority) {
      return a.index - b.index;
    }
    const priorityOrder: Record<TodoPriority, number> = { high: 0, med: 1, low: 2 };
    return priorityOrder[a.todo.priority] - priorityOrder[b.todo.priority];
  });

  return result.map(({ todo }) => todo);
}

export function formatTodo(todo: TodoItem): string {
  const pieces = [`[${todo.id}] ${todo.title}`];
  pieces.push(`priority=${todo.priority}`);
  if (todo.dueDate) {
    pieces.push(`due=${todo.dueDate}`);
  }
  pieces.push(todo.completed ? 'status=done' : 'status=pending');
  return pieces.join(' ');
}

export function describeTodos(todos: TodoItem[]): string {
  if (todos.length === 0) {
    return 'No todos found.';
  }
  return todos.map((todo) => `- ${formatTodo(todo)}`).join('\n');
}
/* c8 ignore stop */
