#!/usr/bin/env node

/**
 * Hello CLI - Greets users by name with optional shout mode
 */

export function formatGreeting(name = 'World', shout = false) {
  const greeting = `Hello, ${name}!`;
  return shout ? greeting.toUpperCase() : greeting;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let name = 'World';
  let shout = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) {
      name = args[i + 1];
      i++;
    } else if (args[i] === '--shout') {
      shout = true;
    }
  }

  return { name, shout };
}

function main() {
  const { name, shout } = parseArgs();
  console.log(formatGreeting(name, shout));
}

main();
