export type StopwatchStatus = 'idle' | 'running' | 'stopped';

export interface Clock {
  now(): number;
}

export interface StopwatchLap {
  index: number;
  duration: number;
  total: number;
  label?: string;
}

export interface StopwatchState {
  status: StopwatchStatus;
  startedAt: number | null;
  lastLapMark: number;
  elapsedBefore: number;
  laps: StopwatchLap[];
  clock?: Clock;
}

export interface SerializedStopwatch {
  status?: StopwatchStatus;
  startedAt?: number | null;
  lastLapMark?: number;
  elapsedBefore?: number;
  laps?: Partial<StopwatchLap>[];
}

export function createStopwatch(clock?: Clock): StopwatchState {
  return {
    status: 'idle',
    startedAt: null,
    lastLapMark: 0,
    elapsedBefore: 0,
    laps: [],
    clock,
  };
}

function now(clock?: Clock): number {
  return clock?.now ? clock.now() : Date.now();
}

function assertRunning(state: StopwatchState): asserts state is StopwatchState & { startedAt: number } {
  if (state.status !== 'running' || state.startedAt === null) {
    throw new Error('Stopwatch is not running. Start it first.');
  }
}

export function startStopwatch(state: StopwatchState): StopwatchState {
  if (state.status === 'running') {
    throw new Error('Stopwatch already started.');
  }

  const timestamp = now(state.clock);
  return {
    ...state,
    status: 'running',
    startedAt: timestamp,
    lastLapMark: 0,
    elapsedBefore: state.status === 'stopped' ? 0 : state.elapsedBefore,
    laps: state.status === 'stopped' ? [] : state.laps,
  };
}

export function lapStopwatch(state: StopwatchState, label: string | null = null): StopwatchState {
  assertRunning(state);
  const timestamp = now(state.clock);
  const totalElapsed = state.elapsedBefore + (timestamp - state.startedAt);
  const lapDuration = totalElapsed - state.lastLapMark;
  if (lapDuration < 0) {
    throw new Error('Lap duration cannot be negative.');
  }
  const lap: StopwatchLap = {
    index: state.laps.length + 1,
    duration: lapDuration,
    total: totalElapsed,
  };
  if (label) {
    lap.label = label;
  }
  return {
    ...state,
    laps: [...state.laps, lap],
    lastLapMark: totalElapsed,
  };
}

export function stopStopwatch(state: StopwatchState): StopwatchState {
  assertRunning(state);
  const timestamp = now(state.clock);
  const totalElapsed = state.elapsedBefore + (timestamp - state.startedAt);
  if (totalElapsed < 0) {
    throw new Error('Elapsed time cannot be negative.');
  }
  return {
    ...state,
    status: 'stopped',
    startedAt: null,
    elapsedBefore: totalElapsed,
    lastLapMark: totalElapsed,
  };
}

export function resetStopwatch(state: StopwatchState): StopwatchState {
  return {
    ...state,
    status: 'idle',
    startedAt: null,
    elapsedBefore: 0,
    lastLapMark: 0,
    laps: [],
  };
}

export function getElapsed(state: StopwatchState): number {
  if (state.status === 'running' && state.startedAt !== null) {
    const timestamp = now(state.clock);
    return state.elapsedBefore + (timestamp - state.startedAt);
  }
  return state.elapsedBefore;
}

function pad(number: number): string {
  return number.toString().padStart(2, '0');
}

export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const remainingMilliseconds = Math.floor(milliseconds % 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${remainingMilliseconds.toString().padStart(3, '0')}`;
}

export function buildReport(state: StopwatchState): string {
  const elapsed = getElapsed(state);
  const lines: string[] = [];
  lines.push(`Status: ${state.status}`);
  lines.push(`Elapsed: ${formatDuration(elapsed)}`);
  if (state.laps.length > 0) {
    lines.push('Laps:');
    for (const lap of state.laps) {
      const label = lap.label ? ` (${lap.label})` : '';
      lines.push(`- #${lap.index}${label}: ${formatDuration(lap.duration)} (total ${formatDuration(lap.total)})`);
    }
  }
  return lines.join('\n');
}

export function serializeStopwatch(state: StopwatchState): string {
  return JSON.stringify({
    status: state.status,
    startedAt: state.startedAt,
    lastLapMark: state.lastLapMark,
    elapsedBefore: state.elapsedBefore,
    laps: state.laps,
  }, null, 2);
}

export function deserializeStopwatch(raw: SerializedStopwatch | null | undefined, clock?: Clock): StopwatchState {
  if (!raw) {
    return createStopwatch(clock);
  }
  return {
    status: raw.status ?? 'idle',
    startedAt: raw.startedAt ?? null,
    lastLapMark: raw.lastLapMark ?? 0,
    elapsedBefore: raw.elapsedBefore ?? 0,
    laps: Array.isArray(raw.laps)
      ? raw.laps.map((lap, index) => ({
        index: lap.index ?? index + 1,
        duration: lap.duration ?? 0,
        total: lap.total ?? 0,
        label: lap.label,
      }))
      : [],
    clock,
  };
}
