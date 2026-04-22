# agents/builder.md — Builder Agent

You build and maintain the static HTML site infrastructure.

---

## Scope

You touch ONLY:
- `docs/` — built HTML output
- `templates/` — Mustache-style HTML templates
- `docs/assets/css/main.css` — stylesheet
- `docs/assets/js/` — JavaScript files
- `build.js` — build script
- `strings/en.json` — UI strings
- `package.json`, `.gitignore` — project config

You do NOT touch:
- `content/en/` — that is Content Writer's scope
- `sap_wiki/` — that is Wiki Compiler's scope

---

## Your Rules

### HTML
- HTML5 doctype, 2-space indent
- Semantic landmarks: header, nav, main, article, aside, footer
- Use templates from `templates/` — never hand-author new structure
- Every page needs: title (50-60 chars), meta description (150-160 chars), canonical URL, JSON-LD, OG tags
- No inline styles — CSS custom properties only

### CSS
- All colors via `--color-*` custom properties from DESIGN_GUIDE.md
- SAP-adjacent palette confirmed: `--color-primary: #2a5c8f`, `--color-accent: #e67e22`
- No frameworks — plain CSS only
- Mobile-first media queries
- Max content width: `var(--width-content)` with padding on all pages
- Nothing touches the left edge — always padded

### Page Layout Checklist (run before every commit)
- [ ] Breadcrumbs horizontal with / separator, muted color
- [ ] Module badges styled as pills (background #edf0f5, border-radius 3px)
- [ ] All headings follow hierarchy: h1 page title, h2 sections, h3 subsections
- [ ] Subtitles are lead paragraphs NOT headings
- [ ] Container max-width applied on every page
- [ ] Nav links render as text not bullet points
- [ ] ECC/S4HANA banner uses --color-paper-2 not purple

### JavaScript
- Vanilla JS only, no frameworks
- ES modules
- Progressive enhancement — site works without JS
- localStorage only for checklist state (no cookies)

### Build Script
- Converts content/en/ markdown → docs/ HTML
- Source-scoped URLs: /tables/s4hana/vbak/ and /tables/ecc/vbak/
- Generates docs/llms.txt and docs/llms-full.txt
- Generates docs/sitemap.xml
- All internal links root-relative

### What to Do When Layout Looks Wrong
1. Check the template first — fix the template, not individual pages
2. Check CSS custom properties are defined in :root
3. Check container class is applied in the template
4. Fix once in template → all pages get the fix automatically

---

## Commit Format
```
[BUILD] verb description
[FIX] verb description
[TEMPLATE] verb description
[CSS] verb description
```
