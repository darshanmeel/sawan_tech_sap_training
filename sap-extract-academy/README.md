# SAP Extract Guide — Site Source

Source for the SAP Extract Guide static site. This README covers the **build system, content conventions, and local development workflow**. For the mission, audience, and content overview, see the [repo-level README](../README.md).

> **AI-generated content disclaimer:** This site and its content are AI-generated and have not been fully verified or proof-checked. Information may be incomplete or inaccurate. Always verify against official SAP documentation before use.

The directory name `sap-extract-academy/` is retained as the repo path because the deploy workflow, Pages artifact path, `package.json` name, and localStorage keys all depend on it. The user-facing site and its content use **Guide**.

**Live site:** [https://darshanmeel.github.io/sawan_tech_sap_training/](https://darshanmeel.github.io/sawan_tech_sap_training/)

---

## Table of Contents

1. [What's in this directory](#whats-in-this-directory)
2. [Stack and dependencies](#stack-and-dependencies)
3. [Quick start](#quick-start)
4. [Build pipeline in detail](#build-pipeline-in-detail)
5. [Page types and templates](#page-types-and-templates)
6. [Frontmatter reference](#frontmatter-reference)
7. [Content directories](#content-directories)
8. [DDL generator](#ddl-generator)
9. [Directory validator](#directory-validator)
10. [Templates and theming](#templates-and-theming)
11. [CSS architecture](#css-architecture)
12. [Progressive-enhancement JavaScript](#progressive-enhancement-javascript)
13. [Accessibility](#accessibility)
14. [SEO outputs](#seo-outputs)
15. [Performance targets](#performance-targets)
16. [Deployment](#deployment)
17. [Adding content — worked examples](#adding-content--worked-examples)
18. [Troubleshooting](#troubleshooting)

---

## What's in this directory

```
sap-extract-academy/
├── README.md                 # This file
├── package.json              # Node dependencies and npm scripts
├── package-lock.json         # Locked dependency tree
├── build.js                  # Main build script (markdown → HTML)
├── build/                    # Build support modules
│   ├── ddl.js                # ECC/S4 DDL generator from table metadata
│   └── directory-validator.js # Schema sanity-check for directory/tables/**
├── content/                  # All site content
│   └── en/                   # English locale (structure is i18n-ready)
│       ├── index.md          # Landing page
│       ├── about.md          # Static about page
│       ├── roadmap.md        # Published roadmap
│       ├── tables/           # Per-table reference pages
│       ├── walkthroughs/     # One end-to-end walkthrough per table
│       ├── articles/         # Long-form articles
│       ├── glossary/         # Single-term definitions
│       └── directory/tables/ # Field-level metadata for DDL generation
├── templates/                # Mustache templates, one per page type
├── strings/en.json           # UI text (i18n-ready)
├── docs/                     # BUILD OUTPUT — served by GitHub Pages
│   ├── assets/               # css/, js/, images/
│   ├── <every page>/index.html
│   └── sitemap.xml
├── .github/workflows/        # Lighthouse CI, deploy workflow
├── lighthouserc.json         # Performance budget
└── DEPLOYMENT.md             # Extra deployment notes
```

## Stack and dependencies

Deliberately minimal — no framework, no bundler, no transpilation.

**Build dependencies** (`package.json` → `devDependencies`):

- **`marked`** — Markdown to HTML. Configured with GitHub-flavoured Markdown and HTML passthrough enabled.
- **`mustache`** — Logic-less templating. Chosen over Handlebars / Liquid because the site does not need helpers or custom filters.
- **`gray-matter`** — YAML frontmatter parsing.
- **`js-yaml`** — Parsing the shared YAML metadata files under `content/en/walkthroughs/shared/`.

**Runtime dependencies in the published site:** none. The JavaScript in `docs/assets/js/` is hand-written, small, and runs only as progressive enhancement.

## Quick start

```bash
# From this directory
npm install                   # One-time
npm run build                 # Generate docs/ from content/en/

# Serve the built site
cd docs
npx local-web-server          # http://localhost:8000
```

Typical edit loop: change a Markdown file → `npm run build` → refresh the browser. Commit both the Markdown source and the regenerated `docs/` output.

## Build pipeline in detail

The build is a single Node script with two passes. Understanding this model makes most content-authoring questions answer themselves.

### Pass 1 — collect

Walks `content/en/**/*.md`. For each file:

1. Parse frontmatter with `gray-matter`.
2. Derive a canonical URL path from the file location and `slug` field.
3. Record the page in an in-memory index keyed by type and slug.

The index is what makes these features possible without manual maintenance:

- Auto-generated list pages (`/tables/`, `/articles/`, `/walkthrough/`, `/glossary/`).
- Cross-references on articles (`relatedWalkthroughs:` in frontmatter becomes rendered links).
- The landing page's featured-tables grid.
- `sitemap.xml`.

### Pass 2 — render

For each page in the index:

1. **Render Markdown body** through `marked`. HTML passthrough is enabled so we can hand-author tabbed walkthrough structures, admonition boxes, and the ECC/S/4HANA `data-*-only` wrappers.
2. **Choose a template** based on file location (see [Page types and templates](#page-types-and-templates)).
3. **Render inner template** with Mustache, passing: frontmatter fields, rendered HTML body, the Pass 1 index (for cross-references and lists), UI strings from `strings/en.json`, and computed SEO fields (canonical URL, JSON-LD object).
4. **Wrap with `base.html`** — the shared header, footer, meta tags, and script tags.
5. **Write** to `docs/<path>/index.html`.

### Auxiliary outputs

Produced in the same build:

- **`docs/sitemap.xml`** — every canonical URL with its `updatedAt` timestamp.
- **Generated DDL per table** — both ECC and S/4HANA flavors, embedded into the table reference pages and also written as standalone pages.
- **Auto-generated list pages** — `/tables/`, `/articles/`, `/walkthrough/`, `/glossary/`, `/directory/tables/`.

## Page types and templates

The build picks a template based on file location:

| Source location | Type | Template | Notes |
|---|---|---|---|
| `index.md` | `landing` | `landing.html` | Bento grid with hero + featured tables |
| `about.md` | `page` | `page.html` | Generic static page |
| `roadmap.md` | `list` | `list.html` | Renders dated roadmap items |
| `tables/<slug>.md` | `table` | `table.html` | Table reference; embeds generated DDL |
| `walkthroughs/<slug>.md` | `walkthrough` | `walkthrough.html` | One end-to-end walkthrough per table |
| `articles/<slug>.md` | `article` | `article.html` | Long-form article (1500–4000 words typical) |
| `glossary/<term>.md` | `glossary` | `glossary.html` | Single-term page |
| Auto-generated indexes | `list` | `list.html` | One per content type, no source file |

**Single walkthrough per table.** Do not create `walkthroughs/beginner/<slug>.md` or `walkthroughs/expert/<slug>.md`. The canonical structure as of April 2026 is one `walkthroughs/<slug>.md` per table covering small-batch, partitioned-batch, and real-time paths inside the same document. Legacy level-segmented directories have been removed; any remaining references in branches should be flattened.

### Adding a new page type

1. Add a template file under `templates/<newtype>.html`.
2. Register it in `build.js` — both in the `getPageType()` logic and in the `pageTemplates` object that `fs.readFileSync`s each template at build start.
3. Add any required frontmatter validation.
4. Add an auto-generated index under `/directory/` or equivalent if the new type warrants it.

## Frontmatter reference

### Universal fields

Every page supports:

| Field | Required | Notes |
|---|---|---|
| `title` | yes | H1 and default `<title>` |
| `slug` | yes | URL slug under the type's root |
| `seoTitle` | recommended | Overrides `<title>`; keep under 60 chars |
| `seoDescription` | recommended | `<meta description>`; 150–160 chars |
| `updatedAt` | yes | ISO date, surfaces in sitemap and JSON-LD |
| `summary` | recommended | One-paragraph abstract; used in list pages |

### Walkthrough-specific

| Field | Notes |
|---|---|
| `pageType: walkthrough` | Explicit (belt and braces — location also determines this) |
| `table` | Table code (e.g. `ACDOCA`) — drives cross-links from the table page |
| `estimatedMinutes` | Surfaced in the walkthrough header |
| `toolSteps` | Ordered list of steps; shown as a checklist with localStorage persistence |
| `reconciliationChecks` | Array of post-load validation queries |
| `nextSteps` | Array of `{label, url}` for the "what's next" block |

### Article-specific

| Field | Notes |
|---|---|
| `publishDate` | ISO date for the article's original publish date |
| `readingTimeMinutes` | Surfaced in article header |
| `author` | String; defaults to "SAP Extract Guide" |
| `relatedWalkthroughs` | Array of `{slug}`; deduplicated by slug in the build. Renders as cross-links. |
| `redirectTo` | Optional; if set, the page emits a meta refresh + canonical pointing elsewhere. Used to keep legacy URLs alive. |

### Table-specific

| Field | Notes |
|---|---|
| `module` | SAP module code (FI, SD, MM, CO, HR) — drives module grouping in lists |
| `primaryKeys` | Array of field names; surfaced in the reference header |
| `approximateRows` | Free-text volume description ("2–20 billion in large enterprises") |
| `relatedTables` | Array of slugs for the "related tables" block |

### Glossary-specific

| Field | Notes |
|---|---|
| `term` | The term itself — usually matches the file name |
| `acronym` | Expanded form, if applicable ("Operational Data Provisioning") |
| `relatedTerms` | Array of other glossary slugs |

## Content directories

### `content/en/tables/`

Five files, one per featured table: `acdoca.md`, `bkpf.md`, `vbak.md`, `mara.md`, `lfa1.md`. Each is a reference page: business meaning, primary keys, volumes, licensing notes, and a link to the single walkthrough.

### `content/en/walkthroughs/`

One end-to-end walkthrough per table, plus shared assets:

```
walkthroughs/
├── acdoca.md, bkpf.md, vbak.md, mara.md, lfa1.md   # The five canonical walkthroughs
├── slt-setup.md                                    # Method-specific: SLT/LTRC/LTRS setup
└── shared/                                         # YAML fragments pulled into walkthroughs
    ├── acdoca.yaml
    └── vbak.yaml
```

The shared YAML files hold long lists (tool step metadata, reconciliation queries) that are referenced by multiple trajectories inside the same walkthrough.

**Legacy directories removed:** Earlier versions had `walkthroughs/beginner/`, `walkthroughs/intermediate/`, `walkthroughs/expert/`, and `walkthroughs/s4hana/beginner/`. These have been consolidated into single canonical walkthroughs. If you're rebasing an old branch, flatten content back into the top-level walkthrough file for that table.

### `content/en/articles/`

Ten long-form articles:

| Slug | Focus |
|---|---|
| `how-to-extract-any-sap-data` | Core guide tying everything together — start here as a reader |
| `why-acdoca-breaks-sap` | Memory internals, `TSV_TNEW_PAGE_ALLOC_FAILED`, why partitioning is mandatory |
| `sap-runtime-license-trap` | Incident-facing view of the Runtime license trap |
| `runtime-vs-full-use` | Architect-facing license decision framework |
| `acdoca-complete-walkthrough` | Deep-dive companion to the ACDOCA walkthrough |
| `odp-setup-guide` | ODP-specific setup, ODQMON usage, delta queues |
| `slt-setup-guide` | SLT / LTRC / LTRS setup end to end |
| `rfc-replication-guide` | When and how to use RFC, patterns and pitfalls |
| `odata-integration-guide` | OData V2/V4 patterns, auth, pagination, batch |
| `datasphere-replication-guide` | SAP Datasphere as an extraction target |

### `content/en/glossary/`

32 terms, one file each. Keep entries concise — one concept, under ~200 words. Terms are grouped conceptually in the glossary index (SAP transactions, extraction concepts, field types, runtime concepts).

### `content/en/directory/tables/`

Field-level metadata driving the DDL generator. Structure:

```
directory/tables/
└── <tableslug>/
    ├── index.md          # Directory entry (cross-links to walkthrough + reference)
    ├── ecc/index.md      # ECC-specific field list
    └── s4/index.md        # S/4HANA-specific field list
```

The field lists are parsed by `build/ddl.js` to generate CREATE TABLE statements in both flavors. This is the single source of truth for field types — never hand-author DDL in Markdown.

## DDL generator

`build/ddl.js` takes the field metadata under `directory/tables/<slug>/<source>/index.md` and produces CREATE TABLE statements for:

- ECC (SAP ECC 6.0 conventions)
- S/4HANA (HANA-style types, with length and precision preserved)

The generator lives as a Node module with a tested snapshot output (`npm test` exercises it). When adding a new field:

1. Edit the field list under `directory/tables/<slug>/<source>/index.md`.
2. Run `npm run build` — DDL regenerates and embeds in the table page.
3. If adding a new type (new to the generator, not SAP), add a mapping in `build/ddl.js`.

## Directory validator

`build/directory-validator.js` runs during the build and fails loudly if the directory tables metadata is malformed — missing primary keys, duplicated field names, unrecognized types, inconsistent ECC/S4 field lists. This catches most "forgot to update metadata after editing a field" bugs at build time instead of in review.

## Templates and theming

Eight templates under `templates/`:

| Template | Purpose |
|---|---|
| `base.html` | Outermost wrapper: `<html>`, `<head>`, header, footer, scripts. Every page passes through this. |
| `landing.html` | Home page (bento grid layout) |
| `page.html` | Generic static pages (about) |
| `list.html` | Index pages (all auto-generated lists plus roadmap) |
| `table.html` | Table reference page |
| `walkthrough.html` | End-to-end walkthrough with tabbed trajectories and checklist |
| `article.html` | Long-form article |
| `glossary.html` | Single glossary term |

All templates are pure Mustache — no custom helpers, no partials except through Node-side composition in `build.js`. If you find yourself reaching for a helper, add the computed value to the Pass 2 context in `build.js` instead.

## CSS architecture

Single stylesheet at `docs/assets/css/main.css` (authored in place — no preprocessor). Key patterns:

**Design tokens** as CSS custom properties in `:root`:

```css
--color-primary: #2d5a3d;        /* S/4HANA green */
--color-primary-light: #e8f0ea;
--color-secondary: #8a6f99;      /* ECC purple */
--color-ink, --color-ink-soft;   /* Text on light */
--color-bg, --color-bg-2, --color-bg-3;  /* Backgrounds */
--color-accent, --color-accent-2;
--space-1 … --space-7;           /* Spacing scale */
--radius-sm, --radius-md, --radius-lg;
--font-sans, --font-display;
```

**Responsive breakpoints** — mobile-first, two breakpoints:

```css
@media (min-width: 640px)  { /* tablet */ }
@media (min-width: 1024px) { /* desktop */ }
```

**Component classes** are flat (no BEM, no utility framework). Class names describe the element's role in the page, not its styling. Notable components:

- `.btn`, `.btn-primary`, `.btn-secondary` — primary/secondary CTAs
- `.container` — max-width wrapper (72rem)
- `.grid`, `.card`, `.card.hero`, `.card.meta`, `.card.section`, `.card.accent` — bento grid building blocks on the landing page
- `.site-header`, `.site-nav`, `.site-footer` — chrome
- `.source-picker`, `.source-indicator` — ECC / S/4HANA version toggle
- `.checklist` — walkthrough progress tracking
- `.eyebrow`, `.chip`, `.dot` — typographic accents

Changing site colors: edit the `:root` custom properties, rebuild, redeploy. No find-and-replace needed.

## Progressive-enhancement JavaScript

Two small hand-written scripts under `docs/assets/js/`:

### `checklist.js`

Persists walkthrough progress across page loads using localStorage.

- **Storage key:** `sap-extract-academy-checklist:<pageSlug>`
- **Persists:** each checkbox state, keyed by `data-step-id` on the enclosing element.
- **Reset:** one-click button in the walkthrough header clears the keyed state.

Usage in Markdown:

```html
<div data-step-id="ltrc-setup">
  <label><input type="checkbox" /> Configure LTRC connection</label>
</div>
```

### `source-picker.js`

Toggles between ECC and S/4HANA content on pages that have both.

- **Storage key:** `sap-extract-academy-source-version`
- **Default:** `s4hana`
- **API:** `window.sapExtractAcademy.getSourceVersion()` returns the current selection.

Usage in Markdown:

```html
<div data-s4hana-only>…S/4HANA-specific content…</div>
<div data-ecc-only>…ECC-specific content…</div>
```

Both scripts degrade gracefully — with JavaScript disabled, checklists are plain checkboxes (no persistence) and both ECC and S/4HANA content is visible.

## Accessibility

Targeting WCAG 2.1 AA:

- **Skip link** at the top of every page (`.skip-link`), visible on focus.
- **Semantic HTML** throughout — `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`, plus `<aside>` for related links.
- **Focus states** on every interactive element (`:focus-visible` outlines).
- **Color contrast** — body text runs at 7:1+ against background; UI chrome at 4.5:1+.
- **Heading hierarchy** — one `<h1>` per page; no skipped levels.
- **Keyboard navigation** — all interactive elements reachable via Tab; no `tabindex` values above 0.
- **ARIA** — only used where semantic HTML cannot express the relationship (e.g. `aria-label` on icon-only buttons).

Lighthouse Accessibility scores enforce ≥95 on `main`.

## SEO outputs

Every page emits:

- **`<title>`** from `seoTitle` (falls back to `title`).
- **`<meta name="description">`** from `seoDescription` (falls back to `summary`).
- **OpenGraph + Twitter Card** meta tags.
- **Canonical link** — always the canonical path (never a level-segmented legacy URL).
- **JSON-LD structured data** — shape depends on page type:
  - `landing` / `page` → `WebPage`
  - `walkthrough` → `HowTo`
  - `article` → `TechArticle`
  - `glossary` → `DefinedTerm`
  - `table` → `WebPage` with `about` linking to a `Dataset`

`sitemap.xml` is regenerated on every build with every canonical URL and its `updatedAt`.

## Performance targets

Lighthouse CI runs in `.github/workflows/` with these thresholds:

| Category | Threshold |
|---|---|
| Performance | ≥ 85 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 90 |
| SEO | ≥ 95 |

The site meets these consistently because it is genuinely static HTML + small progressive-enhancement JS. The usual causes of performance regression are: oversized hero images (keep them under 200 KB, prefer SVG), blocking third-party scripts (don't add any), and oversized inline JSON-LD blocks on index pages (the build truncates description fields in list contexts to prevent this).

## Deployment

GitHub Pages serving `docs/` from `main`. The flow:

1. Edit Markdown content under `content/en/`.
2. Run `npm run build` locally.
3. Commit both the Markdown source and the regenerated `docs/` output.
4. Push to `main`.
5. GitHub Pages picks up the new `docs/` and serves it (typically within 30 seconds).

**Why commit the build output?** Determinism. The live site is always exactly what is in the repo at HEAD. No pipeline race conditions, no flakiness when the CI runtime changes, easy rollback via `git revert`.

**Lighthouse CI** runs as an advisory workflow — it posts scores on PRs but does not block merges. Hard performance regressions should be caught in local Lighthouse runs before pushing.

### Manual Lighthouse run

```bash
cd docs
npx local-web-server &
npx lhci autorun --config=../lighthouserc.json
```

## Adding content — worked examples

### Add a new glossary term

Create `content/en/glossary/<term-slug>.md`:

```markdown
---
term: BADI
acronym: Business Add-In
slug: badi
seoTitle: BADI — SAP Business Add-In
seoDescription: Business Add-Ins are SAP's enhancement framework for injecting custom logic into standard transactions.
relatedTerms:
  - abap
  - z-field
  - transport-request
updatedAt: 2026-04-24
---

A BADI (Business Add-In) is SAP's modern enhancement framework…
```

Run `npm run build`. The term appears in `/glossary/` and in the `relatedTerms` blocks of the terms you cross-linked.

### Add a new article

Create `content/en/articles/<article-slug>.md`:

```markdown
---
title: "OData V4 Batch Requests for SAP Extraction"
slug: odata-v4-batch
publishDate: 2026-04-24
readingTimeMinutes: 8
author: "SAP Extract Guide"
summary: "OData V4 batch requests reduce round-trip overhead…"
relatedWalkthroughs:
  - slug: acdoca
  - slug: vbak
seoTitle: "OData V4 Batch Requests for SAP — Extraction Guide"
seoDescription: "Reduce OData extraction round-trips with batch requests…"
updatedAt: 2026-04-24
---

Body content…
```

Build. The article appears in `/articles/` and the listed walkthroughs get a back-reference.

### Add a new featured table

1. **Reference page** — `content/en/tables/<slug>.md` with `module`, `primaryKeys`, `approximateRows`.
2. **Walkthrough** — `content/en/walkthroughs/<slug>.md` with `toolSteps`, `reconciliationChecks`, `nextSteps`. Cover all three trajectories (small-batch, partitioned-batch, real-time) as sections inside one document.
3. **Directory metadata** — `content/en/directory/tables/<slug>/{ecc,s4}/index.md` with the field lists that drive DDL generation.
4. **Update landing page** — add the table to `featuredTables` in `content/en/index.md` so it appears in the bento grid. Also update count stats (`Tables covered: N`, `Walkthroughs: N`) in `templates/landing.html`.

Build. The directory validator will fail loudly if the field lists are malformed.

### Change site UI text

Edit `strings/en.json`:

```json
{
  "nav": {
    "home": "Home",
    "tables": "SAP Tables",
    "walkthroughs": "Walkthroughs",
    "articles": "Articles",
    "glossary": "Glossary"
  },
  "footer": { … }
}
```

Build. All templates pull UI copy from this file.

### Change colors or typography

Edit the `:root` custom properties in `docs/assets/css/main.css`. Build.

## Troubleshooting

### Build fails with "Unknown page type"

**Cause:** The file's location does not match any rule in `getPageType()`, or a path separator mismatch on Windows.

**Fix:** In `build.js`, paths are normalized to forward slashes with `filePath.replaceAll('\\', '/')`. Verify this is still happening if you've touched the path resolution.

### "Template undefined" error on a new page type

**Cause:** Registered a new page type in `getPageType()` but forgot to load the template into `pageTemplates`.

**Fix:** Add the template load at the top of `build.js`:

```javascript
pageTemplates.newtype = fs.readFileSync(
  path.join(TEMPLATES_DIR, 'newtype.html'),
  'utf-8'
);
```

### Code inside a list item renders as a heading

**Cause:** Blank line inside a `<pre>` block nested inside an `<li>`. CommonMark treats a blank line as a type-6 HTML block terminator, so the rest of the code lands outside `<pre>` and gets parsed as Markdown — including `#` being interpreted as a heading.

**Fix:** Remove blank lines inside `<pre>` tags nested in list items. No blank lines between opening `<pre>`, the code content, and the closing `</pre>`. This has bitten us repeatedly; it's worth double-checking any walkthrough that embeds code in a numbered list.

### Site not updating on GitHub Pages after push

1. Check `Actions` tab — Pages deploys are usually under `pages-build-deployment`.
2. Confirm `Settings → Pages` shows: **Source: Deploy from a branch**, **Branch: `main`**, **Folder: `/docs`** (or the full nested path if the repo structure requires it).
3. Hard-refresh the browser (`Ctrl+Shift+R`) — GitHub Pages sets generous cache headers.
4. Confirm that `docs/` was actually regenerated and committed — the classic mistake is editing Markdown without running `npm run build` before pushing.

### Lighthouse SEO score drops below 95

Usual suspects:

- **Missing `seoDescription`** — every page should have one.
- **Auto-generated list page missing per-item summaries** — check that the source pages have `summary` fields; the list page pulls from there.
- **Canonical URL mismatch** — the canonical must match the URL actually served. Don't put legacy paths in `canonicalPath`.

### `npm ci` fails in GitHub Actions

Usually means `package-lock.json` is stale or was not committed. Fix:

```bash
npm install
git add package-lock.json
git commit -m "chore: refresh package-lock"
git push
```

---

**See also:** [Repo-level README](../README.md) for mission and content overview, [`content/en/roadmap.md`](./content/en/roadmap.md) for the public roadmap, and [`DEPLOYMENT.md`](./DEPLOYMENT.md) for additional deployment notes.
