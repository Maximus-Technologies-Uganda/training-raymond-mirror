import { beforeEach, describe, expect, it } from 'vitest';
import { runTodoCli } from '../../src/cli/todo.js';

function createMemoryStorage(initial = { todos: [], nextId: 1 }) {
  let data = JSON.parse(JSON.stringify(initial));
  return {
    read: async () => JSON.parse(JSON.stringify(data)),
    write: async (state: unknown) => {
      data = JSON.parse(JSON.stringify(state));
    },
    snapshot: () => data,
  };
}

function createClock(date: Date) {
  return { now: () => date.getTime() };
}

function createIO() {
  const out: string[] = [];
  const err: string[] = [];
  return {
    stdout: (message: string) => out.push(message),
    stderr: (message: string) => err.push(message),
    out,
    err,
  };
}

describe('todo CLI', () => {
  let storage: ReturnType<typeof createMemoryStorage>;
  let clock: ReturnType<typeof createClock>;
  let io: ReturnType<typeof createIO>;

  beforeEach(() => {
    storage = createMemoryStorage();
    clock = createClock(new Date('2025-02-02T00:00:00Z'));
    io = createIO();
  });

  it('adds a todo and persists it', async () => {
    const code = await runTodoCli(['add', '--title', 'Pay bills', '--priority', 'high'], io, { storage, clock });
    expect(code).toBe(0);
    expect(io.out[0]).toContain('Added todo');
    expect(storage.snapshot().todos).toHaveLength(1);
  });

  it('lists todos with friendly message when empty', async () => {
    const code = await runTodoCli(['list'], io, { storage, clock });
    expect(code).toBe(0);
    expect(io.out[0]).toBe('No todos found.');
  });

  it('completes a todo', async () => {
    await runTodoCli(['add', '--title', 'Finish project'], io, { storage, clock });
    const code = await runTodoCli(['complete', '1'], io, { storage, clock });
    expect(code).toBe(0);
    expect(io.out.pop()).toContain('Completed todo');
    expect(storage.snapshot().todos[0].completed).toBe(true);
  });

  it('returns non-zero when completing missing todo', async () => {
    const code = await runTodoCli(['complete', '9'], io, { storage, clock });
    expect(code).toBe(2);
    expect(io.err[0]).toContain('Todo not found');
  });
});
