const PRIORITIES = new Set(['low', 'med', 'high']);

function determineNextId(todos) {
  if (todos.length === 0) {
    return 1;
  }
  const highest = todos.reduce((acc, todo) => Math.max(acc, Number.parseInt(todo.id, 10) || 0), 0);
  return highest + 1;
}

function validateDueDate(input) {
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

function normalizeStoredTodo(todo) {
  if (!todo || typeof todo !== 'object') {
    throw new Error('Stored todo must be an object.');
  }

  const record = todo;
  const normalized = {
    id: String(record.id ?? ''),
    title: String(record.title ?? '').trim(),
    priority: String(record.priority ?? 'med').toLowerCase(),
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

export function createInitialState(raw) {
  if (!raw || typeof raw !== 'object') {
    return { todos: [], nextId: 1 };
  }

  const record = raw;
  const todos = Array.isArray(record.todos) ? record.todos.map(normalizeStoredTodo) : [];
  const nextId =
    typeof record.nextId === 'number' && Number.isInteger(record.nextId) && record.nextId > 0
      ? record.nextId
      : determineNextId(todos);
  return { todos, nextId };
}

export function serializeState(state) {
  return JSON.stringify(state, null, 2);
}

function validateTitle(title) {
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error('Title must be a non-empty string.');
  }
  return title.trim();
}

function validatePriority(priority = 'med') {
  const value = String(priority).toLowerCase();
  if (!PRIORITIES.has(value)) {
    throw new Error('Priority must be one of low, med, or high.');
  }
  return value;
}

function findDuplicateTitle(state, title) {
  const normalized = title.toLowerCase();
  return state.todos.find((todo) => todo.title.toLowerCase() === normalized);
}

export function addTodo(state, input, deps = {}) {
  const title = validateTitle(input.title);
  if (findDuplicateTitle(state, title)) {
    throw new Error('A todo with the same title already exists.');
  }

  const priority = validatePriority(input.priority);
  const dueDate = input.dueDate ? validateDueDate(input.dueDate) : undefined;

  const now = deps.clock?.now ? new Date(deps.clock.now()) : new Date();
  const createdAt = now.toISOString();

  const id = String(state.nextId);
  const todo = {
    id,
    title,
    priority,
    completed: false,
    createdAt,
  };

  if (dueDate) {
    todo.dueDate = dueDate;
  }

  const nextState = {
    todos: [...state.todos, todo],
    nextId: state.nextId + 1,
  };

  return { state: nextState, todo };
}

export function completeTodo(state, id, deps = {}) {
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

  const updated = { ...todo, completed: true, completedAt };
  const todos = [...state.todos];
  todos[index] = updated;
  return { state: { todos, nextId: state.nextId }, todo: updated };
}

function toDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function isDueToday(todo, clock) {
  if (!todo.dueDate) {
    return false;
  }
  const now = clock?.now ? new Date(clock.now()) : new Date();
  return todo.dueDate === toDateOnly(now);
}

export function listTodos(state, filters = {}, deps = {}) {
  let result = [...state.todos];

  if (filters.priority) {
    const priority = validatePriority(filters.priority);
    result = result.filter((todo) => todo.priority === priority);
  }

  if (filters.dueDate) {
    const dueDate = validateDueDate(filters.dueDate);
    result = result.filter((todo) => todo.dueDate === dueDate);
  }

  if (filters.dueToday) {
    result = result.filter((todo) => isDueToday(todo, deps.clock));
  }

  result.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    if (a.priority === b.priority) {
      return a.id.localeCompare(b.id);
    }
    const priorityOrder = { high: 0, med: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return result;
}

export function formatTodo(todo) {
  const pieces = [`[${todo.id}] ${todo.title}`];
  pieces.push(`priority=${todo.priority}`);
  if (todo.dueDate) {
    pieces.push(`due=${todo.dueDate}`);
  }
  pieces.push(todo.completed ? 'status=done' : 'status=pending');
  return pieces.join(' ');
}

export function describeTodos(todos) {
  if (todos.length === 0) {
    return 'No todos found.';
  }
  return todos.map((todo) => `- ${formatTodo(todo)}`).join('\n');
}
