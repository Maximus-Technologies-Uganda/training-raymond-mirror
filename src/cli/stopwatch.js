import { promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getStringFlag, parseArgs } from '../helpers/args.js';
import {
  buildReport,
  createStopwatch,
  deserializeStopwatch,
  lapStopwatch,
  resetStopwatch,
  serializeStopwatch,
  startStopwatch,
  stopStopwatch,
} from '../stopwatch/core.js';

function defaultClock() {
  return { now: () => Date.now() };
}

function createFileStore(path) {
  const target = resolve(path);
  return {
    async read(clock) {
      try {
        const raw = await fs.readFile(target, 'utf8');
        return deserializeStopwatch(JSON.parse(raw), clock);
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
          return createStopwatch(clock);
        }
        throw new Error('Failed to read stopwatch storage.');
      }
    },
    async write(state) {
      const directory = dirname(target);
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(target, serializeStopwatch(state));
    },
  };
}

function resolveStorage(flags, env) {
  const storagePath = getStringFlag(flags, 'storage', { label: 'Storage path' }) ?? '.data/stopwatch.json';
  return (env && env.storage) || createFileStore(storagePath);
}

function buildClock(env) {
  return (env && env.clock) || defaultClock();
}

async function loadState(storage, clock, io) {
  try {
    return await storage.read(clock);
  } catch (error) {
    io.stderr?.(error.message);
    return null;
  }
}

async function persistState(storage, state, io) {
  try {
    await storage.write(state);
    return true;
  } catch (error) {
    io.stderr?.(error.message);
    return false;
  }
}

async function handleStart(state, storage, io) {
  try {
    const next = startStopwatch(state);
    if (await persistState(storage, next, io)) {
      io.stdout?.('Stopwatch started.');
      return 0;
    }
    return 2;
  } catch (error) {
    io.stderr?.(error.message);
    return 2;
  }
}

async function handleLap(state, storage, io, flags) {
  try {
    const label = getStringFlag(flags, 'label', { label: 'Label' }) ?? null;
    const next = lapStopwatch(state, label);
    if (await persistState(storage, next, io)) {
      const lastLap = next.laps[next.laps.length - 1];
      io.stdout?.(`Lap #${lastLap.index}: ${lastLap.duration}ms`);
      return 0;
    }
    return 2;
  } catch (error) {
    io.stderr?.(error.message);
    return 2;
  }
}

async function handleStop(state, storage, io) {
  try {
    const next = stopStopwatch(state);
    if (await persistState(storage, next, io)) {
      io.stdout?.('Stopwatch stopped.');
      return 0;
    }
    return 2;
  } catch (error) {
    io.stderr?.(error.message);
    return 2;
  }
}

async function handleReset(state, storage, io) {
  const next = resetStopwatch(state);
  if (await persistState(storage, next, io)) {
    io.stdout?.('Stopwatch reset.');
    return 0;
  }
  return 2;
}

async function handleStatus(state, io) {
  io.stdout?.(buildReport(state));
  return 0;
}

export async function runStopwatchCli(
  argv,
  io = { stdout: (message) => console.log(message), stderr: (message) => console.error(message) },
  env = {},
) {
  const { flags, positionals } = parseArgs(argv);
  const command = positionals[0];

  if (!command) {
    io.stderr?.('Specify a command: start, lap, stop, reset, or status.');
    return 1;
  }

  const storage = resolveStorage(flags, env);
  const clock = buildClock(env);
  const state = await loadState(storage, clock, io);
  if (!state) {
    return 2;
  }

  state.clock = clock;

  switch (command) {
  case 'start':
    return handleStart(state, storage, io);
  case 'lap':
    return handleLap(state, storage, io, flags);
  case 'stop':
    return handleStop(state, storage, io);
  case 'reset':
    return handleReset(state, storage, io);
  case 'status':
    return handleStatus(state, io);
  default:
    io.stderr?.(`Unknown command: ${command}`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runStopwatchCli(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
