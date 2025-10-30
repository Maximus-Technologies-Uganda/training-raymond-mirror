/* c8 ignore start */
import { promises as fs } from 'node:fs';
import { extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  getIntegerFlag,
  getStringFlag,
  parseArgs,
  requireStringFlag,
} from '../helpers/args.js';
import {
  formatQuote,
  parseQuotes,
  QuoteError,
  QuoteErrorReason,
  QuoteRecord,
  selectQuote,
} from '../quote/core.js';

interface CliIO {
  stdout?: (message: string) => void;
  stderr?: (message: string) => void;
}

interface QuoteEnvironment {
  readFile?: (path: string, encoding: BufferEncoding) => Promise<string>;
}

function determineFormat(path: string): 'json' | 'csv' | undefined {
  const extension = extname(path).toLowerCase();
  if (extension === '.json') {
    return 'json';
  }
  if (extension === '.csv') {
    return 'csv';
  }
  return undefined;
}

async function loadQuotes(path: string, env: QuoteEnvironment): Promise<QuoteRecord[]> {
  const reader = env.readFile ?? fs.readFile;
  try {
    const raw = await reader(path, 'utf8');
    const format = determineFormat(path);
    return parseQuotes(raw, format);
  } catch (error: unknown) {
    if (error instanceof Error && 'reason' in error) {
      throw error;
    }

    const message =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'ENOENT'
        ? `Could not read quotes file: ${path}`
        : (error as Error).message ?? 'Failed to read quotes file.';
    const failure = new Error(message);
    (failure as { exitCode?: number }).exitCode = 2;
    throw failure;
  }
}

function mapReasonToExitCode(reason?: QuoteErrorReason): number {
  switch (reason) {
    case 'author-not-found':
    case 'tag-not-found':
      return 1;
    case 'no-quotes':
      return 2;
    default:
      return 2;
  }
}

export async function runQuoteCli(
  argv: readonly string[],
  io: CliIO = { stdout: (message) => console.log(message), stderr: (message) => console.error(message) },
  env: QuoteEnvironment = {},
): Promise<number> {
  const { flags } = parseArgs(argv);

  let inputPath: string;
  let author: string | undefined;
  let tag: string | undefined;
  let seed: number | undefined;

  try {
    inputPath = requireStringFlag(
      flags,
      'input',
      'Provide --input <path> to specify a quotes file.',
      { label: 'Input path' },
    );
    author = getStringFlag(flags, 'author', { label: 'Author' });
    tag = getStringFlag(flags, 'tag', { label: 'Tag' });
    seed = getIntegerFlag(flags, 'seed', { label: 'Seed' });
  } catch (error: unknown) {
    io.stderr?.((error as Error).message);
    return 1;
  }

  let quotes: QuoteRecord[];
  try {
    quotes = await loadQuotes(inputPath, env);
  } catch (error: unknown) {
    io.stderr?.((error as Error).message);
    return (error as { exitCode?: number }).exitCode ?? 2;
  }

  try {
    const quote = selectQuote(quotes, { author, tag, seed });
    io.stdout?.(formatQuote(quote));
    return 0;
  } catch (error: unknown) {
    const reason = (error as QuoteError).reason;
    const exitCode = mapReasonToExitCode(reason);
    const message = (error as Error).message ?? 'Failed to select quote.';
    io.stderr?.(message);
    return exitCode;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runQuoteCli(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
/* c8 ignore stop */
