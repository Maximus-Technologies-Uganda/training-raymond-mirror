/**
 * Deterministic pseudo-random number generator utilities.
 *
 * Shared between production UI code and tests to guarantee
 * reproducible quote selection without depending on Math.random.
 */
export interface SeededRandom {
  /** Returns the next random number in the range [0, 1). */
  next(): number;
  /** Returns a deterministic integer in the range [0, maxExclusive). */
  nextInt(maxExclusive: number): number;
  /** Picks a value from the provided collection using deterministic randomness. */
  pick<T>(values: readonly T[]): T;
  /** Returns a deterministically shuffled copy of the provided collection. */
  shuffle<T>(values: readonly T[]): T[];
  /** Resets the generator back to its initial seed state. */
  reset(): void;
}

function toSeedValue(seed: number | string): number {
  if (typeof seed === 'number') {
    if (!Number.isFinite(seed)) {
      throw new Error('Seed must be a finite number.');
    }
    const normalized = Math.floor(Math.abs(seed));
    return normalized === 0 ? 1 : normalized;
  }

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    const char = seed.charCodeAt(index);
    hash = ((hash << 5) - hash + char) | 0; // hash * 31 + char
  }
  const normalized = Math.abs(hash);
  return normalized === 0 ? 1 : normalized;
}

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
