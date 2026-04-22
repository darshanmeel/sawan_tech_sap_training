# SKILL: Stage 1 Static HTML

Use this skill when building Stage 1 pages, templates, or the optional build script.

---

## The Approach

Stage 1 produces static HTML files committed to the `docs/` folder. GitHub Pages serves `docs/` directly. No server, no build step required for GitHub to publish.

Content is authored in markdown at `content/en/`. HTML is generated either:

- **Manually** — for the first 3-5 pages while templates stabilize
- **Via `build.js`** — a tiny Node script that reads markdown, applies templates, writes HTML

Both approaches produce the same output. Manual works without any tooling; the script scales.

---

## Directory Mapping

| Content source | HTML output |
|---|---|
| `content/en/tables/vbak.md` | `docs/tables/vbak/index.html` |
| `content/en/walkthroughs/expert/acdoca.md` | `docs/walkthrough/expert/acdoca/index.html` |
| `content/en/glossary/odp.md` | `docs/glossary/odp/index.html` |
| `content/en/articles/why-acdoca-breaks-sap.md` | `docs/articles/why-acdoca-breaks-sap/index.html` |

**Note:** every page is `index.html` inside a directory. This produces trailing-slash URLs, which is important for SEO and migration safety (see `MIGRATION_PATH.md`).

---

## HTML Templates

Five templates in `templates/`:

1. `base.html` — shell (head, header, footer, skip link, global CSS)
2. `landing.html` — homepage (unique layout)
3. `table-detail.html` — individual table pages
4. `walkthrough.html` — individual walkthrough pages
5. `article.html` — long-form articles

Index pages (`/tables/`, `/glossary/`, `/articles/`) are simpler — just lists of cards. Use a simplified template or write directly.

---

## Template Syntax

Stage 1 uses Mustache-style variable replacement for simplicity. The optional `build.js` uses Mustache.js (or handwritten regex replacement for simpler cases).

Template markers:

```html
<title>{{seoTitle}} — SAP Extract Academy</title>
<meta name="description" content="{{seoDescription}}">
<h1>{{title}}</h1>
```

For loops (walkthrough steps, gotchas, related terms):

```html
{{#steps}}
<section id="step-{{id}}" class="step">
  <h2>Step {{id}}: {{title}}</h2>
  <p>{{{explanation}}}</p>
  <!-- ... -->
</section>
{{/steps}}
```

Triple-brace `{{{html}}}` outputs raw HTML (no escaping) — use for already-rendered markdown body content. Double-brace `{{text}}` escapes HTML — use for user-facing text.

---

## Markdown Rendering

For markdown body content (article bodies, table page intros), use `marked` npm package in `build.js`:

```js
import { marked } from 'marked';
const html = marked.parse(markdownBody);
```

For inline markdown in frontmatter fields (explanations, step text), either:
- Pre-render at build time with `marked`
- Or keep frontmatter HTML-ready and skip markdown in frontmatter

Simpler at Stage 1: write SAP links in frontmatter as already-rendered HTML:

```yaml
explanation: 'Open <a href="https://help.sap.com/...">ODQMON</a> and check the subscription monitor.'
```

Markdown body stays markdown; frontmatter stays simple HTML. Stage 2 can swap this to MDX.

---

## The Minimal `build.js` (Optional but Recommended)

```js
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import Mustache from 'mustache';

const CONTENT_DIR = 'content/en';
const TEMPLATES_DIR = 'templates';
const OUTPUT_DIR = 'docs';

// Pseudocode — full implementation in ISSUE-003
function build() {
  // 1. Load strings/en.json
  // 2. Walk content/en/**/*.md
  // 3. For each file, parse frontmatter + body, pick template based on content type
  // 4. Render body markdown to HTML
  // 5. Merge data + strings into template via Mustache
  // 6. Write to correct output path under docs/
  // 7. Generate sitemap.xml from all output paths
}

build();
```

`package.json`:

```json
{
  "scripts": {
    "build": "node build.js",
    "watch": "node build.js --watch"
  },
  "dependencies": {
    "gray-matter": "^4.0.0",
    "marked": "^11.0.0",
    "mustache": "^4.2.0"
  }
}
```

Run locally: `npm run build`. Inspect `docs/` output. Commit `docs/`. Push.

---

## Without `build.js`

For quick iteration or very few pages, open the markdown file, copy the frontmatter values into the template manually, save as HTML in `docs/...`. Tedious for 15 walkthroughs, fine for 3 articles. Use judgment.

---

## HTML Head Requirements

Every page includes (via `base.html`):

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <title>{{seoTitle}}</title>
  <meta name="description" content="{{seoDescription}}">
  <link rel="canonical" href="https://academy.example.com{{canonicalPath}}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="{{ogType}}">
  <meta property="og:title" content="{{seoTitle}}">
  <meta property="og:description" content="{{seoDescription}}">
  <meta property="og:url" content="https://academy.example.com{{canonicalPath}}">
  <meta property="og:image" content="https://academy.example.com/assets/og/{{ogImage}}">
  <meta property="og:site_name" content="SAP Extract Academy">
  <meta property="og:locale" content="en_US">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{{seoTitle}}">
  <meta name="twitter:description" content="{{seoDescription}}">
  <meta name="twitter:image" content="https://academy.example.com/assets/og/{{ogImage}}">
  
  <!-- JSON-LD — page-type-specific, generated in template -->
  <script type="application/ld+json">{{{jsonLd}}}</script>
  
  <!-- Styles -->
  <link rel="stylesheet" href="/assets/css/main.css">
  
  <!-- Favicon -->
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  
  <!-- Analytics (Plausible — only once domain is set) -->
  <!-- <script defer data-domain="academy.example.com" src="https://plausible.io/js/script.js"></script> -->
</head>
```

---

## GitHub Pages Publication

In repository settings:

1. **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `main`, folder: `/docs`
4. Save

Every push to `main` that touches `docs/` triggers a deploy (~1-2 min).

Custom domain (optional, later):

1. Add `docs/CNAME` with domain e.g. `academy.extraktstudio.com`
2. Configure DNS (A records to GitHub Pages IPs)
3. Enable HTTPS in Settings → Pages

---

## Common Pitfalls

### Pitfall 1: URLs Without Trailing Slash

Wrong: `docs/tables/vbak.html` → served as `/tables/vbak.html`
Right: `docs/tables/vbak/index.html` → served as `/tables/vbak/`

The trailing-slash version matches what Astro and Next.js produce, avoiding migration rewrites.

### Pitfall 2: Relative Links

If using `base` config in Stage 2 (project pages, not custom domain), relative links break.

**Fix:** use root-relative links at Stage 1:
- `<a href="/tables/vbak/">` not `<a href="tables/vbak/">`
- `<link href="/assets/css/main.css">` not `<link href="assets/css/main.css">`

### Pitfall 3: Missing index.html

If you create `docs/tables/vbak/` without `index.html`, GitHub Pages 404s. Always end directory paths with `index.html`.

### Pitfall 4: Cache Headers

GitHub Pages sets moderate cache headers. When updating CSS or JS, bust cache via query string:

```html
<link rel="stylesheet" href="/assets/css/main.css?v=2">
```

Manually bump `v=` when shipping style changes.
