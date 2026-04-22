# ACADEMY_SCOPE.md — What This Training Covers (and What It Doesn't)

**This is a data extraction training site, not SAP functional training.**

The Academy teaches **data engineers, data scientists, and analytics engineers** how to extract SAP data to cloud platforms. It covers the SAP-side technical work needed to make that extraction possible, but nothing about SAP business processes or end-user workflows.

---

## IN SCOPE ✅ — What We Teach

### CDS Views & Extensibility
- How CDS views expose data (released views like `I_JournalEntryItem` for ACDOCA)
- CDS annotations for extractors (`@Analytics.dataExtract`, `@Semantics`)
- Append Structures + CDS Extension Views (how to add Z-fields so they're extractable)
- Why custom CDS views matter for extraction (filtering, join logic, currency conversion)

### Extraction Mechanisms
- **ODP (Operational Data Provisioning)** — the modern extraction framework
- **SLT (SAP Landscape Transformation)** — replication server for real-time delta
- **Classic BW Extractors** (2LIS_*, 0FI_*, etc.) — ECC extraction path
- How each handles delta data, full loads, and incremental updates

### Operations & Monitoring
- **ODQMON** — the delta queue monitor (what's pending, what failed)
- **LTRC** — SLT replication monitoring (lag, errors, status)
- **LTRS** — SLT subscription management
- **SM59** — RFC destination setup (connectivity from extraction tool to SAP)
- **SU01** — user authorization setup for extraction (S_RFC, S_ODP_READ)

### Table Structure & Extraction Gotchas
- **ACDOCA** (Universal Journal in S/4HANA) — why it's massive, how to partition, which fields are slow, why you can't just SELECT *
- **VBAK** (Sales Document Header) — simple extraction but has child tables, delta logic
- **BSEG** (ECC Accounting Documents) — ECC equivalent to ACDOCA, classic BW extractor path
- **MARA** (Material Master) — how Z-fields propagate, change tracking
- Why certain fields require authorization, why some fields are locked, why some change infrequently

### License Implications
- **Runtime Use License** — what extraction methods are allowed
- **Full Use License** — what methods are blocked
- Which tools (SLT, OData, direct JDBC) require which license
- How to validate your license covers your extraction approach

### Screenshots & Demos
- **SE80** — ABAP Development Workbench showing CDS view code and annotations
- **ODQMON** — delta queue status, subscriptions, stuck requests
- **LTRC** — SLT real-time replication status and monitoring
- **SM59** — RFC destination configuration
- **SU01** — user authorization assignment for extraction
- **ODQMON** — transaction code entry, delta queue inspection

---

## OUT OF SCOPE ❌ — What We Don't Teach

### Functional SAP Training
- How to create a purchase order (MM/SD/FI processes)
- How accounts receivable (AR) or accounts payable (AP) works
- Sales & distribution (SD) transaction workflows
- Procurement processes
- Manufacturing (PP) or planning modules
- Any business process training

### End-User Fiori Workflows
- How to use the Fiori Launchpad as a business user
- How to navigate Fiori apps
- How to perform standard business transactions via UI
- User experience or design of Fiori

### SAP Implementation & General Administration
- SAP implementation methodology (ASAP, Activate, etc.)
- Best practices for SAP rollouts
- General SAP Basis administration (not extraction-related)
- System monitoring (only delta queue & replication monitoring in scope)
- Backup/recovery, security hardening, performance tuning
- SAP governance or organizational change management

### Data Modeling Beyond Table Structure
- How to design data marts in BW
- Master data management (MDM) philosophy
- Data quality frameworks
- Dimensional modeling or star schema design
- These are post-extraction concerns

### Business Process Screenshots
- Screenshots showing how an order flows through the system
- How a user navigates Fiori to approve a document
- Workflow approval screens
- GL posting workflows
- Anything that isn't directly related to making data extractable

---

## The Golden Rule

**Every walkthrough answers:** "How do I get this table out of SAP and into my cloud platform, and what do I need to know on the SAP side to make that work?"

If the content doesn't answer that question, it's out of scope.

---

## When You're in Doubt

Ask: **"Would a Basis admin need to understand this to enable extraction, or is this only useful to a business user?"**

- If Basis needs it → **IN SCOPE** (authorization, RFC, ODP config, SLT setup)
- If only business users need it → **OUT OF SCOPE** (how to post a GL entry, how to approve an order)

---

## Examples

### IN SCOPE ✅

"Here's why you can't just SELECT * from ACDOCA — the table is 2 billion rows, it has 500+ fields including time-dependent attributes, currency fields require conversion. Here's the partitioning strategy and the released CDS view that handles it for you."

"To extract BSEG from ECC, you need the classic BW extractor 0FI_ACDOCA_10 (or 0GLFLEXA in newer ECC versions). SLT can replicate it via ODP, or you can use a direct table replication. Here's the authorization the BASIS team needs to grant."

"This Z-field is in an Append Structure on ACDOCA. To extract it, you need to create a CDS Extension View with the Z-field annotated @Semantics.amount.currencyCode. Here's how, and here's what authorization changes are needed."

### OUT OF SCOPE ❌

"Here's how to post a GL entry in transaction FB50." (business user task, not extraction)

"Here's how a purchase order flows through approval workflows." (business process, not extraction)

"Here's how to use the Fiori app to maintain material master data." (end-user Fiori workflow, not extraction)

"Here's SAP's implementation methodology." (governance, not extraction)

---

## For Claude Code — Use This When Authoring Content

When writing walkthroughs, articles, or glossary entries:

1. Read this file (`ACADEMY_SCOPE.md`) before drafting
2. Ask: "Does this help someone extract SAP data or understand why extraction is hard?"
3. If no → don't include it
4. If yes → include it with extraction-focused examples

For screenshots, only capture:
- Code editors (SE80, ADT for CDS views)
- Extraction monitoring (ODQMON, LTRC, LTRS)
- Configuration (SM59, SU01, LTRC replication setup)
- Table structure (SE16N for data preview, SE11 for field definitions)
- NOT business transaction workflows, Fiori apps, or functional processes
