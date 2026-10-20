import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

export const ENGINE = 'wakafy/1';
export const MAX_FILES = 20;

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
    main: 'index.js',
    params: [{ name: 'name', required: false, placeholder: 'friend' }],
  };
}

export function packageConfig(name) {
  return {
    name,
    version: '1.0.0',
    type: 'module',
    main: 'index.js',
    dependencies: { wakafy: '^1.0.0' },
  };
}

export const INDEX_TEMPLATE = 'function main(input) {\n  return { ok: true, echo: input };\n}\n';

export function init(targetDir, { force = false } = {}) {
  const dir = resolve(targetDir || '.');
  mkdirSync(dir, { recursive: true });

  const wakaPath = resolve(dir, 'waka.json');
  if (existsSync(wakaPath) && !force) {
    throw new Error(`waka.json already exists in ${dir} (use --force to overwrite)`);
  }
  const name = slug(basename(dir));
  const files = {
    'waka.json': JSON.stringify(wakaConfig(name), null, 2) + '\n',
    'package.json': JSON.stringify(packageConfig(name), null, 2) + '\n',
    'index.js': INDEX_TEMPLATE,
  };
  const created = [];
  const skipped = [];
  for (const [file, content] of Object.entries(files)) {
    if (existsSync(resolve(dir, file)) && !force) {
      skipped.push(file);
      continue;
    }
    writeFileSync(resolve(dir, file), content);
    created.push(file);
  }
  return { dir, created, skipped };
}
