// Unit tests for the DDL generator.
//
// Run with:    node --test tests/ddl.test.mjs
//
// Each {dialect × table} pair has a committed snapshot under
// tests/__snapshots__/ddl/. Drift shows up as a PR diff — that is the point.
//
// To regenerate snapshots intentionally:
//    UPDATE_SNAPSHOTS=1 node --test tests/ddl.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateDdl } from '../build/ddl.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAP_DIR = path.join(__dirname, '__snapshots__', 'ddl');
const UPDATE = process.env.UPDATE_SNAPSHOTS === '1';

function assertSnapshot(name, actual) {
  const file = path.join(SNAP_DIR, `${name}.sql`);
  if (UPDATE || !fs.existsSync(file)) {
    fs.mkdirSync(SNAP_DIR, { recursive: true });
    fs.writeFileSync(file, actual, 'utf-8');
    return;
  }
  const expected = fs.readFileSync(file, 'utf-8');
  assert.equal(
    actual,
    expected,
    `Snapshot mismatch for ${name}. Re-run with UPDATE_SNAPSHOTS=1 to update.`
  );
}

// ------------------------------------------------------------
// Fixtures — minimal column sets for three representative tables.
// These intentionally do not depend on content/en/directory/tables so the
// tests run even if Worker A's content isn't in-tree.
// ------------------------------------------------------------

const ACDOCA = {
  name: 'ACDOCA',
  module: 'FI',
  partitionKeys: ['RYEAR', 'RBUKRS'],
  columns: [
    { name: 'MANDT',  type: 'CLNT', length: 3,  key: true,  description: 'Client' },
    { name: 'RBUKRS', type: 'CHAR', length: 4,  key: true,  description: 'Company code' },
    { name: 'RYEAR',  type: 'NUMC', length: 4,  key: true,  description: 'Reporting year' },
    { name: 'POPER',  type: 'NUMC', length: 3,  key: true,  description: 'Posting period' },
    { name: 'BELNR',  type: 'CHAR', length: 10, key: true,  description: 'Document no.' },
    { name: 'WSL',    type: 'CURR', length: 23, decimals: 2, description: 'Local amount' }
  ]
};

const BKPF = {
  name: 'BKPF',
  module: 'FI',
  partitionKeys: ['GJAHR', 'BUKRS'],
  columns: [
    { name: 'MANDT', type: 'CLNT', length: 3,  key: true,  description: 'Client' },
    { name: 'BUKRS', type: 'CHAR', length: 4,  key: true,  description: 'Company code' },
    { name: 'BELNR', type: 'CHAR', length: 10, key: true,  description: 'Document no.' },
    { name: 'GJAHR', type: 'NUMC', length: 4,  key: true,  description: 'Fiscal year' },
    { name: 'BLART', type: 'CHAR', length: 2,                description: 'Document type' },
    { name: 'BLDAT', type: 'DATS',                           description: 'Document date' },
    { name: 'WAERS', type: 'CUKY', length: 5,                description: 'Currency key' }
  ]
};

const MARA = {
  name: 'MARA',
  module: 'MM',
  partitionKeys: ['MATNR'],
  columns: [
    { name: 'MANDT',   type: 'CLNT', length: 3,  key: true, description: 'Client' },
    { name: 'MATNR',   type: 'CHAR', length: 40, key: true, description: 'Material number' },
    { name: 'ERSDA',   type: 'DATS',                         description: 'Created on' },
    { name: 'ERNAM',   type: 'CHAR', length: 12,             description: 'Created by' },
    { name: 'MTART',   type: 'CHAR', length: 4,              description: 'Material type' },
    { name: 'MATKL',   type: 'CHAR', length: 9,              description: 'Material group' },
    { name: 'BRGEW',   type: 'QUAN', length: 13, decimals: 3, description: 'Gross weight' },
    { name: 'GEWEI',   type: 'UNIT', length: 3,              description: 'Weight unit' }
  ]
};

const FIXTURES = [
  ['acdoca', ACDOCA],
  ['bkpf',   BKPF],
  ['mara',   MARA]
];

const DIALECTS = ['snowflake', 'databricks', 'fabric'];

for (const [slug, fx] of FIXTURES) {
  for (const dialect of DIALECTS) {
    test(`generateDdl · ${dialect} · ${slug}`, () => {
      const sql = generateDdl(dialect, fx.name, fx.columns, fx.partitionKeys, {
        module: fx.module
      });
      assert.ok(sql.length > 0, 'DDL must be non-empty');
      assertSnapshot(`${slug}.${dialect}`, sql);
    });
  }
}

test('generateDdl · unknown type falls back to VARCHAR/STRING, does not throw', () => {
  const cols = [
    { name: 'MANDT',   type: 'CLNT',    length: 3, key: true },
    { name: 'WEIRD',   type: 'ZZUNKNOWN', length: 8 }
  ];
  const sf = generateDdl('snowflake', 'ZTEST', cols, ['MANDT'], { module: 'ZZ' });
  assert.match(sf, /VARCHAR\(8\)|VARCHAR\(255\)/);
  const dbx = generateDdl('databricks', 'ZTEST', cols, ['MANDT'], { module: 'ZZ' });
  assert.match(dbx, /STRING/);
  const fab = generateDdl('fabric', 'ZTEST', cols, ['MANDT'], { module: 'ZZ' });
  assert.match(fab, /VARCHAR/);
});

test('generateDdl · unknown dialect throws', () => {
  assert.throws(
    () => generateDdl('bigquery', 'T', [{ name: 'A', type: 'CHAR', length: 1 }], []),
    /unknown dialect/
  );
});

test('generateDdl · empty column array throws', () => {
  assert.throws(
    () => generateDdl('snowflake', 'T', [], [], { module: 'ZZ' }),
    /non-empty/
  );
});
