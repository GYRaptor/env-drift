'use strict';

/**
 * Compare an expected set of variables against an actual one.
 * @param {Record<string,string>} expected  e.g. parsed .env.example
 * @param {Record<string,string|undefined>} actual  e.g. parsed .env or process.env
 * @param {{ignore?: string[]}} [options]
 * @returns {{missing:string[], extra:string[], empty:string[], ok:boolean}}
 */
function compare(expected, actual, options = {}) {
  if (!expected || !actual) throw new TypeError('compare expects two objects');
  const ignore = new Set(options.ignore || []);
  const exp = Object.keys(expected).filter((k) => !ignore.has(k));
  const act = Object.keys(actual).filter((k) => !ignore.has(k));
  const missing = exp.filter((k) => !(k in actual) || actual[k] === undefined).sort();
  const extra = act.filter((k) => !(k in expected)).sort();
  const empty = exp
    .filter((k) => k in actual && actual[k] === '' && expected[k] !== '')
    .sort();
  return { missing, extra, empty, ok: missing.length === 0 && empty.length === 0 };
}

module.exports = { compare };
