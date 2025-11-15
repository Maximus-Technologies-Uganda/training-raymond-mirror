import { describe, expect, it } from 'vitest';
import { runQuoteCli } from '../../src/cli/quote.js';

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

const SAMPLE_DATA = JSON.stringify([
  {
    text: 'Success is liking yourself, liking what you do, and liking how you do it.',
    author: 'Maya Angelou',
    tags: ['inspiration', 'success'],
  },
  {
    text: 'If you want to lift yourself up, lift up someone else.',
    author: 'Booker T. Washington',
    tags: ['service'],
  },
  {
    text: 'It always seems impossible until it is done.',
    author: 'Nelson Mandela',
    tags: ['inspiration', 'perseverance'],
  },
]);

describe('quote CLI', () => {
  it('prints a quote filtered by author', async () => {
    const io = createIO();
    const code = await runQuoteCli(
      ['--input', 'quotes.json', '--author', 'maya angelou'],
      io,
      {
        readFile: async (path) => {
          if (path === 'quotes.json') {
            return SAMPLE_DATA;
          }
          throw Object.assign(new Error('not found'), { code: 'ENOENT' });
        },
      },
    );

    expect(code).toBe(0);
    expect(io.out).toEqual([
      '"Success is liking yourself, liking what you do, and liking how you do it." — Maya Angelou (tags: inspiration, success)',
    ]);
  });

  it('filters quotes by tag case-insensitively', async () => {
    const io = createIO();
    const code = await runQuoteCli(
      ['--input', 'quotes.json', '--tag', 'Perseverance'],
      io,
      {
        readFile: async () => SAMPLE_DATA,
      },
    );

    expect(code).toBe(0);
    expect(io.out[0]).toBe('"It always seems impossible until it is done." — Nelson Mandela (tags: inspiration, perseverance)');
  });

  it('selects a deterministic quote when using a seed without filters', async () => {
    const io = createIO();
    const code = await runQuoteCli(
      ['--input', 'quotes.json', '--seed', '7'],
      io,
      {
        readFile: async () => SAMPLE_DATA,
      },
    );

    expect(code).toBe(0);
    expect(io.out[0]).toBe('"Success is liking yourself, liking what you do, and liking how you do it." — Maya Angelou (tags: inspiration, success)');
  });

  it('supports deterministic selection using string seeds', async () => {
    const firstRun = createIO();
    const secondRun = createIO();

    const argv = ['--input', 'quotes.json', '--seed', 'quote-demo-seed'];
    const env = { readFile: async () => SAMPLE_DATA };

    const [firstCode, secondCode] = await Promise.all([
      runQuoteCli(argv, firstRun, env),
      runQuoteCli(argv, secondRun, env),
    ]);

    expect(firstCode).toBe(0);
    expect(secondCode).toBe(0);
    expect(firstRun.out[0]).toBe(secondRun.out[0]);
  });

  it('returns a non-zero exit code when author is not found', async () => {
    const io = createIO();
    const code = await runQuoteCli(
      ['--input', 'quotes.json', '--author', 'Unknown'],
      io,
      {
        readFile: async () => SAMPLE_DATA,
      },
    );

    expect(code).toBe(1);
    expect(io.err[0]).toBe('No quotes found for author "Unknown".');
  });

  it('fails when the dataset is empty', async () => {
    const io = createIO();
    const code = await runQuoteCli(
      ['--input', 'quotes.json'],
      io,
      {
        readFile: async () => '[]',
      },
    );

    expect(code).toBe(2);
    expect(io.err[0]).toBe('No quotes available.');
  });

  it('reports file read failures with exit code 2', async () => {
    const io = createIO();
    const code = await runQuoteCli(
      ['--input', 'missing.json'],
      io,
      {
        readFile: async () => {
          throw Object.assign(new Error('nope'), { code: 'ENOENT' });
        },
      },
    );

    expect(code).toBe(2);
    expect(io.err[0]).toBe('Could not read quotes file: missing.json');
  });
});
