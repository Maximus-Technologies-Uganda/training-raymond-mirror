/**
 * UI Clock Adapter Library
 *
 * Provides clock abstractions for the UI layer that bridge between:
 * - UI components expecting Date instances
 * - CLI todo core expecting millisecond timestamps
 *
 * This enables deterministic testing through clock injection while maintaining
 * clean separation between presentation and business logic layers.
 *
 * @module lib/time/clock
 */

import type { Clock as TodoClock } from '@todo/core';

/**
 * UI-friendly clock abstraction that returns Date instances.
 * Enables deterministic testing by injecting a controllable clock.
 */
export interface UiClock {
  /** Returns the current time as a Date object */
  now(): Date;
}

/**
 * Normalizes various instant representations to milliseconds since epoch.
 * Validates input to prevent invalid dates from propagating through the system.
 *
 * @param instant - Date, ISO string, or millisecond timestamp
 * @returns Milliseconds since Unix epoch
 * @throws Error if instant is invalid or NaN
 */
function normalizeInstant(instant: Date | string | number): number {
  if (instant instanceof Date) {
    const timestamp = instant.getTime();
    if (Number.isNaN(timestamp)) {
      throw new Error('Invalid Date provided to clock.');
    }
    return timestamp;
  }

  if (typeof instant === 'number') {
    if (!Number.isFinite(instant)) {
      throw new Error('Clock instant must be a finite number.');
    }
    return instant;
  }

  const parsed = new Date(instant);
  const timestamp = parsed.getTime();
  if (Number.isNaN(timestamp)) {
    throw new Error('Invalid ISO timestamp provided to clock.');
  }
  return timestamp;
}

/**
 * Creates a system-backed clock that always returns the current time.
 * Use this for production code that needs real-time behavior.
 *
 * @example
 * ```ts
 * const clock = createSystemClock();
 * const now = clock.now(); // Current system time
 * ```
 */
export function createSystemClock(): UiClock {
  return {
    now(): Date {
      return new Date();
    }
  };
}

/**
 * Creates a fixed clock locked to the provided instant.
 * Essential for deterministic testing where time-dependent behavior
 * must be reproducible across test runs.
 *
 * @param instant - The fixed time point (Date, ISO string, or timestamp)
 * @returns UiClock that always returns the same time
 *
 * @example
 * ```ts
 * const clock = createFixedClock('2025-11-05T09:00:00Z');
 * const now1 = clock.now();
 * // ... time passes in real world ...
 * const now2 = clock.now();
 * // now1.getTime() === now2.getTime() // Always true
 * ```
 */
export function createFixedClock(instant: Date | string | number): UiClock {
  const timestamp = normalizeInstant(instant);
  return {
    now(): Date {
      return new Date(timestamp);
    }
  };
}

/**
 * Wraps a UI clock into the CLI-friendly TodoClock that returns milliseconds.
 * This adapter enables UI components to work with Date objects while the
 * todo core logic operates on timestamps.
 *
 * @param clock - UiClock instance
 * @returns TodoClock instance compatible with @todo/core
 *
 * @example
 * ```ts
 * const uiClock = createFixedClock('2025-11-05T09:00:00Z');
 * const todoClock = toTodoClock(uiClock);
 *
 * const deps: TodoDependencies = { clock: todoClock };
 * const result = addTodo(state, input, deps); // Uses injected clock
 * ```
 */
export function toTodoClock(clock: UiClock): TodoClock {
  return {
    now(): number {
      return clock.now().getTime();
    }
  };
}

/**
 * Extracts the date portion (YYYY-MM-DD) from a Date instance in UTC.
 * Used for comparing calendar dates independent of time zones.
 *
 * @param date - The date to convert
 * @returns ISO date string (YYYY-MM-DD)
 *
 * @example
 * ```ts
 * const date = new Date('2025-11-05T23:59:59Z');
 * toDateOnly(date); // "2025-11-05"
 * ```
 */
export function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Calculates the difference in calendar days between two ISO date strings.
 * Uses UTC midnight for consistent day boundaries across time zones.
 *
 * @param targetDate - ISO date string (YYYY-MM-DD)
 * @param currentDate - ISO date string (YYYY-MM-DD)
 * @returns Number of days (positive = future, negative = past, 0 = same day)
 *
 * @example
 * ```ts
 * differenceInDays('2025-11-10', '2025-11-05'); // 5
 * differenceInDays('2025-11-01', '2025-11-05'); // -4
 * differenceInDays('2025-11-05', '2025-11-05'); // 0
 * ```
 */
export function differenceInDays(targetDate: string, currentDate: string): number {
  const target = parseDateOnly(targetDate);
  const current = parseDateOnly(currentDate);
  const MS_PER_DAY = 86_400_000;
  return Math.round((target - current) / MS_PER_DAY);
}

/**
 * Parses an ISO date string (YYYY-MM-DD) into UTC midnight milliseconds.
 * Validates format to prevent ambiguous date interpretations.
 *
 * @param value - ISO date string
 * @returns Milliseconds since epoch at UTC midnight
 * @throws Error if format is invalid
 */
function parseDateOnly(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Date must use YYYY-MM-DD format.');
  }
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

/**
 * Type guard for error objects with message property.
 * Useful for safe error handling in catch blocks.
 */
export function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

/**
 * Safely extracts error message from unknown error types.
 * Provides graceful fallback for non-standard error objects.
 *
 * @param error - Any thrown value
 * @returns Human-readable error message
 */
export function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
