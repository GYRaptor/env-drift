const { parseEnv, compare } = require('../src');

const example = parseEnv('DB_URL=\nPORT=3000\nAPI_KEY=changeme');
const actual = parseEnv('PORT=3000\nDEBUG=1');

console.log(compare(example, actual));
// { missing: [ 'API_KEY', 'DB_URL' ], extra: [ 'DEBUG' ], empty: [], ok: false }
