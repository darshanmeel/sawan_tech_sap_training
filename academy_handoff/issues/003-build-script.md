# ISSUE-003: Build Script (Optional but Recommended)

**Phase:** Foundation
**Estimated Effort:** 2-3 hours
**Depends on:** ISSUE-001, ISSUE-002
**Skill files:** `SKILLS/stage1-static-html.md`, `SKILLS/seo-implementation.md`, `SKILLS/migration-readiness.md`

---

## Goal

Create `build.js` that reads markdown content from `content/en/`, applies templates from `templates/`, and outputs HTML to `docs/`. Also generates `docs/sitemap.xml`.

---

## Why Optional

For the first 3-5 pages, manual template filling is acceptable. Once you hit 10+ pages, a build script saves significant time. Do this issue before ISSUE-005 so content authoring is fast.

If manually rendering instead: skip this issue and note it in Open Questions.

---

## Steps

1. Install dependencies:
   ```bash
   npm install gray-matter marked mustache
   ```
2. Create `build.js` with this structure:
   - Read `strings/en.json`
   - Walk `content/en/**/*.md`
   - For each file:
     - Parse frontmatter and body with `gray-matter`
     - Render body markdown with `marked`
     - Determine page type from path (tables, walkthroughs, articles, glossary, roadmap)
     - Pick the right template
     - Build the JSON-LD for the page type
     - Compute the output path (e.g. `content/en/tables/vbak.md` → `docs/tables/vbak/index.html`)
     - Render the template with Mustache, passing: frontmatter fields, rendered body, strings, jsonLd, canonicalPath
     - Write to output path
   - After all pages: generate `docs/sitemap.xml` from the list of output files
3. Add to `package.json`:
   ```json
   "scripts": {
     "build": "node build.js"
   }
   ```
4. Run `npm run build` and verify `docs/` populates correctly (after ISSUE-005 seeds content)

---

## Page Type Detection

```js
const pageType = (filePath) => {
  if (filePath.includes('/tables/')) return 'table';
  if (filePath.includes('/walkthroughs/')) return 'walkthrough';
  if (filePath.includes('/articles/')) return 'article';
  if (filePath.includes('/glossary/')) return 'glossary';
  if (filePath.includes('/roadmap/')) return 'roadmap';
  throw new Error(`Unknown page type for ${filePath}`);
};
```

---

## Output Path Mapping

```js
const outputPath = (inputPath) => {
  // content/en/tables/vbak.md → docs/tables/vbak/index.html
  // content/en/walkthroughs/expert/acdoca.md → docs/walkthrough/expert/acdoca/index.html
  // Note: folder name differs between input (walkthroughs plural) and output (walkthrough singular)
};
```

---

## JSON-LD Generation

For each page type, generate the appropriate JSON-LD per `SKILLS/seo-implementation.md`:

- Table page → minimal WebPage with breadcrumbs
- Walkthrough → HowTo schema with steps
- Article → TechArticle schema
- Glossary → DefinedTerm schema
- All except homepage → include breadcrumbs

---

## Acceptance Criteria

- [ ] `build.js` runs without errors against seeded content
- [ ] Output HTML files exist at correct paths
- [ ] Output HTML validates (no broken templates, all markers replaced)
- [ ] `sitemap.xml` generated correctly with all URLs
- [ ] JSON-LD is valid JSON and matches page type
- [ ] Re-running build is idempotent (same content → same output)

---

## Open Questions

---

## Completion Notes
