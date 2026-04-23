/**
 * Schema tests for directory table frontmatter.
 *
 * Run with: node --test tests/directory-schema.test.mjs
 *
 * Verifies:
 *  1. Every seeded .md under content/en/directory/tables/ passes validation
 *     with no errors.
 *  2. Specific broken fixtures produce specific errors (bad mode, missing
 *     required field, invalid extract-method id, etc.).
 *  3. `mode: both` tables with a missing `_ecc` variant warn (non-fatal).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

import validateDirectoryTable, {
  VALID_EXTRACT_METHOD_IDS,
  VALID_MODES
} from '../build/validate-directory.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SEED_DIR = path.join(ROOT, 'content/en/directory/tables');

const EXPECTED_SEED_SLUGS = [
  'acdoca',
  'bkpf',
  'bseg',
  'vbak',
  'vbap',
  'lfa1',
  'kna1',
  'mara',
  'ekko',
  'ekpo'
];
const EXPECTED_STUB_SLUGS = ['coep', 'glt0'];

function loadSeed(slug) {
  const filePath = path.join(SEED_DIR, `${slug}.md`);
  const content = fs.readFileSync(filePath, 'utf-8');
  return { ...matter(content), filePath };
}

describe('directory seeds — file presence', () => {
  it('all 10 seeded tables exist', () => {
    for (const slug of EXPECTED_SEED_SLUGS) {
      const p = path.join(SEED_DIR, `${slug}.md`);
      assert.ok(fs.existsSync(p), `missing seed file: ${p}`);
    }
  });

  it('both ECC stubs (COEP, GLT0) exist', () => {
    for (const slug of EXPECTED_STUB_SLUGS) {
      const p = path.join(SEED_DIR, `${slug}.md`);
      assert.ok(fs.existsSync(p), `missing stub file: ${p}`);
    }
  });
});

describe('directory seeds — validator passes on real files', () => {
  for (const slug of EXPECTED_SEED_SLUGS) {
    it(`${slug} validates without errors`, () => {
      const { data, filePath } = loadSeed(slug);
      const { errors } = validateDirectoryTable(data, filePath);
      assert.deepEqual(
        errors,
        [],
        `unexpected errors for ${slug}:\n  ${errors.join('\n  ')}`
      );
    });
  }

  for (const slug of EXPECTED_STUB_SLUGS) {
    it(`${slug} (stub) validates without errors`, () => {
      const { data, filePath } = loadSeed(slug);
      const { errors } = validateDirectoryTable(data, filePath);
      assert.deepEqual(
        errors,
        [],
        `unexpected errors for stub ${slug}:\n  ${errors.join('\n  ')}`
      );
    });
  }
});

describe('directory seeds — canonical extract-method IDs', () => {
  for (const slug of EXPECTED_SEED_SLUGS) {
    it(`${slug} uses only canonical extract_method ids`, () => {
      const { data } = loadSeed(slug);
      for (const m of data.extract_methods || []) {
        assert.ok(
          VALID_EXTRACT_METHOD_IDS.has(m.id),
          `${slug}: non-canonical method id "${m.id}"`
        );
      }
      for (const m of data.extract_methods_ecc || []) {
        assert.ok(
          VALID_EXTRACT_METHOD_IDS.has(m.id),
          `${slug} (ecc): non-canonical method id "${m.id}"`
        );
      }
    });
  }
});

describe('directory seeds — master-data tables have no BW Bridge', () => {
  // Per the brief §"Methods applicable to each table":
  // master data (LFA1, KNA1, MARA) should not list bw-bridge.
  for (const slug of ['lfa1', 'kna1', 'mara']) {
    it(`${slug} does not list bw-bridge`, () => {
      const { data } = loadSeed(slug);
      const ids = (data.extract_methods || []).map(m => m.id);
      const idsEcc = (data.extract_methods_ecc || []).map(m => m.id);
      assert.ok(!ids.includes('bw-bridge'), `${slug} has bw-bridge in S/4 methods`);
      assert.ok(
        !idsEcc.includes('bw-bridge'),
        `${slug} has bw-bridge in ECC methods`
      );
    });
  }
});

describe('directory seeds — ACDOCA redirect resolves', () => {
  it('ACDOCA declares equivalent_in_ecc, and every target is a real seed', () => {
    const { data } = loadSeed('acdoca');
    assert.ok(Array.isArray(data.equivalent_in_ecc));
    assert.ok(data.equivalent_in_ecc.length >= 2);

    const allSlugs = new Set([...EXPECTED_SEED_SLUGS, ...EXPECTED_STUB_SLUGS]);
    for (const eq of data.equivalent_in_ecc) {
      assert.ok(
        allSlugs.has(eq.slug),
        `ACDOCA references "${eq.slug}" but no seed file exists for it`
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Broken fixtures — inline, no disk writes.
// ---------------------------------------------------------------------------

describe('validator — broken fixtures produce specific errors', () => {
  const base = () => ({
    slug: 'fixture',
    name: 'FIXTURE',
    title: 'FIXTURE — test',
    mode: 'both',
    module: 'FI',
    description_one_liner: 'one-liner',
    scope_lock: 'rule',
    columns_total: 5,
    columns: [
      {
        name: 'MANDT', type: 'CLNT', length: 3, key: true,
        source: null, description: 'client'
      },
      {
        name: 'FOO', type: 'CHAR', length: 10, key: false,
        source: null, description: 'some field'
      }
    ],
    extract_methods: [
      { id: 'odp-cds', name: 'ODP', tagline: 't', license: 'runtime',
        latency: 'batch', volume: 'any', body_markdown: 'b' },
      { id: 'slt', name: 'SLT', tagline: 't', license: 'full',
        latency: 'realtime', volume: 'any', body_markdown: 'b' },
      { id: 'rfc', name: 'RFC', tagline: 't', license: 'runtime',
        latency: 'batch', volume: 'small', body_markdown: 'b' }
    ],
    notes: [
      { date: '2026-01', headline: 'h', body_markdown: 'b' },
      { date: '2025-09', headline: 'h', body_markdown: 'b' }
    ],
    ingestion_guidance: {
      snowflake: 'a', snowflake_docs_url: 'https://x',
      databricks: 'a', databricks_docs_url: 'https://x',
      fabric: 'a', fabric_docs_url: 'https://x'
    }
  });

  it('passes on the baseline fixture', () => {
    const { errors } = validateDirectoryTable(base(), 'fixture.md');
    assert.deepEqual(errors, []);
  });

  it('fails when mode is invalid', () => {
    const f = { ...base(), mode: 'somethingelse' };
    const { errors } = validateDirectoryTable(f, 'fixture.md');
    assert.ok(
      errors.some(e => /mode "somethingelse" must be one of/.test(e)),
      `expected mode-enum error, got:\n${errors.join('\n')}`
    );
  });

  it('fails when required slug is missing', () => {
    const f = base();
    delete f.slug;
    const { errors } = validateDirectoryTable(f, 'fixture.md');
    assert.ok(
      errors.some(e => /required field "slug" is missing/.test(e)),
      `expected slug missing error, got:\n${errors.join('\n')}`
    );
  });

  it('fails when an extract_method uses a non-canonical id', () => {
    const f = base();
    f.extract_methods[0].id = 'homemade';
    const { errors } = validateDirectoryTable(f, 'fixture.md');
    assert.ok(
      errors.some(e => /is not in the canonical set/.test(e)),
      `expected canonical-set error, got:\n${errors.join('\n')}`
    );
  });

  it('fails when extract_methods has fewer than 3 entries', () => {
    const f = base();
    f.extract_methods = f.extract_methods.slice(0, 2);
    const { errors } = validateDirectoryTable(f, 'fixture.md');
    assert.ok(
      errors.some(e => /expected 3–5 extract_methods/.test(e)),
      `expected count error, got:\n${errors.join('\n')}`
    );
  });

  it('fails when no column has key: true', () => {
    const f = base();
    for (const c of f.columns) c.key = false;
    const { errors } = validateDirectoryTable(f, 'fixture.md');
    assert.ok(
      errors.some(e => /at least one column must have key: true/.test(e)),
      `expected key-column error, got:\n${errors.join('\n')}`
    );
  });

  it('fails when columns_total < columns.length', () => {
    const f = base();
    f.columns_total = 1;
    const { errors } = validateDirectoryTable(f, 'fixture.md');
    assert.ok(
      errors.some(e => /columns_total.*<.*columns\.length/.test(e)),
      `expected columns_total error, got:\n${errors.join('\n')}`
    );
  });

  it('fails when ingestion_guidance.snowflake is missing', () => {
    const f = base();
    delete f.ingestion_guidance.snowflake;
    const { errors } = validateDirectoryTable(f, 'fixture.md');
    assert.ok(
      errors.some(e => /ingestion_guidance\.snowflake is missing/.test(e)),
      `expected ingestion error, got:\n${errors.join('\n')}`
    );
  });

  it('fails when a note date is not YYYY-MM', () => {
    const f = base();
    f.notes[0].date = '2026/01';
    const { errors } = validateDirectoryTable(f, 'fixture.md');
    assert.ok(
      errors.some(e => /note\.date "2026\/01" must be YYYY-MM/.test(e)),
      `expected date-format error, got:\n${errors.join('\n')}`
    );
  });

  it('warns — not errors — when mode: both is missing _ecc variant', () => {
    // Baseline is mode: both with NO `_ecc` fields — should warn repeatedly.
    const f = base();
    const { errors, warnings } = validateDirectoryTable(f, 'fixture.md');
    assert.deepEqual(errors, []);
    assert.ok(
      warnings.some(w => /Missing _ecc variant for columns/.test(w)),
      `expected _ecc warning, got:\n${warnings.join('\n')}`
    );
  });

  it('mode: s4-only requires equivalent_in_ecc', () => {
    const f = base();
    f.mode = 's4-only';
    // No equivalent_in_ecc.
    const { errors } = validateDirectoryTable(f, 'fixture.md');
    assert.ok(
      errors.some(e => /equivalent_in_ecc/.test(e)),
      `expected s4-only redirect error, got:\n${errors.join('\n')}`
    );
  });

  it('stub detection: mode: ecc-only + no columns → minimal validation', () => {
    const f = {
      slug: 'stub-test',
      name: 'STUBTEST',
      title: 'Stub test',
      mode: 'ecc-only',
      module: 'FI',
      stub: true,
      equivalent_in_s4: [{ slug: 'acdoca', role: 'replacement' }]
    };
    const { errors } = validateDirectoryTable(f, 'stub-test.md');
    assert.deepEqual(errors, []);
  });
});

describe('validator — enum exports are stable', () => {
  it('VALID_MODES matches the brief', () => {
    assert.deepEqual(
      new Set([...VALID_MODES]),
      new Set(['both', 's4-only', 'ecc-only'])
    );
  });

  it('VALID_EXTRACT_METHOD_IDS matches the brief', () => {
    assert.deepEqual(
      new Set([...VALID_EXTRACT_METHOD_IDS]),
      new Set(['odp-cds', 'slt', 'cds-direct', 'rfc', 'bw-bridge', 'bw-extractor'])
    );
  });
});
