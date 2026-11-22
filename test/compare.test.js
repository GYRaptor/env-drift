'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { compare, checkDrift } = require('../src');

test('detects missing, extra and empty keys', () => {
  const r = compare({ A: 'x', B: 'y', C: 'z' }, { A: 'x', B: '', D: '1' });
  assert.deepEqual(r.missing, ['C']);
  assert.deepEqual(r.extra, ['D']);
  assert.deepEqual(r.empty, ['B']);
  assert.equal(r.ok, false);
});
test('ok when in sync; blank example values may stay blank', () => {
  assert.equal(compare({ A: '' }, { A: '' }).ok, true);
});
test('ignore option skips keys', () => {
  assert.equal(compare({ A: '1', SECRET: '' }, { A: '1' }, { ignore: ['SECRET'] }).ok, true);
});

function tmp(files) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'envdrift-'));
  for (const [n, c] of Object.entries(files)) fs.writeFileSync(path.join(d, n), c);
  return d;
}

test('checkDrift reads files', () => {
  const d = tmp({ '.env.example': 'A=1\nB=2', '.env': 'A=1' });
  assert.deepEqual(checkDrift({ cwd: d }).missing, ['B']);
});
test('checkDrift throws when file missing', () => {
  assert.throws(() => checkDrift({ cwd: tmp({}) }), /not found/);
});
test('checkDrift can use process.env', () => {
  process.env.ENVDRIFT_TEST_KEY = 'yes';
  const d = tmp({ '.env.example': 'ENVDRIFT_TEST_KEY=1' });
  assert.equal(checkDrift({ cwd: d, useProcessEnv: true }).ok, true);
});

const bin = path.join(__dirname, '..', 'bin', 'env-drift.js');
test('CLI exits 1 on drift and 0 when in sync', () => {
  const bad = tmp({ '.env.example': 'A=1\nB=2', '.env': 'A=1' });
  assert.equal(spawnSync('node', [bin], { cwd: bad }).status, 1);
  const good = tmp({ '.env.example': 'A=1', '.env': 'A=1' });
  assert.equal(spawnSync('node', [bin], { cwd: good }).status, 0);
});
test('CLI --strict fails on extras and --json prints JSON', () => {
  const d = tmp({ '.env.example': 'A=1', '.env': 'A=1\nB=2' });
  assert.equal(spawnSync('node', [bin, '--strict'], { cwd: d }).status, 1);
  const out = spawnSync('node', [bin, '--json'], { cwd: d }).stdout.toString();
  assert.deepEqual(JSON.parse(out).extra, ['B']);
});
test('CLI exits 2 on missing file', () => {
  assert.equal(spawnSync('node', [bin], { cwd: tmp({}) }).status, 2);
});
