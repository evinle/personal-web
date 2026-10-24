import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const repoRoot = path.resolve(fileURLToPath(import.meta.url), '../..');

function readYamlIds(dir) {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.yaml'))
    .map((file) => path.basename(file, '.yaml'));
}

function readYamlEntries(dir) {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.yaml'))
    .map((file) => ({
      id: path.basename(file, '.yaml'),
      data: parse(readFileSync(path.join(dir, file), 'utf8')),
    }));
}

const technologyIds = new Set(readYamlIds(path.join(repoRoot, 'src/content/technologies')));

function checkTechnologyReferences(collection) {
  const errors = [];
  for (const { id, data } of readYamlEntries(path.join(repoRoot, `src/content/${collection}`))) {
    for (const technologyId of data.technologies ?? []) {
      if (!technologyIds.has(technologyId)) {
        errors.push(
          `${collection}/${id}.yaml references unknown Technology id "${technologyId}"`
        );
      }
    }
  }
  return errors;
}

const errors = [...checkTechnologyReferences('stack'), ...checkTechnologyReferences('projects')];

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`[content-reference] ${error}`);
  }
  process.exit(1);
}
