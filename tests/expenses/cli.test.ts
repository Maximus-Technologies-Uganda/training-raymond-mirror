import { describe, expect, it } from 'vitest';
import { runExpensesCli } from '../../src/cli/expenses.js';

function createStubIO() {
  const out: string[] = [];
  const err: string[] = [];
  return {
    stdout: (message: string) => out.push(message),
    stderr: (message: string) => err.push(message),
    out,
    err,
  };
}

describe('expenses CLI', () => {
  it('prints totals for sample data filtered by month', async () => {
    const io = createStubIO();
    const code = await runExpensesCli(['--sample', '--month', 'Feb'], io);
    expect(code).toBe(0);
    expect(io.out.join('\n')).toContain('Total: $132.10');
  });

  it('fails when input file cannot be read', async () => {
    const io = createStubIO();
    const code = await runExpensesCli(['--input', 'missing.csv'], io, {
      readFile: () => Promise.reject(Object.assign(new Error('no file'), { code: 'ENOENT' })),
    });
    expect(code).toBe(2);
    expect(io.err[0]).toContain('Could not read input file');
  });

  it('errors on empty dataset', async () => {
    const io = createStubIO();
    const code = await runExpensesCli(['--sample', '--category', 'Unknown'], io);
    expect(code).toBe(2);
    expect(io.err[0]).toContain('No expenses found');
  });
});
