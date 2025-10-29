import { beforeEach, describe, expect, it } from 'vitest';
import { runStopwatchCli } from '../../src/cli/stopwatch.js';

function createMemoryStorage(initial?: any) {
  let state = initial;
  return {
    async read(clock: { now: () => number }) {
      return state ?? { status: 'idle', startedAt: null, elapsedBefore: 0, lastLapMark: 0, laps: [], clock };
    },
    async write(next: any) {
      state = { ...next };
    },
    snapshot: () => state,
  };
}

function createClock(ticks: number[]) {
  let index = 0;
  return {
    now: () => {
      if (index >= ticks.length) {
        return ticks[ticks.length - 1];
      }
      const value = ticks[index];
      index += 1;
      return value;
    },
  };
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

describe('stopwatch CLI', () => {
  let storage: ReturnType<typeof createMemoryStorage>;
  let clock: ReturnType<typeof createClock>;
  let io: ReturnType<typeof createIO>;

  beforeEach(() => {
    storage = createMemoryStorage();
    clock = createClock([0, 1000, 2000, 3000]);
    io = createIO();
  });

  it('runs through start, lap, stop, and status', async () => {
    expect(await runStopwatchCli(['start'], io, { storage, clock })).toBe(0);
    expect(await runStopwatchCli(['lap'], io, { storage, clock })).toBe(0);
    expect(await runStopwatchCli(['stop'], io, { storage, clock })).toBe(0);
    const statusIo = createIO();
    const code = await runStopwatchCli(['status'], statusIo, { storage, clock });
    expect(code).toBe(0);
    expect(statusIo.out.join('\n')).toContain('Elapsed:');
  });

  it('refuses to lap before start', async () => {
    const code = await runStopwatchCli(['lap'], io, { storage, clock });
    expect(code).toBe(2);
    expect(io.err[0]).toContain('Stopwatch is not running');
  });
});
