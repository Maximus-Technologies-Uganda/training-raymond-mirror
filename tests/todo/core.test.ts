import { describe, expect, it } from 'vitest';
import {
  addTodo,
  completeTodo,
  createInitialState,
  listTodos,
} from '../../src/todo/core.js';

function createClock(fixed: Date) {
  return { now: () => fixed.getTime() };
}

describe('todo core', () => {
  it('adds todos with unique titles and sequential ids', () => {
    const clock = createClock(new Date('2025-01-01T12:00:00Z'));
    const initial = createInitialState();
    const first = addTodo(initial, { title: 'Pay rent', priority: 'high' }, { clock });
    const second = addTodo(first.state, { title: 'Buy milk' }, { clock });
    expect(first.todo.id).toBe('1');
    expect(second.todo.id).toBe('2');
    expect(second.state.todos).toHaveLength(2);
  });

  it('prevents duplicate titles', () => {
    const clock = createClock(new Date('2025-01-01T12:00:00Z'));
    let state = createInitialState();
    state = addTodo(state, { title: 'Pay rent' }, { clock }).state;
    expect(() => addTodo(state, { title: 'pay rent' }, { clock })).toThrow('same title already exists');
  });

  it('lists by due today and priority', () => {
    const clock = createClock(new Date('2025-02-02T00:00:00Z'));
    let state = createInitialState();
    state = addTodo(state, { title: 'Task A', dueDate: '2025-02-02', priority: 'high' }, { clock }).state;
    state = addTodo(state, { title: 'Task B', dueDate: '2025-02-03', priority: 'low' }, { clock }).state;
    const dueToday = listTodos(state, { dueToday: true }, { clock });
    expect(dueToday).toHaveLength(1);
    expect(dueToday[0].title).toBe('Task A');
    const highPriority = listTodos(state, { priority: 'high' });
    expect(highPriority).toHaveLength(1);
  });

  it('completes todos and records timestamps', () => {
    const clock = createClock(new Date('2025-03-01T09:00:00Z'));
    const added = addTodo(createInitialState(), { title: 'Submit report' }, { clock });
    const result = completeTodo(added.state, added.todo.id, { clock });
    expect(result.todo.completed).toBe(true);
    expect(result.todo.completedAt).toContain('2025-03-01');
  });

  it('errors on missing todo when completing', () => {
    const clock = createClock(new Date('2025-03-01T09:00:00Z'));
    const state = createInitialState();
    expect(() => completeTodo(state, '123', { clock })).toThrow('Todo not found');
  });
});
