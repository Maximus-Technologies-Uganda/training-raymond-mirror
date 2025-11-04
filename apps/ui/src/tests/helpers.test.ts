import { describe, expect, it } from 'vitest';
import { createSeededRandom, createTestClock } from './helpers.js';

describe('createSeededRandom', () => {
  describe('determinism', () => {
    it('produces identical sequences for the same numeric seed', () => {
      const rng1 = createSeededRandom(42);
      const rng2 = createSeededRandom(42);

      const sequence1 = [rng1.next(), rng1.next(), rng1.next()];
      const sequence2 = [rng2.next(), rng2.next(), rng2.next()];

      expect(sequence1).toEqual(sequence2);
    });

    it('produces identical sequences for the same string seed', () => {
      const rng1 = createSeededRandom('week3-test');
      const rng2 = createSeededRandom('week3-test');

      const sequence1 = [rng1.next(), rng1.next(), rng1.next()];
      const sequence2 = [rng2.next(), rng2.next(), rng2.next()];

      expect(sequence1).toEqual(sequence2);
    });

    it('produces different sequences for different seeds', () => {
      const rng1 = createSeededRandom('seed-a');
      const rng2 = createSeededRandom('seed-b');

      const val1 = rng1.next();
      const val2 = rng2.next();

      expect(val1).not.toEqual(val2);
    });
  });

  describe('next()', () => {
    it('returns values in the range [0, 1)', () => {
      const rng = createSeededRandom(123);

      for (let i = 0; i < 100; i += 1) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('produces different values on successive calls', () => {
      const rng = createSeededRandom(999);

      const values = new Set([rng.next(), rng.next(), rng.next(), rng.next(), rng.next()]);
      expect(values.size).toBeGreaterThan(1);
    });
  });

  describe('nextInt()', () => {
    it('returns integers in the range [0, max)', () => {
      const rng = createSeededRandom(456);
      const max = 10;

      for (let i = 0; i < 50; i += 1) {
        const value = rng.nextInt(max);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(max);
      }
    });

    it('throws for invalid max values', () => {
      const rng = createSeededRandom(1);

      expect(() => rng.nextInt(0)).toThrow('must be a positive finite number');
      expect(() => rng.nextInt(-5)).toThrow('must be a positive finite number');
      expect(() => rng.nextInt(Number.POSITIVE_INFINITY)).toThrow('must be a positive finite number');
      expect(() => rng.nextInt(Number.NaN)).toThrow('must be a positive finite number');
    });

    it('produces deterministic sequences', () => {
      const rng1 = createSeededRandom(789);
      const rng2 = createSeededRandom(789);

      const sequence1 = [rng1.nextInt(100), rng1.nextInt(100), rng1.nextInt(100)];
      const sequence2 = [rng2.nextInt(100), rng2.nextInt(100), rng2.nextInt(100)];

      expect(sequence1).toEqual(sequence2);
    });
  });

  describe('pick()', () => {
    it('selects items deterministically', () => {
      const items = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];
      const rng1 = createSeededRandom('pick-test');
      const rng2 = createSeededRandom('pick-test');

      const picks1 = [rng1.pick(items), rng1.pick(items), rng1.pick(items)];
      const picks2 = [rng2.pick(items), rng2.pick(items), rng2.pick(items)];

      expect(picks1).toEqual(picks2);
    });

    it('only picks items from the provided collection', () => {
      const items = ['A', 'B', 'C'];
      const rng = createSeededRandom(321);

      for (let i = 0; i < 20; i += 1) {
        const picked = rng.pick(items);
        expect(items).toContain(picked);
      }
    });

    it('throws when picking from an empty collection', () => {
      const rng = createSeededRandom(1);
      expect(() => rng.pick([])).toThrow('Cannot pick from an empty collection');
    });

    it('always returns the only item in a single-item collection', () => {
      const rng = createSeededRandom(42);
      const singleItem = ['only'];

      expect(rng.pick(singleItem)).toBe('only');
      expect(rng.pick(singleItem)).toBe('only');
    });
  });

  describe('shuffle()', () => {
    it('returns a shuffled copy with all original elements', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8];
      const rng = createSeededRandom('shuffle-test');

      const shuffled = rng.shuffle(original);

      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.slice().sort()).toEqual(original.slice().sort());
    });

    it('does not mutate the original array', () => {
      const original = ['a', 'b', 'c', 'd'];
      const rng = createSeededRandom(555);

      const before = [...original];
      rng.shuffle(original);

      expect(original).toEqual(before);
    });

    it('produces deterministic shuffle order', () => {
      const items = [1, 2, 3, 4, 5];
      const rng1 = createSeededRandom('shuffle-seed');
      const rng2 = createSeededRandom('shuffle-seed');

      const shuffled1 = rng1.shuffle(items);
      const shuffled2 = rng2.shuffle(items);

      expect(shuffled1).toEqual(shuffled2);
    });

    it('handles empty arrays', () => {
      const rng = createSeededRandom(1);
      expect(rng.shuffle([])).toEqual([]);
    });

    it('handles single-element arrays', () => {
      const rng = createSeededRandom(2);
      expect(rng.shuffle([42])).toEqual([42]);
    });
  });

  describe('reset()', () => {
    it('resets the generator to reproduce the initial sequence', () => {
      const rng = createSeededRandom('reset-test');

      const firstRun = [rng.next(), rng.next(), rng.next()];
      rng.reset();
      const secondRun = [rng.next(), rng.next(), rng.next()];

      expect(firstRun).toEqual(secondRun);
    });

    it('resets nextInt sequences', () => {
      const rng = createSeededRandom(777);

      const firstRun = [rng.nextInt(100), rng.nextInt(100), rng.nextInt(100)];
      rng.reset();
      const secondRun = [rng.nextInt(100), rng.nextInt(100), rng.nextInt(100)];

      expect(firstRun).toEqual(secondRun);
    });

    it('resets pick sequences', () => {
      const items = ['x', 'y', 'z'];
      const rng = createSeededRandom('pick-reset');

      const firstRun = [rng.pick(items), rng.pick(items)];
      rng.reset();
      const secondRun = [rng.pick(items), rng.pick(items)];

      expect(firstRun).toEqual(secondRun);
    });
  });
});

describe('createTestClock', () => {
  describe('initialization', () => {
    it('starts at the provided Date object', () => {
      const baseline = new Date('2025-11-03T08:00:00Z');
      const clock = createTestClock(baseline);

      expect(clock.now().toISOString()).toBe('2025-11-03T08:00:00.000Z');
    });

    it('starts at the provided ISO string', () => {
      const clock = createTestClock('2025-11-03T12:30:45.678Z');

      expect(clock.now().toISOString()).toBe('2025-11-03T12:30:45.678Z');
    });

    it('starts at the provided timestamp', () => {
      const timestamp = new Date('2025-01-01T00:00:00Z').getTime();
      const clock = createTestClock(timestamp);

      expect(clock.now().toISOString()).toBe('2025-01-01T00:00:00.000Z');
    });

    it('throws for invalid date strings', () => {
      expect(() => createTestClock('not-a-date')).toThrow('Invalid ISO timestamp');
    });

    it('throws for invalid Date objects', () => {
      expect(() => createTestClock(new Date('invalid'))).toThrow('Invalid Date provided to clock');
    });

    it('throws for non-finite timestamps', () => {
      expect(() => createTestClock(Number.POSITIVE_INFINITY)).toThrow('Timestamp must be finite');
    });
  });

  describe('now()', () => {
    it('returns a new Date object each time', () => {
      const clock = createTestClock('2025-11-03T08:00:00Z');

      const date1 = clock.now();
      const date2 = clock.now();

      expect(date1).not.toBe(date2); // Different objects
      expect(date1.getTime()).toBe(date2.getTime()); // Same time
    });

    it('returns the current clock time', () => {
      const clock = createTestClock('2025-11-03T08:00:00Z');

      expect(clock.now().toISOString()).toBe('2025-11-03T08:00:00.000Z');
    });
  });

  describe('advanceBy()', () => {
    it('advances the clock by the specified milliseconds', () => {
      const clock = createTestClock('2025-11-03T08:00:00Z');

      clock.advanceBy(60_000); // +1 minute
      expect(clock.now().toISOString()).toBe('2025-11-03T08:01:00.000Z');

      clock.advanceBy(3600_000); // +1 hour
      expect(clock.now().toISOString()).toBe('2025-11-03T09:01:00.000Z');
    });

    it('supports negative advancement (going backward)', () => {
      const clock = createTestClock('2025-11-03T12:00:00Z');

      clock.advanceBy(-3600_000); // -1 hour
      expect(clock.now().toISOString()).toBe('2025-11-03T11:00:00.000Z');
    });

    it('throws for non-finite milliseconds', () => {
      const clock = createTestClock('2025-11-03T08:00:00Z');

      expect(() => clock.advanceBy(Number.NaN)).toThrow('Milliseconds must be a finite number');
      expect(() => clock.advanceBy(Number.POSITIVE_INFINITY)).toThrow('Milliseconds must be a finite number');
    });

    it('accumulates multiple advances', () => {
      const clock = createTestClock('2025-01-01T00:00:00Z');

      clock.advanceBy(1000);
      clock.advanceBy(2000);
      clock.advanceBy(3000);

      expect(clock.now().toISOString()).toBe('2025-01-01T00:00:06.000Z');
    });
  });

  describe('advanceTo()', () => {
    it('sets the clock to an absolute time using Date', () => {
      const clock = createTestClock('2025-11-03T08:00:00Z');

      clock.advanceTo(new Date('2025-12-25T00:00:00Z'));
      expect(clock.now().toISOString()).toBe('2025-12-25T00:00:00.000Z');
    });

    it('sets the clock to an absolute time using ISO string', () => {
      const clock = createTestClock('2025-11-03T08:00:00Z');

      clock.advanceTo('2025-06-15T14:30:00Z');
      expect(clock.now().toISOString()).toBe('2025-06-15T14:30:00.000Z');
    });

    it('sets the clock to an absolute time using timestamp', () => {
      const clock = createTestClock('2025-11-03T08:00:00Z');
      const targetTimestamp = new Date('2025-02-14T12:00:00Z').getTime();

      clock.advanceTo(targetTimestamp);
      expect(clock.now().toISOString()).toBe('2025-02-14T12:00:00.000Z');
    });

    it('can go backward in time', () => {
      const clock = createTestClock('2025-11-03T08:00:00Z');

      clock.advanceTo('2025-01-01T00:00:00Z');
      expect(clock.now().toISOString()).toBe('2025-01-01T00:00:00.000Z');
    });

    it('throws for invalid time values', () => {
      const clock = createTestClock('2025-11-03T08:00:00Z');

      expect(() => clock.advanceTo('invalid-date')).toThrow('Invalid ISO timestamp');
      expect(() => clock.advanceTo(new Date('invalid'))).toThrow('Invalid Date provided to clock');
      expect(() => clock.advanceTo(Number.NaN)).toThrow('Timestamp must be finite');
    });
  });

  describe('withFixedNow()', () => {
    it('temporarily sets time for the duration of the callback', () => {
      const clock = createTestClock('2025-11-03T08:00:00Z');

      const result = clock.withFixedNow('2025-12-31T23:59:59Z', () => {
        return clock.now().toISOString();
      });

      expect(result).toBe('2025-12-31T23:59:59.000Z');
      expect(clock.now().toISOString()).toBe('2025-11-03T08:00:00.000Z'); // Restored
    });

    it('returns the callback result', () => {
      const clock = createTestClock('2025-11-03T08:00:00Z');

      const result = clock.withFixedNow('2025-01-01T00:00:00Z', () => {
        return 'callback-result';
      });

      expect(result).toBe('callback-result');
    });

    it('restores time even if the callback throws', () => {
      const clock = createTestClock('2025-11-03T08:00:00Z');

      expect(() => {
        clock.withFixedNow('2025-12-31T00:00:00Z', () => {
          throw new Error('test error');
        });
      }).toThrow('test error');

      expect(clock.now().toISOString()).toBe('2025-11-03T08:00:00.000Z'); // Still restored
    });

    it('supports nested withFixedNow calls', () => {
      const clock = createTestClock('2025-11-03T08:00:00Z');

      const outer = clock.withFixedNow('2025-06-01T00:00:00Z', () => {
        const outerTime = clock.now().toISOString();

        const inner = clock.withFixedNow('2025-09-01T00:00:00Z', () => {
          return clock.now().toISOString();
        });

        return { outerTime, inner, restored: clock.now().toISOString() };
      });

      expect(outer).toEqual({
        outerTime: '2025-06-01T00:00:00.000Z',
        inner: '2025-09-01T00:00:00.000Z',
        restored: '2025-06-01T00:00:00.000Z',
      });
      expect(clock.now().toISOString()).toBe('2025-11-03T08:00:00.000Z');
    });

    it('works with Date objects', () => {
      const clock = createTestClock('2025-11-03T08:00:00Z');

      const result = clock.withFixedNow(new Date('2025-03-15T10:30:00Z'), () => {
        return clock.now().toISOString();
      });

      expect(result).toBe('2025-03-15T10:30:00.000Z');
    });

    it('works with timestamps', () => {
      const clock = createTestClock('2025-11-03T08:00:00Z');
      const timestamp = new Date('2025-07-04T12:00:00Z').getTime();

      const result = clock.withFixedNow(timestamp, () => {
        return clock.now().toISOString();
      });

      expect(result).toBe('2025-07-04T12:00:00.000Z');
    });
  });

  describe('integration scenarios', () => {
    it('supports testing time-dependent logic', () => {
      const clock = createTestClock('2025-11-02T00:00:00Z');

      const isWeekend = (date: Date): boolean => {
        const day = date.getUTCDay();
        return day === 0 || day === 6;
      };

      expect(isWeekend(clock.now())).toBe(true); // Sunday Nov 2, 2025

      clock.advanceTo('2025-11-03T00:00:00Z'); // Monday
      expect(isWeekend(clock.now())).toBe(false);
    });

    it('supports testing date boundaries', () => {
      const clock = createTestClock('2025-11-03T23:59:59Z');

      const dateBefore = clock.now().toISOString().split('T')[0];
      expect(dateBefore).toBe('2025-11-03');

      clock.advanceBy(2000); // +2 seconds, cross midnight

      const dateAfter = clock.now().toISOString().split('T')[0];
      expect(dateAfter).toBe('2025-11-04');
    });
  });
});
