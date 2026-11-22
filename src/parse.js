'use strict';

/**
 * Parse the text of a .env file into a plain object.
 * Supports comments, `export KEY=value`, single/double quotes, blank values.
 * @param {string} text
 * @returns {Record<string,string>}
 */
function parseEnv(text) {
  if (typeof text !== 'string') throw new TypeError('parseEnv expects a string');
  const out = {};
  for (const rawLine of text.replace(/^﻿/, '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_.-]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let value = m[2];
    const q = value[0];
    if ((q === '"' || q === "'") && value.indexOf(q, 1) !== -1) {
      const end = value.indexOf(q, 1);
      value = value.slice(1, end);
      if (q === '"') value = value.replace(/\\n/g, '\n');
    } else {
      value = value.replace(/\s+#.*$/, '').trim();
    }
    out[m[1]] = value;
  }
  return out;
}

module.exports = { parseEnv };
