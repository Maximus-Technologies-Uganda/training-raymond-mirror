import { describe, it, expect } from 'vitest';
import { formatGreeting } from '../src/hello/index.js';

describe('Hello CLI', () => {
  it('should greet with default name', () => {
    const result = formatGreeting();
    expect(result).toBe('Hello, World!');
  });

  it('should greet with provided name', () => {
    const result = formatGreeting('Raymond');
    expect(result).toBe('Hello, Raymond!');
  });

  it('should shout when shout flag is true', () => {
    const result = formatGreeting('John', true);
    expect(result).toBe('HELLO, JOHN!');
  });

  it('should work with default name and shout', () => {
    const result = formatGreeting('World', true);
    expect(result).toBe('HELLO, WORLD!');
  });
});
