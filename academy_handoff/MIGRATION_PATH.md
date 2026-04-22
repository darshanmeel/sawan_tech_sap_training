# MIGRATION_PATH.md — Stage 1 to Stage 2

This file ensures Stage 1 decisions make Stage 2 easy. Every Stage 1 choice is evaluated against: "Will this create rework when we move to Astro or Next.js?"

---

## Decision Table

| Decision | Stage 1 Choice | Why It's Migration-Safe |
|---|---|---|
| Content format | Markdown with YAML frontmatter | Works identically in Astro Content Collections AND Next.js MDX |
| URL structure | `/tables/vbak/`, `/walkthrough/expert/acdoca/` | Both frameworks produce these URLs natively |
| i18n structure | `content/en/tables/vbak.md` | Astro i18n and next-intl both use locale-prefixed folders |
| Strings file | `strings/en.json` | Universal — same JSON works for both frameworks |
| Stylesheets | Plain CSS with custom properties | Framework-agnostic |
| JavaScript | Vanilla JS, ES modules | Works without modification in either framework |
| Images | `assets/images/` with descriptive names | Both frameworks handle static assets the same way |
| Structured data | JSON-LD in each page | Both frameworks output this the same way |
| Sitemap | Hand-written XML at Stage 1 | Replaced by framework plugin at Stage 2 |
| Analytics | Plausible / Simple Analytics | Works identically regardless of framework |

---

## Stage 1 Authoring Workflow

1. Author writes a markdown file in `content/en/...`
2. Content is rendered into an HTML template from `templates/`
3. Output HTML goes into `docs/...`
4. Git push → GitHub Pages serves `docs/`

Rendering is either:
- **Manual copy-paste** (acceptable for first few pages)
- **A tiny Node script** (`build.js`) that reads markdown, applies a template, writes HTML

Example `build.js` (reference — actual implementation in ISSUE-003):

```js
// Reads content/en/**/*.md
// Applies appropriate template from templates/
// Writes to docs/
```

---

## Stage 2 Migration Workflow

When it's time to move to Astro (or Next.js), the migration is:

1. `npm create astro@latest` in a new branch
2. Configure content collections (schema defined in `DATA_SCHEMA.md`)
3. Copy `content/en/` folder unchanged into `src/content/en/`
4. Port `templates/base.html` → `src/layouts/BaseLayout.astro` (straightforward)
5. Port `templates/walkthrough.html` → `src/layouts/WalkthroughLayout.astro`
6. Create dynamic routes `src/pages/tables/[slug].astro` etc.
7. Copy `assets/css/main.css` unchanged
8. Re-run Lighthouse to verify parity
9. Add German locale
10. Deploy

If structure is disciplined at Stage 1, this migration is a 2-3 day job, not a rewrite.

---

## Risks to Avoid

### Risk 1: URL drift

Any URL change at migration time costs SEO. If Stage 1 has `/tables/vbak.html` and Stage 2 has `/tables/vbak/`, you need redirects.

**Fix:** Stage 1 uses directory-style URLs from the start. Either:
- `docs/tables/vbak.html` served as `/tables/vbak.html` — AVOID
- `docs/tables/vbak/index.html` served as `/tables/vbak/` — CORRECT

### Risk 2: Content format divergence

If Stage 1 markdown has `title: foo` but Stage 2 schema expects `title: foo (required, max 60 chars)`, migration fails validation.

**Fix:** `DATA_SCHEMA.md` defines the exact frontmatter contract for both stages. Stage 1 content validates against it manually or via a script.

### Risk 3: Hand-authored HTML in content files

If a Stage 1 HTML page has inline `<script>` or complex DOM, moving it to Astro/Next means extracting that logic into components.

**Fix:** All HTML is in templates, not in content. Markdown content never contains raw HTML beyond basic elements (code blocks, links, images). No `<script>` tags in content.

### Risk 4: Forgotten structured data

Stage 1 hand-adds JSON-LD. If you migrate and forget, SEO degrades.

**Fix:** Structured data is generated from frontmatter — in Stage 1 via templates, in Stage 2 via component logic. Either way, the data source is the frontmatter.

### Risk 5: i18n-unsafe strings

If Stage 1 has "Home" hardcoded in a template instead of `{{strings.nav.home}}`, German launch means finding every template file and editing.

**Fix:** Every user-facing string lives in `strings/en.json`. Templates reference `{{strings.key.path}}`. Stage 2 migrates this to `en.json` in the framework's i18n system.

---

## The Frontmatter Contract

The frontmatter schema in `DATA_SCHEMA.md` is the single most important migration artifact. It's the contract between Stage 1 and Stage 2.

If Stage 2 needs a new field, add it to Stage 1 content first (even if unused), then the migration is purely mechanical.

---

## When to Migrate

Migrate to Stage 2 when any of these is true:

- **500+ monthly organic visits** — you have traction worth protecting; framework lets you iterate faster
- **German launch is 8 weeks away** — framework i18n is meaningfully easier than hand-duplicating HTML
- **Studio product integration needed** — Studio is likely a framework-based app; sharing a codebase with Academy simplifies auth
- **Build times exceed 5 minutes** — unlikely at Stage 1 scale, but a forcing function

Do NOT migrate earlier than these signals. Premature framework adoption is a distraction.

---

## Stage 2 Framework Decision

Deferred explicitly until Stage 1 signals are in hand. Factors at decision time:

**Choose Astro if:**
- Content is 80%+ of the site (likely true)
- No real-time interactivity needed (also likely)
- SEO remains the priority
- Team prefers progressive enhancement over SPA

**Choose Next.js if:**
- Stage 2 adds authenticated dashboards
- Studio product shares a codebase with Academy
- Team prefers React across all surfaces
- Advanced ISR / server components needed for scale

As of Stage 1 planning, Astro is the stronger default — but the decision is made with data, not assumptions.
