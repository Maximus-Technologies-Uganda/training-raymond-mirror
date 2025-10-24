import { describe, it, expect } from 'vitest';
import { convertCtoF, convertFtoC, convertTemperature } from '../src/temperature/index.js';

describe('Temperature Converter', () => {
  it('converts Celsius to Fahrenheit', () => {
    expect(convertCtoF(0)).toBe(32);
    expect(Math.round(convertCtoF(100))).toBe(212);
    expect(convertTemperature('C', 'F', 0)).toBe(32);
  });

  it('converts Fahrenheit to Celsius', () => {
    expect(convertFtoC(212)).toBe(100);
    expect(Math.round(convertFtoC(32))).toBe(0);
    expect(convertTemperature('F', 'C', 212)).toBe(100);
  });

  it('rejects same units', () => {
    expect(() => convertTemperature('C', 'C', 10)).toThrow('must differ');
  });

  it('rejects invalid unit', () => {
    expect(() => convertTemperature('X', 'C', 10)).toThrow('Invalid unit');
    expect(() => convertTemperature('C', 'Z', 10)).toThrow('Invalid unit');
  });

  it('rejects non-numeric value', () => {
    // @ts-expect-error
    expect(() => convertTemperature('C', 'F', 'abc')).toThrow('number');
  });
});


