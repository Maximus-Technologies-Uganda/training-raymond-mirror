/**
 * Deterministic testing helpers for UI components.
 * Provides seeded random number generation and controllable clock for reproducible tests.
 */

import { createSeededRandom } from '../lib/random/seeded.js';

export type { SeededRandom } from '../lib/random/seeded.js';

/**
 * Controllable clock for deterministic time-dependent tests.
 */
export interface TestClock {
  /** Returns current time as a Date object */
  now(): Date;
  /** Advances the clock by the specified milliseconds */
  advanceBy(milliseconds: number): void;
  /** Sets the clock to an absolute time */
  advanceTo(instant: Date | string | number): void;
  /** Temporarily sets time for the duration of a callback */
  withFixedNow<T>(instant: Date | string | number, run: () => T): T;
}

export { createSeededRandom };

/**
 * Converts various time representations to milliseconds since epoch.
 */
function toTimestamp(value: Date | string | number): number {
  if (value instanceof Date) {
    const time = value.getTime();
    if (Number.isNaN(time)) {
      throw new Error('Invalid Date provided to clock.');
    }
    return time;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('Timestamp must be finite.');
    }
    return value;
  }

  const parsed = new Date(value);
  const timestamp = parsed.getTime();
  if (Number.isNaN(timestamp)) {
    throw new Error('Invalid ISO timestamp provided to clock.');
  }
  return timestamp;
}

/**
 * Creates a controllable clock for deterministic time-dependent tests.
 * Essential for testing ToDo boundaries (yesterday/today/tomorrow) and time-based UI.
 *
 * @example
 * ```ts
 * const clock = createTestClock('2025-11-03T08:00:00Z');
 * clock.advanceBy(60_000); // +1 minute
 * expect(clock.now().toISOString()).toBe('2025-11-03T08:01:00.000Z');
 *
 * // Scoped time control
 * const result = clock.withFixedNow('2025-12-31T23:59:59Z', () => {
 *   return someTimeDependentFunction(clock.now());
 * });
 * // Clock returns to previous time after callback
 * ```
 */
export function createTestClock(initial: Date | string | number = new Date()): TestClock {
  const baseline = toTimestamp(initial);
  let current = baseline;

  return {
    now(): Date {
      return new Date(current);
    },

    advanceBy(milliseconds: number): void {
      if (!Number.isFinite(milliseconds)) {
        throw new Error('Milliseconds must be a finite number.');
      }
      current += milliseconds;
    },

    advanceTo(instant: Date | string | number): void {
      current = toTimestamp(instant);
    },

    withFixedNow<T>(instant: Date | string | number, run: () => T): T {
      const previous = current;
      current = toTimestamp(instant);
      try {
        return run();
      } finally {
        current = previous;
      }
    },
  };
}
