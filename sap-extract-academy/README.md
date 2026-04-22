# SAP Extract Academy

Learn SAP data extraction the right way — professional patterns for production environments.

A free, interactive learning platform that teaches data engineers, architects, and SAP Basis professionals how to extract data from S/4HANA and ECC into cloud platforms like Snowflake, Redshift, and BigQuery.

**Status:** Launch ready  
**Supported Sources:** S/4HANA on-prem, ECC 6.0  
**Difficulty Levels:** Beginner → Intermediate → Expert  
**Tables Covered:** ACDOCA, BKPF, VBAK, MARA, LFA1

---

## What You'll Learn

- **ODP (Operational Data Provisioning)**: Free, built-in extraction with delta support
- **SLT (SAP Landscape Transformation)**: Licensed, parallelized extraction at enterprise scale
- **Licensing Traps**: Runtime vs. Full Use licenses, audit risks, cost implications
- **Real-world Patterns**: Partitioning, parallelism, cardinality reconciliation, and performance tuning
- **Tools & Integration**: Kafka, Snowflake, Python, Azure Data Factory, Fivetran

Every walkthrough covers the same table at three difficulty levels, so you can:
1. **Start with basics** (1-2 hours, single company/year, batch extraction)
2. **Graduate to patterns** (4-8 hours, multi-year/company parallelism)
3. **Master enterprise scale** (real-time streaming, billions of rows, SLT configuration)

---

## Quick Start

### Prerequisites

- **Node.js 18+**
- **npm 9+**

### Build Locally

```bash
cd sap-extract-academy
npm install
npm run build
```

Built site appears in `docs/` directory.

### Serve Locally

```bash
cd docs
npx local-web-server
# Open http://localhost:8000
```

---

## Features

### ✓ Three-Level Difficulty Progression

Each SAP table has beginner, intermediate, and expert walkthroughs. Learners advance at their own pace.

```
Beginner (0-2 hours)     → Single partition, batch extraction, Python/ADF
Intermediate (4-8 hours) → Multi-partition, parallelism, monitoring  
Expert (8-12 hours)      → Real-time streaming, SLT, Kafka, high volume
```

### ✓ ECC/S/4HANA Mode Toggle

Users select their SAP version. Content automatically switches between legacy (ECC) and modern (S/4HANA) extraction patterns.

- Dropdown in header: "Choose SAP Version"
- Preference saved to localStorage
- Content marked with `[data-ecc-only]` or `[data-s4hana-only]` shows/hides automatically

### ✓ Walkthrough Progress Tracking

Checklists with auto-save:
- Check off steps as you complete them
- Progress persists across page reloads (localStorage)
- One-click reset button to start over

### ✓ Comprehensive Glossary

32 terms covering SAP extraction concepts:
- ABAP, ODP, SLT, LTRS, LTRC, ODQMON, RFC
- Field types: CUKY, CURR, DATS, NUMC, QUAN, MEINS
- Key tables: MANDT, VBELN, Z-fields
- Execution contexts: Dialog Work Process, Extractor

### ✓ Industry Insights

3 detailed articles covering critical knowledge:
- **Why ACDOCA Breaks SAP**: Memory exhaustion, TSV_TNEW_PAGE_ALLOC_FAILED, mandatory partitioning
- **The SAP Runtime License Trap**: Full Use vs. Runtime, SLT licensing restrictions, audit horror stories
- **ACDOCA Complete Walkthrough**: Three extraction patterns with code, configurations, and troubleshooting

### ✓ Responsive & Accessible

- Mobile-first design (640px, 1024px breakpoints)
- WCAG 2.1 AA compliance (skip links, focus states, semantic HTML)
- Lighthouse CI: Performance 85%+, Accessibility 95%+, Best Practices 90%+, SEO 95%+

### ✓ SEO Optimized

- JSON-LD structured data (WebPage, HowTo, TechArticle, DefinedTerm)
- Meta tags (OpenGraph, Twitter Card, canonical URLs)
- Auto-generated sitemap.xml
- Optimized for search: "SAP extraction," "ODP," "SLT," "ACDOCA"

### ✓ Auto-Generated Index Pages

Indexes automatically built from content:
- `/tables/` — all table walkthroughs
- `/glossary/` — all terms with search-friendly descriptions
- `/articles/` — all industry insights

No manual index maintenance required.

---

## Project Structure

```
sap-extract-academy/
├── content/en/
│   ├── index.md                    # Landing page
│   ├── about.md                    # Mission & values
│   ├── roadmap.md                  # Q2-Q4 2026 + 2027 plans
│   ├── tables/
│   │   ├── acdoca.md               # General ledger table
│   │   ├── bkpf.md                 # FI document header
│   │   ├── vbak.md                 # Sales order header
│   │   ├── mara.md                 # Material master
│   │   └── lfa1.md                 # Vendor master
│   ├── walkthroughs/
│   │   ├── beginner/
│   │   ├── intermediate/
│   │   └── expert/
│   ├── articles/
│   │   ├── why-acdoca-breaks-sap.md
│   │   ├── sap-runtime-license-trap.md
│   │   └── acdoca-complete-walkthrough.md
│   └── glossary/
│       └── (32 terms)
├── templates/
│   ├── base.html                   # Page wrapper with header/footer
│   ├── landing.html                # Home page layout
│   ├── table.html                  # Table overview page
│   ├── walkthrough.html            # Walkthrough with checklist
│   ├── article.html                # Long-form content
│   ├── glossary.html               # Single term definition
│   ├── list.html                   # Index pages (tables, glossary, articles)
│   └── page.html                   # Generic page (about, roadmap)
├── docs/                           # Built static site (generated)
│   ├── assets/
│   │   ├── css/main.css
│   │   ├── js/
│   │   │   ├── checklist.js        # Walkthrough progress tracking
│   │   │   └── source-picker.js    # ECC/S/4HANA version toggle
│   │   └── images/
│   ├── index.html                  # Generated from index.md
│   ├── tables/
│   ├── glossary/
│   ├── articles/
│   ├── walkthroughs/
│   └── sitemap.xml
├── strings/
│   └── en.json                     # UI text (i18n ready)
├── build.js                        # Build script (markdown → HTML)
├── package.json
├── package-lock.json               # Locked dependencies for reproducibility
├── .github/workflows/
│   └── deploy.yml                  # GitHub Actions CI/CD
├── lighthouserc.json               # Performance audit config
├── DEPLOYMENT.md                   # Build & deployment guide
├── LINKEDIN_OUTREACH.md            # Social media strategy
└── README.md                       # This file
```

---

## Development

### Adding New Content

1. **Create markdown file** in appropriate `content/en/` subdirectory
2. **Add YAML frontmatter** with required metadata:

```markdown
---
title: Extract ACDOCA (Beginner)
slug: acdoca-beginner
difficulty: beginner
table: ACDOCA
description: |
  Learn to extract the GL master from SAP...
seoTitle: SAP ACDOCA Extraction Guide (Beginner)
seoDescription: Step-by-step walkthrough for extracting GL master data from SAP...
---

# Extract ACDOCA (Beginner)

Content here...
```

3. **Build locally** to verify: `npm run build`
4. **Commit & push** to trigger deployment

### Available Page Types

The build system auto-detects page type based on location:

| File | Type | Template | Purpose |
|------|------|----------|---------|
| `index.md` | landing | landing.html | Home page with hero + featured content |
| `about.md` | page | page.html | About mission/values |
| `roadmap.md` | list | list.html | Roadmap with dated items |
| `tables/*.md` | table | table.html | Table overview (links to walkthroughs) |
| `walkthroughs/*/*.md` | walkthrough | walkthrough.html | Step-by-step guide with checklist |
| `articles/*.md` | article | article.html | Long-form content (2000+ words) |
| `glossary/*.md` | glossary | glossary.html | Single term definition |

### Template Variables

Every template has access to:

```javascript
{
  seoTitle,                 // <title> tag
  seoDescription,          // <meta description>
  ogImage,                 // OpenGraph image
  jsonLd,                  // Structured data (JSON-LD)
  canonicalPath,           // URL path for canonical link
  content,                 // Rendered HTML from markdown
  strings,                 // UI text from strings/en.json
  buttondownUsername,      // Email signup service
  ...frontmatter           // All YAML frontmatter fields
}
```

---

## Building & Deployment

### Build Process

```bash
npm run build
```

This:
1. Reads markdown files from `content/en/`
2. Parses YAML frontmatter (gray-matter)
3. Renders markdown to HTML (marked)
4. Selects template based on page type
5. Renders with Mustache template engine
6. Generates index pages automatically
7. Outputs static HTML to `docs/`
8. Generates `sitemap.xml` for SEO

### Deployment

**GitHub Pages** (automatic on `main` push):

1. GitHub Actions runs `npm run build`
2. Uploads `docs/` artifact
3. Deploys to GitHub Pages
4. Runs Lighthouse CI (performance audit)

**Manual deployment:**

```bash
git push origin main
```

Workflow runs automatically. View status at **Actions** tab.

### Performance Targets

Lighthouse CI enforces on main branch:
- **Performance**: 85%+
- **Accessibility**: 95%+  
- **Best Practices**: 90%+
- **SEO**: 95%+

Pull requests show scores (warnings only, non-blocking).

---

## Configuration

### Key Files

| File | Purpose |
|------|---------|
| `build.js` | Build script (markdown → HTML) |
| `lighthouserc.json` | Lighthouse CI configuration |
| `.github/workflows/deploy.yml` | GitHub Actions CI/CD |
| `DEPLOYMENT.md` | Detailed deployment documentation |
| `strings/en.json` | UI text (internationalization-ready) |
| `docs/assets/css/main.css` | Stylesheet (CSS custom properties, mobile-first) |
| `docs/assets/js/checklist.js` | Walkthrough progress tracking |
| `docs/assets/js/source-picker.js` | ECC/S/4HANA version toggle |

### Environment Variables

None required. Configuration is in:
- `lighthouserc.json` (audit settings)
- `strings/en.json` (UI text)
- `.github/workflows/deploy.yml` (CI/CD settings)

---

## CSS Architecture

### Design Tokens

CSS custom properties in `main.css`:

```css
--color-primary: #2d5a3d;      /* S/4HANA green */
--color-primary-light: #e8f0ea;
--color-secondary: #8a6f99;    /* ECC purple */
--color-secondary-light: #f4e8f4;
--color-text: #1a1a1a;
--color-border: #e0e0e0;
--spacing-unit: 0.5rem;        /* 8px */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", ...;
```

### Responsive Breakpoints

- **Mobile**: Default styles, no media query needed
- **Tablet**: `@media (min-width: 640px)`
- **Desktop**: `@media (min-width: 1024px)`

### Component Classes

```css
.btn, .btn-primary           /* Buttons */
.container                   /* Max-width wrapper */
.site-header, .site-nav     /* Navigation */
.site-footer                 /* Footer */
.card, .card-grid           /* Content cards */
.source-picker              /* Version selector */
.source-indicator           /* Version banner */
.checklist                   /* Progress tracking */
```

---

## Accessibility

WCAG 2.1 AA compliant:

- **Skip link** at top of every page (`.skip-link`)
- **Semantic HTML**: `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`
- **Focus states**: All interactive elements have visible `:focus`
- **Color contrast**: 7:1 ratio for text on backgrounds
- **Keyboard navigation**: All interactive elements accessible via Tab
- **Screen reader support**: `aria-label`, `role` attributes where needed
- **Headings**: Logical heading hierarchy (h1 → h2 → h3)

---

## JavaScript

### Checklist (walkthrough.html)

**Purpose**: Track user progress through walkthrough steps

```javascript
// Saves to localStorage: sap-extract-academy-checklist:{pageSlug}
// Loads on page load, persists across sessions
// One-click reset button clears saved state
```

**Usage in markdown**:
```html
<div data-step-id="step-1">
  <label>
    <input type="checkbox" />
    Configure LTRS parallelism
  </label>
</div>
```

### Source Picker (source-picker.js)

**Purpose**: Toggle between ECC and S/4HANA extraction patterns

```javascript
// localStorage key: sap-extract-academy-source-version
// Default: 's4hana'
// Exposed as: window.sapExtractAcademy.getSourceVersion()
```

**Usage in templates**:
```html
<!-- Show only in ECC mode -->
<div data-ecc-only>...</div>

<!-- Show only in S/4HANA mode -->
<div data-s4hana-only>...</div>
```

---

## Common Tasks

### Add a new table

1. Create `content/en/tables/tablename.md` with frontmatter:
   ```yaml
   title: TABLE_NAME Overview
   slug: tablename
   ```

2. Create walkthroughs:
   ```
   content/en/walkthroughs/beginner/tablename-beginner.md
   content/en/walkthroughs/intermediate/tablename-intermediate.md
   content/en/walkthroughs/expert/tablename-expert.md
   ```

3. Build: `npm run build`

Index pages auto-update. No manual maintenance.

### Add a glossary term

Create `content/en/glossary/term-name.md`:

```yaml
---
term: ODP
acronym: "Operational Data Provisioning"
description: |
  Built-in SAP extraction framework...
relatedTerms:
  - Delta
  - SLT
  - RFC
---

# ODP

Full definition here...
```

Appears in `/glossary/` and auto-indexed.

### Change site colors

Edit `docs/assets/css/main.css`:

```css
:root {
  --color-primary: #2d5a3d;           /* Change this */
  --color-primary-light: #e8f0ea;     /* And this */
  ...
}
```

Rebuild: `npm run build`

### Update UI text

Edit `strings/en.json`:

```json
{
  "nav": {
    "home": "Home",
    "tables": "SAP Tables",
    ...
  },
  ...
}
```

Rebuild: `npm run build`

---

## Troubleshooting

### Build fails with "Unknown page type"

**Cause**: Windows path separators in build.js  
**Fix**: Update build.js to normalize paths:
```javascript
const normalized = filePath.replaceAll('\\', '/');
```

### Templates undefined error

**Cause**: New page type added to `getPageType()` but not `pageTemplates` object  
**Fix**: Add template to `pageTemplates`:
```javascript
pageTemplates.newtype = fs.readFileSync(path.join(TEMPLATES_DIR, 'newtype.html'), 'utf-8');
```

### Site not updating on GitHub Pages

1. Check GitHub Actions (Actions tab)
2. Verify build completed successfully
3. Confirm GitHub Pages settings: Settings → Pages → Deploy from branch: `main`, folder: `/docs`
4. Wait 30-60 seconds for CDN to update

### Lighthouse tests failing

```bash
cd sap-extract-academy/docs
npx local-web-server
# In another terminal:
npx lhci autorun --config=./lighthouserc.json
```

Check `lighthouserc.json` for thresholds.

### npm ci fails in GitHub Actions

**Cause**: `package-lock.json` not committed  
**Fix**:
```bash
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

---

## Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Build system, GitHub Pages setup, Lighthouse CI
- **[LINKEDIN_OUTREACH.md](../LINKEDIN_OUTREACH.md)** — Social media strategy, post templates
- **[Project Spec](../academy_handoff/PROJECT_SPEC.md)** — Complete requirements and content outline
- **[GitHub Actions Workflow](./.github/workflows/deploy.yml)** — CI/CD configuration

---

## Contributing

Contributions welcome! Submit pull requests to:

1. Add new SAP tables (with 3-level walkthroughs)
2. Expand glossary (32 terms done, more coming)
3. Translate content (i18n-ready with `strings/en.json`)
4. Improve CSS/accessibility
5. Fix typos or clarify documentation

---

## License

This project is open source and free to use. SAP is a registered trademark of SAP SE.

---

## Roadmap

**Q2 2026** (Now)
- ✓ S/4HANA walkthroughs for 5 core tables
- ✓ 32-term glossary
- ✓ Licensing deep-dive articles
- ✓ ECC mode toggle

**Q3 2026**
- Beginner-to-expert progression guides
- SAP Analytics Cloud integration
- Live Q&A sessions (LinkedIn)

**Q4 2026**
- MM (Materials Management) tables
- OData extraction patterns
- Lakehouse architecture (Delta Lake + Iceberg)

**2027**
- HR, SD modules
- Real-time CDP patterns
- Community-driven content

See [Roadmap](./content/en/roadmap.md) for details.

---

**Built with Node.js, Markdown, Mustache templates, and deployed to GitHub Pages.**

**Questions?** File an issue or check the [project documentation](../academy_handoff/).
