import { describe, expect, it } from 'vitest';
import { runTemperatureCli } from '../../src/cli/temperature.js';

function createIO() {
  const out: string[] = [];
  const err: string[] = [];
  return {
    stdout: (message: string) => out.push(message),
    stderr: (message: string) => err.push(message),
    out,
    err,
  };
}

describe('temperature CLI', () => {
  it('converts values with lowercase units', () => {
    const io = createIO();
    const code = runTemperatureCli(['--from', 'c', '--to', 'f', '--value', '37'], io);
    expect(code).toBe(0);
    expect(io.out[0]).toBe('37°C = 98.60°F');
  });

  it('rejects identical units', () => {
    const io = createIO();
    const code = runTemperatureCli(['--from', 'c', '--to', 'C', '--value', '10'], io);
    expect(code).toBe(2);
    expect(io.err[0]).toContain('differ');
  });
});
