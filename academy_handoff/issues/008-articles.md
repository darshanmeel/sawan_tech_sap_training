# ISSUE-008: Three Cornerstone Articles

**Phase:** Content
**Estimated Effort:** 8-12 hours (2000-3500 words each)
**Depends on:** ISSUE-005, ISSUE-007
**Skill files:** `SKILLS/sap-content-authoring.md`, `SKILLS/content-writing.md`, `CONTENT_RULES.md`, `SKILLS/seo-implementation.md`

---

## Goal

Write the three cornerstone articles that anchor the site's SEO authority.

---

## Articles

### Article 1: `content/en/articles/why-acdoca-breaks-sap.md`

**Title:** Why Reading ACDOCA Directly Breaks Your SAP System

**Length:** 2500-3500 words

**Structure:**
1. Hook scenario (paragraph 1): team wants Universal Journal in Snowflake; SELECT * crashes SAP
2. What ACDOCA is (short, link to glossary + table page)
3. Why raw reads fail — dialog processes, memory limits, short dumps (cite SAP Notes)
4. What SAP recommends instead — CDS views, ODP
5. The release CDS view I_JournalEntryItem (details, extension views, Z-fields)
6. Partitioning by BUKRS + GJAHR
7. License awareness — Runtime vs Full Use
8. Conclusion + CTA to the expert walkthrough

**Target queries:**
- "why is SELECT ACDOCA slow"
- "ACDOCA extraction"
- "how to extract Universal Journal"
- "ACDOCA CDS view"

### Article 2: `content/en/articles/sap-runtime-license-trap.md`

**Title:** The SAP Runtime License Trap in Data Extraction

**Length:** 2000-2800 words

**Structure:**
1. Hook: architect plans SLT to Kafka, gets blocked by procurement at the last minute
2. What a Runtime License is vs Full Use (high-level; link to SAP Note if you can find it)
3. What's permitted under each
4. Why SLT is blocked under Runtime — database-layer access
5. Why ODP via CDS views is always safe
6. Fivetran HVR and why it hits the same wall
7. What to ask before architecture decisions
8. Conclusion + CTA to relevant walkthroughs

**Target queries:**
- "SAP Runtime License extraction"
- "can I use SLT Runtime License"
- "SAP license data extraction"
- "Full Use License SAP"

**Important:** Be careful with specific license terms. Link to SAP Notes where possible. Mark uncertain legal claims `[NEEDS_SAP_CITATION]`.

### Article 3: `content/en/articles/acdoca-complete-walkthrough.md`

**Title:** Extracting ACDOCA: A Complete S/4HANA-to-Snowflake Walkthrough

**Length:** 2500-3500 words

**Structure:**
1. Setup: what you'll build, what you need
2. Step-by-step narrative (more prose than the walkthrough; tell the story)
3. Each section mirrors a chunk of the expert walkthrough but as connected narrative
4. Code examples inline (CDS extension, Python, Snowflake DDL)
5. Troubleshooting sidebar
6. Conclusion + next steps

This is the long-form pair to the expert walkthrough. The walkthrough is the checklist; the article is the story.

**Target queries:**
- "extract ACDOCA Snowflake"
- "ACDOCA to cloud guide"
- "S/4HANA financial extraction tutorial"

---

## Shared Structural Rules

Every article:
- Opens with a concrete scenario, not a definition
- Uses H2s in question format where possible (helps LLM citation)
- Internal links to at least 5 other site pages
- External links only to SAP Help or SAP Notes
- Images optional at launch but add alt text if used
- FAQ schema at the end (3-5 Q&A pairs in JSON-LD)
- Reading time calculated honestly (roughly word count / 250)

---

## Frontmatter Example

```yaml
---
title: "Why Reading ACDOCA Directly Breaks Your SAP System"
slug: why-acdoca-breaks-sap
description: "Reading ACDOCA with SELECT * crashes SAP. Here's why, and what CDS views and ODP do instead. Every technical claim cited to SAP Help Portal."
author: "SAP Extract Academy"
publishDate: 2025-01-15
updatedAt: 2025-01-15
readingTimeMinutes: 14
tags:
  - ACDOCA
  - CDS Views
  - Performance
relatedWalkthroughs:
  - expert-acdoca
  - intermediate-bkpf
seoTitle: "Why Reading ACDOCA Directly Breaks Your SAP System"
seoDescription: "ACDOCA is billions of rows. SELECT * crashes SAP. This article explains the problem, the SAP-recommended fix via CDS views and ODP, and partitioning tactics."
---
```

---

## Acceptance Criteria

For each article:

- [ ] Word count in target range
- [ ] Every SAP claim cited
- [ ] At least 5 internal links
- [ ] Uses H2s in question format for key sections
- [ ] FAQ JSON-LD block in the body (or handled by build.js from explicit FAQ frontmatter)
- [ ] No banned words
- [ ] SEO frontmatter complete
- [ ] Links to related walkthroughs
- [ ] No `[NEEDS_SAP_CITATION]` remaining

---

## Open Questions

---

## Completion Notes
