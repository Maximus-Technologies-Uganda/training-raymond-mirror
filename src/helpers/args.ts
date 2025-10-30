const VALUE_FLAG_PATTERN = /^--([^=]+)=(.*)$/;

export type FlagValue = string | boolean;
export type FlagMap = Map<string, FlagValue>;

export interface ParsedArgs {
  flags: FlagMap;
  positionals: string[];
}

export function parseArgs(argv: readonly string[]): ParsedArgs {
  const flags: FlagMap = new Map();
  const positionals: string[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('-')) {
      positionals.push(token);
      continue;
    }

    if (token.startsWith('--')) {
      const valueMatch = token.match(VALUE_FLAG_PATTERN);
      if (valueMatch) {
        const [, key, value] = valueMatch;
        flags.set(key, value);
        continue;
      }

      const key = token.slice(2);
      const next = argv[index + 1];
      if (next === undefined || next.startsWith('-')) {
        flags.set(key, true);
      } else {
        flags.set(key, next);
        index += 1;
      }
      continue;
    }

    const cluster = token.slice(1);
    for (const char of cluster) {
      flags.set(char, true);
    }
  }

  return { flags, positionals };
}

export function getFlag(flags: FlagMap, name: string): FlagValue | undefined {
  return flags.has(name) ? flags.get(name) : undefined;
}

export function requireFlag(flags: FlagMap, name: string, message: string): FlagValue {
  if (!flags.has(name)) {
    throw new Error(message);
  }
  return flags.get(name)!;
}

export function removeFlag(flags: FlagMap, name: string): FlagValue | undefined {
  const value = flags.get(name);
  flags.delete(name);
  return value;
}

export function hasAnyFlag(flags: FlagMap, names: readonly string[]): boolean {
  return names.some((name) => flags.has(name));
}

export function toObject(flags: FlagMap): Record<string, FlagValue> {
  const result: Record<string, FlagValue> = {};
  for (const [key, value] of flags.entries()) {
    result[key] = value;
  }
  return result;
}

export interface StringFlagOptions {
  label?: string;
  trim?: boolean;
  allowEmpty?: boolean;
}

function resolveLabel(name: string, options: StringFlagOptions | undefined): string {
  return options?.label ?? `--${name}`;
}

export function getStringFlag(flags: FlagMap, name: string, options?: StringFlagOptions): string | undefined {
  if (!flags.has(name)) {
    return undefined;
  }

  const raw = flags.get(name);
  const label = resolveLabel(name, options);

  if (raw === true) {
    throw new Error(`${label} requires a value.`);
  }

  if (raw === undefined || raw === null) {
    throw new Error(`${label} requires a value.`);
  }

  let value = String(raw);
  if (options?.trim !== false) {
    value = value.trim();
  }

  if (!options?.allowEmpty && value === '') {
    throw new Error(`${label} cannot be empty.`);
  }

  return value;
}

export function requireStringFlag(
  flags: FlagMap,
  name: string,
  message?: string,
  options?: StringFlagOptions,
): string {
  const value = getStringFlag(flags, name, options);
  if (value === undefined) {
    throw new Error(message ?? `${resolveLabel(name, options)} is required.`);
  }
  return value;
}

export interface NumberFlagOptions extends StringFlagOptions {
  integer?: boolean;
  min?: number;
  max?: number;
}

export function getNumberFlag(flags: FlagMap, name: string, options?: NumberFlagOptions): number | undefined {
  const value = getStringFlag(flags, name, options);
  if (value === undefined) {
    return undefined;
  }

  const label = resolveLabel(name, options);
  const parsed = options?.integer ? Number.parseInt(value, 10) : Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be numeric.`);
  }

  if (options?.integer && !Number.isInteger(parsed)) {
    throw new Error(`${label} must be an integer.`);
  }

  if (options?.min !== undefined && parsed < options.min) {
    throw new Error(`${label} must be at least ${options.min}.`);
  }

  if (options?.max !== undefined && parsed > options.max) {
    throw new Error(`${label} must be at most ${options.max}.`);
  }

  return parsed;
}

export function getIntegerFlag(flags: FlagMap, name: string, options?: NumberFlagOptions): number | undefined {
  return getNumberFlag(flags, name, { ...options, integer: true });
}

export interface EnumFlagOptions<T extends string> extends StringFlagOptions {
  caseInsensitive?: boolean;
  valuesLabel?: string;
  defaultValue?: T;
}

export function getEnumFlag<T extends string>(
  flags: FlagMap,
  name: string,
  allowed: readonly T[],
  options?: EnumFlagOptions<T>,
): T | undefined {
  const value = getStringFlag(flags, name, options);
  if (value === undefined) {
    return options?.defaultValue;
  }

  const label = resolveLabel(name, options);
  const caseInsensitive = options?.caseInsensitive !== false;

  if (!caseInsensitive) {
    if ((allowed as readonly string[]).includes(value)) {
      return value as T;
    }
    throw new Error(`${label} must be one of: ${(allowed as readonly string[]).join(', ')}.`);
  }

  const lookup = new Map<string, T>();
  for (const entry of allowed) {
    lookup.set(String(entry).toLowerCase(), entry);
  }

  const normalized = value.toLowerCase();
  const match = lookup.get(normalized);
  if (!match) {
    throw new Error(`${label} must be one of: ${(allowed as readonly string[]).join(', ')}.`);
  }
  return match;
}

const MONTHS = new Map<string, number>([
  ['jan', 1],
  ['january', 1],
  ['feb', 2],
  ['february', 2],
  ['mar', 3],
  ['march', 3],
  ['apr', 4],
  ['april', 4],
  ['may', 5],
  ['jun', 6],
  ['june', 6],
  ['jul', 7],
  ['july', 7],
  ['aug', 8],
  ['august', 8],
  ['sep', 9],
  ['sept', 9],
  ['september', 9],
  ['oct', 10],
  ['october', 10],
  ['nov', 11],
  ['november', 11],
  ['dec', 12],
  ['december', 12],
]);

export function normalizeMonth(input: number | string | null | undefined): number | null {
  if (input === null || input === undefined) {
    return null;
  }

  if (typeof input === 'number') {
    if (Number.isInteger(input) && input >= 1 && input <= 12) {
      return input;
    }
    throw new Error('Month must be an integer between 1 and 12.');
  }

  const value = String(input).trim();
  if (value === '') {
    throw new Error('Month cannot be empty.');
  }

  if (/^\d+$/.test(value)) {
    const numeric = Number.parseInt(value, 10);
    if (numeric >= 1 && numeric <= 12) {
      return numeric;
    }
    throw new Error('Month must be an integer between 1 and 12.');
  }

  const normalized = value.toLowerCase();
  if (MONTHS.has(normalized)) {
    return MONTHS.get(normalized)!;
  }

  throw new Error('Invalid month value. Use Jan-Dec or 1-12.');
}

export function getMonthFlag(flags: FlagMap, name: string, options?: StringFlagOptions): number | undefined {
  if (!flags.has(name)) {
    return undefined;
  }

  const value = flags.get(name);
  if (value === true) {
    throw new Error(`${resolveLabel(name, options)} requires a value.`);
  }

  const normalized = normalizeMonth(value as string | number | null | undefined);
  return normalized === null ? undefined : normalized;
}

export interface DateFlagOptions extends StringFlagOptions {
  label?: string;
}

export function getDateFlag(flags: FlagMap, name: string, options?: DateFlagOptions): string | undefined {
  const value = getStringFlag(flags, name, options);
  if (value === undefined) {
    return undefined;
  }

  const label = options?.label ?? resolveLabel(name, options);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use YYYY-MM-DD format.`);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ${label.toLowerCase()}.`);
  }

  return value;
}
