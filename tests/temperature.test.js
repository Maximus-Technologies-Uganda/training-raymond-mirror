import { describe, it, expect } from 'vitest';
import { celsiusToFahrenheit, fahrenheitToCelsius, convert } from '../src/temperature/index.js';

describe('Temperature Converter CLI', () => {
  describe('celsiusToFahrenheit', () => {
    it('should convert 0°C to 32°F', () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
    });

    it('should convert 100°C to 212°F', () => {
      expect(celsiusToFahrenheit(100)).toBe(212);
    });

    it('should convert -40°C to -40°F', () => {
      expect(celsiusToFahrenheit(-40)).toBe(-40);
    });
  });

  describe('fahrenheitToCelsius', () => {
    it('should convert 32°F to 0°C', () => {
      expect(fahrenheitToCelsius(32)).toBe(0);
    });

    it('should convert 212°F to 100°C', () => {
      expect(fahrenheitToCelsius(212)).toBe(100);
    });
  });

  describe('convert', () => {
    it('should convert 25 from C to F', () => {
      const result = convert('25', 'C', 'F');
      expect(parseFloat(result)).toBeCloseTo(77, 1);
    });

    it('should throw error for invalid from unit', () => {
      expect(() => {
        convert('25', 'K', 'F');
      }).toThrow('Invalid \'from\' unit');
    });

    it('should throw error for same units', () => {
      expect(() => {
        convert('25', 'C', 'C');
      }).toThrow('Source and target units cannot be the same');
    });

    it('should throw error for invalid temperature value', () => {
      expect(() => {
        convert('abc', 'C', 'F');
      }).toThrow('Invalid temperature value');
    });
  });
});
