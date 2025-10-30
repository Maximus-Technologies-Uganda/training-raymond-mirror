/**
 * Minimal flag parser for Node ESM CLIs.
 * Supports:
 *  - --key value (string/number)
 *  - --flag (boolean true)
 *  - Aliases via spec.flags[name].alias
 * Returns: { flags: Record<string, any>, positionals: string[] }
 */
export function parseArgs(argv = process.argv.slice(2), spec = {}) {
  const flags = {};
  const positionals = [];
  const aliasToName = new Map();
  const names = new Set();

  if (spec && spec.flags) {
    for (const [name, cfg] of Object.entries(spec.flags)) {
      names.add(name);
      if (cfg && cfg.alias) aliasToName.set(cfg.alias, name);
    }
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positionals.push(arg);
      continue;
    }

    const raw = arg.slice(2);
    const name = names.has(raw)
      ? raw
      : aliasToName.has(raw)
        ? aliasToName.get(raw)
        : raw;

    const next = argv[i + 1];
    // Boolean flag if next is absent or another flag
    if (next === undefined || (typeof next === 'string' && next.startsWith('--'))) {
      flags[name] = true;
      continue;
    }

    // Consume value
    flags[name] = next;
    i++;
  }

  return { flags, positionals };
}

export function getStringFlag(flags, name, def = null) {
  if (!(name in flags)) return def;
  const v = flags[name];
  return typeof v === 'string' ? v : String(v);
}

export function getNumberFlag(flags, name, def = null) {
  if (!(name in flags)) return def;
  const num = Number(flags[name]);
  return Number.isNaN(num) ? def : num;
}

export function requireAtLeastOne(flags, names, message) {
  const has = names.some((n) => flags[n]);
  if (!has) throw new Error(message);
}

export function ensureNotFoundEmpty(arr, notFoundMessage, emptyMessage) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error(emptyMessage);
  }
  if (arr[0] === '__NOT_FOUND__') {
    throw new Error(notFoundMessage);
  }
}
