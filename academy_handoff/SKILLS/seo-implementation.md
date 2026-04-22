# SKILL: SEO Implementation

Use this skill on every user-facing page. SEO is not optional — see `SEO_STRATEGY.md` for the strategy; this file is about the implementation mechanics.

---

## Checklist for Every Page

Before committing any page, verify:

- [ ] `<title>` 50-60 characters, includes primary keyword naturally
- [ ] `<meta name="description">` 150-160 characters, includes primary keyword
- [ ] `<link rel="canonical">` with the full URL
- [ ] Open Graph tags (type, title, description, url, image, site_name, locale)
- [ ] Twitter Card tags (card, title, description, image)
- [ ] Exactly one `<h1>` per page, contains primary keyword
- [ ] `<h2>` and `<h3>` follow logical hierarchy; many in question format
- [ ] JSON-LD structured data matching page type
- [ ] Breadcrumb JSON-LD (every page except homepage)
- [ ] At least 3 internal links with descriptive anchor text
- [ ] Alt text on every `<img>` (descriptive, not "image")
- [ ] Semantic HTML landmarks: `<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`
- [ ] URL is lowercase, hyphenated, trailing slash for directories
- [ ] Page listed in `docs/sitemap.xml`
- [ ] Page will serve with correct `Content-Type: text/html; charset=utf-8`
- [ ] No placeholders or `[NEEDS_SAP_CITATION]` remaining

---

## Title Patterns by Page Type

| Page Type | Title Pattern | Example |
|---|---|---|
| Landing | `[Value prop] — SAP Extract Academy` | "Learn SAP S/4HANA Data Extraction — Cited from SAP Docs" |
| Table detail | `Extract [TABLE] from SAP S/4HANA — Complete Guide` | "Extract VBAK from SAP S/4HANA — Complete Guide" |
| Walkthrough | `Extract [TABLE] to [Target] ([Level]) — [Source] Walkthrough` | "Extract ACDOCA to Snowflake (Expert) — S/4HANA Walkthrough" |
| Glossary | `[TERM]: [Full Form] in SAP — Plain Explanation` | "ODP: Operational Data Provisioning in SAP — Plain Explanation" |
| Article | Use the actual question/statement as-is | "Why Reading ACDOCA Directly Breaks Your SAP System" |
| Roadmap | `SAP Extract Academy Roadmap — [Next Phase]` | "SAP Extract Academy Roadmap — ECC 6.0 Next" |

Keep under 60 characters to avoid Google truncating.

---

## Meta Description Patterns

| Page Type | Pattern |
|---|---|
| Landing | Value prop + what's covered + free signal |
| Table detail | What the table is + key technical facts + destinations covered |
| Walkthrough | Step-by-step for [X] + what's covered + audience level |
| Glossary | Direct answer to "what is X" + technical precision |
| Article | Hook + what problem the article solves |

Keep 150-160 characters. Over 160 gets truncated in search results.

---

## Internal Linking Rules

### Every page links to at least 3 other pages

- **Landing** → top walkthroughs, articles, roadmap
- **Table detail** → each level's walkthrough, related tables, relevant articles
- **Walkthrough** → table overview (breadcrumb), glossary terms (on first mention), other walkthroughs of same table, relevant article
- **Article** → relevant walkthroughs, table overviews, glossary terms
- **Glossary** → related terms, walkthroughs using the term

### Anchor Text Rules

Descriptive, not generic:

- Good: "extract VBAK walkthrough"
- Good: "read about ACDOCA partitioning"
- Bad: "click here"
- Bad: "learn more"
- Bad: "this article"

### First Mention Rule for Glossary Terms

On first mention of an acronym in a page, link to its glossary entry:

```html
<p>Use <a href="/glossary/odp/">ODP</a> to manage delta queues for your extraction.</p>
```

Subsequent mentions in the same page don't need linking (avoids clutter).

---

## Structured Data (JSON-LD)

Add the appropriate schema to the `<head>` of each page via `<script type="application/ld+json">`.

### Breadcrumbs (every non-homepage page)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://academy.example.com/" },
    { "@type": "ListItem", "position": 2, "name": "Walkthroughs", "item": "https://academy.example.com/walkthrough/" },
    { "@type": "ListItem", "position": 3, "name": "Extract ACDOCA to Snowflake" }
  ]
}
```

### Walkthrough (HowTo schema)

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Extract ACDOCA to Snowflake (Expert)",
  "description": "Step-by-step walkthrough for extracting the Universal Journal from S/4HANA to Snowflake.",
  "totalTime": "PT45M",
  "estimatedCost": { "@type": "MonetaryAmount", "currency": "USD", "value": "0" },
  "tool": [
    { "@type": "HowToTool", "name": "S/4HANA system with ODQMON access" },
    { "@type": "HowToTool", "name": "Snowflake account" }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Confirm released CDS view",
      "text": "Check whether SAP ships a released CDS view for ACDOCA.",
      "url": "https://academy.example.com/walkthrough/expert/acdoca/#step-01"
    }
  ]
}
```

### Article (TechArticle schema)

```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Why Reading ACDOCA Directly Breaks Your SAP System",
  "description": "...",
  "author": { "@type": "Organization", "name": "SAP Extract Academy" },
  "publisher": { "@type": "Organization", "name": "SAP Extract Academy" },
  "datePublished": "2025-01-15",
  "dateModified": "2025-01-20",
  "mainEntityOfPage": "https://academy.example.com/articles/why-acdoca-breaks-sap/"
}
```

### Glossary term (DefinedTerm schema)

```json
{
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  "name": "Operational Data Provisioning",
  "alternateName": "ODP",
  "description": "SAP's framework for exposing data to external consumers. Supports full and delta extraction.",
  "inDefinedTermSet": {
    "@type": "DefinedTermSet",
    "name": "SAP Extract Academy Glossary",
    "url": "https://academy.example.com/glossary/"
  }
}
```

### FAQ (where applicable — e.g. table pages)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Can I use SLT under an SAP Runtime License?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. SLT performs database-level replication, which SAP Runtime Licenses do not permit for third-party use. Use ODP with CDS views instead."
      }
    }
  ]
}
```

---

## Sitemap Generation

### Stage 1 (hand-maintained)

`docs/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://academy.example.com/</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://academy.example.com/tables/vbak/</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Every other page -->
</urlset>
```

Priority guide:
- Homepage: 1.0
- Cornerstone articles, ACDOCA expert walkthrough: 0.9
- Table detail pages, other walkthroughs: 0.8
- Glossary pages: 0.6
- About, roadmap: 0.5

If using `build.js`, auto-generate this from the list of output files.

### Robots.txt

`docs/robots.txt`:

```
User-agent: *
Allow: /

# AI crawlers — we want to be cited
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: ChatGPT-User
Allow: /

Sitemap: https://academy.example.com/sitemap.xml
```

---

## Image Optimization

For SEO and performance:

- **Formats:** prefer AVIF > WebP > JPEG
- **Dimensions:** serve images at display size, not larger. Use `<img width="800" height="450">` always.
- **Loading:** `loading="lazy"` for below-fold images, `loading="eager"` for above-fold
- **Alt text:** descriptive ("Screenshot of the ODQMON subscription monitor showing an active delta queue") not decorative ("image")
- **File naming:** kebab-case, descriptive ("odqmon-subscription-monitor.webp")

At Stage 1, MVP may have few images. Use placeholder SVGs or skip entirely. Don't let missing images block launch.

---

## Canonical URL

Every page sets `<link rel="canonical">`. For a page at `docs/tables/vbak/index.html`, the canonical is `https://academy.example.com/tables/vbak/` (trailing slash).

Never set canonicals to 404 URLs or to pages that redirect.

---

## Submit to Search Consoles

After deploying Stage 1:

1. **Google Search Console** (`search.google.com/search-console`)
   - Add property (DNS verification preferred, HTML verification as backup)
   - Submit sitemap at `https://academy.example.com/sitemap.xml`
   - Check "Coverage" after 24-48 hours

2. **Bing Webmaster Tools** (`bing.com/webmasters`)
   - Import from Google Search Console (easiest)
   - Submit sitemap
   - Bing powers ChatGPT's web search — don't skip this

3. **Google Business Profile** (optional, only if a physical business address applies)

---

## Analytics

Not Google Analytics (GDPR friction, cookie banner). Use **Plausible** or **Simple Analytics**:

```html
<script defer data-domain="academy.example.com" src="https://plausible.io/js/script.js"></script>
```

Metrics to care about:
- Organic search sessions per week
- Top landing pages
- Top search queries (via Search Console)
- Referrers including `chat.openai.com`, `claude.ai`, `perplexity.ai` (indicator of LLM citations)
