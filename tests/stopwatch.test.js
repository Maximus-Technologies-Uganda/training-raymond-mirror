import { describe, it, expect, beforeEach } from 'vitest';
import { Stopwatch } from '../src/stopwatch/index.js';

describe('Stopwatch CLI', () => {
  let stopwatch;

  beforeEach(() => {
    stopwatch = new Stopwatch();
  });

  it('should start the stopwatch', () => {
    const result = stopwatch.start();
    expect(result).toBe('Stopwatch started');
    expect(stopwatch.isRunning).toBe(true);
  });

  it('should record a lap time', () => {
    stopwatch.start();
    const lapTime = stopwatch.lap();
    expect(lapTime).toMatch(/\d+s \d+ms/);
    expect(stopwatch.getLaps().length).toBe(1);
  });

  it('should throw error when lapping before start', () => {
    expect(() => {
      stopwatch.lap();
    }).toThrow('Stopwatch not started');
  });

  it('should stop the stopwatch', () => {
    stopwatch.start();
    const stopTime = stopwatch.stop();
    expect(stopTime).toMatch(/\d+s \d+ms/);
    expect(stopwatch.isRunning).toBe(false);
  });

  it('should throw error when stopping before start', () => {
    expect(() => {
      stopwatch.stop();
    }).toThrow('Stopwatch not running');
  });
});
