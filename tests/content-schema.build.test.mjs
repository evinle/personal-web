import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(fileURLToPath(import.meta.url), '../..');
const stackDir = path.join(repoRoot, 'src/content/stack');
const brokenFixture = path.join(stackDir, '__broken_fixture__.yaml');

function runBuild() {
  return spawnSync('npm', ['run', 'build'], { cwd: repoRoot, encoding: 'utf8' });
}

test('build fails when a Stack group references a Technology id that does not exist', () => {
  mkdirSync(stackDir, { recursive: true });
  writeFileSync(
    brokenFixture,
    'name: broken-fixture\ntechnologies:\n  - nonexistent-technology-id\n'
  );

  try {
    const result = runBuild();
    assert.notEqual(result.status, 0, 'expected astro build to fail on an unknown Technology reference');
  } finally {
    rmSync(brokenFixture, { force: true });
  }
});
