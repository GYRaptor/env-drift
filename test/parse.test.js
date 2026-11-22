'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseEnv } = require('../src/parse');

test('parses basic pairs, comments and blanks', () => {
  assert.deepEqual(parseEnv('# c\nA=1\n\nB=two'), { A: '1', B: 'two' });
});
test('handles export, quotes and inline comments', () => {
  const r = parseEnv('export A="x y"\nB=\'q\'\nC=val # note\nD=');
  assert.deepEqual(r, { A: 'x y', B: 'q', C: 'val', D: '' });
});
test('handles CRLF and BOM', () => {
  assert.deepEqual(parseEnv('﻿A=1\r\nB=2\r\n'), { A: '1', B: '2' });
});
test('ignores malformed lines', () => {
  assert.deepEqual(parseEnv('not valid\n=x\nOK=1'), { OK: '1' });
});
test('throws on non-string', () => {
  assert.throws(() => parseEnv(null), TypeError);
});
