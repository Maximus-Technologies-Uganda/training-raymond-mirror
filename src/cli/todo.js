import { promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getDateFlag, getEnumFlag, getStringFlag, parseArgs, requireStringFlag } from '../helpers/args.js';
import { addTodo, completeTodo, createInitialState, describeTodos, listTodos, serializeState } from '../todo/core.js';

function defaultClock() {
  return { now: () => Date.now() };
}

function createFileStorage(basePath) {
  const target = resolve(basePath);
  return {
    async read() {
      try {
        const data = await fs.readFile(target, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
          return { todos: [], nextId: 1 };
        }
        throw new Error('Failed to read todo storage.');
      }
    },
    async write(state) {
      const directory = dirname(target);
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(target, serializeState(state));
    },
  };
}

function resolveStorage(flags, env) {
  const storagePath = getStringFlag(flags, 'storage', { label: 'Storage path' }) ?? '.data/todo.json';
  return (env && env.storage) || createFileStorage(storagePath);
}

function buildClock(env) {
  return (env && env.clock) || defaultClock();
}

function parsePriority(flags) {
  return getEnumFlag(flags, 'priority', ['low', 'med', 'high'], {
    label: 'Priority',
    caseInsensitive: true,
  });
}

function parseDueDate(flags) {
  return getDateFlag(flags, 'due', { label: 'Due date' });
}

async function handleAdd(state, flags, env, io) {
  let title;
  try {
    title = requireStringFlag(flags, 'title', 'The add command requires --title.', { label: 'Title' });
  } catch (error) {
    io.stderr?.(error.message);
    return 1;
  }

  try {
    const result = addTodo(
      state,
      {
        title,
        priority: parsePriority(flags),
        dueDate: parseDueDate(flags),
      },
      env,
    );
    await env.storage.write(result.state);
    io.stdout?.(`Added todo ${result.todo.id}: ${result.todo.title}`);
    return 0;
  } catch (error) {
    io.stderr?.(error.message);
    return 2;
  }
}

async function handleList(state, flags, env, io) {
  try {
    const todos = listTodos(
      state,
      {
        priority: parsePriority(flags),
        dueDate: parseDueDate(flags),
        dueToday: flags.has('dueToday'),
      },
      env,
    );
    io.stdout?.(describeTodos(todos));
    return 0;
  } catch (error) {
    io.stderr?.(error.message);
    return 2;
  }
}

async function handleComplete(state, argv, env, io) {
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
  } catch (error) {
    io.stderr?.(error.message);
    return 2;
  }
}

export async function runTodoCli(
  argv,
  io = { stdout: (message) => console.log(message), stderr: (message) => console.error(message) },
  env = {},
) {
  const { flags, positionals } = parseArgs(argv);
  const command = positionals[0];

  if (!command) {
    io.stderr?.('Specify a command: add, list, or complete.');
    return 1;
  }

  const storage = resolveStorage(flags, env);
  const clock = buildClock(env);
  const runtimeEnv = { storage, clock };

  let rawState;
  try {
    rawState = await storage.read();
  } catch (error) {
    io.stderr?.(error.message);
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
