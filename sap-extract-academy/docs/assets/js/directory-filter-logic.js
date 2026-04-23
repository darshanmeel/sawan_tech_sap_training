/**
 * directory-filter-logic.js
 *
 * Pure decision function for the extract-method filter + recommendation
 * feature on /directory/tables/<slug>/ pages.
 *
 * No DOM access. No globals. Exported as ESM so tests can import it
 * directly without a browser.
 *
 * Contract (consumed by directory.js and by
 * tests/directory-extract-filter.test.mjs):
 *
 *   decideMethodStates(methods, filter) => {
 *     recommendedId: string | null,
 *     blocked: { [methodId]: string }   // methodId -> blocker reason text
 *   }
 *
 *   methods: array of plain objects, each
 *     { id, license: 'runtime'|'full', latency: 'realtime'|'batch',
 *       volume: 'any'|'small' }
 *
 *   filter: plain object
 *     { license: 'any'|'full'|'runtime',
 *       latency: 'any'|'realtime'|'batch',
 *       volume:  'any'|'small'|'big' }
 *
 * Blocker-reason priority (first match wins per method, per brief §3):
 *   1. License mismatch
 *      - license=runtime + method.license=full
 *        - if method.id === 'bw' → "Requires BW Bridge license"
 *        - else                   → "Requires Full Use license"
 *   2. Latency mismatch
 *      - latency=realtime + method.latency=batch
 *        → "Batch only — not real-time"
 *   3. Volume mismatch
 *      - volume=big + method.volume=small
 *        → "Not suited for > 500M rows"
 *
 * Recommendation priority (first non-blocked wins):
 *   1. latency=realtime → prefer 'slt'
 *   2. else prefer 'cds-direct' if volume=small
 *   3. else prefer 'odp'
 *   4. else first non-blocked method in the input order
 *
 * If no methods exist or all are blocked, recommendedId is null.
 */

const BLOCKER_REASONS = {
  licenseFull: 'Requires Full Use license',
  licenseBwBridge: 'Requires BW Bridge license',
  latencyBatchOnly: 'Batch only — not real-time',
  volumeTooLarge: 'Not suited for > 500M rows',
};

function blockReasonFor(method, filter) {
  // Priority 1: license
  if (filter.license === 'runtime' && method.license === 'full') {
    return method.id === 'bw'
      ? BLOCKER_REASONS.licenseBwBridge
      : BLOCKER_REASONS.licenseFull;
  }
  // Priority 2: latency
  if (filter.latency === 'realtime' && method.latency === 'batch') {
    return BLOCKER_REASONS.latencyBatchOnly;
  }
  // Priority 3: volume
  if (filter.volume === 'big' && method.volume === 'small') {
    return BLOCKER_REASONS.volumeTooLarge;
  }
  return null;
}

export function decideMethodStates(methods, filter) {
  const blocked = {};
  const nonBlocked = [];

  for (const m of methods) {
    const reason = blockReasonFor(m, filter);
    if (reason) {
      blocked[m.id] = reason;
    } else {
      nonBlocked.push(m);
    }
  }

  let recommendedId = null;
  if (nonBlocked.length > 0) {
    let pick = null;
    if (filter.latency === 'realtime') {
      pick = nonBlocked.find(m => m.id === 'slt');
    }
    if (!pick && filter.volume === 'small') {
      pick = nonBlocked.find(m => m.id === 'cds-direct');
    }
    if (!pick) {
      pick = nonBlocked.find(m => m.id === 'odp');
    }
    if (!pick) {
      pick = nonBlocked[0];
    }
    recommendedId = pick.id;
  }

  return { recommendedId, blocked };
}

export const _BLOCKER_REASONS = BLOCKER_REASONS;
