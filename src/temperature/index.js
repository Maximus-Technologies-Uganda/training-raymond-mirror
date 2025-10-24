#!/usr/bin/env node

/**
 * Temperature Converter CLI - Convert between Celsius and Fahrenheit
 */

export function celsiusToFahrenheit(celsius) {
  return (celsius * 9/5) + 32;
}

export function fahrenheitToCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5/9;
}

export function convert(value, fromUnit, toUnit) {
  const validUnits = ['C', 'F'];

  if (!validUnits.includes(fromUnit)) {
    throw new Error(`Invalid 'from' unit: ${fromUnit}. Must be 'C' or 'F'.`);
  }
  if (!validUnits.includes(toUnit)) {
    throw new Error(`Invalid 'to' unit: ${toUnit}. Must be 'C' or 'F'.`);
  }
  if (fromUnit === toUnit) {
    throw new Error('Source and target units cannot be the same');
  }

  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    throw new Error(`Invalid temperature value: ${value}`);
  }

  let result;
  if (fromUnit === 'C' && toUnit === 'F') {
    result = celsiusToFahrenheit(numValue);
  } else if (fromUnit === 'F' && toUnit === 'C') {
    result = fahrenheitToCelsius(numValue);
  }

  return result.toFixed(2);
}

function parseArgs() {
  const args = process.argv.slice(2);
  let fromUnit = null;
  let toUnit = null;
  let value = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--from' && args[i + 1]) {
      fromUnit = args[i + 1].toUpperCase();
      i++;
    } else if (args[i] === '--to' && args[i + 1]) {
      toUnit = args[i + 1].toUpperCase();
      i++;
    } else if (!args[i].startsWith('--')) {
      value = args[i];
    }
  }

  return { value, fromUnit, toUnit };
}

function main() {
  const { value, fromUnit, toUnit } = parseArgs();

  try {
    if (!value || !fromUnit || !toUnit) {
      console.log('Usage: temperature --from <C|F> --to <C|F> <value>');
      process.exit(0);
    }

    const result = convert(value, fromUnit, toUnit);
    console.log(`${value}°${fromUnit} = ${result}°${toUnit}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Only run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
