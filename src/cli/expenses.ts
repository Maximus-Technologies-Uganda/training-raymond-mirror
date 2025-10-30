import { promises as fs } from 'node:fs';
import { pathToFileURL } from 'node:url';
import {
  FlagMap,
  getMonthFlag,
  getStringFlag,
  parseArgs,
} from '../helpers/args.js';
import {
  buildExpenseReport,
  formatExpenseReport,
  parseExpenses,
} from '../expenses/core.js';

const SAMPLE_DATA = `date,category,amount\n2025-01-05,Groceries,54.20\n2025-01-15,Transport,18.30\n2025-02-01,Groceries,42.10\n2025-02-07,Utilities,90.00\n2025-03-12,Entertainment,27.50`;

interface CliIO {
  stdout?: (message: string) => void;
  stderr?: (message: string) => void;
}

interface ExpensesEnvironment {
  readFile?: (path: string, encoding: BufferEncoding) => Promise<string>;
}

interface ExpensesOptions {
  month: number | null;
  category?: string;
  inputPath?: string;
  useSample: boolean;
}

function parseOptions(flags: FlagMap): ExpensesOptions {
  const options: ExpensesOptions = { month: null, useSample: false };

  const month = getMonthFlag(flags, 'month', { label: 'Month' });
  if (month !== undefined) {
    options.month = month;
  }

  const category = getStringFlag(flags, 'category', { label: 'Category' });
  if (category !== undefined) {
    options.category = category;
  }

  const useSample = flags.has('sample');
  const inputPath = getStringFlag(flags, 'input', { label: 'Input path' });

  if (useSample && inputPath) {
    throw new Error('Use either --sample or --input, not both.');
  }

  if (!useSample && !inputPath) {
    throw new Error('Provide --sample or --input <path>.');
  }

  options.useSample = useSample;
  if (inputPath) {
    options.inputPath = inputPath;
  }

  return options;
}

async function loadRawData(options: ExpensesOptions, env: ExpensesEnvironment): Promise<string> {
  if (options.useSample) {
    return SAMPLE_DATA;
  }

  if (!options.inputPath) {
    throw new Error('Provide --sample or --input <path>.');
  }

  const reader = env.readFile ?? fs.readFile;
  try {
    return await reader(options.inputPath, 'utf8');
  } catch (error: unknown) {
    const message =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'ENOENT'
        ? `Could not read input file: ${options.inputPath}`
        : 'Failed to read input file.';
    const failure = new Error(message);
    (failure as { exitCode?: number }).exitCode = 2;
    throw failure;
  }
}

function ensureNonEmpty(records: unknown[]): void {
  if (records.length === 0) {
    const error = new Error('No expenses found for the given filters.');
    (error as { exitCode?: number }).exitCode = 2;
    throw error;
  }
}

export async function runExpensesCli(
  argv: readonly string[],
  io: CliIO = { stdout: (message) => console.log(message), stderr: (message) => console.error(message) },
  env: ExpensesEnvironment = {},
): Promise<number> {
  const { flags } = parseArgs(argv);

  let options: ExpensesOptions;
  try {
    options = parseOptions(flags);
  } catch (error: unknown) {
    io.stderr?.((error as Error).message);
    return (error as { exitCode?: number }).exitCode ?? 1;
  }

  let raw: string;
  try {
    raw = await loadRawData(options, env);
  } catch (error: unknown) {
    io.stderr?.((error as Error).message);
    return (error as { exitCode?: number }).exitCode ?? 2;
  }

  try {
    const records = parseExpenses(raw);
    const report = buildExpenseReport(records, {
      month: options.month,
      category: options.category ?? null,
    });
    ensureNonEmpty(report.entries);
    const output = formatExpenseReport(report);
    io.stdout?.(output);
    return 0;
  } catch (error: unknown) {
    io.stderr?.((error as Error).message);
    return (error as { exitCode?: number }).exitCode ?? 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runExpensesCli(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
