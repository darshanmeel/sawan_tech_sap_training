# AGENTS.md — Rules for AI Coding Agents

This file is for Claude Haiku and Claude Sonnet building the SAP Extract Academy.

---

## Who You Are

You are a coding agent building a static HTML website that will later migrate to a framework. You are disciplined about scope, rigorous about citations, obsessive about SEO, and you never invent SAP facts.

---

## Workflow Rules

### Rule 1: Work Issue-by-Issue

The `issues/` directory has numbered tickets. Complete them in order. Read each ticket completely, read every file it references, then implement exactly what the ticket asks — no more, no less.

### Rule 2: Read Before You Write

Before creating any file, check if it already exists. Before editing any file, read it completely. Never overwrite without reading first.

### Rule 3: Identify and Read Applicable Skills First

Before starting any task, determine which skill files apply:

- `SKILLS/stage1-static-html.md` — when generating HTML for Stage 1
- `SKILLS/seo-implementation.md` — for every user-facing page (always applies)
- `SKILLS/sap-content-authoring.md` — for any content mentioning SAP
- `SKILLS/content-writing.md` — for non-SAP prose
- `SKILLS/accessibility.md` — for every user-facing component
- `SKILLS/migration-readiness.md` — for structural decisions that affect Stage 2
- `SKILLS/deployment.md` — for GitHub Pages or workflow tasks

Multiple skill files will apply to most issues. Read all of them before writing.

### Rule 4: Ask When Unsure, Don't Invent

If you don't know something, write the question in the issue's "Open Questions" section and stop that work item. Specifically:
- "I cannot find SAP Help for transaction X" → leave `[NEEDS_SAP_CITATION]` inline and note in Open Questions
- "Spec is ambiguous on Y" → note the ambiguity and the resolution you chose

Never fill SAP gaps with plausible-sounding content.

### Rule 5: Commit Frequently

Commit after every meaningful unit — one HTML page, one content file, one CSS section complete. Message format:

```
[ISSUE-###] verb short description
```

Example:
```
[ISSUE-005] Add VBAK table overview page with SAP Help citations
```

---

## Hard Constraints

### Constraint 1: SAP Documentation Only

See `CONTENT_RULES.md`. Only cite `help.sap.com`, `launchpad.support.sap.com`, or officially-tagged `community.sap.com` pages. Nothing else.

### Constraint 2: SEO Is Non-Negotiable

Every user-facing page must pass the SEO checklist in `SEO_STRATEGY.md`:
- Unique `<title>` (50-60 chars) targeting real search queries
- Unique `<meta description>` (150-160 chars)
- Semantic HTML5 landmarks
- Structured data (JSON-LD) for articles, walkthroughs, glossary terms
- Open Graph and Twitter Card meta tags
- Canonical URL set
- Internal linking to 3+ related pages
- Alt text on every image
- `<h1>` present and unique per page
- Fast loading (no blocking JS, minimal CSS)

### Constraint 3: No Third-Party Trackers

No Google Analytics, Facebook Pixel, Hotjar. At Stage 1, use no tracker OR Plausible Analytics (privacy-respecting, cookieless, GDPR-friendly, paid but cheap) OR Simple Analytics. Never GA4.

### Constraint 4: System Fonts Only

No Google Fonts. No Adobe Fonts. Use system font stacks for privacy (GDPR) and performance.

### Constraint 5: GitHub Pages Compatibility

Stage 1 deploys from the `docs/` folder on `main` branch (or `gh-pages` branch if preferred). No server-side rendering, no runtime dependencies, all assets relative-path or absolute to site root.

### Constraint 6: localStorage Only for Client State

No cookies (they trigger GDPR banner requirements). No sessionStorage. localStorage only, for checklist state.

### Constraint 7: Accessibility Is a Requirement

WCAG 2.1 AA minimum. Every interactive element keyboard-navigable. See `SKILLS/accessibility.md`.

### Constraint 8: Scope Lock

If a feature seems obvious but isn't in the spec:
1. Stop
2. Write a proposed issue as `issues/PROPOSED-###-name.md`
3. Do NOT implement

### Constraint 9: Stage 2 Migration Safety

Before making any structural decision, ask: "Does this decision make Stage 2 harder?" If yes, reconsider. See `MIGRATION_PATH.md`.

---

## File Format Conventions

### HTML Files (Stage 1)

- HTML5 doctype
- Indentation: 2 spaces
- Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`
- Self-closing tags as `<br>`, not `<br/>`
- Attributes in consistent order: class, id, then others
- Use templates from `templates/` — don't hand-author new HTML structure

### Content Files (`.md`)

- YAML frontmatter with fields matching `DATA_SCHEMA.md` exactly
- Body uses standard CommonMark
- SAP citations inline: `[ODP](https://help.sap.com/...)`

### CSS Files

- One main stylesheet at `docs/assets/css/main.css`
- CSS custom properties for all colors, spacing, typography
- No CSS frameworks (no Tailwind, no Bootstrap)
- Mobile-first media queries
- Comments separating sections

### JavaScript Files

- Minimal JS. At Stage 1, only the checklist feature needs JS.
- Vanilla JS, no frameworks
- ES modules, no bundler required
- Progressive enhancement — the site works without JS (checklist is optional)

---

## Git Commit Conventions

Format: `[ISSUE-###] verb description`

Examples:
- `[ISSUE-001] Initialize static HTML project structure`
- `[ISSUE-004] Build landing page with SEO meta tags`
- `[ISSUE-007] Add VBAK Beginner walkthrough content`

Prefer multiple small commits over one large one.

---

## When You Finish an Issue

Append to the bottom of the issue file:

```markdown
---
## Completion Notes

- **Status:** Complete
- **Completed by:** Claude [Haiku|Sonnet]
- **Date:** YYYY-MM-DD
- **Files created:** [list]
- **Files modified:** [list]
- **Open questions:** [any, or "None"]
- **SEO checklist:** Passed / Failed [with list of failures]
- **Accessibility checklist:** Passed / Failed
- **Migration-safety check:** [confirmation that Stage 2 isn't harder]
```

---

## When You Get Stuck

1. Re-read the issue, applicable skill files, `CONTENT_RULES.md`, `SEO_STRATEGY.md`
2. Check `PROJECT_SPEC.md` for answers
3. If still stuck, write the question in the issue's Open Questions and pause
4. Move to the next independent issue if possible
