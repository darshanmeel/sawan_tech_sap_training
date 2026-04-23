# Manual QA checklist — `/directory/tables/<slug>/` interactions

Playwright is deferred for directory v1 (see `DIRECTORY_NOTES.md` §8). Before
shipping a directory table page, a human reviewer walks this checklist. Budget:
under 10 minutes.

Prereq: `npm run build` in `sap-extract-academy/`, then serve `docs/` (any
static server — `npx local-web-server -d docs` or equivalent). Open a
directory table page, e.g. `/directory/tables/acdoca/`.

## 0 · Smoke

- [ ] Page loads without a JS console error
- [ ] `<html class="has-js">` is present in the inspector
- [ ] Scrollspy sidenav is visible on the left at ≥ 900px viewport
- [ ] All five sections render: Overview, Columns, DDL, Extract, Notes

## 1 · C1 — Picker view switching

### Columns

- [ ] On load, "Human" pill is selected and the `.col-table` is visible
- [ ] Click "JSON" — table hides, `<pre>` JSON view appears
- [ ] Click "Human" — JSON hides, table reappears
- [ ] Keyboard: tab to the radio, arrow keys switch views

### DDL

- [ ] On load, "Snowflake" pill is selected and its `<pre>` is visible
- [ ] Click "Databricks" — Snowflake hides, Databricks `<pre>` appears
- [ ] Click "Fabric" — Databricks hides, Fabric `<pre>` appears
- [ ] Click "Snowflake" — Fabric hides, Snowflake reappears

## 2 · C2 — Extract filter + recommendation

Each combo below: set the filters, then verify the expected output. Start
fresh (reload) between combos to avoid order effects.

### Combo A — License: **Runtime**, Latency: **Any**, Volume: **Any**

- [ ] Recommendation: **ODP via CDS view** (first non-blocked, runtime-compatible)
- [ ] SLT shows red blocked badge: "Requires Full Use license"
- [ ] BW shows red blocked badge: "Requires BW Bridge license" (NOT "Full Use")
- [ ] ODP, CDS direct, Direct RFC are not blocked

### Combo B — License: **Any**, Latency: **Any**, Volume: **< 500M**

- [ ] Recommendation: **CDS view consumption** (CDS direct preferred for small)
- [ ] No methods blocked

### Combo C — License: **Runtime**, Latency: **Real-time**, Volume: **Any**  ← the edge case

- [ ] Recommendation summary band is hidden
- [ ] A muted "No method fits your filters — see licensing options" message
      shows in place of the summary (look for `.filter-summary-empty`)
- [ ] SLT blocked with license reason (license > latency priority)
- [ ] ODP / CDS direct / RFC / BW blocked with "Batch only — not real-time"
      (or "Requires Full Use license" for BW — license wins)
- [ ] Every method card has a red blocked badge; none has an amber top border

### Combo D (sanity, defaults) — all Any

- [ ] Recommendation: **ODP via CDS view**
- [ ] No methods blocked
- [ ] Amber ribbon "Recommended" appears on ODP card's top-right
- [ ] Pale-yellow "why" block appears inside the ODP card

## 3 · C3 — Scrollspy

- [ ] At top of page: sidenav "Overview" is active (amber left border, darker text)
- [ ] Scroll slowly downward — the active sidenav item follows the section
      near the top of the viewport
- [ ] Pass through all 5 sections: Overview → Columns → DDL → Extract → Notes
- [ ] Click a sidenav link — the page jumps and that item becomes active

## 4 · C4 — Copy to clipboard

### Columns · Human (TSV expected)

- [ ] Make sure Human view is active
- [ ] Click "Copy" in the Columns toolbar
- [ ] Button flashes to "Copied ✓" for ~1.2s then restores
- [ ] Paste into a text editor: rows are tab-separated, starts with the
      header row (Field, Type, Key, Description, Source)

### Columns · JSON (verbatim expected)

- [ ] Switch to JSON view, click Copy
- [ ] Paste: body matches the `<pre>` text exactly (JSON-shaped), no HTML

### DDL · Snowflake (raw SQL expected)

- [ ] Ensure Snowflake view is active, click "Copy DDL"
- [ ] Paste: the text is the exact SQL from the code block, no HTML tags

### Repeat for Databricks and Fabric

- [ ] Each DDL variant copies cleanly when its pill is active

## 5 · Degraded-state (no-JS) verification

- [ ] Temporarily add `data-no-js` attribute to `<html>` via the browser
      inspector and reload
- [ ] Columns "Human" view is visible (JSON view hidden by CSS)
- [ ] DDL "Snowflake" view is visible (others hidden)
- [ ] `.filter-summary` band is **hidden** (no recommendation shown)
- [ ] Copy buttons do nothing (no-op, not errored)
- [ ] Sidenav shows its static initial state (no JS-driven scrollspy updates)
- [ ] Remove `data-no-js` — interactivity returns on reload

## 6 · Accessibility spot-checks

- [ ] Tab order flows through nav → title → sidenav → main → filters → method
      cards → copy buttons
- [ ] Each copy button has a visible focus ring
- [ ] Radio pill-pickers can be operated with arrow keys
- [ ] No element has `aria-describedby` pointing to a missing id
- [ ] Run Lighthouse accessibility audit: score ≥ 95

## 7 · Browser coverage

At minimum reproduce C1–C4 on:

- [ ] Chromium (or Chrome/Edge)
- [ ] Firefox (IntersectionObserver supported, check scrollspy feel)
- [ ] Safari (clipboard API quirks — expect the `navigator.clipboard` path,
      fallback only triggers on insecure/iframe contexts)

## 8 · Sign-off

- [ ] Reviewer name / date recorded in the PR description
- [ ] Any failing step captured as an issue with a reproducer URL
