/* c8 ignore start */
import { promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  FlagMap,
  getStringFlag,
  parseArgs,
} from '../helpers/args.js';
import {
  buildReport,
  Clock,
  createStopwatch,
  deserializeStopwatch,
  lapStopwatch,
  resetStopwatch,
  serializeStopwatch,
  startStopwatch,
  stopStopwatch,
  StopwatchState,
} from '../stopwatch/core.js';

interface CliIO {
  stdout?: (message: string) => void;
  stderr?: (message: string) => void;
}

interface StopwatchStorage {
  read(clock: Clock): Promise<StopwatchState>;
  write(state: StopwatchState): Promise<void>;
}

interface StopwatchEnvironment {
  storage?: StopwatchStorage;
  clock?: Clock;
}

function defaultClock(): Clock {
  return { now: () => Date.now() };
}

function createFileStore(path: string): StopwatchStorage {
  const target = resolve(path);
  return {
    async read(clock: Clock): Promise<StopwatchState> {
      try {
        const raw = await fs.readFile(target, 'utf8');
        return deserializeStopwatch(JSON.parse(raw), clock);
      } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'ENOENT') {
          return createStopwatch(clock);
        }
        throw new Error('Failed to read stopwatch storage.');
      }
    },
    async write(state: StopwatchState): Promise<void> {
      const directory = dirname(target);
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(target, serializeStopwatch(state));
    },
  };
}

function resolveStorage(flags: FlagMap, env: StopwatchEnvironment): StopwatchStorage {
  const storagePath = getStringFlag(flags, 'storage', { label: 'Storage path' }) ?? '.data/stopwatch.json';
  return env.storage ?? createFileStore(storagePath);
}

function buildClock(env: StopwatchEnvironment): Clock {
  return env.clock ?? defaultClock();
}

async function loadState(storage: StopwatchStorage, clock: Clock, io: CliIO): Promise<StopwatchState | null> {
  try {
    return await storage.read(clock);
  } catch (error: unknown) {
    io.stderr?.((error as Error).message);
    return null;
  }
}

async function persistState(storage: StopwatchStorage, state: StopwatchState, io: CliIO): Promise<boolean> {
  try {
    await storage.write(state);
    return true;
  } catch (error: unknown) {
    io.stderr?.((error as Error).message);
    return false;
  }
}

async function handleStart(state: StopwatchState, storage: StopwatchStorage, io: CliIO): Promise<number> {
  try {
    const next = startStopwatch(state);
    if (await persistState(storage, next, io)) {
      io.stdout?.('Stopwatch started.');
      return 0;
    }
    return 2;
  } catch (error: unknown) {
    io.stderr?.((error as Error).message);
    return 2;
  }
}

async function handleLap(state: StopwatchState, storage: StopwatchStorage, io: CliIO, flags: FlagMap): Promise<number> {
  try {
    const label = getStringFlag(flags, 'label', { label: 'Label' }) ?? null;
    const next = lapStopwatch(state, label);
    if (await persistState(storage, next, io)) {
      const lastLap = next.laps[next.laps.length - 1];
      io.stdout?.(`Lap #${lastLap.index}: ${lastLap.duration}ms`);
      return 0;
    }
    return 2;
  } catch (error: unknown) {
    io.stderr?.((error as Error).message);
    return 2;
  }
}

async function handleStop(state: StopwatchState, storage: StopwatchStorage, io: CliIO): Promise<number> {
  try {
    const next = stopStopwatch(state);
    if (await persistState(storage, next, io)) {
      io.stdout?.('Stopwatch stopped.');
      return 0;
    }
    return 2;
  } catch (error: unknown) {
    io.stderr?.((error as Error).message);
    return 2;
  }
}

async function handleReset(state: StopwatchState, storage: StopwatchStorage, io: CliIO): Promise<number> {
  const next = resetStopwatch(state);
  if (await persistState(storage, next, io)) {
    io.stdout?.('Stopwatch reset.');
    return 0;
  }
  return 2;
}

async function handleStatus(state: StopwatchState, io: CliIO): Promise<number> {
  io.stdout?.(buildReport(state));
  return 0;
}

export async function runStopwatchCli(
  argv: readonly string[],
  io: CliIO = { stdout: (message) => console.log(message), stderr: (message) => console.error(message) },
  env: StopwatchEnvironment = {},
): Promise<number> {
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
/* c8 ignore stop */
