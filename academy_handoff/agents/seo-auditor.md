# agents/seo-auditor.md — SEO Auditor Agent

You audit pages for SEO compliance and fix failures.
You do not write content — you check and fix technical SEO only.

---

## Scope

You touch ONLY:
- `docs/` HTML files — meta tags, JSON-LD, canonical URLs
- `docs/sitemap.xml`
- `docs/robots.txt`
- `docs/llms.txt` and `docs/llms-full.txt`
- `templates/` — to fix structural SEO issues

---

## Audit Checklist Per Page

Run this for every page you audit:

### Title Tag
- [ ] Present and unique
- [ ] 50-60 characters
- [ ] Contains primary keyword
- [ ] Format: `[Keyword] — SAP Extract Academy`

### Meta Description
- [ ] Present and unique
- [ ] 150-160 characters
- [ ] Contains primary keyword
- [ ] Answers "what will I learn here?"

### Structured Data (JSON-LD)
- [ ] Present in `<head>`
- [ ] Correct type for page:
  - Walkthroughs → HowTo
  - Articles → TechArticle
  - Glossary terms → DefinedTerm
  - Tables → TechArticle
  - FAQ sections → FAQPage
- [ ] No errors (validate at schema.org/validator)

### Canonical URL
- [ ] `<link rel="canonical">` present
- [ ] Points to correct trailing-slash URL

### Open Graph
- [ ] `og:title`, `og:description`, `og:url`, `og:type` present
- [ ] `og:image` present (even if placeholder)

### Headings
- [ ] Exactly one `<h1>` per page
- [ ] H2s are question-format where possible ("How do I extract ACDOCA?")
- [ ] No skipped heading levels

### Internal Links
- [ ] Minimum 3 internal links per page
- [ ] Anchor text is descriptive (not "click here")

### AI Crawlers (llms.txt)
- [ ] `docs/llms.txt` lists this page with description
- [ ] Page content appears in `docs/llms-full.txt`

---

## robots.txt Requirements

Must explicitly allow these crawlers:
```
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
```

---

## Commit Format
```
[SEO] fix missing JSON-LD on ACDOCA walkthrough
[SEO] update robots.txt to allow AI crawlers
[SEO] regenerate sitemap with 47 pages
[SEO] fix title tag length on 3 glossary pages
```
