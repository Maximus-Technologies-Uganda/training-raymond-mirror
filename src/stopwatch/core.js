function createStopwatch(clock) {
  return {
    status: 'idle',
    startedAt: null,
    lastLapMark: 0,
    elapsedBefore: 0,
    laps: [],
    clock,
  };
}

export { createStopwatch };

function now(clock) {
  return clock && clock.now ? clock.now() : Date.now();
}

function assertRunning(state) {
  if (state.status !== 'running' || state.startedAt === null) {
    throw new Error('Stopwatch is not running. Start it first.');
  }
}

export function startStopwatch(state) {
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

export function lapStopwatch(state, label = null) {
  assertRunning(state);
  const timestamp = now(state.clock);
  const totalElapsed = state.elapsedBefore + (timestamp - state.startedAt);
  const lapDuration = totalElapsed - state.lastLapMark;
  if (lapDuration < 0) {
    throw new Error('Lap duration cannot be negative.');
  }
  const lap = {
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

export function stopStopwatch(state) {
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

export function resetStopwatch(state) {
  return {
    ...state,
    status: 'idle',
    startedAt: null,
    elapsedBefore: 0,
    lastLapMark: 0,
    laps: [],
  };
}

export function getElapsed(state) {
  if (state.status === 'running' && state.startedAt !== null) {
    const timestamp = now(state.clock);
    return state.elapsedBefore + (timestamp - state.startedAt);
  }
  return state.elapsedBefore;
}

function pad(number) {
  return number.toString().padStart(2, '0');
}

export function formatDuration(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const remainingMilliseconds = Math.floor(milliseconds % 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${remainingMilliseconds.toString().padStart(3, '0')}`;
}

export function buildReport(state) {
  const elapsed = getElapsed(state);
  const lines = [];
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

export function serializeStopwatch(state) {
  return JSON.stringify(
    {
      status: state.status,
      startedAt: state.startedAt,
      lastLapMark: state.lastLapMark,
      elapsedBefore: state.elapsedBefore,
      laps: state.laps,
    },
    null,
    2,
  );
}

export function deserializeStopwatch(raw, clock) {
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
