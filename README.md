# env-drift

Detect drift between `.env.example`, your real `.env`, and `process.env`. Zero dependencies. Works as a library and a CLI.

## Why

"It works on my machine" is often a missing environment variable. Someone adds `STRIPE_KEY` to the code, forgets to update `.env.example`, and a teammate or CI run breaks. `env-drift` compares your reference file against the real values and tells you exactly which keys are missing, blank, or undocumented.

## Installation

```bash
npm install --save-dev env-drift
# or run without installing
npx env-drift
```

Requires Node.js 18+.

## Quick start

### CLI

```bash
npx env-drift                              # compares .env.example vs .env
npx env-drift --process-env                # compares .env.example vs process.env (great in CI)
npx env-drift --strict --ignore NODE_ENV   # also fail on extra keys, skip NODE_ENV
npx env-drift --json                       # machine-readable output
```

Example output:

```
Missing:
  - API_KEY
Extra (not in example):
  + DEBUG
Drift detected.
```

| Option | Description |
| --- | --- |
| `--example <file>` | Reference file (default `.env.example`) |
| `--env <file>` | File to check (default `.env`) |
| `--process-env` | Check `process.env` instead of a file |
| `--ignore a,b` | Keys to skip |
| `--strict` | Also fail when extra keys exist |
| `--json` | JSON output |

Exit codes: `0` in sync, `1` drift found, `2` usage or file error.

Add it to `package.json` so it runs before tests:

```json
{ "scripts": { "pretest": "env-drift" } }
```

### Library

```js
const { parseEnv, compare, checkDrift } = require('env-drift');

const expected = parseEnv('DB_URL=\nPORT=3000\nAPI_KEY=changeme');
const actual = parseEnv('PORT=3000\nDEBUG=1');

compare(expected, actual);
// { missing: ['API_KEY', 'DB_URL'], extra: ['DEBUG'], empty: [], ok: false }
```

## API

### `parseEnv(text) -> object`
Parses `.env` text. Supports comments, blank lines, `export KEY=value`, single and double quotes, inline `# comments` on unquoted values, CRLF and BOM.
- **text** `string`: file contents. Throws `TypeError` if not a string.
- **Returns** `Record<string,string>`.

### `compare(expected, actual, options?) -> result`
- **expected** `object`: reference variables.
- **actual** `object`: variables to check (parsed file or `process.env`).
- **options.ignore** `string[]`: keys to skip.
- **Returns** `{ missing, extra, empty, ok }`
  - `missing`: in expected, absent from actual
  - `extra`: in actual, absent from expected
  - `empty`: blank in actual although the example gives a value
  - `ok`: `true` when `missing` and `empty` are both empty (extras do not fail unless you check them yourself)

### `checkDrift(options?) -> result`
Reads files and runs `compare`.
- **options.example** `string` (default `.env.example`)
- **options.env** `string` (default `.env`)
- **options.useProcessEnv** `boolean`
- **options.ignore** `string[]`
- **options.cwd** `string` (default `process.cwd()`)
- Throws if a file does not exist.

TypeScript definitions are included.

## Limitations

- No variable interpolation (`${OTHER}`) and no multi-line quoted values.
- Compares key names and blankness only; it does not validate value formats.

## Contributing

1. Fork and clone the repo.
2. `npm test` (uses the built-in Node test runner, nothing to install).
3. Add tests for any change and open a pull request.

## License

MIT
