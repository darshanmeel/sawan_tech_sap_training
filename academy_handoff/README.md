# SAP Extract Academy — Build Handoff Package

**Version:** MVP 1.0
**Strategy:** Stage 1 (static HTML on GitHub Pages) → Stage 2 (Astro or Next.js migration)
**Brand architecture:** Umbrella brand with subdomains — `academy.yoursite.com` (this product), `studio.yoursite.com` (paid Stage 2), `lakehouse.yoursite.com` / `warehouse.yoursite.com` (future Databricks/Snowflake content)
**Primary goal:** Maximum organic ranking on Google, and citability by Claude / ChatGPT / Gemini for SAP data extraction queries
**Launch scope:** S/4HANA on-prem + ECC 6.0 (shared code, 1-2 week extension), English only
**Future scope:** German translation, S/4HANA Cloud, BW, Datasphere, Academy + Studio product line
**Primary build tool:** Claude Code (handles all code, content drafting, and SAP URL verification via its web search)
**SAP practice environment:** SAP CAL deployed to GCP `europe-west3` (Frankfurt) for live extraction demos — see `SAP_PRACTICE_SYSTEM.md`
**Chatbot:** Deferred until after Studio MVP. Design: 10,000 tokens free / 5 Q/day per IP OR unlimited for paid Studio users.

---

## Read Order (Mandatory for AI Agent)

You are an AI coding agent (Claude Haiku or Sonnet). Read these files in this order before writing any code:

1. **`README.md`** (this file) — overview, stages, SEO mandate, success criteria
2. **`AGENTS.md`** — agent workflow rules and guardrails
3. **`PROJECT_SPEC.md`** — complete product specification
4. **`SEO_STRATEGY.md`** — the SEO playbook (this is critical — it's why we exist)
5. **`CONTENT_RULES.md`** — rules for all written content (SAP citation rules are non-negotiable)
6. **`DATA_SCHEMA.md`** — content frontmatter schema (works for both stages)
7. **`MIGRATION_PATH.md`** — how Stage 1 output maps cleanly to Stage 2
8. **`SKILLS/*.md`** — skill files for specific tasks
9. **`issues/*.md`** — implementation tickets in numerical order
10. **`content_samples/*.md`** — one full reference walkthrough as a template
11. **`templates/*.html`** — Stage 1 HTML templates

---

## The Two-Stage Strategy

### Stage 1 — Static HTML on GitHub Pages (Weeks 1-6)

**Why:** fastest path to publishing. Zero build complexity. Google indexes static HTML instantly. No npm, no Node, no deploy pipeline beyond a git push. Ideal for validating content quality and early SEO before investing in a framework.

**What:** hand-written HTML files, one per page, sharing a set of templates. Content stored as markdown source files (for future migration), but published as pre-generated HTML.

**How:**
- Markdown source files in `content/en/` contain all walkthroughs, table data, articles, glossary
- A small Node script (`build.js` — optional, or manually paste) renders each markdown file into the corresponding HTML template
- Output HTML lives in `docs/` (GitHub Pages' default publish folder) or site root
- `git push` = deploy

### Stage 2 — Astro or Next.js (Months 2-3)

**Why:** once content is validated and early traffic is flowing, migrate to a framework for:
- Better component reuse
- Server-rendered search
- i18n for German launch
- Future dashboards and account pages

**What:** decision between Astro and Next.js deferred until Stage 1 shows real usage patterns. The content format is designed to move without rewrite.

**Migration safety:** because content is already in structured markdown with frontmatter, moving to Astro's content collections or Next.js MDX is a mechanical conversion. URL structure stays identical so no SEO loss.

---

## Why This Order Matters for SEO

Google has made static HTML the gold standard for ranking since 2019. A fast-loading, well-structured static HTML page with semantic markup, internal linking, and real content outranks a poorly-configured JavaScript-heavy SPA every time. We intentionally build Stage 1 as static HTML so we gain:

1. **Instant indexability** — Googlebot renders and indexes immediately, no JS execution delay
2. **Perfect Core Web Vitals** — no JS bundle = excellent LCP, FID, CLS
3. **AI crawler friendliness** — OpenAI's GPTBot, ClaudeBot, PerplexityBot all prefer static HTML
4. **Zero regression risk** during Stage 2 migration since content and URLs stay stable

See `SEO_STRATEGY.md` for the full strategy.

---

## Ground Rules (Non-Negotiable)

### Rule 1: Only SAP Official Documentation

Every SAP fact cites an SAP Help Portal URL. No blogs, no Stack Overflow, no AI memory. See `CONTENT_RULES.md`.

### Rule 2: SEO Is a Build Requirement, Not a Nice-To-Have

Every page must pass the SEO checklist in `SEO_STRATEGY.md` before it's considered done. This is equal in weight to accessibility and functional correctness.

### Rule 3: English Only at Launch, German-Ready

Structure content under `content/en/`. German will mirror to `content/de/` in Stage 2. Never hardcode UI strings in templates — use a strings file.

### Rule 4: GitHub Pages Compatibility

Final output is fully static HTML. No server requirement. No build-time external API calls (content fetching happens at author time, not runtime).

### Rule 5: Stage 2 Migration Safety

Every decision in Stage 1 considers the Stage 2 migration:
- URLs match what Astro/Next.js would produce
- Frontmatter matches what content collections / MDX expect
- Component structure maps to future component files

See `MIGRATION_PATH.md` for the specifics.

### Rule 6: Do Not Invent Product Features

Scope is locked. If a feature seems obvious but isn't in the spec, open a `PROPOSED-###` issue instead of building it.

---

## What "Done" Means for Stage 1 MVP

Stage 1 is complete when:

1. Live at `https://<username>.github.io/sap-extract-academy/` (or custom domain)
2. Five tables covered: VBAK, LFA1, MARA, BKPF, ACDOCA
3. Fifteen walkthroughs (5 tables × 3 levels)
4. Three cornerstone articles published
5. Glossary with 32 terms
6. Roadmap page showing ECC / Cloud / BW / Datasphere phases
7. Every page scores 95+ on Lighthouse across all four categories
8. Every page passes the SEO checklist in `SEO_STRATEGY.md`
9. Sitemap published and submitted to Google Search Console
10. Analytics strategy in place (Plausible or Simple Analytics — privacy-respecting only, NOT Google Analytics for GDPR reasons given the user's EU location)
11. Email capture functional (via Buttondown or similar privacy-respecting provider)
12. All content cites SAP Help Portal (no `[NEEDS_SAP_CITATION]` markers remaining)

---

## What "Done" Means for Stage 2 Migration

Stage 2 is complete when:

1. Framework chosen (Astro or Next.js) based on Stage 1 learnings
2. All Stage 1 pages render identically on the new framework
3. URLs preserved bit-for-bit (301 redirects only if absolutely necessary)
4. German content infrastructure in place (even if not yet translated)
5. All Stage 1 SEO scores maintained or improved
6. Content collections / MDX structure used for authoring

---

## Directory Structure

```
sap-extract-academy/
├── README.md
├── .github/workflows/deploy.yml     (Stage 1: simple copy-to-pages; Stage 2: framework build)
├── docs/                            (GitHub Pages publish folder — Stage 1 output)
│   ├── index.html
│   ├── tables/
│   │   ├── index.html
│   │   ├── vbak.html
│   │   ├── lfa1.html
│   │   └── ...
│   ├── walkthrough/
│   │   ├── beginner/
│   │   │   ├── vbak.html
│   │   │   └── ...
│   │   ├── intermediate/
│   │   └── expert/
│   ├── articles/
│   ├── glossary/
│   ├── roadmap.html
│   ├── about.html
│   ├── sitemap.xml
│   ├── robots.txt
│   └── assets/
│       ├── css/main.css
│       ├── js/checklist.js
│       └── images/
├── content/                         (source markdown — drives both stages)
│   └── en/
│       ├── tables/
│       ├── walkthroughs/
│       ├── articles/
│       ├── glossary/
│       └── roadmap/
├── templates/                       (Stage 1 HTML templates)
│   ├── base.html
│   ├── walkthrough.html
│   ├── table-detail.html
│   └── article.html
├── build.js                         (optional Node script to render templates)
└── strings/
    └── en.json
```

---

## First Command to Run

```bash
# Verify tooling
git --version

# Create the repo structure
mkdir -p sap-extract-academy/{docs,content/en,templates,strings}
cd sap-extract-academy
git init

# Open issue 001
```

Then open `issues/001-stage1-setup.md`.
