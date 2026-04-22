# DATA_SCHEMA.md — Content Frontmatter Schemas

Shared between Stage 1 (static HTML generator) and Stage 2 (Astro / Next.js). This is the migration contract.

---

## Why Frontmatter

Every content file is markdown with YAML frontmatter. Stage 1 tools read frontmatter to populate HTML templates. Stage 2 frameworks validate it against Zod (Astro) or TypeScript schemas (Next.js MDX).

If the frontmatter is correct in Stage 1, Stage 2 migration is a copy-paste.

---

## Collection 1: Tables

**Path:** `content/en/tables/[code].md` (lowercase)

```yaml
---
code: VBAK
name: "Sales Document Header"
slug: vbak
module: SD                        # SD | MM | FI | CO | PP | MD | HR | LE
businessDescription: "Header record for sales documents (orders, quotations, contracts). One row per sales document."
volumeClass: medium               # small | medium | heavyweight
typicalRowCount: "10M-200M"
primaryKey:
  - MANDT
  - VBELN
releasedCdsView: "I_SalesDocument"    # optional
cdsViewDocUrl: "https://help.sap.com/docs/..."   # optional
sapHelpUrl: "https://help.sap.com/docs/..."       # required
extractionGotchas:
  - summary: "Very large customers may partition VBAK by document type (AUART) or sales organization (VKORG) to manage extraction windows."
    sapNoteOrDocUrl: "https://help.sap.com/..."
availableLevels:
  - beginner
  - intermediate
  - expert
seoTitle: "Extract VBAK from SAP S/4HANA — Complete Guide"
seoDescription: "VBAK is the sales document header in S/4HANA. This guide covers the table, the released CDS view I_SalesDocument, Z-field extensions, and extraction paths."
updatedAt: 2025-01-15
---

Long-form markdown body describing the table in business terms, its key fields, and typical extraction considerations.
```

---

## Collection 2: Walkthroughs

**Path:** `content/en/walkthroughs/[level]/[table].md`

```yaml
---
table: ACDOCA
level: expert                     # beginner | intermediate | expert
slug: acdoca                      # matches table slug
title: "Extract the Universal Journal at Scale"
summary: "End-to-end walkthrough for extracting ACDOCA from S/4HANA to Snowflake with partitioning, Z-fields, and license awareness."
estimatedMinutes: 45
prerequisites:
  - "Intermediate BKPF walkthrough completed, or equivalent experience"
  - "Access to an S/4HANA system with SE11 and ODQMON authorization"
licenseRelevance: "Full Use License required for SLT path. ODP path works under Runtime."
destinations:
  - Snowflake
  - ADLS
extractors:
  - SLT
  - Python
steps:
  - id: step-01
    title: "Confirm the released CDS view for ACDOCA"
    explanation: "Before extracting, check whether SAP ships a released CDS view for this table. Released views come with business logic and authorization built in."
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → Package Z_ACADEMY"
      helpUrl: "https://help.sap.com/docs/..."
    verify: "You find I_JournalEntryItem in the CDS views list with annotation @Analytics.dataExtract: true."
    whyItMatters: "Reading ACDOCA raw is slow and breaks business rules. The CDS view enforces posting date ranges, authorization, and currency translation automatically."
  # ... more steps
troubleshooting:
  - problem: "Extraction times out during initial load"
    solution: "Partition by BUKRS + GJAHR and run parallel jobs. See LTRS advanced replication settings."
    sapNoteUrl: "https://launchpad.support.sap.com/#/notes/..."
nextSteps:
  - label: "Read the ACDOCA deep dive article"
    url: "/articles/why-acdoca-breaks-sap/"
  - label: "Try the BKPF expert walkthrough"
    url: "/walkthrough/expert/bkpf/"
seoTitle: "Extract ACDOCA to Snowflake (Expert) — S/4HANA Walkthrough"
seoDescription: "Step-by-step walkthrough for extracting the Universal Journal (ACDOCA) from S/4HANA to Snowflake at enterprise volume. CDS views, Z-fields, partitioning, license awareness."
updatedAt: 2025-01-15
---

Markdown body: scenario intro (2-3 paragraphs before the steps render), "What you've built" summary (after steps).
```

**Important:** walkthrough content lives in the `steps` array in frontmatter, not the markdown body. The body is used only for the scenario intro and the summary. Stage 1 templates render each step as a discrete section; Stage 2 framework components map 1:1.

---

## Collection 3: Glossary

**Path:** `content/en/glossary/[term].md` (term slug, lowercase, hyphens)

```yaml
---
term: ODP
fullName: "Operational Data Provisioning"
slug: operational-data-provisioning
shortDefinition: "SAP's framework for exposing data to external consumers. Supports full and delta extraction with built-in recovery and monitoring."
relatedTerms:
  - odqmon
  - cds-view
  - delta
sapDocUrl: "https://help.sap.com/docs/..."
seoTitle: "ODP: Operational Data Provisioning in SAP — Plain Explanation"
seoDescription: "What is ODP in SAP? Operational Data Provisioning is SAP's framework for exposing data to external consumers with full and delta extraction."
---

Extended markdown body: paragraph-level explanation with examples, use cases, and related concepts.
```

---

## Collection 4: Articles

**Path:** `content/en/articles/[slug].md`

```yaml
---
title: "Why Reading ACDOCA Directly Breaks Your SAP System"
slug: why-acdoca-breaks-sap
description: "Reading ACDOCA with SELECT * crashes SAP's dialog processes. This article explains why, and what to do instead using CDS views and ODP."
author: "SAP Extract Academy"
publishDate: 2025-01-15
updatedAt: 2025-01-15
readingTimeMinutes: 12
tags:
  - ACDOCA
  - CDS Views
  - Performance
heroImage: "/assets/images/acdoca-hero.png"       # optional
relatedWalkthroughs:
  - expert-acdoca
  - intermediate-bkpf
seoTitle: "Why Reading ACDOCA Directly Breaks Your SAP System"
seoDescription: "ACDOCA is billions of rows. SELECT * crashes SAP. Here's what to do instead: CDS views, ODP, and partitioning. Cited to SAP Help Portal throughout."
---

Full article body in markdown.
```

---

## Collection 5: Roadmap

**Path:** `content/en/roadmap/phase-[n].md`

```yaml
---
phase: 2
source: "ECC 6.0"
slug: ecc
status: planned                    # current | next | planned
expectedMonth: "Month 4-5"
rationale: "Classic SAP ERP still runs 40% of the SAP installed base."
whatShips:
  - "BW Extractors via ODP"
  - "SLT for ECC (same LTRC transaction as S/4HANA)"
  - "Tables: BSEG, MATDOC, EKKO, EKPO"
  - "New transactions: RSA5, RSA6, RSA7"
---

Body content (optional) expanding on the phase.
```

---

## Site Strings (`strings/en.json`)

Non-content UI strings are centralized:

```json
{
  "nav.home": "Home",
  "nav.tables": "Tables",
  "nav.walkthroughs": "Walkthroughs",
  "nav.glossary": "Glossary",
  "nav.articles": "Articles",
  "nav.roadmap": "Roadmap",
  "nav.about": "About",
  "cta.pickTable": "Pick a table",
  "cta.readAcdocaDeepDive": "Read the ACDOCA deep dive",
  "cta.startWalkthrough": "Start the walkthrough",
  "cta.subscribeEmail": "Subscribe",
  "cta.emailPlaceholder": "you@example.com",
  "cta.downloadPdf": "Download PDF checklist",
  "cta.resetProgress": "Reset progress",
  "form.emailLabel": "Email address",
  "form.consentText": "By subscribing you agree to receive occasional emails about platform updates. Unsubscribe anytime.",
  "walkthrough.stepCountTemplate": "Step {{current}} of {{total}}",
  "walkthrough.progressCompleteTemplate": "{{completed}} of {{total}} complete",
  "walkthrough.verifyLabel": "Verify",
  "walkthrough.whyLabel": "Why this matters",
  "walkthrough.doThisInSapLabel": "Do this in SAP",
  "walkthrough.troubleshootingHeading": "Troubleshooting",
  "walkthrough.nextStepsHeading": "What's next",
  "glossary.relatedTermsLabel": "Also see",
  "glossary.sapDocLabel": "SAP documentation",
  "footer.disclaimer": "SAP, S/4HANA, and related terms are trademarks of SAP SE. This site is an independent educational resource and is not affiliated with, endorsed by, or sponsored by SAP SE. All references to SAP documentation link to the original source on sap.com.",
  "footer.copyright": "© {{year}} SAP Extract Academy"
}
```

For Stage 2, a parallel `strings/de.json` will mirror these keys.

---

## localStorage Schema (Client-Side)

For the walkthrough checklist:

```json
{
  "sapExtractAcademy.checklist": {
    "expert-acdoca": {
      "completed": ["step-01", "step-02", "step-05"],
      "startedAt": "2025-01-15T09:15:00Z",
      "lastUpdated": "2025-01-15T10:30:00Z"
    }
  }
}
```

Key: `sapExtractAcademy.checklist`. Nested by walkthrough ID (`<level>-<table>`).

---

## Buttondown Embed

The email form posts to Buttondown's public embed endpoint — no auth needed in client code:

```
POST https://buttondown.email/api/emails/embed-subscribe/<USERNAME>
Content-Type: application/x-www-form-urlencoded
email=reader@example.com
```

The `<USERNAME>` is stored as a build-time placeholder. At Stage 1, replace it manually in `templates/base.html`. At Stage 2, use an environment variable.
