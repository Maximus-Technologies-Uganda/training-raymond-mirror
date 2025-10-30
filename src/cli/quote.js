#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, getStringFlag, getNumberFlag } from '../helpers/args.js';
import { selectQuote } from '../quote/core.js';

function parseCsv(content) {
  // Minimal CSV: header expected: text,author,tags
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const idxText = header.indexOf('text');
  const idxAuthor = header.indexOf('author');
  const idxTags = header.indexOf('tags');
  const out = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const text = (cols[idxText] ?? '').trim();
    const author = (cols[idxAuthor] ?? '').trim();
    const tags = (cols[idxTags] ?? '').trim();
    if (!text) continue;
    out.push({ text, author, tags });
  }
  return out;
}

function loadQuotesFromFile(inputPath) {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    const raw = fs.readFileSync(inputPath, 'utf8');
    if (ext === '.json') {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) throw new Error('JSON must be an array of quotes');
      return data;
    }
    if (ext === '.csv') {
      return parseCsv(raw);
    }
    throw new Error('Unsupported input format. Use .json or .csv');
  } catch (err) {
    const e = new Error(`Failed to load input: ${err.message}`);
    e.code = 'INPUT_ERROR';
    throw e;
  }
}

function main() {
  const spec = {
    flags: {
      author: { alias: 'a' },
      tag: { alias: 't' },
      input: { alias: 'i' },
      seed: { alias: 's' },
      help: { alias: 'h' },
    },
  };

  try {
    const { flags } = parseArgs(process.argv.slice(2), spec);
    if (flags.help) {
      console.log('Usage: quote --input <file.[json|csv]> [--author <name>] [--tag <tag>] [--seed <n>]');
      process.exit(0);
    }

    const input = getStringFlag(flags, 'input');
    if (!input) {
      throw new Error('Missing required --input <path>');
    }

    const author = getStringFlag(flags, 'author');
    const tag = getStringFlag(flags, 'tag');
    const seed = getNumberFlag(flags, 'seed', null);

    const dataset = loadQuotesFromFile(input);
    const quote = selectQuote(dataset, { author, tag, seed });

    const tagsOut = Array.isArray(quote.tags) && quote.tags.length > 0 ? ` [${quote.tags.join(', ')}]` : '';
    console.log(`"${quote.text}" — ${quote.author}${tagsOut}`);
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    if (err && err.code === 'INPUT_ERROR') {
      console.error(`Error: ${msg}`);
      process.exit(2);
    }
    console.error(`Error: ${msg}`);
    process.exit(1);
  }
}

// Only run main if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
