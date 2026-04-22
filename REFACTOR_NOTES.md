# REFACTOR_NOTES.md

Orientation pass for `refactor: bug-fix, content rewrite, picker, Bento theme (v2)`.
Every worker reads this before touching code. **No fixes in this pass — findings only.**

Working copy of the site lives in `sap-extract-academy/` (not at repo root).

---

## 1 · Stack

| Item | Value |
|---|---|
| Generator | Custom Node.js build script (`sap-extract-academy/build.js`) |
| Templating | Mustache (`mustache@4.2.0`) |
| Markdown | `marked@18.0.2` |
| Frontmatter | `gray-matter@4.0.3` |
| CSS approach | Plain CSS, single bundle at `docs/assets/css/main.css` (1610 lines) with `:root` tokens |
| Content source | Markdown with YAML frontmatter under `content/en/` |
| Build command | `npm run build` → `node build.js` (run from `sap-extract-academy/`) |
| Output dir | `sap-extract-academy/docs/` (deployed to GitHub Pages) |
| Node engine | ESM (`"type": "module"` in package.json) |
| Dev dependencies | `@lhci/cli`, `lighthouse`, `local-web-server` |

No Astro / Next / Eleventy. No bundler, no Tailwind, no PostCSS. CSS is hand-written and linked from `templates/base.html`.

---

## 2 · Content model — path → template → schema

All content lives under `sap-extract-academy/content/en/`. Templates are in
`sap-extract-academy/templates/`. `build.js` chooses the template via `getPageType()`.

| Source path | Template | Schema (frontmatter) | Notes |
|---|---|---|---|
| `content/en/index.md` | `landing.html` | `title`, `seoTitle`, `seoDescription`, hero + list fields | Home page |
| `content/en/about.md` | `page.html` | `title`, `seoTitle`, body markdown | Generic page |
| `content/en/roadmap.md` | `list.html` | `items[]` | Uses the generic list template |
| `content/en/tables/<slug>.md` | `table-detail.html` | `code`, `name`, `slug`, `module`, `businessDescription`, `volumeClass`, `typicalRowCount`, `primaryKey[]`, `keyFields[{name,description}]`, `releasedCdsView`, `cdsViewDocUrl`, `sapHelpUrl`, `extractionGotchas[{summary,sapNoteOrDocUrl}]`, `availableLevels[]`, SEO | 5 tables: acdoca, bkpf, lfa1, mara, vbak |
| `content/en/walkthroughs/<level>/<slug>.md` | `walkthrough.html` | `table`, `level`, `slug`, `title`, `summary`, `estimatedMinutes`, `prerequisites[]`, `licenseRelevance`, `destinations[]`, `extractors[]`, `steps[{id,title,explanation,sapTransaction,codeBlock,verify,whyItMatters}]`, `troubleshooting[]`, `nextSteps[]` | 3 levels × 5 tables = 15 walkthroughs. Folder is plural (`walkthroughs/`), output path is singular (`/walkthrough/<level>/<slug>/`) — translated in `build.js:75-77` |
| `content/en/articles/<slug>.md` | `article.html` | `title`, `slug`, `publishDate`, `readingTimeMinutes`, `author`, `summary`, `relatedWalkthroughs[{slug,level}]`, `heroImage`, `tags[]` | 3 articles |
| `content/en/glossary/<slug>.md` | `glossary-term.html` | `term`, `fullName`, `slug`, `shortDefinition`, `sapDocUrl` | 32 glossary terms |
| _auto-generated_ | `tables-index.html` | `items[]`, `moduleChips[]` | Built from tables frontmatter in `generateIndexPages()` |
| _auto-generated_ | `list.html` (articles) | `items[{title,subtitle,description,url,label}]` | See bug B5 below — template uses `{{pageTitle}}` but build passes `title` |
| _auto-generated_ | `list.html` (glossary) | same | Same `pageTitle`/`title` mismatch |

`build.js` pipeline per page (`buildPage`, lines 211-298):
1. `matter(content)` splits frontmatter + body
2. `marked(body)` renders body markdown → HTML
3. `getPageType()` picks template
4. `Mustache.render(pageTemplate, mergedData)` → page content
5. `Mustache.render(baseTemplate, {...mergedData, content})` → full HTML
6. Write to `docs/<path>/index.html`

**Important:** `steps[].explanation` and `steps[].whyItMatters` are rendered via
`{{{explanation}}}` (raw HTML) but are **never piped through marked**. They are
rendered as-is. This matters for B6 and for Worker B (see § 4).

---

## 3 · Known bugs — located in source, not yet fixed

### Summary: some bugs as briefed DO NOT reproduce in the current build

I verified by grepping the built HTML at `sap-extract-academy/docs/`. The 6× / 4× / 4× duplication claims (B1-B3) are **not present** in the current output — each section heading appears exactly once on the affected pages. Either the source was cleaned up between the brief being written and the orientation pass, or the brief was based on a different build. The other bugs reproduce, some more severely than briefed.

| # | Reported symptom | Actual state | File + line |
|---|---|---|---|
| B1 | `## Key fields` renders 6× on tables/acdoca/ | **NOT REPRODUCING** — exactly one `<h2>Key fields</h2>` in `docs/tables/acdoca/index.html:100`. Template `table-detail.html:30-52` is correctly gated by `{{#hasKeyFields}}` and inner `{{#keyFields}}` only iterates rows. No source bug found. | `templates/table-detail.html:30-52` (checked, clean) |
| B2 | `## Extraction gotchas` renders 4× | **NOT REPRODUCING** — one `<h2>` at `docs/tables/acdoca/index.html:163`. Template `table-detail.html:74-91` correctly gated. | `templates/table-detail.html:74-91` (checked, clean) |
| B3 | `## Before you start` renders 4× on walkthrough | **NOT REPRODUCING** — one `<h2>` at `docs/walkthrough/beginner/acdoca/index.html:119`. Template `walkthrough.html:56-65` correctly gated. | `templates/walkthrough.html:56-65` (checked, clean) |
| B4 | `Related walkthroughs` shows `[object Object]` | **CONFIRMED and worse than briefed** — outputs **9 broken links** on `docs/articles/acdoca-complete-walkthrough/index.html:438-478`. Root cause: nested `{{#relatedWalkthroughs}}` around `<ul>` AND inside `<li>`. Outer iterates 3 items; inner re-enters the array (Mustache name lookup walks the stack); result is 3×3 = 9 links × `[object Object]` because items are `{slug, level}` objects and template uses `{{.}}`. Fix: remove outer section tag; inner loop should render `{{level}}/{{slug}}`. | `templates/article.html:45-56` |
| B5 | `articles/` index shows raw `__title__` markdown | **NOT REPRODUCING AS DESCRIBED** — no `__` markdown leaks (article titles in source are plain text). BUT a real bug: `docs/articles/index.html:70` renders `<h1></h1>` (empty). Cause: `list.html:4` uses `{{pageTitle}}` but `build.js:454-467` passes `title` (mismatch key). Also `docs/articles/index.html:79` renders the date as a raw JS Date string (`Wed Apr 22 2026 02:00:00 GMT+0200 (Central European Summer Time)`). Cause: `build.js:441` does string-concat on `a.publishDate`, which gray-matter/YAML parses into a `Date` object. Same bug affects glossary index. | `templates/list.html:4,22`, `build.js:441,454-467` |
| B6 | Code blocks render as inline prose instead of `<pre><code>` with highlighting | **PARTIALLY REPRODUCING** — Code blocks DO render as `<pre><code class="language-*">…</code></pre>` (verified in both walkthroughs and articles). However there is **no syntax highlighter installed** (no Shiki, no Prism, no highlight.js). The `language-*` class is present but there is no CSS / script converting it to colored tokens. Walkthrough step code blocks come from structured YAML (`codeBlock.content`) so they will always render — but `steps[].explanation` is never passed through marked, so fenced code blocks inside prose explanations would NOT render as `<pre><code>`. | `build.js:211-298` (no marked on step strings); no highlighter configured anywhere |

**Likely misread in the brief:** B1-B3 may have been in a prior build where
`{{#hasKeyFields}}` was nested inside another loop, producing N copies of the
whole block. The current templates use the hasX gate + inner loop pattern
correctly. Worker A still needs to (a) add tests that would catch these if they
reappear, (b) fix B4/B5/B6 as described in revised root causes above.

### Additional bugs found during orientation (not in brief)

| # | Symptom | File + line |
|---|---|---|
| X1 | Articles index `<h1>` is empty | `templates/list.html:4` uses `{{pageTitle}}`; build passes `title`. |
| X2 | Article/glossary list item subtitles render raw JS `Date` toString when `publishDate` is a YAML date | `build.js:441` (`${a.publishDate}`) |
| X3 | `canonicalPath` in `<link rel="canonical">` is HTML-entity-escaped (`&#x2F;` in `/`) | Mustache `{{canonicalPath}}` should be `{{{canonicalPath}}}` in `templates/base.html:9,14`. Affects SEO. |
| X4 | `buttondownUsername` is hardcoded to `'example'` | `build.js:251`. Either remove the form or wire a real username. Worker C owns footer cleanup — decide there. |
| X5 | Breadcrumbs use `https://academy.example.com/` — placeholder domain | `build.js:95-115`. Real deploy is `darshanmeel.github.io/sawan_tech_sap_training/`. Worker C owns. |
| X6 | `<script type="application/ld+json"></script>` on `articles/index.html:24` is empty because `buildIndexPage` doesn't call `buildJsonLd`. | `build.js:450-489` |
| X7 | `steps[].whyItMatters` uses `{{{.}}}` inside `{{#whyItMatters}}` — but `whyItMatters` is a string, not an object. `{{{.}}}` renders the current scope as raw, which works for a string. OK — documenting for audit only. | `templates/walkthrough.html:136` |
| X8 | `build.js:198-205` defines `roadmap` JSON-LD but `getPageType()` only returns `'roadmap'` for files under `/roadmap/` dir (line 60 is missing the case — only the `roadmap.md` → `list` branch hits). Minor — Worker A if time allows. | `build.js:50-62,198-205` |

---

## 4 · Content rewrite notes for Worker B

Worker B must cut Azure/ADF/Python tutorials from walkthroughs and articles.
Files to touch (markdown source only):

**Articles (heavy prose cuts):**
- `content/en/articles/acdoca-complete-walkthrough.md` — contains 60+ lines of pyrfc Python scripts, ThreadPoolExecutor patterns, Snowflake Kafka Connector JSON, LTRC/LTRS step-by-step. Per brief § 2, move these to a collapsible "Reference starter" paragraph and link to SAP Help + vendor docs. Keep the license and partitioning discussion.
- `content/en/articles/sap-runtime-license-trap.md` — verify this is the candidate for promotion to the dedicated `/articles/runtime-vs-full-use/` page. It may already serve that purpose; Worker B should rename the slug or cross-link from every walkthrough.
- `content/en/articles/why-acdoca-breaks-sap.md` — keep mostly. Strip any tool-specific code.

**Walkthroughs (structural rewrite):**
All 15 files under `content/en/walkthroughs/<level>/<slug>.md`. Each currently has:
- YAML `steps[]` with per-step `codeBlock` containing ADF pipeline JSON, ADLS folder layouts, etc.
- Tool-specific prose throughout

Per brief § 2, each walkthrough needs:
1. Picker (method/tool/sink) at top — new component
2. SAP-side preflight (identical across all 15 — store as shared partial or as a shared include)
3. Table-specific preflight (pulled from table frontmatter — see `tables/<slug>.md`)
4. Tool hand-off (conditional on picker state — one collapsible starter block max)
5. Verification section (SAP-side: ODQMON, SE16N row-count reconcile)

**Shared data that Worker B needs (build tooling may need extending):**
- A new `_partials/sap-preflight.md` or an include mechanism in `build.js`. Mustache has partials (`{{> name}}`) but `build.js` doesn't register any — **Worker B must coordinate with Worker A** to add Mustache partial registration, OR bake the preflight into the template itself with a YAML toggle. Recommend: add partial registration in `build.js` to avoid duplicating preflight prose 15 times.
- The `<LicenseCheck />` component described in the brief needs an implementation. In this stack that maps to a Mustache partial keyed on `{{method}}` (odp | slt | rfc | ref).

---

## 5 · Theme token inventory — what to replace in Worker E

Current `docs/assets/css/main.css`:

**Fonts (current):**
- `Inter` (400, 500, 600, 700) — loaded via Google Fonts at line 1
- `JetBrains Mono` (400, 500) — same import
- `--font-display: var(--font-sans)` — no actual display serif, just aliased to sans. Replace with DM Serif Display.

**Palette tokens currently in `:root` (lines 6-22):**

| Token | Current | Bento target | Delta |
|---|---|---|---|
| `--color-primary` | `#2563eb` (blue) | `--color-accent: #1a4d3a` (forest green) | Rename + new value |
| `--color-primary-hover` | `#1d4ed8` | (derived) | Rename |
| `--color-primary-soft` | `#3b82f6` | (derived) | Rename |
| `--color-ink` | `#0d1117` | `#14120f` | Keep name, new value |
| `--color-paper` | `#ffffff` | `--color-bg: #f6f4ef`, `--color-bg-2: #ffffff` | Split + rename |
| `--color-paper-2` | `#fafbfc` | `--color-bg-3: #efebe2` | Rename + new value |
| `--color-rule` | `#e1e4e8` | `rgba(20,18,15,.08)` | New value |
| `--color-border` | `#e1e4e8` | (aliased from rule) | Keep |
| `--color-accent` | `#5b21b6` (purple) | `--color-accent-2: #d97706` (amber) | Rename + new value |
| `--color-accent-soft` | `#7c3aed` | `--color-accent-soft: #e7f0e6` (pale green) | New value |
| `--color-muted` | `#57606a` | `--color-ink-soft: #6b6659` | Rename + new value |
| `--color-link` | `#2563eb` | `var(--color-accent)` (forest green) | Alias |
| `--color-code-bg` | `#f6f8fa` | `--code-bg: #14120f` | Invert (light→dark code block) |
| `--color-code-border` | `#d0d7de` | removed | Delete |

**Hex colors used outside `:root` (must be migrated to tokens):**

`main.css` lines where raw hex appears — Worker E should grep this list back to zero after refactor:
- `#12396a` (line 173)
- `#e8e8e8` (line 207)
- `#ffffff` (line 389)
- `#edf0f5` (line 639)
- `#e5e7eb` (line 1074 — already behind a `var()` fallback)
- `#6b7280`, `#111827`, `#9ca3af` (lines 1082, 1100, 1106, 1111 — fallback values)
- `#8b949e`, `#f4f5f8`, `#d0d7de` (lines 1126-1129 — inside a non-`prefers-color-scheme` block that looks like an alternate-surface context; verify)
- `#dbeafe`, `#1e40af` (lines 1533-1534)

**No `prefers-color-scheme: dark` block exists** — confirmed via grep. Worker E does not need to remove dark-mode branches. Do NOT add any.

**Spacing:** current tokens use `--size-spacing-{xs,sm,md,lg,xl,2xl}` in rem. Bento brief expects `--space-{1..7}` in px. Worker E picks the naming; keep one scheme only and update all consumers.

**Reference frame:** `docs/design/reference.html` exists (278 lines). The Bento frame is scoped to a `.bento` selector. Worker E should lift those tokens to `:root` instead of wrapping the whole site in `.bento`.

---

## 6 · Link audit

Full URL list with source file + line is in `link-audit.txt` at repo root.
All `help.sap.com` URLs fall into three families:

1. **`https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/*.html`** — ~50 URLs. The GUID `0f69a8fb28ac48d89de2381c2f02a1e9` does not appear to be a real SAP Help product page GUID. Expected to 404 in bulk.
2. **`https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/*.html`** — ~25 URLs. Same pattern with a different placeholder GUID.
3. **`https://help.sap.com/docs/SAP_NETWEAVER_750/wm_netweaver_740_ehp1_html/*.html`** — a few URLs with sub-GUIDs that also look synthetic (e.g. `4e4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b`).

**Worker C mandate:** fetch each URL from `link-audit.txt`, mark OK / 404 / redirect; replace 404s with the nearest working SAP Help equivalent or strip the hyperlink. Add `lychee` to CI per brief § 3.

---

## 7 · Shared contracts between workers

**Query-param contract for picker + decide page** (Worker B + Worker D):

```
?method=<odp|slt|rfc|ref>
&tool=<adf|databricks|fivetran|airbyte|custom>
&sink=<adls|s3|gcs|snowflake|bigquery|fabric|other>
```

All three params are optional. Missing = picker opens with defaults. Worker B's
walkthrough picker reads these on load and updates on selection (via
`history.replaceState`). Worker D's decide page writes them into the final CTA
URL. Neither ships without the other's contract-consuming code.

**Mustache partials for shared content** (Worker A + Worker B):

Worker A needs to register Mustache partials in `build.js` before Worker B can
add `{{> sap-preflight }}` and `{{> license-check }}` to the walkthrough
template. Order: Worker A ships partial registration first → Worker B builds on
top.

**CSS class contract for picker** (Worker B + Worker E):

Worker B's picker renders as `.picker` with three fieldsets `.picker-axis`.
Worker E styles `.picker` and `.picker-axis label` (pill-shaped) within the
Bento token system. Class names are the contract — both lock on this string.

---

## 8 · Repo layout recap (where things live)

```
sawan_tech_sap_training/              ← repo root
├── REFACTOR_NOTES.md                 ← THIS FILE
├── link-audit.txt                    ← full URL list
├── AGENTS.md                         ← existing agent routing (pre-refactor)
├── academy_handoff/                  ← spec docs (read-only)
├── docs/design/reference.html        ← Bento reference (read-only)
├── sap_wiki/                         ← private SAP knowledge base
└── sap-extract-academy/              ← the site
    ├── build.js                      ← Worker A owns
    ├── templates/*.html              ← Worker A + Worker E split
    ├── content/en/                   ← Worker B owns
    ├── docs/                         ← built output, do not edit directly
    ├── docs/assets/css/main.css      ← Worker E owns
    └── docs/assets/js/               ← Worker B + D (picker + decide tree)
```

---

## 9 · Follow-ups (out of scope for v2, park here)

- Redirect `academy.example.com` in `build.js` to the real deployed origin or read from env (`SITE_ORIGIN`).
- Empty JSON-LD on index pages (X6).
- Canonical-URL HTML-entity escaping (X3).
- Hardcoded `buttondownUsername = 'example'` (X4) — **v2 C3 note:** The subscribe form is now wrapped in `{{#buttondownUsername}}...{{/buttondownUsername}}` guard in `templates/base.html`. For the form to auto-hide in the built site, `build.js:251` must pass an empty string `''` (or falsy value) instead of `'example'` when no real Buttondown username is configured. As-is, `'example'` is truthy so the form still renders; this is intentional to allow the template guard to work. Worker A should update `build.js` to conditionally set this value based on env or config.
- Add a pre-commit or test that validates every step's `explanation` is run through marked (defend against B6 regression for prose code blocks).
