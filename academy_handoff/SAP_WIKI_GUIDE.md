# SAP_WIKI_GUIDE.md — Your Private Karpathy-Style SAP Knowledge Base

Parallel to the public Academy site, you maintain a **private** wiki that Claude Code reads when authoring content. This eliminates hallucinated SAP citations and makes content production 10× faster.

---

## Why This Exists

Your Academy has a strict rule: every SAP claim cites an official SAP Help Portal URL. Enforcing that requires Claude Code to verify every URL for every page. That's slow and error-prone.

Instead: **pre-verify once, reuse forever.**

The private wiki stores canonical SAP knowledge that you (as SME) have verified. When Claude Code writes an ACDOCA walkthrough, it reads your wiki's `ACDOCA.md` article — which already contains verified SAP Help URLs, verified transaction codes, verified technical claims. The walkthrough references the wiki, the wiki references SAP, and Claude Code can't invent URLs because everything is already pre-specified.

---

## Directory Structure

Inside your private repo, alongside `academy_handoff/`:

```
sap_wiki/
├── raw/                          (unprocessed source material)
│   ├── pdfs/                     (SAP Help Portal PDFs you downloaded)
│   │   ├── extensibility_s4hana.pdf
│   │   ├── odp_framework.pdf
│   │   └── slt_replication.pdf
│   ├── clippings/                (Obsidian Web Clipper outputs)
│   │   ├── ODQMON_transaction.md
│   │   └── I_JournalEntryItem_cds.md
│   └── notes/                    (your SME tribal knowledge)
│       └── license_edge_cases.md
├── wiki/                         (Claude Code compiles this from raw/)
│   ├── index.md                  (master cross-reference)
│   ├── tables/
│   │   ├── ACDOCA.md
│   │   ├── VBAK.md
│   │   ├── BSEG.md
│   │   └── ... (one per table)
│   ├── concepts/
│   │   ├── ODP.md
│   │   ├── SLT.md
│   │   ├── CDS_views.md
│   │   ├── CDS_extension_views.md
│   │   ├── Append_structures.md
│   │   └── ... (one per concept)
│   ├── transactions/
│   │   ├── ODQMON.md
│   │   ├── LTRC.md
│   │   ├── LTRS.md
│   │   ├── SE11.md
│   │   ├── SE80.md
│   │   └── ... (one per transaction)
│   ├── licenses/
│   │   ├── runtime_vs_full_use.md
│   │   └── what_slt_requires.md
│   └── troubleshooting/
│       ├── TSV_TNEW_PAGE_ALLOC_FAILED.md
│       └── ... (common errors)
├── changelog.md                  (what changed, when, by whom)
└── CLAUDE.md                     (instructions for Claude Code)
```

---

## Wiki Article Schema

Every `wiki/` article follows this exact structure:

```markdown
---
topic: ACDOCA
type: table
module: FI
verified_date: 2025-04-22
primary_sap_source: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/.../acdoca.html"
related: [BSEG, BKPF, I_JournalEntryItem, ODP, CDS_extension_views]
---

# ACDOCA — Universal Journal

## Summary (paraphrased from SAP docs)

1-2 paragraphs in your own words explaining what this is. Every factual 
claim has a cited source link.

## Key Technical Facts

- **Table type:** Journal entry table (FI)
- **Introduced in:** S/4HANA 1511
- **Typical row count:** 500M-5B+ depending on enterprise size
- **Primary key:** RCLNT, RLDNR, RBUKRS, GJAHR, BELNR, DOCLN
- **Released CDS view:** I_JournalEntryItem ([source](https://help.sap.com/...))
- **Delta capability:** Via ODP on I_JournalEntryItem (annotation 
  @Analytics.dataCategory: #FACT)

## Extraction Paths

1. **ODP via CDS view** (recommended, license-safe)
   - Source: [SAP Help](url)
2. **SLT** (requires Full Use license)
   - Source: [SAP Help](url)
3. **Direct JDBC** (requires Full Use license + HANA access)
   - Source: [SAP Help](url)

## Common Gotchas

- **Partitioning required for initial load** — [SAP Note 2659080](url)
- **Currency translation** — CDS view handles via @Semantics annotations
- **MANDT filtering** — ODP auto-adds client filter, SLT does not by default

## Related Concepts

- [[ODP]] — the framework used for most ACDOCA extractions
- [[CDS_extension_views]] — how to add Z-fields
- [[BSEG]] — the ECC equivalent table (different structure)

## Raw Sources

- `raw/pdfs/finance_data_model.pdf` (pages 247-389)
- `raw/clippings/I_JournalEntryItem_cds.md`
- `raw/notes/acdoca_partition_strategies.md`

## Changelog

- 2025-04-22: Created from SAP Help Portal extraction + SME notes
- 2025-05-10: Added partitioning gotcha from field experience
```

---

## Populating the Wiki — Three Sources

### Source 1: SAP Help Portal PDFs (Highest Quality)

Every SAP product page has a PDF export. These are structured, complete, and high-quality.

**High-value PDFs to download first:**

1. **"Extensibility for SAP S/4HANA"** — Append Structures, CDS Extension Views, Key User Extensibility
2. **"Operational Data Provisioning Framework"** — canonical ODP reference
3. **"SAP Landscape Transformation Replication Server"** — full SLT guide
4. **"ABAP CDS: Core Data Services"** — CDS view reference and annotations
5. **"Finance Data Model"** (S/4HANA) — ACDOCA, BKPF relationships
6. **"Sales and Distribution Data Model"** — VBAK, VBAP
7. **"Material Management Data Model"** — MARA, MATDOC, EKKO/EKPO
8. **"Data Migration to SAP S/4HANA"** (not extraction-focused but covers migration cockpit)
9. **"Authorization Concept"** — S_RFC, S_TABU_DIS, S_ODP_READ details

Download from `help.sap.com/docs/[product]`. Each PDF ranges 200-800 pages.

### Source 2: Obsidian Web Clipper (Targeted Pages)

For individual pages that aren't worth a whole PDF:

1. Install Obsidian Web Clipper browser extension
2. Clip any specific SAP Help page → saves as markdown to a configured folder
3. Move the resulting `.md` file into `sap_wiki/raw/clippings/`

Use for: single transaction pages, specific SAP Notes, narrow concepts not in a product PDF.

### Source 3: Your SME Tribal Knowledge

Things you know from experience that aren't in SAP docs:

- License interpretations from real customer conversations
- Common gotchas you've hit personally
- Workarounds for SAP bugs
- Performance benchmarks from real systems

Keep these in `sap_wiki/raw/notes/`. Mark them clearly as SME knowledge vs SAP-documented. When Claude Code writes content, it can cite SME notes with "based on practitioner experience" instead of a SAP Help URL — appropriate for operational guidance that SAP itself doesn't document.

---

## The Compilation Workflow

### Step 1: Set Up the Wiki Schema

Create `sap_wiki/CLAUDE.md` with wiki-specific rules. This is Claude Code's config file when operating on the wiki (separate from the main `AGENTS.md` that governs Academy authoring).

```markdown
# CLAUDE.md — Instructions for SAP Wiki Maintenance

You are maintaining a private SAP knowledge base in this directory.

## Rules

1. Every article follows the schema in SAP_WIKI_GUIDE.md
2. Every factual claim cites either:
   - A SAP Help Portal URL (verified, not invented)
   - A raw/ source file path
   - An explicit SME note marker
3. Never invent a SAP Help URL. If unsure, mark [VERIFY_WITH_SME]
4. When ingesting a new raw/ file, check if a wiki article already 
   exists for the topic. If yes, update and flag any contradictions. 
   If no, create a new article.
5. Keep articles under 2000 words. Split into multiple articles if 
   longer.
6. Always update wiki/index.md when creating new articles.
7. Always append to changelog.md with what you did.

## Workflow Prompts

### Ingest a new raw source

"Read raw/[path/to/new/file]. Identify the main topics. For each 
topic, check if a wiki article exists. Update or create as needed. 
Flag any contradictions with existing content."

### Compile a new topic from multiple sources

"Compile a wiki article on [topic]. Search all of raw/ for relevant 
content. Cross-reference with existing wiki articles. Produce a 
new file at wiki/[category]/[topic].md following the schema."

### Lint/health check

"Scan the entire wiki. Report: (a) broken cross-references, (b) 
articles without primary_sap_source, (c) contradictions between 
articles, (d) topics mentioned in multiple articles that should 
be consolidated."
```

### Step 2: Process PDFs with Docling

Install once:

```bash
pip install docling
```

Convert each PDF:

```bash
# Single PDF
docling sap_wiki/raw/pdfs/extensibility_s4hana.pdf \
  --to md \
  --output sap_wiki/raw/pdfs_md/extensibility_s4hana.md

# Batch
for pdf in sap_wiki/raw/pdfs/*.pdf; do
  docling "$pdf" --to md --output "sap_wiki/raw/pdfs_md/$(basename "$pdf" .pdf).md"
done
```

**Why Docling and not other tools:**
- Best-in-class table handling (SAP docs are table-heavy)
- Preserves heading hierarchy
- Handles technical code blocks correctly
- Open source (IBM project) — no API limits

Alternative if Docling doesn't work: **Marker** (similar quality, different tradeoffs). Avoid Pandoc for SAP PDFs — its table handling is weak.

### Step 3: Compile with Claude Code

In a fresh Claude Code session:

```
Read CLAUDE.md for wiki-specific rules.

Read all files in sap_wiki/raw/pdfs_md/ that are new since the last 
compilation (check changelog.md for the cutoff date).

For each source:
1. Identify the main topics covered
2. For each topic, check sap_wiki/wiki/ for an existing article
3. If exists: update with any new information, flag contradictions
4. If new: create an article following the schema in SAP_WIKI_GUIDE.md
5. Update sap_wiki/wiki/index.md with new cross-links

After all sources processed:
- Run the lint/health check
- Append entry to sap_wiki/changelog.md
- Show me a summary of new articles and flagged issues
```

### Step 4: Use the Wiki When Authoring Academy Content

When it's time to write a walkthrough:

```
I need to write the ACDOCA Expert walkthrough.

Before you write anything:
1. Read sap_wiki/wiki/tables/ACDOCA.md
2. Read sap_wiki/wiki/concepts/ODP.md
3. Read sap_wiki/wiki/concepts/CDS_extension_views.md
4. Read sap_wiki/wiki/transactions/LTRC.md
5. Read sap_wiki/wiki/licenses/runtime_vs_full_use.md

Now write the walkthrough using ONLY the citations found in those 
wiki articles. Every SAP Help URL you cite must already be 
present in the wiki. If you need a citation that's not in the wiki, 
stop and ask me to add it first.
```

Because all citations come from pre-verified wiki sources, you never get invented URLs in the output.

---

## Wiki Maintenance Cadence

### Weekly (30 min)

- Clip any new SAP Help pages you encountered during the week
- Drop new PDFs into `raw/pdfs/`
- Run Claude Code: "Ingest anything new since [last date]"

### Monthly (1-2 hours)

- Full wiki lint pass
- Check for outdated SAP references (URLs sometimes drift)
- Review and consolidate duplicate articles

### Quarterly (half day)

- Major SAP release review — is there new content from SAP to ingest?
- Re-verify 10 random SAP Help URLs across the wiki to catch link rot
- Archive wiki articles no longer relevant (obsolete transactions, deprecated features)

---

## How This Scales

**Small wiki (~30 articles):** Hand-manage. One Claude Code session can read the whole thing.

**Medium wiki (~100 articles):** Start using the index.md as a routing table. Claude Code reads index first, then loads only the articles it needs.

**Large wiki (~500 articles):** Consider adding embeddings/vector search. This is also when the wiki can feed Studio's code generation. Covered in the Studio architecture, not here.

For Academy Stage 1, you'll likely have 60-80 wiki articles at launch. Stays comfortably in the "medium" tier. No vector DB needed.

---

## Privacy & Licensing

This wiki is **private, for your internal use only**. Legally:

- Storing SAP PDFs in your private repo for personal research and AI-assisted content creation is fair use
- Paraphrasing SAP concepts into your own articles for public distribution (the Academy) is also fine, with attribution
- **Never** republish SAP PDFs publicly
- **Never** copy-paste SAP prose into your Academy content — paraphrase only

Your `CONTENT_RULES.md` already covers the Academy side. The wiki exists between SAP docs and your public content as a disciplined intermediary — exactly what fair use allows.

---

## Integration with Studio (Future)

When you build Studio (Stage 2), the wiki becomes its knowledge source:

1. Every wiki article gets embedded via Google `text-embedding-004`
2. Embeddings stored in Qdrant or pgvector
3. Studio's code generator queries the wiki at runtime: "User wants to extract ACDOCA with Z-fields to Snowflake — what does the wiki say about this combination?"
4. Claude Sonnet generates code using wiki-retrieved context + wiki-verified citations

The wiki you build today for Academy content authoring becomes the retrieval layer for Studio tomorrow. No throwaway work.
