# ISSUE-002: Base Template and Main Stylesheet

**Phase:** Foundation
**Estimated Effort:** 3-4 hours
**Depends on:** ISSUE-001
**Skill files:** `SKILLS/stage1-static-html.md`, `SKILLS/seo-implementation.md`, `SKILLS/accessibility.md`, `SKILLS/migration-readiness.md`

---

## Goal

Create `templates/base.html` — the shell used by every page — and `docs/assets/css/main.css` — the complete stylesheet.

---

## Part A: base.html

Location: `templates/base.html`

Must include:

1. HTML5 doctype, `<html lang="en">`
2. Complete `<head>` per `SKILLS/seo-implementation.md`:
   - Meta charset + viewport
   - `{{seoTitle}}`, `{{seoDescription}}`
   - Canonical URL
   - All Open Graph tags
   - All Twitter Card tags
   - JSON-LD placeholder: `<script type="application/ld+json">{{{jsonLd}}}</script>`
   - Stylesheet link: `/assets/css/main.css`
   - Favicon link
   - Plausible snippet commented out (human enables later)
3. `<body>`:
   - Skip link
   - `<header>` with site logo/name + nav (renders `{{strings.nav.*}}`)
   - `<main id="main">{{{content}}}</main>`
   - `<footer>` with:
     - Link cluster (About, Roadmap, Glossary, Articles, GitHub placeholder)
     - Email capture form (Buttondown embed, username as `{{buttondownUsername}}`)
     - Trademark disclaimer from `strings.footer.disclaimer`
     - Copyright with current year

---

## Part B: main.css

Location: `docs/assets/css/main.css`

Organize the file into commented sections in this order:

1. **Design tokens** — CSS custom properties (colors, spacing, typography from `PROJECT_SPEC.md`)
2. **Reset** — minimal box-sizing reset, margin/padding zero on lists
3. **Base elements** — body, headings, paragraphs, links, lists, code, pre, blockquote
4. **Layout utilities** — `.container` (max-width wrapper), `.stack` (vertical rhythm), `.cluster` (horizontal wrap)
5. **Components** — `.skip-link`, `.site-header`, `.site-nav`, `.site-footer`, `.card`, `.btn`, `.btn-primary`, `.btn-secondary`, `.breadcrumb`, `.callout` (info/warning/danger variants), `.step` (walkthrough step), `.verify-box`, `.glossary-link`, `.email-form`
6. **Pages** — landing-specific, walkthrough-specific, article-specific overrides
7. **Utilities** — `.sr-only`, `.external-icon`, `.mt-*`, `.py-*` (sparingly — prefer component classes)
8. **Media queries** — mobile-first, breakpoints at 640px and 1024px

---

## Acceptance Criteria

- [ ] `base.html` exists with all required sections
- [ ] Every template marker (`{{...}}`) references a field from `DATA_SCHEMA.md` or `strings/en.json`
- [ ] `main.css` organized into the sections above
- [ ] CSS uses custom properties for all colors, spacing, typography
- [ ] Mobile-first responsive with 640px and 1024px breakpoints
- [ ] Focus styles use `:focus-visible`
- [ ] `.sr-only` utility exists
- [ ] No external font loads
- [ ] No CSS framework imports
- [ ] Test: render the template against dummy data and verify HTML is valid

---

## Open Questions

---

## Completion Notes
