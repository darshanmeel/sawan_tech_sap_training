# Design: Core SAP Data Extraction Guide Article

**Date:** 2026-04-23  
**Scope:** Create flagship "How to Extract Any SAP Data" article + LinkedIn post + replace Decide button with notification signup  
**Status:** Design approved, ready for implementation

---

## Overview

A comprehensive, navigational guide article that teaches visitors **how to use this website to extract any SAP table**. The article uses ACDOCA (GL extraction via ODP) and VBAK (Sales Orders extraction via SLT) as concrete examples, showing users the complete journey from "I need to extract data" to "data lands in my cloud warehouse."

The article serves as the **main pinned resource** explaining what the site does and how it helps users extract SAP data to any system.

---

## Article Structure & Content

### 1. Opening Section (200 words)
- **What this site teaches:** 
  - How to extract SAP data to any target system (S3, Snowflake, Databricks, etc.)
  - Three extraction methods: ODP (batch), SLT (real-time), RFC (custom)
  - Patterns from beginner (one-time extract) to enterprise (billions of rows, sub-minute latency)
  - Tool-agnostic guidance (works with ADF, Python, Fivetran, etc.)

- **What this site doesn't cover:**
  - Post-extraction data modeling or transformations
  - Custom connectors or non-standard extraction methods
  - SAP Analytics Cloud or embedded analytics
  - ECC-only tables (focused on S/4HANA, with ECC addendums)

### 2. Decision Framework Section (300 words)
**"How to choose your extraction method"**

Presented as a simple decision matrix:
- **ODP:** Best for batch extractions, any volume with proper partitioning, scheduled loads. No special license required (Runtime license OK). Tools: Fivetran, ADF, Databricks, Python.
- **SLT:** Best for real-time delta, sub-5-minute latency, continuous streaming. Requires Full Use license. Tools: Kafka, Snowflake connectors, cloud storage (S3, ADLS).
- **RFC:** Legacy, rarely recommended for new projects. Mentioned for completeness; not covered in depth.

Visual comparison table: method vs. use case vs. license vs. complexity.

Links to full method articles for deeper study.

### 3. ACDOCA Extraction Path (600 words)
**"Extracting Your First GL Dataset"**

**Why ACDOCA matters:**
- The Universal Journal: every GL posting, cost allocation, controlling entry
- Largest table in enterprise SAP (billions of rows)
- Licensing trap: must validate Full Use vs. Runtime before choosing method

**The ODP approach (recommended for ACDOCA):**
- What ODP does: Operational Data Provisioning, SAP's standard extraction framework
- Why ODP for ACDOCA: No special license, scales to 500M+ rows per partition with proper strategy
- Key constraint: Must partition by Company Code (BUKRS) + Fiscal Year (GJAHR)
- Reconciliation: SE16N row counts must match your target

**Example: Extract 2024 ACDOCA to Databricks + S3**
- SAP-side: Create extraction user, verify CDS view I_JournalEntryItem, count rows
- Databricks-side: Connect to SAP ODP via OData API, extract in parallel partitions
- S3 destination: Raw zone landing (Parquet), partitioned by BUKRS/GJAHR
- Expected timing: 100M rows ≈ 4 hours, 500M rows ≈ 12 hours

**Other tool options:**
- Azure Data Factory (RFC or OData connector)
- Fivetran ODP connector
- Custom Python/pyrfc script
- Airbyte

**What comes next:**
- Link to full ACDOCA walkthrough (beginner: single partition, intermediate: multi-partition, expert: SLT real-time)
- Link to licensing article (Runtime vs. Full Use trap)
- Link to reconciliation patterns article

### 4. VBAK Extraction Path (600 words)
**"Extracting Real-Time Sales Orders"**

**Why VBAK matters:**
- Sales Orders header: every sales transaction
- Moderate volume (typically 10M–100M rows)
- Often needed for real-time analytics (order-to-cash visibility)

**The SLT approach (recommended for real-time VBAK):**
- What SLT does: SAP Landscape Transformation, real-time replication with continuous delta
- Why SLT for VBAK: Sub-5-minute latency, continuous sync, full-load + delta in one setup
- License requirement: Full Use required (this is the hard constraint)
- Partition strategy: By Sales Org (VKORG) + Distribution Channel (VTWEG) for parallel readers

**Example: Stream VBAK to Databricks + S3 with sub-5-minute lag**
- SAP-side: Verify Full Use license, create SLT replication object, configure 4–8 parallel readers
- Kafka connector: SLT pushes delta to Kafka topic in real-time
- Databricks: Kafka source → structured streaming → S3 (bronze/silver layers)
- S3 destination: Bronze (raw), Silver (deduplicated), Gold (business-ready)
- Expected: Full load 2–4 hours, delta within 5 minutes

**Other tool options:**
- Snowflake connector (SLT → Snowflake directly)
- Custom Kafka consumers (Go, Python, Rust)
- Cloud storage (Azure ADLS Gen2, Google Cloud Storage)
- Real-time CDPs (Segment, mParticle)

**What comes next:**
- Link to full VBAK walkthrough (beginner: one-time load, intermediate: scheduled batch, expert: real-time SLT)
- Link to SLT licensing article
- Link to data quality/reconciliation for streaming article

### 5. Licensing & Common Pitfalls (300 words)
**"How to avoid the expensive mistakes"**

**Licensing trap:**
- ODP via OData API: Runtime license OK
- SLT replication: Full Use license required (not Runtime)
- Mistake: Designing architecture without confirming license type first

**Common pitfalls:**
- ACDOCA without partitioning → memory exhaustion, finance users locked out
- SLT without Full Use license → audit findings, retroactive licensing costs
- Raw ACDOCA extract → authorization failures, incomplete data
- No reconciliation → silent data quality issues

**How to validate:**
- Check SAP license in SLICENSE transaction
- Get written confirmation from SAP licensing team before architecture design
- Run reconciliation after every extract (SE16N row count match)

### 6. Notification Signup (100 words)
**"Get new walkthroughs first"**

Replace the current "Decide" button with an email signup for new article notifications.

CTA: "We publish new extraction patterns every 2 weeks (ACDOCA expert, BKPF intermediate, etc.). Get notified first."

**Why:** Keeps readers returning for latest walkthroughs, builds engaged community.

---

## LinkedIn Post

**Format:** Carousel (5 slides) + single post format for cross-posting

**Slide 1:** Hook
"Extracting SAP data is 80% decision-making, 20% execution. Know which method before you start 🎯"

**Slide 2:** The Problem
"Most teams design their extraction architecture AFTER confirming their license.
→ Costs $100k+ in retroactive licensing."

**Slide 3:** The Solution
"Three extraction methods. Five decision points. Pick the right one on day one.
ODP for batch. SLT for real-time. Know the licensing trap."

**Slide 4:** Examples
"ACDOCA (GL): ODP → Databricks/S3 (no special license, 12 hours for 500M rows)
VBAK (Sales): SLT → Kafka/S3 (real-time, requires Full Use license)"

**Slide 5:** CTA
"Master any SAP extraction with our free guide.
Link in comments 👇 sawan-tech.com/extract"

---

## Feature Changes: Replace Decide Button

**What to remove:**
- `/content/en/decide.md` page
- `decide.js` interactive decision tree widget
- Navigation link to Decide page

**What to add:**
- Email notification signup form (replaces Decide button position on landing page)
- Form fields: email + optional (table name they want to extract)
- Backend: Capture to subscriber list (Mailchimp, Brevo, or internal list)
- Confirmation: "Thanks! You'll hear from us every 2 weeks with new walkthroughs"

**Where:** Landing page, article footer, after each walkthrough

---

## Navigation & Links

**Internal links throughout article:**
- ACDOCA walkthrough (beginner, intermediate, expert)
- VBAK walkthrough (beginner, intermediate, expert)
- Licensing article (Runtime vs. Full Use)
- Reconciliation article
- ODP glossary term
- SLT glossary term
- BUKRS/GJAHR/VKORG/VTWEG table field explanations
- SE16N SAP transaction reference
- Alternative tools comparison

**External links:** None required (self-contained)

---

## Content Principles

1. **No "training" keyword** — Use "walkthroughs," "extraction patterns," "guides," "academy"
2. **Concrete examples** — Every method shown with ACDOCA/VBAK + tool/destination
3. **Licensing honesty** — Licensing constraints clearly marked upfront
4. **Tool agnostic** — Default to Databricks/S3, but name 3–4 alternatives per example
5. **Link to depth** — Article is overview; walkthroughs have the detailed steps
6. **Reconciliation first** — Every section mentions validation/row count matching

---

## Success Criteria

✅ Visitor lands on article → understands three extraction methods  
✅ Visitor picks ACDOCA → sees ODP path with Databricks/S3 + alternative tools  
✅ Visitor picks VBAK → sees SLT path with real-time example + licensing warning  
✅ Visitor signs up for notifications → receives new walkthroughs every 2 weeks  
✅ LinkedIn post drives backlinks → CTA links to article  
✅ Decide button removed → notification signup in its place  

---

## Implementation Tasks

1. Write core article (ACDOCA section, VBAK section, framework)
2. Update landing page: remove Decide button, add notification signup form
3. Remove `/decide.md` page and decide.js script
4. Write LinkedIn post (carousel + single post)
5. Test all internal links (walkthroughs, articles, glossary)
6. Update navigation menu (remove Decide, add link to core article)
7. Commit and push

---

## Questions for User Review

- Does the article structure flow logically for a first-time visitor?
- Are ACDOCA (ODP) + VBAK (SLT) the right example pair, or should we swap/change one?
- Should the notification signup form ask for optional metadata (e.g., "which table do you want to extract?") or keep it simple (email only)?
- Any other tools we should prioritize in the "alternatives" lists besides ADF, Fivetran, Kafka, Snowflake?
- Should the LinkedIn post be a 5-slide carousel, or would a single long-form post work better for your audience?
