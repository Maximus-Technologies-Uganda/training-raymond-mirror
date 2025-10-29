import { describe, expect, it } from 'vitest';
import { convertTemperature, parseUnits } from '../../src/temperature/core.js';

describe('temperature core', () => {
  it('normalizes units and converts Celsius to Fahrenheit', () => {
    const units = parseUnits('c', 'F');
    expect(units.from).toBe('C');
    expect(units.to).toBe('F');
    expect(convertTemperature(37, 'C', 'F')).toBeCloseTo(98.6, 2);
  });

  it('converts Fahrenheit to Celsius with rounding', () => {
    expect(convertTemperature(98.6, 'F', 'C')).toBeCloseTo(37, 2);
  });

  it('throws for identical units', () => {
    expect(() => parseUnits('c', 'C')).toThrow('must differ');
  });
});
