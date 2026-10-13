import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

export const ENGINE = 'wakafy/1';

export function slug(s) {
  const out = String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return out || 'my-plugin';
}

export function titleCase(slugName) {
  return String(slugName)
    .split('-')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export function wakaConfig(name) {
  return {
    engine: ENGINE,
    name,
    title: titleCase(name),
    description: 'A wakafy plugin: replace this description in waka.json.',
    category: 'Community',
    method: 'GET',
    entry: 'index.js',
    params: [{ name: 'name', required: false, placeholder: 'friend' }],
  };
}

export const INDEX_JS = `function main(input) {
  const name = String(input.name || 'friend');
  wakafy.send({ greeting: 'Hello, ' + name + '!', length: name.length });
}
`;

export function init(targetDir, { force = false } = {}) {
  const dir = resolve(targetDir || '.');
  mkdirSync(dir, { recursive: true });
  const created = [];
  const skipped = [];

  const wakaPath = resolve(dir, 'waka.json');
  if (existsSync(wakaPath) && !force) {
    throw new Error(`waka.json already exists in ${dir} (use --force to overwrite)`);
  }
  const name = slug(basename(dir));
  writeFileSync(wakaPath, JSON.stringify(wakaConfig(name), null, 2) + '\n');
  created.push('waka.json');

  const entryPath = resolve(dir, 'index.js');
  if (existsSync(entryPath) && !force) {
    skipped.push('index.js');
  } else {
    writeFileSync(entryPath, INDEX_JS);
    created.push('index.js');
  }
  return { dir, created, skipped };
}
