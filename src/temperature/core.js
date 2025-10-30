const UNITS = new Map([
  ['c', 'C'],
  ['celsius', 'C'],
  ['f', 'F'],
  ['fahrenheit', 'F'],
]);

function normalizeUnit(unit) {
  if (unit === undefined || unit === null) {
    throw new Error('Temperature unit is required.');
  }
  const value = String(unit).trim().toLowerCase();
  const normalized = UNITS.get(value);
  if (!normalized) {
    throw new Error('Unsupported temperature unit. Use C or F.');
  }
  return normalized;
}

export function parseUnits(from, to) {
  const normalizedFrom = normalizeUnit(from);
  const normalizedTo = normalizeUnit(to);
  if (normalizedFrom === normalizedTo) {
    throw new Error('Source and target units must differ.');
  }
  return { from: normalizedFrom, to: normalizedTo };
}

function parseValue(input) {
  if (input === undefined || input === null) {
    throw new Error('Value is required.');
  }
  const value = Number.parseFloat(String(input));
  if (!Number.isFinite(value)) {
    throw new Error('Value must be numeric.');
  }
  return value;
}

export function convertTemperature(rawValue, fromUnit, toUnit) {
  const value = parseValue(rawValue);

  let result;
  if (fromUnit === 'C' && toUnit === 'F') {
    result = value * (9 / 5) + 32;
  } else if (fromUnit === 'F' && toUnit === 'C') {
    result = (value - 32) * (5 / 9);
  } else {
    throw new Error('Unsupported conversion.');
  }

  return Number.parseFloat(result.toFixed(2));
}

export function formatConversion(value, result, from, to) {
  return `${value}°${from} = ${result.toFixed(2)}°${to}`;
}
