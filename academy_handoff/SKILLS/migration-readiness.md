# SKILL: Migration Readiness

Use this skill when making any structural decision. Every Stage 1 decision must answer: "Does this make Stage 2 migration harder?"

See `MIGRATION_PATH.md` for the full strategy.

---

## Key Rules

### Rule 1: Trailing-Slash URLs

Wrong: `docs/tables/vbak.html` → `/tables/vbak.html`
Right: `docs/tables/vbak/index.html` → `/tables/vbak/`

Matches what Astro/Next produce natively. Avoids redirects.

### Rule 2: Root-Relative Links Only

Wrong: `<a href="../tables/vbak/">` or `<a href="tables/vbak/">`
Right: `<a href="/tables/vbak/">`

Root-relative works at Stage 1 and Stage 2. Relative paths break when base path changes.

### Rule 3: Frontmatter Is the Contract

Every content file's frontmatter matches `DATA_SCHEMA.md` exactly. Stage 2 validates with Zod (Astro) or TypeScript (Next.js MDX).

If a field is missing from schema but you think you need it, update the schema first, then use it.

### Rule 4: No HTML Inside Markdown Body

Keep markdown clean. No `<script>` or complex HTML in body content. Complex structure goes in templates (Stage 1) or components (Stage 2).

Exception: inline SAP citation links as markdown `[text](url)` or as simple HTML `<a href="url">text</a>` — both convert cleanly.

### Rule 5: Strings Centralized

Every UI string lives in `strings/en.json`. Templates reference `{{strings.key}}`. This enables:
- Consistent wording across pages
- German translation (Stage 2) by copying to `strings/de.json`
- Typo fixes in one place

### Rule 6: No Inline Styles

Use `class` attributes and CSS. No `style="..."` in HTML. Framework migration doesn't break.

### Rule 7: JavaScript Is Progressive Enhancement

The site works without JS. JS adds the checklist, PDF download, and email form enhancement. If JS fails, users can still read content and submit the email form (via native form submit).

At Stage 2, the checklist becomes a React component but the underlying HTML shouldn't need restructuring.

---

## Decision Examples

### Decision: "Should I add a search feature?"

Framework question to ask: "Is search in scope for Stage 1?"

Answer: No — search is out of scope per `PROJECT_SPEC.md`. Do not add. If proposed for Stage 2, open `PROPOSED-###-search.md`.

### Decision: "I want to add a fancy progress bar animation"

Framework question: "Does this require JavaScript beyond the checklist?"

Answer: Only use CSS transitions/animations. Don't add a library. Don't add a framework-specific dependency (no GSAP at Stage 1).

### Decision: "Table detail pages have repetitive structure — should I extract a component?"

Framework question: "Can I represent this as a template partial at Stage 1 that cleanly becomes an Astro component at Stage 2?"

Answer: Yes. Use template includes (or the `build.js` concept of partials). The mapping from partials to Astro components is mechanical at migration time.

### Decision: "I need to load a list of all tables for the tables index page"

Framework question: "How do I keep data fetching consistent between Stage 1 and Stage 2?"

Stage 1: `build.js` reads all files in `content/en/tables/` and passes an array to the template.
Stage 2: `getCollection('tables')` from Astro content collections.

Same data model, different fetch mechanism. Content files don't change.

### Decision: "Should I use IDs or slugs for URLs?"

Framework question: "Which is more SEO-friendly and stable?"

Slugs (e.g. `vbak`, `expert`, `why-acdoca-breaks-sap`). Slugs are in frontmatter (`slug:` field), human-readable, SEO-valuable, and stable across migrations.

---

## Migration Preview Checklist

Before committing any structural change, mentally simulate the Stage 2 migration:

- [ ] Does the URL this produces match what Astro's `getStaticPaths` or Next.js dynamic routes would produce?
- [ ] Is the content fetchable via Astro Content Collections / Next.js MDX without schema changes?
- [ ] Does this template partial map to a single Astro component?
- [ ] Does the CSS use custom properties (not SCSS variables or styled-components)?
- [ ] Is the JavaScript vanilla (not bundler-dependent)?
- [ ] Are all strings in `strings/en.json`?
- [ ] Are all images root-relative and framework-agnostic format (WebP or AVIF)?

If any answer is "no," adjust before committing.
