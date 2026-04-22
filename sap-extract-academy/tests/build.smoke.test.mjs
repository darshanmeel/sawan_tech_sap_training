/**
 * Smoke tests for the SAP Extract Academy build output.
 * Run with: node --test tests/
 *
 * These tests catch regressions for bugs B1-B3 (duplicate sections),
 * B4 ([object Object] in related walkthroughs), and B5 (empty <h1>).
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');

// Run the build once before all tests (reuses prior artifact if already fresh,
// but always rebuilds to catch regressions immediately).
before(() => {
  execSync('node build.js', { cwd: ROOT, stdio: 'inherit' });
});

function readFile(relPath) {
  return fs.readFileSync(path.join(DOCS, relPath), 'utf-8');
}

function countMatches(html, pattern) {
  return (html.match(pattern) || []).length;
}

describe('B1 regression — tables/acdoca Key fields section', () => {
  it('contains exactly one <h2>Key fields</h2>', () => {
    const html = readFile('tables/acdoca/index.html');
    assert.equal(
      countMatches(html, /<h2>Key fields<\/h2>/g),
      1,
      'Expected exactly one <h2>Key fields</h2> in tables/acdoca/index.html'
    );
  });

  it('contains exactly one <h2>Extraction gotchas</h2>', () => {
    const html = readFile('tables/acdoca/index.html');
    assert.equal(
      countMatches(html, /<h2>Extraction gotchas<\/h2>/g),
      1,
      'Expected exactly one <h2>Extraction gotchas</h2> in tables/acdoca/index.html'
    );
  });
});

describe('B3 regression — walkthrough Before you start section', () => {
  it('contains exactly one <h2>Before you start</h2>', () => {
    const html = readFile('walkthrough/beginner/acdoca/index.html');
    assert.equal(
      countMatches(html, /<h2>Before you start<\/h2>/g),
      1,
      'Expected exactly one <h2>Before you start</h2> in walkthrough/beginner/acdoca/index.html'
    );
  });
});

describe('B4 — related walkthroughs must not contain [object Object]', () => {
  it('articles/acdoca-complete-walkthrough/index.html has no [object Object]', () => {
    const html = readFile('articles/acdoca-complete-walkthrough/index.html');
    assert.ok(
      !html.includes('[object Object]'),
      'Found "[object Object]" in articles/acdoca-complete-walkthrough/index.html'
    );
  });
});

describe('B5 / X1 — articles index must have a non-empty <h1>', () => {
  it('articles/index.html contains a non-empty <h1>', () => {
    const html = readFile('articles/index.html');
    assert.match(
      html,
      /<h1>[^<]+<\/h1>/,
      'articles/index.html must contain a non-empty <h1>'
    );
  });
});
