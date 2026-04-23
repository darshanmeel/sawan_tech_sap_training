/**
 * Pure-logic tests for the extract-filter recommendation.
 *
 * Run with:
 *   cd sap-extract-academy && node --test tests/directory-extract-filter.test.mjs
 *
 * These tests import decideMethodStates() directly. No DOM, no browser.
 * DOM toggling, clipboard, and scroll behaviour are covered by the manual
 * QA checklist at tests/manual-qa-directory.md (Playwright is deferred —
 * see DIRECTORY_NOTES.md §8).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { decideMethodStates } from '../docs/assets/js/directory-filter-logic.js';

// ACDOCA's five canonical methods, in the stable order used by the mockup.
const ACDOCA_METHODS = [
  { id: 'odp',        license: 'runtime', latency: 'batch',    volume: 'any'   },
  { id: 'slt',        license: 'full',    latency: 'realtime', volume: 'any'   },
  { id: 'cds-direct', license: 'runtime', latency: 'batch',    volume: 'small' },
  { id: 'rfc',        license: 'runtime', latency: 'batch',    volume: 'any'   },
  { id: 'bw',         license: 'full',    latency: 'batch',    volume: 'any'   },
];

const ANY = { license: 'any', latency: 'any', volume: 'any' };

describe('decideMethodStates — defaults (Any/Any/Any)', () => {
  it('recommends ODP, blocks nothing', () => {
    const { recommendedId, blocked } = decideMethodStates(ACDOCA_METHODS, ANY);
    assert.equal(recommendedId, 'odp');
    assert.deepEqual(blocked, {});
  });
});

describe('decideMethodStates — license=runtime', () => {
  it('blocks SLT with "Requires Full Use license"', () => {
    const f = { ...ANY, license: 'runtime' };
    const { blocked } = decideMethodStates(ACDOCA_METHODS, f);
    assert.equal(blocked.slt, 'Requires Full Use license');
  });

  it('blocks BW with "Requires BW Bridge license" (not "Full Use")', () => {
    const f = { ...ANY, license: 'runtime' };
    const { blocked } = decideMethodStates(ACDOCA_METHODS, f);
    assert.equal(blocked.bw, 'Requires BW Bridge license');
  });

  it('still recommends ODP (runtime-compatible, batch)', () => {
    const f = { ...ANY, license: 'runtime' };
    const { recommendedId } = decideMethodStates(ACDOCA_METHODS, f);
    assert.equal(recommendedId, 'odp');
  });
});

describe('decideMethodStates — latency=realtime', () => {
  it('recommends SLT when license permits it', () => {
    const f = { ...ANY, latency: 'realtime' };
    const { recommendedId, blocked } = decideMethodStates(ACDOCA_METHODS, f);
    assert.equal(recommendedId, 'slt');
    // batch methods are blocked
    assert.equal(blocked.odp, 'Batch only — not real-time');
    assert.equal(blocked['cds-direct'], 'Batch only — not real-time');
    assert.equal(blocked.rfc, 'Batch only — not real-time');
    assert.equal(blocked.bw, 'Batch only — not real-time');
  });

  it('Runtime + Real-time = everything blocked, no recommendation', () => {
    // The brief's canonical edge case: SLT would be the real-time pick, but
    // SLT requires Full Use. Every other method is batch, so they're all
    // blocked too. Result: no method fits.
    const f = { ...ANY, license: 'runtime', latency: 'realtime' };
    const { recommendedId, blocked } = decideMethodStates(ACDOCA_METHODS, f);
    assert.equal(recommendedId, null);
    // SLT is blocked by license (priority 1), not by latency.
    assert.equal(blocked.slt, 'Requires Full Use license');
    // Others are blocked by latency.
    assert.equal(blocked.odp, 'Batch only — not real-time');
    assert.equal(blocked.rfc, 'Batch only — not real-time');
    // Every method must appear in `blocked`.
    for (const m of ACDOCA_METHODS) {
      assert.ok(blocked[m.id], `${m.id} should be blocked`);
    }
  });
});

describe('decideMethodStates — volume filter', () => {
  it('volume=big blocks CDS direct with "Not suited for > 500M rows"', () => {
    const f = { ...ANY, volume: 'big' };
    const { recommendedId, blocked } = decideMethodStates(ACDOCA_METHODS, f);
    assert.equal(blocked['cds-direct'], 'Not suited for > 500M rows');
    assert.equal(recommendedId, 'odp');
  });

  it('volume=small prefers CDS direct over ODP (when both non-blocked)', () => {
    const f = { ...ANY, volume: 'small' };
    const { recommendedId, blocked } = decideMethodStates(ACDOCA_METHODS, f);
    assert.equal(recommendedId, 'cds-direct');
    assert.deepEqual(blocked, {});
  });
});

describe('decideMethodStates — blocker-reason priority', () => {
  it('license > latency: SLT blocked by license when filter is runtime+realtime', () => {
    const f = { license: 'runtime', latency: 'realtime', volume: 'any' };
    const { blocked } = decideMethodStates(ACDOCA_METHODS, f);
    // License check runs first, so the reason is the license one.
    assert.equal(blocked.slt, 'Requires Full Use license');
  });

  it('latency > volume: CDS direct blocked by latency when filter is realtime+big', () => {
    const f = { license: 'any', latency: 'realtime', volume: 'big' };
    const { blocked } = decideMethodStates(ACDOCA_METHODS, f);
    // Latency check beats volume check.
    assert.equal(blocked['cds-direct'], 'Batch only — not real-time');
  });
});

describe('decideMethodStates — recommendation priority chain', () => {
  it('falls through to first non-blocked when preferred picks are unavailable', () => {
    // Only RFC is non-blocked: make everything else incompatible.
    const methods = [
      { id: 'odp',        license: 'full',    latency: 'batch',    volume: 'any'   },
      { id: 'slt',        license: 'full',    latency: 'realtime', volume: 'any'   },
      { id: 'cds-direct', license: 'full',    latency: 'batch',    volume: 'any'   },
      { id: 'rfc',        license: 'runtime', latency: 'batch',    volume: 'any'   },
      { id: 'bw',         license: 'full',    latency: 'batch',    volume: 'any'   },
    ];
    const { recommendedId } = decideMethodStates(methods, { ...ANY, license: 'runtime' });
    assert.equal(recommendedId, 'rfc');
  });

  it('empty methods array → no recommendation', () => {
    const { recommendedId, blocked } = decideMethodStates([], ANY);
    assert.equal(recommendedId, null);
    assert.deepEqual(blocked, {});
  });
});

describe('decideMethodStates — master-data tables (no SLT/BW)', () => {
  // LFA1-ish: fewer methods, no BW.
  const MASTER = [
    { id: 'odp',        license: 'runtime', latency: 'batch', volume: 'any'   },
    { id: 'cds-direct', license: 'runtime', latency: 'batch', volume: 'small' },
    { id: 'rfc',        license: 'runtime', latency: 'batch', volume: 'any'   },
  ];

  it('Any/Any/Any → ODP', () => {
    assert.equal(decideMethodStates(MASTER, ANY).recommendedId, 'odp');
  });

  it('volume=small → CDS direct', () => {
    assert.equal(
      decideMethodStates(MASTER, { ...ANY, volume: 'small' }).recommendedId,
      'cds-direct'
    );
  });

  it('realtime filter → no method fits (no SLT)', () => {
    const { recommendedId, blocked } = decideMethodStates(MASTER, { ...ANY, latency: 'realtime' });
    assert.equal(recommendedId, null);
    assert.equal(Object.keys(blocked).length, MASTER.length);
  });
});
