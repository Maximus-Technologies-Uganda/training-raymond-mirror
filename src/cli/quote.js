import { promises as fs } from 'node:fs';
import { extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getIntegerFlag, getStringFlag, parseArgs, requireStringFlag } from '../helpers/args.js';
import { formatQuote, parseQuotes, QuoteError, selectQuote } from '../quote/core.js';

function determineFormat(path) {
  const extension = extname(path).toLowerCase();
  if (extension === '.json') {
    return 'json';
  }
  if (extension === '.csv') {
    return 'csv';
  }
  return undefined;
}

async function loadQuotes(path, env) {
  const reader = env && env.readFile ? env.readFile : fs.readFile;
  try {
    const raw = await reader(path, 'utf8');
    const format = determineFormat(path);
    return parseQuotes(raw, format);
  } catch (error) {
    if (error instanceof QuoteError) {
      throw error;
    }

    const message =
      error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT'
        ? `Could not read quotes file: ${path}`
        : (error && error.message) || 'Failed to read quotes file.';
    const failure = new Error(message);
    failure.exitCode = 2;
    throw failure;
  }
}

function mapReasonToExitCode(reason) {
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
  argv,
  io = { stdout: (message) => console.log(message), stderr: (message) => console.error(message) },
  env = {},
) {
  const { flags } = parseArgs(argv);

  let inputPath;
  let author;
  let tag;
  let seed;

  try {
    inputPath = requireStringFlag(flags, 'input', 'Provide --input <path> to specify a quotes file.', {
      label: 'Input path',
    });
    author = getStringFlag(flags, 'author', { label: 'Author' });
    tag = getStringFlag(flags, 'tag', { label: 'Tag' });
    seed = getIntegerFlag(flags, 'seed', { label: 'Seed' });
  } catch (error) {
    io.stderr?.(error.message);
    return 1;
  }

  let quotes;
  try {
    quotes = await loadQuotes(inputPath, env);
  } catch (error) {
    io.stderr?.(error.message);
    return error.exitCode ?? 2;
  }

  try {
    const quote = selectQuote(quotes, { author, tag, seed });
    io.stdout?.(formatQuote(quote));
    return 0;
  } catch (error) {
    const reason = error && error.reason;
    const exitCode = mapReasonToExitCode(reason);
    const message = (error && error.message) || 'Failed to select quote.';
    io.stderr?.(message);
    return exitCode;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runQuoteCli(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
