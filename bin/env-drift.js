#!/usr/bin/env node
'use strict';

const { checkDrift } = require('../src/index');

const HELP = `env-drift - detect drift between .env.example and .env

Usage: env-drift [options]

Options:
  --example <file>   Reference file (default: .env.example)
  --env <file>       File to check (default: .env)
  --process-env      Check process.env instead of a file
  --ignore <a,b,c>   Comma-separated keys to skip
  --strict           Also fail on extra keys
  --json             Print machine-readable JSON
  -h, --help         Show this help

Exit codes: 0 = in sync, 1 = drift found, 2 = usage/file error`;

function parseArgs(argv) {
  const o = { ignore: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') o.help = true;
    else if (a === '--example') o.example = argv[++i];
    else if (a === '--env') o.env = argv[++i];
    else if (a === '--process-env') o.useProcessEnv = true;
    else if (a === '--ignore') o.ignore = (argv[++i] || '').split(',').filter(Boolean);
    else if (a === '--strict') o.strict = true;
    else if (a === '--json') o.json = true;
    else throw new Error(`Unknown option: ${a}`);
  }
  return o;
}

try {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) { console.log(HELP); process.exit(0); }
  const r = checkDrift(opts);
  const failed = !r.ok || (opts.strict && r.extra.length > 0);
  if (opts.json) {
    console.log(JSON.stringify({ ...r, ok: !failed }, null, 2));
  } else {
    if (r.missing.length) console.log('Missing:\n' + r.missing.map((k) => '  - ' + k).join('\n'));
    if (r.empty.length) console.log('Empty (set in example, blank here):\n' + r.empty.map((k) => '  - ' + k).join('\n'));
    if (r.extra.length) console.log('Extra (not in example):\n' + r.extra.map((k) => '  + ' + k).join('\n'));
    console.log(failed ? 'Drift detected.' : 'No drift.');
  }
  process.exit(failed ? 1 : 0);
} catch (e) {
  console.error('env-drift: ' + e.message);
  process.exit(2);
}
