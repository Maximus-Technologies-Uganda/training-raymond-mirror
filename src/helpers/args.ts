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
