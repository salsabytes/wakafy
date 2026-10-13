#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { init } from '../lib/init.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const HELP = `wakafy v${pkg.version} — module + CLI for the wakafy.store plugin repository

usage:
  wakafy init [folder] [--force]   scaffold waka.json + index.js starter
  wakafy --help                    show this help
  wakafy --version                 show the version

example:
  wakafy init hello-friend
  cd hello-friend && edit waka.json + index.js however you like
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
  const dir = rest.find((a) => !a.startsWith('--'));
  try {
    const r = init(dir || '.', { force });
    for (const f of r.created) process.stdout.write(`create ${f}\n`);
    for (const f of r.skipped) process.stdout.write(`skip ${f} (already exists)\n`);
    process.stdout.write(`\nready in ${r.dir}\nedit waka.json (title, description, category) + index.js however you like.\n`);
  } catch (e) {
    fail(e.message);
  }
  process.exit(0);
}
fail(`unknown command: ${cmd}\n\n${HELP}`);
