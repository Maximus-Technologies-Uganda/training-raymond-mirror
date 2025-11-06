import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const coverageDir = path.join(projectRoot, 'coverage');
const targetDir = path.resolve(projectRoot, '..', '..', 'review-artifacts', 'ui', 'unit');

async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

/**
 * Exports UI coverage reports to review-artifacts for PR reviews.
 * This script is automatically run after test:coverage command.
 */
async function main() {
  try {
    await fs.access(coverageDir);
  } catch (error) {
    throw new Error('UI coverage directory not found. Run `npm run test:coverage` first.');
  }

  await ensureDirectory(targetDir);
  await fs.rm(targetDir, { recursive: true, force: true });
  await ensureDirectory(targetDir);
  await fs.cp(coverageDir, targetDir, { recursive: true });
  console.log(`✓ Copied UI coverage to ${path.relative(projectRoot, targetDir)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
