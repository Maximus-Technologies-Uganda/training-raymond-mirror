/**
 * Deterministic testing helpers for UI components.
 * Provides seeded random number generation and controllable clock for reproducible tests.
 */

/**
 * Seeded random number generator with utility methods for common test scenarios.
 */
export interface SeededRandom {
  /** Returns a deterministic number in [0, 1) */
  next(): number;
  /** Returns a deterministic integer in [0, maxExclusive) */
  nextInt(maxExclusive: number): number;
  /** Selects a random item from the collection */
  pick<T>(values: readonly T[]): T;
  /** Returns a shuffled copy of the collection */
  shuffle<T>(values: readonly T[]): T[];
  /** Resets the generator to its initial seed state */
  reset(): void;
}

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

/**
 * Converts various seed inputs into a normalized numeric seed.
 */
function toSeedValue(seed: number | string): number {
  if (typeof seed === 'number') {
    if (!Number.isFinite(seed)) {
      throw new Error('Seed must be a finite number.');
    }
    return Math.abs(Math.floor(seed)) || 1;
  }

  // String hashing using simple multiplicative hash
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    const char = seed.charCodeAt(index);
    hash = ((hash << 5) - hash + char) | 0; // hash * 31 + char
  }
  return Math.abs(hash) || 1;
}

/**
 * Creates a PRNG function using SplitMix32-inspired algorithm for better distribution.
 */
function createGenerator(seedValue: number): () => number {
  let state = seedValue >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let temp = state;
    temp = Math.imul(temp ^ (temp >>> 15), temp | 1);
    temp ^= temp + Math.imul(temp ^ (temp >>> 7), temp | 61);
    return ((temp ^ (temp >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Creates a deterministic pseudo-random number generator.
 * Useful for testing randomized UI behaviors (quote selection, shuffling, etc.).
 *
 * @example
 * ```ts
 * const rng = createSeededRandom('test-seed');
 * const quote = rng.pick(['A', 'B', 'C']); // Always picks the same item
 * const shuffled = rng.shuffle([1, 2, 3, 4]); // Always same order
 * ```
 */
export function createSeededRandom(seed: number | string): SeededRandom {
  const initialSeed = toSeedValue(seed);
  let generator = createGenerator(initialSeed);

  return {
    next(): number {
      return generator();
    },

    nextInt(maxExclusive: number): number {
      if (!Number.isFinite(maxExclusive) || maxExclusive <= 0) {
        throw new Error('maxExclusive must be a positive finite number.');
      }
      return Math.floor(generator() * maxExclusive);
    },

    pick<T>(values: readonly T[]): T {
      if (values.length === 0) {
        throw new Error('Cannot pick from an empty collection.');
      }
      const index = this.nextInt(values.length);
      return values[index];
    },

    shuffle<T>(values: readonly T[]): T[] {
      const mutable = [...values];
      // Fisher-Yates shuffle
      for (let index = mutable.length - 1; index > 0; index -= 1) {
        const swapIndex = this.nextInt(index + 1);
        [mutable[index], mutable[swapIndex]] = [mutable[swapIndex], mutable[index]];
      }
      return mutable;
    },

    reset(): void {
      generator = createGenerator(initialSeed);
    },
  };
}

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
