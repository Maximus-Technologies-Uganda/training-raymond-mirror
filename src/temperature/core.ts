const UNITS = new Map<string, TemperatureUnit>([
  ['c', 'C'],
  ['celsius', 'C'],
  ['f', 'F'],
  ['fahrenheit', 'F'],
]);

type TemperatureUnit = 'C' | 'F';

function normalizeUnit(unit: unknown): TemperatureUnit {
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

export interface ParsedUnits {
  from: TemperatureUnit;
  to: TemperatureUnit;
}

export function parseUnits(from: unknown, to: unknown): ParsedUnits {
  const normalizedFrom = normalizeUnit(from);
  const normalizedTo = normalizeUnit(to);
  if (normalizedFrom === normalizedTo) {
    throw new Error('Source and target units must differ.');
  }
  return { from: normalizedFrom, to: normalizedTo };
}

function parseValue(input: unknown): number {
  if (input === undefined || input === null) {
    throw new Error('Value is required.');
  }
  const value = Number.parseFloat(String(input));
  if (!Number.isFinite(value)) {
    throw new Error('Value must be numeric.');
  }
  return value;
}

export function convertTemperature(rawValue: unknown, fromUnit: TemperatureUnit, toUnit: TemperatureUnit): number {
  const value = parseValue(rawValue);

  let result: number;
  if (fromUnit === 'C' && toUnit === 'F') {
    result = value * (9 / 5) + 32;
  } else if (fromUnit === 'F' && toUnit === 'C') {
    result = (value - 32) * (5 / 9);
  } else {
    throw new Error('Unsupported conversion.');
  }

  return Number.parseFloat(result.toFixed(2));
}

export function formatConversion(value: number, result: number, from: TemperatureUnit, to: TemperatureUnit): string {
  return `${value}°${from} = ${result.toFixed(2)}°${to}`;
}
