/**
 * directory.js — interactive primitives for /directory/tables/<slug>/
 *
 * Loaded as an ES module (type="module") by directory-table.html. Module
 * scripts are deferred by default, matching the brief's "defer-loaded"
 * requirement.
 *
 * This file implements four primitives:
 *   C1  Picker view switching (Columns: Human/JSON; DDL: Snowflake/Databricks/Fabric)
 *   C2  Extract filter + recommendation
 *   C3  Scrollspy sidenav
 *   C4  Copy to clipboard (TSV for tables, verbatim for <pre>)
 *
 * Degraded-state / no-JS contract (Worker D's CSS honours this):
 *   - On load, this script sets `document.documentElement.classList.add('has-js')`.
 *   - Worker D's CSS uses `html:not(.has-js) .filter-summary { display: none }`
 *     so the recommendation band does not appear until JS runs.
 *   - First `.view` element in each pair/triple ships with `class="view active"`
 *     so Columns Human and DDL Snowflake render by default without JS.
 *   - Copy buttons remain visible but are inert without JS (harmless).
 *   - Sidenav has no active state by default; scrollspy adds `.active`.
 *
 * Opt-out for QA: if the root element carries `data-no-js`, this script
 * bails early and leaves the page in its degraded state.
 *
 * DOM contract (verbatim from the reference mockup in docs/design/):
 *   - input[type=radio][name="col-view"]       # Columns picker (Human/JSON)
 *   - input[type=radio][name="ddl-view"]       # DDL picker
 *   - input[type=radio][name^="f-"]            # Extract filter radios
 *       names: f-license, f-latency, f-volume
 *       id prefixes: fl-, flat-, fv-
 *   - .method[data-method][data-license][data-latency][data-volume]
 *   - .method .recommend-badge                 # toggled by .recommended on parent
 *   - .method .blocked-badge                   # toggled by .blocked on parent, textContent = reason
 *   - .method .why                             # inline "why" block, shown when parent .recommended
 *   - .filter-summary  with inner #recommend-name and #recommend-why
 *   - .filter-summary-empty                    # optional sibling, created on the fly if missing
 *   - button.copy-btn[data-copy-target="<section-id>"]
 *   - .view[data-for="<radio-id>"], .view.active
 *   - aside.sidenav a[href="#<section-id>"]
 *   - <section id="overview|columns|ddl|extract|notes">
 *
 * No deps. Vanilla JS. IE11 is not a target.
 */

import { decideMethodStates } from './directory-filter-logic.js';

// -------------------- Early-out / has-js marker --------------------

const root = document.documentElement;

if (root.hasAttribute('data-no-js')) {
  // QA opt-out. Do nothing.
} else {
  root.classList.add('has-js');
  init();
}

function init() {
  // Defensive: only activate on pages that actually have a .method grid or
  // a .view-bearing section. Otherwise the listeners are no-ops anyway.
  initPickerSwitching();
  initExtractFilters();
  initScrollspy();
  initCopyButtons();
}

// ==================================================================
// C1 — Picker view switching (Columns + DDL)
// ==================================================================

const PICKER_NAMES = new Set(['col-view', 'ddl-view']);

function initPickerSwitching() {
  document.addEventListener('change', (event) => {
    const el = event.target;
    if (!(el instanceof HTMLInputElement)) return;
    if (el.type !== 'radio') return;
    if (!PICKER_NAMES.has(el.name)) return;
    switchView(el);
  });
}

function switchView(radio) {
  const section = radio.closest('section');
  if (!section) return;
  const views = section.querySelectorAll('.view');
  views.forEach((v) => v.classList.remove('active'));
  const target = section.querySelector(`.view[data-for="${cssEscape(radio.id)}"]`);
  if (target) target.classList.add('active');
}

// ==================================================================
// C2 — Extract filter + recommendation
// ==================================================================

/** Strips the radio-id prefix so 'fl-runtime' → 'runtime', 'flat-any' → 'any', 'fv-big' → 'big'. */
function unprefixFilterId(id) {
  if (!id) return 'any';
  const dashIdx = id.indexOf('-');
  return dashIdx >= 0 ? id.slice(dashIdx + 1) : id;
}

function readCurrentFilter() {
  const pick = (name) => {
    const r = document.querySelector(`input[name="${name}"]:checked`);
    return unprefixFilterId(r ? r.id : '');
  };
  return {
    license: pick('f-license'),   // 'any' | 'full' | 'runtime'
    latency: pick('f-latency'),   // 'any' | 'realtime' | 'batch'
    volume:  pick('f-volume'),    // 'any' | 'small' | 'big'
  };
}

function readMethodsFromDom() {
  return Array.from(document.querySelectorAll('.method')).map((el) => ({
    id: el.dataset.method,
    license: el.dataset.license,
    latency: el.dataset.latency,
    volume: el.dataset.volume,
    el,
  }));
}

function initExtractFilters() {
  // A no-JS page hid the filter-summary band by CSS
  // (`html:not(.has-js) .filter-summary{display:none}`). We've already set
  // `.has-js`, so the band becomes visible again. Also remove any explicit
  // `hidden` attribute Worker B may ship as a fail-closed safety net.
  const summary = document.getElementById('filter-summary');
  if (summary && summary.hasAttribute('hidden')) summary.removeAttribute('hidden');

  document.addEventListener('change', (event) => {
    const el = event.target;
    if (!(el instanceof HTMLInputElement)) return;
    if (el.type !== 'radio') return;
    if (!el.name.startsWith('f-')) return;
    applyExtractFilters();
  });

  // Initial pass so the recommendation appears on load.
  applyExtractFilters();
}

function applyExtractFilters() {
  const methods = readMethodsFromDom();
  if (methods.length === 0) return;

  const filter = readCurrentFilter();
  const { recommendedId, blocked } = decideMethodStates(methods, filter);

  // Reset + apply states.
  for (const m of methods) {
    m.el.classList.remove('recommended', 'blocked');
    const badge = m.el.querySelector('.blocked-badge');
    if (badge) badge.textContent = 'Blocked'; // default fallback text

    const reason = blocked[m.id];
    if (reason) {
      m.el.classList.add('blocked');
      if (badge) badge.textContent = reason;
    }
    if (m.id === recommendedId) {
      m.el.classList.add('recommended');
    }
  }

  renderRecommendationSummary(methods, recommendedId);
}

function renderRecommendationSummary(methods, recommendedId) {
  const summary = document.querySelector('.filter-summary');
  if (!summary) return;

  // Ensure a sibling `.filter-summary-empty` exists (create lazily).
  let empty = summary.parentElement
    ? summary.parentElement.querySelector('.filter-summary-empty')
    : null;
  if (!empty) {
    empty = document.createElement('p');
    empty.className = 'filter-summary-empty';
    empty.setAttribute('role', 'status');
    empty.innerHTML =
      'No method fits your filters — see ' +
      '<a href="../../../articles/runtime-vs-full-use/">licensing options</a>.';
    empty.hidden = true;
    summary.parentNode.insertBefore(empty, summary.nextSibling);
  }

  if (!recommendedId) {
    summary.hidden = true;
    summary.style.display = 'none';
    empty.hidden = false;
    empty.style.display = '';
    return;
  }

  // Recommendation exists: restore the band, hide the empty sibling.
  summary.hidden = false;
  summary.style.display = '';
  empty.hidden = true;
  empty.style.display = 'none';

  const recEl = methods.find((m) => m.id === recommendedId)?.el;
  if (!recEl) return;

  const nameEl = document.getElementById('recommend-name');
  const whyEl = document.getElementById('recommend-why');

  if (nameEl) {
    const h3 = recEl.querySelector('h3');
    if (h3) {
      const clone = h3.cloneNode(true);
      const numNode = clone.querySelector('.num');
      if (numNode) numNode.remove();
      nameEl.textContent = clone.textContent.trim();
    }
  }
  if (whyEl) {
    const why = recEl.querySelector('.why');
    whyEl.textContent = why ? why.textContent.trim() : '';
  }
}

// ==================================================================
// C3 — Scrollspy
// ==================================================================

function initScrollspy() {
  const navLinks = Array.from(document.querySelectorAll('aside.sidenav a[href^="#"]'));
  if (navLinks.length === 0) return;

  const linkByHash = new Map();
  const sections = [];
  for (const a of navLinks) {
    const hash = a.getAttribute('href');
    if (!hash || hash.length < 2) continue;
    const section = document.getElementById(hash.slice(1));
    if (!section) continue;
    linkByHash.set(hash, a);
    sections.push(section);
  }
  if (sections.length === 0) return;

  const setActive = (section) => {
    for (const a of navLinks) a.classList.remove('active');
    const link = linkByHash.get('#' + section.id);
    if (link) link.classList.add('active');
  };

  if ('IntersectionObserver' in window) {
    // Track intersection ratio of each section; activate the one closest to
    // the top of the viewport that is currently intersecting.
    const intersecting = new Map(); // section -> boundingRect.top
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            intersecting.set(entry.target, entry.boundingClientRect.top);
          } else {
            intersecting.delete(entry.target);
          }
        }
        if (intersecting.size > 0) {
          // Pick the section whose top is closest to (but above) the active zone.
          let best = null;
          let bestTop = -Infinity;
          for (const [sec, top] of intersecting.entries()) {
            if (top <= 0 && top > bestTop) {
              bestTop = top;
              best = sec;
            }
          }
          if (!best) {
            // All visible sections are below the fold marker — pick the
            // topmost visible one.
            let minTop = Infinity;
            for (const [sec, top] of intersecting.entries()) {
              if (top < minTop) {
                minTop = top;
                best = sec;
              }
            }
          }
          if (best) setActive(best);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.01, 1] }
    );
    sections.forEach((s) => observer.observe(s));
  } else {
    // Fallback: throttled scroll listener.
    const onScroll = throttle(() => {
      const y = window.scrollY + window.innerHeight * 0.2;
      let active = sections[0];
      for (const s of sections) {
        if (s.offsetTop <= y) active = s;
      }
      if (active) setActive(active);
    }, 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}

function throttle(fn, wait) {
  let last = 0;
  let timer = null;
  return function throttled(...args) {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      if (timer) { clearTimeout(timer); timer = null; }
      last = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

// ==================================================================
// C4 — Copy to clipboard
// ==================================================================

function initCopyButtons() {
  document.addEventListener('click', (event) => {
    const btn = event.target instanceof Element
      ? event.target.closest('button.copy-btn[data-copy-target]')
      : null;
    if (!btn) return;
    event.preventDefault();
    handleCopy(btn);
  });
}

function handleCopy(btn) {
  const targetId = btn.dataset.copyTarget;
  if (!targetId) return;
  const section = document.getElementById(targetId);
  if (!section) return;

  const activeView = section.querySelector('.view.active') || section.querySelector('.view');
  if (!activeView) return;

  const text = extractCopyText(activeView);
  if (!text) return;

  copyToClipboard(text).finally(() => flashButton(btn));
}

function extractCopyText(view) {
  const table = view.querySelector('table');
  if (table) return tableToTsv(table);
  const pre = view.querySelector('pre');
  if (pre) return pre.textContent;
  return view.textContent.trim();
}

function tableToTsv(table) {
  const rows = [];
  const headRows = table.querySelectorAll('thead tr');
  const bodyRows = table.querySelectorAll('tbody tr');
  const collect = (nodeList) => {
    nodeList.forEach((tr) => {
      const cells = tr.querySelectorAll('th, td');
      const line = Array.from(cells)
        .map((c) => (c.textContent || '').replace(/\s+/g, ' ').trim())
        .join('\t');
      rows.push(line);
    });
  };
  if (headRows.length === 0 && bodyRows.length === 0) {
    // Fallback: all rows regardless of thead/tbody.
    collect(table.querySelectorAll('tr'));
  } else {
    collect(headRows);
    collect(bodyRows);
  }
  return rows.join('\n');
}

function copyToClipboard(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function'
      && window.isSecureContext !== false) {
    return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
  }
  return new Promise((resolve) => { legacyCopy(text); resolve(); });
}

function legacyCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '-1000px';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (_) { /* ignore */ }
  document.body.removeChild(ta);
}

function flashButton(btn) {
  if (btn.dataset.flashing === '1') return;
  btn.dataset.flashing = '1';
  const original = btn.textContent;
  btn.textContent = 'Copied ✓';
  setTimeout(() => {
    btn.textContent = original;
    delete btn.dataset.flashing;
  }, 1200);
}

// ==================================================================
// utilities
// ==================================================================

function cssEscape(s) {
  if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(s);
  // Minimal fallback: escape the characters a radio id is likely to contain.
  return String(s).replace(/["\\]/g, '\\$&');
}
