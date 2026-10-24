import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(fileURLToPath(import.meta.url), '../..');

function runBuild() {
  return spawnSync('npm', ['run', 'build'], { cwd: repoRoot, encoding: 'utf8' });
}

function withBrokenFixture(dir, filename, contents, run) {
  const fullDir = path.join(repoRoot, dir);
  const fixturePath = path.join(fullDir, filename);
  mkdirSync(fullDir, { recursive: true });
  writeFileSync(fixturePath, contents);
  try {
    return run();
  } finally {
    rmSync(fixturePath, { force: true });
  }
}

test('build fails when a Stack group references a Technology id that does not exist', () => {
  const result = withBrokenFixture(
    'src/content/stack',
    '__broken_fixture__.yaml',
    'name: broken-fixture\ntechnologies:\n  - nonexistent-technology-id\n',
    runBuild
  );
  assert.notEqual(result.status, 0, 'expected astro build to fail on an unknown Technology reference');
});

test('build fails when a Project references a Technology id that does not exist', () => {
  const result = withBrokenFixture(
    'src/content/projects',
    '__broken_fixture__.yaml',
    [
      'name: broken-fixture',
      'start: "2024-01"',
      'tone: blue',
      'note: a note',
      'detail:',
      '  problem: a problem',
      '  fix: a fix',
      '  result: a result',
      'technologies:',
      '  - nonexistent-technology-id',
      '',
    ].join('\n'),
    runBuild
  );
  assert.notEqual(result.status, 0, 'expected astro build to fail on an unknown Technology reference');
});
