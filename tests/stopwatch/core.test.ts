import { describe, expect, it } from 'vitest';
import {
  buildReport,
  createStopwatch,
  lapStopwatch,
  resetStopwatch,
  startStopwatch,
  stopStopwatch,
} from '../../src/stopwatch/core.js';

function createClock(values: number[]) {
  let index = 0;
  return {
    now: () => {
      if (index >= values.length) {
        return values[values.length - 1];
      }
      const value = values[index];
      index += 1;
      return value;
    },
  };
}

describe('stopwatch core', () => {
  it('supports start, lap, and stop with deterministic timing', () => {
    const clock = createClock([0, 1000, 2000, 3000]);
    let state = createStopwatch(clock);
    state = startStopwatch(state);
    state = lapStopwatch(state);
    expect(state.laps[0].duration).toBe(1000);
    state = lapStopwatch(state);
    expect(state.laps[1].duration).toBe(1000);
    state = stopStopwatch(state);
    expect(state.elapsedBefore).toBe(3000);
    const report = buildReport(state);
    expect(report).toContain('Elapsed: 00:00:03.000');
  });

  it('prevents lap before start', () => {
    const clock = createClock([0]);
    const state = createStopwatch(clock);
    expect(() => lapStopwatch(state)).toThrow('Stopwatch is not running');
  });

  it('prevents double start', () => {
    const clock = createClock([0]);
    let state = createStopwatch(clock);
    state = startStopwatch(state);
    expect(() => startStopwatch(state)).toThrow('already started');
  });

  it('resets to idle', () => {
    const clock = createClock([0, 1000]);
    let state = createStopwatch(clock);
    state = startStopwatch(state);
    state = stopStopwatch(state);
    state = resetStopwatch(state);
    expect(state.status).toBe('idle');
    expect(state.laps).toHaveLength(0);
  });
});
