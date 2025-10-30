#!/usr/bin/env node
/* c8 ignore start */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coverageDir = path.join(root, 'coverage');
const packetDir = path.join(root, 'review-artifacts');
const packetIndex = path.join(packetDir, 'index.html');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function buildIndex() {
  const hasCoverage = fs.existsSync(path.join(coverageDir, 'index.html'));
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Week 2 Review Packet</title>
  <style>body{font-family:system-ui,Segoe UI,Segoe UI Variable,Arial,sans-serif;margin:2rem;max-width:900px} a{color:#0b5fff;text-decoration:none}</style>
</head>
<body>
  <h1>Week 2 Review Packet</h1>
  <p>This packet aggregates coverage artifacts for CLIs.</p>
  <ul>
    ${hasCoverage ? '<li><a href="../coverage/index.html">Coverage Index (global)</a></li>' : '<li>No coverage HTML found.</li>'}
  </ul>
</body>
</html>`;
  ensureDir(packetDir);
  fs.writeFileSync(packetIndex, html, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Wrote ${packetIndex}`);
}

buildIndex();
/* c8 ignore stop */
