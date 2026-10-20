#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { init, GO_ENGINE } from '../lib/init.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const HELP = `wakafy v${pkg.version} — module + CLI for the wakafy.store plugin repository

usage:
  wakafy init [folder] [--go] [--force]   scaffold a repo (Node.js by default)
  wakafy --help                            show this help
  wakafy --version                         show the version

Node.js: package.json + waka.json + index.js
Golang : go.mod + waka.json + main.go

example:
  wakafy init hello-friend
  wakafy init hello-go --go
  cd hello-friend && npm install && add files freely
`;

function fail(msg) {
  process.stderr.write(`wakafy: ${msg}\n`);
  process.exit(1);
}

const args = process.argv.slice(2);
const cmd = args[0];

if (!cmd || cmd === '--help' || cmd === '-h' || cmd === 'help') {
  process.stdout.write(HELP);
  process.exit(0);
}
if (cmd === '--version' || cmd === '-v' || cmd === 'version') {
  process.stdout.write(`wakafy v${pkg.version}\n`);
  process.exit(0);
}
if (cmd === 'init') {
  const rest = args.slice(1);
  const force = rest.includes('--force');
  const go =
    rest.includes('--go') ||
    rest.includes('--golang') ||
    rest.some((a) => /^--engine=(go|golang)$/i.test(a));
  const dir = rest.find((a) => !a.startsWith('--'));
  try {
    const r = init(dir || '.', { force, engine: go ? GO_ENGINE : undefined });
    for (const f of r.created) process.stdout.write(`create ${f}\n`);
    for (const f of r.skipped) process.stdout.write(`skip ${f} (already exists)\n`);
    const next = go
      ? 'edit main.go, then set "main" in waka.json if you rename it.\n'
      : 'npm install to test locally, then set "main" in waka.json to the entry file.\n';
    process.stdout.write(`\nready in ${r.dir}\n${next}`);
  } catch (e) {
    fail(e.message);
  }
  process.exit(0);
}
fail(`unknown command: ${cmd}\n\n${HELP}`);
