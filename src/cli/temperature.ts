import { pathToFileURL } from 'node:url';
import { getStringFlag, parseArgs, requireStringFlag } from '../helpers/args.js';
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

  let from: string;
  let to: string;
  try {
    from = requireStringFlag(flags, 'from', 'Both --from and --to flags are required.', { label: '--from' });
    to = requireStringFlag(flags, 'to', 'Both --from and --to flags are required.', { label: '--to' });
  } catch (error: unknown) {
    io.stderr?.((error as Error).message);
    return 1;
  }

  const valueFlag = getStringFlag(flags, 'value', { label: 'Value' });
  const value = valueFlag ?? positionals[0];

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
