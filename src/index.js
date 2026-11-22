'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { parseEnv } = require('./parse');
const { compare } = require('./compare');

/**
 * Read two env files from disk (or process.env) and report drift.
 * @param {object} [options]
 * @param {string} [options.example='.env.example']  Path to the reference file.
 * @param {string} [options.env='.env']              Path to the file to check.
 * @param {boolean} [options.useProcessEnv=false]    Check process.env instead of a file.
 * @param {string[]} [options.ignore=[]]             Keys to skip.
 * @param {string} [options.cwd=process.cwd()]       Base directory.
 * @returns {{missing:string[], extra:string[], empty:string[], ok:boolean}}
 */
function checkDrift(options = {}) {
  const cwd = options.cwd || process.cwd();
  const examplePath = path.resolve(cwd, options.example || '.env.example');
  if (!fs.existsSync(examplePath)) throw new Error(`Reference file not found: ${examplePath}`);
  const expected = parseEnv(fs.readFileSync(examplePath, 'utf8'));

  let actual;
  if (options.useProcessEnv) {
    actual = process.env;
  } else {
    const envPath = path.resolve(cwd, options.env || '.env');
    if (!fs.existsSync(envPath)) throw new Error(`Env file not found: ${envPath}`);
    actual = parseEnv(fs.readFileSync(envPath, 'utf8'));
  }
  return compare(expected, actual, { ignore: options.ignore });
}

module.exports = { parseEnv, compare, checkDrift };
