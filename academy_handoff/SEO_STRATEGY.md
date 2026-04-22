# SEO_STRATEGY.md — The Traffic Playbook

This file is as important as any spec. Every page built is an SEO investment. Every title, URL, heading, and paragraph is a ranking signal.

---

## Goals

1. **Rank in Google's top 3** for high-intent SAP S/4HANA extraction queries within 6 months
2. **Be cited by LLM search tools** (Claude, ChatGPT, Perplexity, Gemini) when users ask how to extract SAP data
3. **Build a durable content moat** — SEO compounds; every good article becomes a traffic asset for years

---

## Target Keywords

### Primary (High Intent, High Value)

These drive paid-tier Studio sales and SI conversations:

- `extract ACDOCA to Snowflake`
- `S/4HANA CDS view extraction`
- `SAP ODP vs SLT`
- `SAP Runtime License extract data`
- `extract SAP table to cloud`
- `ACDOCA data extraction`
- `SAP CDS view delta`
- `S/4HANA migration data extraction`

### Secondary (Educational, Builds Authority)

These drive Academy signups and top-of-funnel:

- `what is ODP SAP`
- `what is SLT SAP`
- `SAP CDS view tutorial`
- `Append Structure SAP`
- `ODQMON transaction`
- `SAP Z-field extraction`
- `I_JournalEntryItem CDS view`
- `extract VBAK table`
- `extract LFA1 vendor master`
- `SAP BKPF BSEG cloud`

### Long-Tail (Question-Based, Perfect for LLM Citation)

These get cited by Claude, ChatGPT, Perplexity when users ask questions:

- `how to extract ACDOCA without breaking SAP`
- `why is reading BSEG directly slow`
- `can I use SLT under SAP Runtime License`
- `difference between ODP and SLT`
- `how to add custom field to CDS view for extraction`
- `partitioning ACDOCA by company code fiscal year`
- `S/4HANA extraction best practices`

### Location + Language Variants (Stage 2)

Once German launches:
- `SAP Daten extrahieren` (extract SAP data)
- `ACDOCA Snowflake Extraktion`
- `CDS View Tutorial Deutsch`

Germany alone accounts for ~30% of SAP installed base. German content is a major Stage 2 priority.

---

## Page-by-Page Keyword Mapping

### Landing Page (`/`)
- Primary: `SAP S/4HANA data extraction`
- Secondary: `SAP extraction tutorial`, `SAP to Snowflake`, `SAP to cloud`
- Title: "SAP S/4HANA Data Extraction — Walkthroughs Cited from SAP Docs"
- Meta description: "Learn how to extract VBAK, ACDOCA, BKPF, LFA1, and MARA from S/4HANA to cloud platforms. Every step cited to SAP's official documentation. Free, level-appropriate walkthroughs."

### Table Pages (`/tables/[code]/`)
- Pattern: `extract [TABLE] to [cloud] SAP`
- Example for VBAK: "Extract VBAK from SAP S/4HANA — Complete Guide"
- Meta: "VBAK is the sales document header in S/4HANA. This guide explains the table structure, the released CDS view I_SalesDocument, common Z-fields, and how to extract it to Snowflake, ADLS, or S3."

### Walkthrough Pages (`/walkthrough/[level]/[table]/`)
- Pattern: `[level] [TABLE] extraction SAP to [target]`
- Example for Expert ACDOCA: "Extract ACDOCA to Snowflake (Expert) — S/4HANA Walkthrough"
- Meta: "Step-by-step walkthrough for extracting the Universal Journal (ACDOCA) from S/4HANA to Snowflake at enterprise volume. Covers CDS views, Z-field extension, license awareness, and partitioning by BUKRS and GJAHR."

### Articles (`/articles/[slug]/`)
- Title: exactly the search query format, e.g. "Why Reading ACDOCA Directly Breaks Your SAP System"
- Meta: answers the question directly in one sentence, provides a hint at the solution

### Glossary (`/glossary/[term]/`)
- Title pattern: "[TERM]: [Full Name] in SAP — Plain Explanation"
- Example: "ODP: Operational Data Provisioning in SAP — Plain Explanation"
- These pages rank for "what is [TERM]" long-tail searches

---

## Technical SEO Requirements

Every page must have all of the following. This is the SEO checklist referenced in `AGENTS.md`.

### 1. HTML Head Tags

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary tags -->
  <title>[Page-specific, 50-60 chars]</title>
  <meta name="description" content="[Page-specific, 150-160 chars]">
  <link rel="canonical" href="https://academy.example.com/current-path/">
  
  <!-- Open Graph -->
  <meta property="og:type" content="article">  <!-- or "website" for index pages -->
  <meta property="og:title" content="[Same as title or shorter]">
  <meta property="og:description" content="[Same as meta description]">
  <meta property="og:url" content="https://academy.example.com/current-path/">
  <meta property="og:image" content="https://academy.example.com/og-images/[page-specific].png">
  <meta property="og:site_name" content="SAP Extract Academy">
  <meta property="og:locale" content="en_US">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="[Same as og:title]">
  <meta name="twitter:description" content="[Same as og:description]">
  <meta name="twitter:image" content="[Same as og:image]">
  
  <!-- Structured Data — see JSON-LD section below -->
  <script type="application/ld+json">...</script>
</head>
```

### 2. Semantic HTML

```html
<body>
  <a href="#main" class="skip-link">Skip to content</a>
  <header>
    <nav aria-label="Primary">...</nav>
  </header>
  <main id="main">
    <article>
      <h1>[Unique, keyword-rich]</h1>
      <section>
        <h2>...</h2>
      </section>
    </article>
    <aside>...</aside>
  </main>
  <footer>...</footer>
</body>
```

### 3. Structured Data (JSON-LD)

Different page types need different schema types. Include the correct one in every page.

**For Articles:**

```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Why Reading ACDOCA Directly Breaks Your SAP System",
  "description": "...",
  "author": {
    "@type": "Organization",
    "name": "SAP Extract Academy"
  },
  "publisher": {
    "@type": "Organization",
    "name": "SAP Extract Academy",
    "logo": {
      "@type": "ImageObject",
      "url": "https://academy.example.com/logo.png"
    }
  },
  "datePublished": "2025-01-15",
  "dateModified": "2025-01-20",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://academy.example.com/articles/why-acdoca-breaks-sap/"
  }
}
```

**For Walkthroughs (HowTo):**

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Extract ACDOCA to Snowflake (Expert)",
  "description": "...",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "totalTime": "PT45M",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Confirm released CDS view",
      "text": "...",
      "url": "https://academy.example.com/walkthrough/expert/acdoca/#step-1"
    }
  ]
}
```

**For Glossary Terms (DefinedTerm):**

```json
{
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  "name": "Operational Data Provisioning",
  "alternateName": "ODP",
  "description": "SAP's framework for exposing data to external consumers...",
  "inDefinedTermSet": {
    "@type": "DefinedTermSet",
    "name": "SAP Extract Academy Glossary",
    "url": "https://academy.example.com/glossary/"
  }
}
```

**For Breadcrumbs (every sub-page):**

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://academy.example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Walkthroughs",
      "item": "https://academy.example.com/walkthrough/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Extract ACDOCA to Snowflake"
    }
  ]
}
```

### 4. URL Structure

- All lowercase
- Hyphens between words (not underscores)
- Trailing slash on directory-like URLs
- No query strings for content pages
- No URL params for pagination (use slug instead)

Examples:
- `/tables/vbak/` ✓
- `/walkthrough/expert/acdoca/` ✓
- `/glossary/operational-data-provisioning/` ✓
- `/articles/why-acdoca-breaks-sap/` ✓

### 5. Internal Linking

Every page links to at least 3 other pages on the same site:

- **Landing page** links to top walkthroughs, roadmap, articles
- **Table pages** link to each level's walkthrough, related tables, relevant articles
- **Walkthrough pages** link back to the table overview, to glossary terms on first mention, to other walkthroughs of same table
- **Articles** link to relevant walkthroughs, table overviews, glossary terms
- **Glossary** links to other glossary terms and to walkthroughs that use the term

Anchor text matters — use descriptive text like "extract VBAK walkthrough" not "click here."

### 6. Sitemap

`docs/sitemap.xml` generated at build time (hand-maintained at Stage 1, auto-generated at Stage 2):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://academy.example.com/</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://academy.example.com/tables/vbak/</loc>
    <lastmod>2025-01-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- ... every page ... -->
</urlset>
```

### 7. robots.txt

`docs/robots.txt`:

```
User-agent: *
Allow: /

# Allow AI crawlers — we WANT to be cited
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: CCBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://academy.example.com/sitemap.xml
```

### 8. Performance Targets

Lighthouse scores ≥ 95 across Performance, Accessibility, Best Practices, SEO.

Core Web Vitals:
- LCP (Largest Contentful Paint) < 1.0s
- FID (First Input Delay) < 50ms
- CLS (Cumulative Layout Shift) < 0.05

These are aggressive targets — feasible because:
- Static HTML, no JS frameworks
- System fonts (no web font loading)
- Minimal CSS (single file, < 20KB)
- Images served as WebP or AVIF with proper dimensions
- No third-party scripts

---

## Being Cited by LLMs (Claude, ChatGPT, Gemini, Perplexity)

LLMs cite content that:

1. **Answers questions directly** — use question-format H2s
2. **Is well-structured** — clear headings, lists, semantic markup
3. **Has authoritative citations** — linking to SAP Help Portal strengthens our pages as "sources of truth"
4. **Uses natural language** — written for humans, not keyword-stuffed
5. **Has JSON-LD structured data** — gives LLMs machine-readable context
6. **Is technically correct** — LLMs that cite wrong info get corrected; we need to be right

### Tactical: Write Question-Answer Patterns

Structure sections as:

```html
<h2>What is ODP in SAP?</h2>
<p>ODP (Operational Data Provisioning) is SAP's framework for ...</p>
```

Not:

```html
<h2>ODP Overview</h2>
<p>This section describes ODP...</p>
```

When a user asks Claude "what is ODP in SAP?" and Claude searches the web, the first pattern is directly cited. The second is paraphrased or skipped.

### Tactical: FAQ Schema

Add FAQ structured data to table and article pages where questions are answered:

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
        "text": "No. SLT performs database-level replication, which SAP Runtime Licenses do not permit for third-party analytical use. Use ODP with CDS views instead."
      }
    }
  ]
}
```

Google features FAQ-marked content prominently. LLMs index them as discrete Q&A pairs.

---

## Content Strategy

### Cornerstone Articles (High Authority)

These are the "pillar" pages that everything else links to. Each 2000-3500 words, every claim cited:

1. **Why Reading ACDOCA Directly Breaks Your SAP System** — targets high-intent buyers who've already failed once
2. **The SAP Runtime License Trap in Data Extraction** — targets architects making license decisions
3. **ODP vs SLT vs OData: A Complete Decision Tree for SAP Extraction** — targets anyone googling comparisons

### Supporting Content (Walkthroughs, Glossary)

Walkthroughs rank for specific long-tail queries. Glossary terms rank for "what is X" queries. Together they form a dense internal link graph that amplifies the cornerstone articles' authority.

### Publishing Cadence

- Launch: all 5 tables + 15 walkthroughs + 3 articles + 32 glossary terms simultaneously
- Ongoing (post-launch): one new article per week, glossary expansion, walkthrough refinement based on search console data

---

## Measurement

Set up in Stage 1:

1. **Google Search Console** — submit sitemap, monitor impressions/clicks
2. **Bing Webmaster Tools** — yes, still worth it (Bing powers ChatGPT's web search)
3. **Plausible Analytics** (or Simple Analytics) — privacy-respecting, GDPR-compliant
4. **Ahrefs free account** — monitor backlinks, competitor keyword overlap

Review weekly:
- Which queries bring impressions but no clicks? → rewrite titles/meta
- Which pages rank 8-15? → add internal links to boost them over the fold
- Which articles get LLM traffic (referrer = chat.openai.com, claude.ai, perplexity.ai)? → write more on those topics

---

## SEO Checklist Per Page (AI Agent runs this)

Before committing any page:

- [ ] Unique `<title>` (50-60 chars), includes primary keyword
- [ ] Unique `<meta description>` (150-160 chars), includes primary keyword naturally
- [ ] Canonical URL set
- [ ] Open Graph tags complete (title, description, image, URL, type)
- [ ] Twitter Card tags complete
- [ ] Exactly one `<h1>`, contains primary keyword
- [ ] `<h2>` / `<h3>` follow logical hierarchy, many in question format
- [ ] JSON-LD structured data appropriate for page type
- [ ] Breadcrumb JSON-LD for non-homepage pages
- [ ] At least 3 internal links with descriptive anchor text
- [ ] Alt text on every image (descriptive, not "image")
- [ ] URL is lowercase, hyphenated, ends in trailing slash if directory-like
- [ ] Semantic HTML landmarks (header, nav, main, article, aside, footer)
- [ ] Page included in `sitemap.xml`
- [ ] Lighthouse SEO score ≥ 95
- [ ] No placeholder content or `[NEEDS_SAP_CITATION]` remaining

If any item fails, fix before committing.
