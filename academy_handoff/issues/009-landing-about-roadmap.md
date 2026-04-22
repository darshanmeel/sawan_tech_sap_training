# ISSUE-009: Landing, About, Start, Roadmap Pages

**Phase:** Core Pages
**Estimated Effort:** 4-6 hours
**Depends on:** ISSUE-002, ISSUE-004, ISSUE-005
**Skill files:** `SKILLS/content-writing.md`, `SKILLS/seo-implementation.md`, `SKILLS/accessibility.md`

---

## Goal

Build the four non-content-driven pages using the templates.

---

## Pages

### Landing (`docs/index.html`)

Source: not a markdown file — either hand-author the HTML using `templates/landing.html`, or create `content/en/landing.md` with frontmatter that `build.js` knows to render via the landing template.

Content per `PROJECT_SPEC.md` section 1. Copy from `SKILLS/content-writing.md` "Landing Page Copy".

SEO:
- Title: "Learn SAP S/4HANA Data Extraction — Cited from SAP Docs"
- Description: 150-160 chars, emphasizes free + SAP-documented + 5 tables

### Start (`docs/start/index.html`)

Short explanatory page per `PROJECT_SPEC.md` section 2. Three path links.

### Roadmap (`docs/roadmap/index.html`)

Per `PROJECT_SPEC.md` section 8 and `SKILLS/content-writing.md` "Roadmap Page". Each phase as a section, email capture for each phase.

### About (`docs/about/index.html`)

Per `PROJECT_SPEC.md` section 9 and `SKILLS/content-writing.md` "About Page". 400-600 words.

### 404 (`docs/404.html`)

Simple not-found page. GitHub Pages automatically serves `404.html` for missing routes. Link back to homepage and tables index.

---

## Acceptance Criteria

- [ ] All 4 pages render correctly
- [ ] Each has unique title and meta description
- [ ] Each includes breadcrumb JSON-LD (except landing)
- [ ] Copy matches `SKILLS/content-writing.md` specs
- [ ] Email capture works on landing and roadmap
- [ ] 404 page tested by visiting a nonexistent URL

---

## Open Questions

---

## Completion Notes
