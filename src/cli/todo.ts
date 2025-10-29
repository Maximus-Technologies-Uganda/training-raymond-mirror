import { promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getFlag, parseArgs, FlagMap } from '../helpers/args.js';
import {
  addTodo,
  completeTodo,
  createInitialState,
  describeTodos,
  listTodos,
  serializeState,
  TodoDependencies,
  TodoState,
} from '../todo/core.js';

interface CliIO {
  stdout?: (message: string) => void;
  stderr?: (message: string) => void;
}

interface Clock {
  now(): number;
}

interface TodoStorage {
  read(): Promise<unknown>;
  write(state: TodoState): Promise<void>;
}

interface TodoEnvironment {
  storage?: TodoStorage;
  clock?: Clock;
}

type RuntimeDependencies = TodoDependencies & { storage: TodoStorage };

function defaultClock(): Clock {
  return { now: () => Date.now() };
}

function createFileStorage(basePath: string): TodoStorage {
  const target = resolve(basePath);
  return {
    async read(): Promise<unknown> {
      try {
        const data = await fs.readFile(target, 'utf8');
        return JSON.parse(data);
      } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'ENOENT') {
          return { todos: [], nextId: 1 };
        }
        throw new Error('Failed to read todo storage.');
      }
    },
    async write(state: TodoState): Promise<void> {
      const directory = dirname(target);
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(target, serializeState(state));
    },
  };
}

function resolveStorage(flags: FlagMap, env: TodoEnvironment): TodoStorage {
  const storageFlag = getFlag(flags, 'storage');
  const storagePath = typeof storageFlag === 'string' ? storageFlag : '.data/todo.json';
  return env.storage ?? createFileStorage(storagePath);
}

function buildClock(env: TodoEnvironment): Clock {
  return env.clock ?? defaultClock();
}

function parsePriority(flags: FlagMap): string | undefined {
  const value = getFlag(flags, 'priority');
  return value && typeof value === 'string' ? value.toLowerCase() : undefined;
}

function parseDueDate(flags: FlagMap): string | undefined {
  const value = getFlag(flags, 'due');
  return typeof value === 'string' ? value : undefined;
}

async function handleAdd(state: TodoState, flags: FlagMap, env: RuntimeDependencies, io: CliIO): Promise<number> {
  const title = getFlag(flags, 'title');
  if (title === undefined || title === true) {
    io.stderr?.('The add command requires --title.');
    return 1;
  }

  try {
    const result = addTodo(state, {
      title,
      priority: parsePriority(flags),
      dueDate: parseDueDate(flags),
    }, env);
    await env.storage.write(result.state);
    io.stdout?.(`Added todo ${result.todo.id}: ${result.todo.title}`);
    return 0;
  } catch (error: unknown) {
    io.stderr?.((error as Error).message);
    return 2;
  }
}

async function handleList(state: TodoState, flags: FlagMap, env: RuntimeDependencies, io: CliIO): Promise<number> {
  try {
    const todos = listTodos(state, {
      priority: parsePriority(flags),
      dueDate: parseDueDate(flags),
      dueToday: flags.has('dueToday'),
    }, env);
    io.stdout?.(describeTodos(todos));
    return 0;
  } catch (error: unknown) {
    io.stderr?.((error as Error).message);
    return 2;
  }
}

async function handleComplete(state: TodoState, argv: readonly string[], env: RuntimeDependencies, io: CliIO): Promise<number> {
  const id = argv[1];
  if (!id) {
    io.stderr?.('The complete command requires an id argument.');
    return 1;
  }

  try {
    const result = completeTodo(state, id, env);
    await env.storage.write(result.state);
    io.stdout?.(`Completed todo ${result.todo.id}.`);
    return 0;
  } catch (error: unknown) {
    io.stderr?.((error as Error).message);
    return 2;
  }
}

export async function runTodoCli(
  argv: readonly string[],
  io: CliIO = { stdout: (message) => console.log(message), stderr: (message) => console.error(message) },
  env: TodoEnvironment = {},
): Promise<number> {
  const { flags, positionals } = parseArgs(argv);
  const command = positionals[0];

  if (!command) {
    io.stderr?.('Specify a command: add, list, or complete.');
    return 1;
  }

  const storage = resolveStorage(flags, env);
  const clock = buildClock(env);
  const runtimeEnv: RuntimeDependencies = { storage, clock };

  let rawState: unknown;
  try {
    rawState = await storage.read();
  } catch (error: unknown) {
    io.stderr?.((error as Error).message);
    return 2;
  }

  const state = createInitialState(rawState);

  switch (command) {
    case 'add':
      return handleAdd(state, flags, runtimeEnv, io);
    case 'list':
      return handleList(state, flags, runtimeEnv, io);
    case 'complete':
      return handleComplete(state, positionals, runtimeEnv, io);
    default:
      io.stderr?.(`Unknown command: ${command}`);
      return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runTodoCli(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
