import { pathToFileURL } from 'node:url';
import { getFlag, parseArgs } from '../helpers/args.js';
import { convertTemperature, formatConversion, parseUnits } from '../temperature/core.js';

interface CliIO {
  stdout?: (message: string) => void;
  stderr?: (message: string) => void;
}

export function runTemperatureCli(
  argv: readonly string[],
  io: CliIO = { stdout: (message) => console.log(message), stderr: (message) => console.error(message) },
): number {
  const { flags, positionals } = parseArgs(argv);

  const from = getFlag(flags, 'from');
  const to = getFlag(flags, 'to');
  const value = getFlag(flags, 'value') ?? positionals[0];

  if (!from || !to) {
    io.stderr?.('Both --from and --to flags are required.');
    return 1;
  }

  if (value === undefined) {
    io.stderr?.('Provide a value to convert using --value or a positional argument.');
    return 1;
  }

  try {
    const { from: normalizedFrom, to: normalizedTo } = parseUnits(from, to);
    const result = convertTemperature(value, normalizedFrom, normalizedTo);
    const numericValue = Number.parseFloat(String(value));
    io.stdout?.(formatConversion(numericValue, result, normalizedFrom, normalizedTo));
    return 0;
  } catch (error: unknown) {
    io.stderr?.((error as Error).message);
    return 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const code = runTemperatureCli(process.argv.slice(2));
  process.exitCode = code;
}
