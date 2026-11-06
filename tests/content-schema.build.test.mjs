import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
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

test('build fails when a Project lists an unknown Technology id as also used', () => {
  const projects = path.join(repoRoot, 'src/content/projects/devops-support.yaml');
  const original = readFileSync(projects, 'utf8');
  writeFileSync(projects, `${original}alsoUsed:\n  - nonexistent-technology-id\n`);
  try {
    assert.notEqual(runBuild().status, 0, 'expected astro build to fail on an unknown Technology reference');
  } finally {
    writeFileSync(projects, original);
  }
});

test('build fails on a Proficiency that is not Strong, Comfortable or Familiar', () => {
  const solace = path.join(repoRoot, 'src/content/technologies/solace.yaml');
  const original = readFileSync(solace, 'utf8');
  writeFileSync(solace, `${original}proficiency: Expert\n`);
  try {
    assert.notEqual(runBuild().status, 0, 'expected astro build to fail on an unknown Proficiency');
  } finally {
    writeFileSync(solace, original);
  }
});

test('a Technology with a Note gets one popover its chips open, and one without stays a plain chip', () => {
  const kubernetes = path.join(repoRoot, 'src/content/technologies/kubernetes.yaml');
  const original = readFileSync(kubernetes, 'utf8');
  const outDir = mkdtempSync(path.join(tmpdir(), 'chip-notes-'));
  writeFileSync(kubernetes, `${original}note: A fixture note.\n`);
  try {
    const build = spawnSync('npx', ['astro', 'build', '--outDir', outDir], { cwd: repoRoot, encoding: 'utf8' });
    assert.equal(build.status, 0, build.stderr);
    const html = readFileSync(path.join(outDir, 'index.html'), 'utf8');

    assert.ok(html.match(/popovertarget="technology-note-kubernetes"/g).length > 1, 'expected chips in the Stack and the Projects');
    assert.equal(html.match(/id="technology-note-kubernetes"/g).length, 1);
    assert.match(html, /A fixture note\./);
    assert.doesNotMatch(html, /technology-note-solace/);
  } finally {
    writeFileSync(kubernetes, original);
    rmSync(outDir, { recursive: true, force: true });
  }
});
