const VALUE_FLAG_PATTERN = /^--([^=]+)=(.*)$/;

export function parseArgs(argv = process.argv.slice(2)) {
  const flags = new Map();
  const positionals = [];

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

function resolveLabel(name, options) {
  return options && options.label ? options.label : `--${name}`;
}

export function getStringFlag(flags, name, options) {
  if (!flags.has(name)) {
    return undefined;
  }

  const raw = flags.get(name);
  const label = resolveLabel(name, options);

  if (raw === true || raw === undefined || raw === null) {
    throw new Error(`${label} requires a value.`);
  }

  let value = String(raw);
  if (!options || options.trim !== false) {
    value = value.trim();
  }

  if ((!options || !options.allowEmpty) && value === '') {
    throw new Error(`${label} cannot be empty.`);
  }

  return value;
}

export function requireStringFlag(flags, name, message, options) {
  const value = getStringFlag(flags, name, options);
  if (value === undefined) {
    throw new Error(message || `${resolveLabel(name, options)} is required.`);
  }
  return value;
}

export function getNumberFlag(flags, name, options) {
  const value = getStringFlag(flags, name, options);
  if (value === undefined) {
    return undefined;
  }

  const label = resolveLabel(name, options);
  const parsed = options && options.integer ? Number.parseInt(value, 10) : Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be numeric.`);
  }

  if (options && options.integer && !Number.isInteger(parsed)) {
    throw new Error(`${label} must be an integer.`);
  }

  if (options && options.min !== undefined && parsed < options.min) {
    throw new Error(`${label} must be at least ${options.min}.`);
  }

  if (options && options.max !== undefined && parsed > options.max) {
    throw new Error(`${label} must be at most ${options.max}.`);
  }

  return parsed;
}

export function getIntegerFlag(flags, name, options) {
  return getNumberFlag(flags, name, { ...(options || {}), integer: true });
}

export function getEnumFlag(flags, name, allowed, options) {
  const value = getStringFlag(flags, name, options);
  if (value === undefined) {
    return options && options.defaultValue !== undefined ? options.defaultValue : undefined;
  }

  const label = resolveLabel(name, options);
  const caseInsensitive = !options || options.caseInsensitive !== false;

  if (!caseInsensitive) {
    if (allowed.includes(value)) {
      return value;
    }
    throw new Error(`${label} must be one of: ${allowed.join(', ')}.`);
  }

  const lookup = new Map();
  for (const entry of allowed) {
    lookup.set(String(entry).toLowerCase(), entry);
  }

  const normalized = value.toLowerCase();
  if (!lookup.has(normalized)) {
    throw new Error(`${label} must be one of: ${allowed.join(', ')}.`);
  }
  return lookup.get(normalized);
}

const MONTHS = new Map([
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

export function normalizeMonth(input) {
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
    return MONTHS.get(normalized);
  }

  throw new Error('Invalid month value. Use Jan-Dec or 1-12.');
}

export function getMonthFlag(flags, name, options) {
  if (!flags.has(name)) {
    return undefined;
  }

  const value = flags.get(name);
  if (value === true) {
    throw new Error(`${resolveLabel(name, options)} requires a value.`);
  }

  const normalized = normalizeMonth(value);
  return normalized === null ? undefined : normalized;
}

export function getDateFlag(flags, name, options) {
  const value = getStringFlag(flags, name, options);
  if (value === undefined) {
    return undefined;
  }

  const label = options && options.label ? options.label : resolveLabel(name, options);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use YYYY-MM-DD format.`);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ${label.toLowerCase()}.`);
  }

  return value;
}
