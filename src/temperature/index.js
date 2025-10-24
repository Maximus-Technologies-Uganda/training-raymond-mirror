#!/usr/bin/env node

/**
 * Temperature Converter CLI
 * Usage:
 *   node src/temperature/index.js --from C --to F 32
 *   node src/temperature/index.js --from F --to C 0
 */

function isValidUnit(unit) {
  return unit === 'C' || unit === 'F';
}

export function convertCtoF(celsius) {
  if (typeof celsius !== 'number' || Number.isNaN(celsius)) {
    throw new Error('Value must be a number');
  }
  return (celsius * 9) / 5 + 32;
}

export function convertFtoC(fahrenheit) {
  if (typeof fahrenheit !== 'number' || Number.isNaN(fahrenheit)) {
    throw new Error('Value must be a number');
  }
  return ((fahrenheit - 32) * 5) / 9;
}

export function convertTemperature(from, to, value) {
  const fromU = typeof from === 'string' ? from.toUpperCase() : from;
  const toU = typeof to === 'string' ? to.toUpperCase() : to;

  if (!isValidUnit(fromU)) {
    throw new Error('Invalid unit for --from. Use "C" or "F".');
  }
  if (!isValidUnit(toU)) {
    throw new Error('Invalid unit for --to. Use "C" or "F".');
  }
  if (fromU === toU) {
    throw new Error('From and to units must differ.');
  }
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error('Value must be a number');
  }

  return fromU === 'C' ? convertCtoF(value) : convertFtoC(value);
}

function parseArgs(argv = process.argv.slice(2)) {
  let from = null;
  let to = null;
  let value = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--from' && argv[i + 1]) {
      from = argv[++i];
    } else if (arg === '--to' && argv[i + 1]) {
      to = argv[++i];
    } else if (!arg.startsWith('--') && value === null) {
      const num = Number(arg);
      value = num;
    }
  }

  return { from, to, value };
}

function main() {
  try {
    const { from, to, value } = parseArgs();
    if (!from || !to) {
      throw new Error('Missing required flags --from and/or --to');
    }
    if (value === null) {
      throw new Error('Missing value to convert');
    }
    const result = convertTemperature(from, to, value);
    // Print with up to 2 decimal places but avoid trailing zeros for integers
    const rounded = Math.round((result + Number.EPSILON) * 100) / 100;
    console.log(rounded);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// Only run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}


