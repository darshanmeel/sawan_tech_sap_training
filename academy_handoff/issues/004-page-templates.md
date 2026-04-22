# ISSUE-004: Page-Type Templates

**Phase:** Foundation
**Estimated Effort:** 4-5 hours
**Depends on:** ISSUE-002
**Skill files:** `SKILLS/stage1-static-html.md`, `SKILLS/seo-implementation.md`, `SKILLS/accessibility.md`

---

## Goal

Create the four page-type templates that plug into `base.html`.

---

## Templates to Create

### 1. `templates/landing.html`

The homepage layout. See `PROJECT_SPEC.md` section 1 for sections.

Sections:
- Hero with H1, subheadline, two CTAs
- Three value prop columns (can use an `{{#valueProps}}` loop or inline three copies)
- Featured ACDOCA walkthrough card
- Table library preview (`{{#featuredTables}}` loop)
- Roadmap teaser
- Email capture (already in base footer, may be duplicated in main content for visibility)

### 2. `templates/table-detail.html`

Sections per `PROJECT_SPEC.md` section 4:
- Header: table code (H1), name (H2 or subhead), module badge
- "What this table is" — renders `{{{body}}}` (markdown body of the table content file)
- "Key fields" table
- "Volume characteristics" — typicalRowCount + volumeClass badge
- "Extraction gotchas" list (from frontmatter array)
- "Walkthroughs available" — 3 cards (one per level in `availableLevels`)
- Breadcrumb JSON-LD

### 3. `templates/walkthrough.html`

The most complex template. Per `PROJECT_SPEC.md` section 5:

- Breadcrumb: Home → Tables → {Table Name} → {Level} Walkthrough
- H1: walkthrough title
- Meta row: estimated time, prerequisites
- License relevance callout
- Scenario intro (from markdown body, paragraph before the first `---STEPS---` marker, or just the full body depending on how you implement it)
- **Steps** — loop `{{#steps}}...{{/steps}}`. Each step:
  - Anchor target `id="step-{{id}}"`
  - H2 with step number + title
  - Explanation paragraph
  - `{{#sapTransaction}}` block rendering "Do this in SAP" box
  - `{{#codeBlock}}` block rendering syntax-highlighted code
  - "Verify" box with `{{verify}}`
  - `{{#whyItMatters}}` collapsible `<details>` element
  - Checkbox: `<input type="checkbox" id="cb-{{id}}" data-walkthrough-id="..." data-step-id="{{id}}">`
- "Troubleshooting" section (loop `{{#troubleshooting}}`)
- "What you've built" summary (from markdown body)
- "Next steps" list (loop `{{#nextSteps}}`)
- Download PDF button (JS-enhanced, inert without JS)

### 4. `templates/article.html`

Long-form article layout:
- Breadcrumb
- H1 (article title)
- Meta: publishDate, readingTimeMinutes, author
- Optional hero image (from `heroImage` frontmatter)
- Article body (rendered markdown, full width prose)
- "Related walkthroughs" section at end (from `relatedWalkthroughs` frontmatter)

### 5. `templates/glossary-term.html`

Simple:
- Breadcrumb: Home → Glossary → {Term}
- H1: `{{term}}: {{fullName}} in SAP`
- Short definition
- Extended body (rendered markdown)
- "Also see" related terms list
- "SAP documentation" external link

### 6. `templates/list.html` (shared)

For index pages (`/tables/`, `/glossary/`, `/articles/`, `/roadmap/`). Generic template that accepts a title, intro, and array of cards. Reuse for all three index pages.

---

## Acceptance Criteria

- [ ] All 6 templates exist
- [ ] Each extends/reuses `base.html` (or includes its markup)
- [ ] Every frontmatter field from `DATA_SCHEMA.md` is accessible in the right template
- [ ] JSON-LD markers present in each (to be filled by `build.js`)
- [ ] Accessibility: semantic landmarks, heading hierarchy, focus states
- [ ] Manually render each template with dummy data; HTML validates

---

## Open Questions

---

## Completion Notes
