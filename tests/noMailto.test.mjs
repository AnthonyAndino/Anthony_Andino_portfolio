import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../src', import.meta.url));
const sourcePattern = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

const collectSourceFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(fullPath);
    return sourcePattern.test(entry.name) ? [fullPath] : [];
  });

test('no source file uses mailto links', () => {
  for (const file of collectSourceFiles(root)) {
    const source = readFileSync(file, 'utf8');
    assert.equal(source.includes('mailto:'), false, `${file} still contains mailto:`);
  }
});
