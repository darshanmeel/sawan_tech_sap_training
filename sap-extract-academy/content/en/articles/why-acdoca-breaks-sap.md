---
title: "Why Reading ACDOCA Directly Breaks Your SAP System"
slug: why-acdoca-breaks-sap
publishDate: 2026-04-22
readingTimeMinutes: 8
author: "SAP Extract Guide"
summary: "ACDOCA is the universal journal—billions of rows, complex structure, and a raw SELECT * will exhaust memory and lock the system. Learn why direct reads are dangerous and what to extract instead."
relatedWalkthroughs:
  - slug: acdoca
seoTitle: "Why Reading ACDOCA Directly Breaks SAP Systems — Extraction Guide"
seoDescription: "ACDOCA raw reads crash SAP systems. Learn the architecture, why SELECT * fails, and the safe extraction patterns for GL data at scale."
updatedAt: 2026-04-22
---

ACDOCA—the universal journal—is the ultimate accounting table. Every accounting entry, every GL posting, every consolidation adjustment in S/4HANA lives there. For a large enterprise, ACDOCA contains billions of rows: 5 billion, 10 billion, sometimes more. It's also the most dangerous table to extract from. A single mistake—a naive SELECT * or a missing WHERE clause—can bring your SAP system down for hours.

This article explains why ACDOCA is so dangerous, what happens when you read it wrong, and the safe patterns to extract GL data at scale.

## The Table Structure Problem

ACDOCA is organized by fiscal period (POPER) and fiscal year (RYEAR), with entries for each company code (BUKRS). But the table doesn't just store raw GL postings. It contains multiple types of entries:

- **Line items** from all modules: FI (General Ledger), CO (Controlling), MM (Materials Management), SD (Sales & Distribution), HR (Human Resources)
- **Consolidation entries**: entries created by consolidation runs, not actual transactions
- **Ledger variants**: ACDOCA stores data for multiple accounting ledgers (Leading Ledger, Extension Ledgers), multiplying cardinality
- **Multiple fiscal versions**: corrections, reversals, and amendments create additional rows

A transaction in VBAK (sales order) becomes 5-10 GL postings in ACDOCA. A cost allocation in CO spawns 100+ postings. A consolidation journal entry can generate thousands of ledger lines. The math compounds: 100M sales orders → 500M GL postings. 1000 cost allocations → 100k GL lines. One consolidation run → 1M adjustment entries.

For a mid-sized enterprise with 5 years of history, ACDOCA contains 2-5 billion rows. For a large multinational, 10-20 billion. Reading all rows—without filtering—means allocating enough memory to hold billions of records on the SAP application server. It can't.

## What Happens When You SELECT *

When a naive extraction attempts SELECT * FROM ACDOCA without filters, SAP's application server tries to fetch all rows into memory. The process works like this:

1. **Memory Allocation**: SAP allocates a work area large enough to hold the first batch of rows (typically 10k-100k rows, depending on row size).
2. **First Batch Success**: The first 1M rows stream through the network to your extraction tool. The system is fine.
3. **Second Batch**: The second 1M rows are fetched. Memory usage doubles.
4. **Cascade**: As the process continues, memory consumption spirals. SAP has allocated 100GB of work memory for this one extraction. The dialog user trying to post a GL entry needs work memory too. The system slows.
5. **Collapse**: When work memory hits the limit (~4-8GB per work process on typical systems), SAP throws **TSV_TNEW_PAGE_ALLOC_FAILED**—"Cannot allocate memory." The extraction dies.

Meanwhile, the SAP database cursor holding the table scan locks millions of rows. Other GL posting transactions queue waiting for locks. Finance users can't close the period. The whole accounting close process stops.

## Why Partitioning Is Mandatory

This is why the expert ACDOCA walkthrough mandates partitioning by BUKRS (company code) and GJAHR (fiscal year). Partitioning isn't optional; it's the difference between a 2-hour extraction and a system crash.

By extracting one company code and fiscal year at a time—RBUKRS='1000' AND RYEAR=2024—you reduce the row set from 5 billion to 100M. A 100M-row extraction fits in work memory. You extract partition 1, then partition 2, looping through all partitions in sequence (or in parallel with SLT's LTRS readers). The total extraction time is the same, but each individual extraction is bounded and safe.

Without partitioning, even the ODP extractor (which is optimized for large tables) will timeout or exhaust memory if you try to extract 5 billion rows at once.

## The CDS View Solution

SAP published the released CDS view **I_JournalEntryItem** as the safe way to extract ACDOCA data. This view:

- **Enforces authorization**: You see only GL entries your user role is allowed to see
- **Applies currency conversion**: Currency fields are pre-converted to your local/group currency
- **Hides complexity**: The view shields you from ACDOCA's internal structure (consolidation entries, ledger variants, etc.)
- **Includes optimizations**: The view includes database hints and field selections that prevent memory exhaustion

When you extract via I_JournalEntryItem with ODP, you're not touching raw ACDOCA. You're querying a materialized, optimized view that SAP maintains. It's safe.

But even I_JournalEntryItem is dangerous at scale. A single query requesting 5 billion journal entries still causes memory exhaustion. This is why the intermediate walkthrough limits extraction to one company + one fiscal year, and why the expert walkthrough uses SLT (which parallelizes across partitions).

## The SLT Escape Hatch

SLT (SAP Landscape Transformation) solves the memory problem by partitioning at the SAP level. When you configure SLT to replicate ACDOCA with BUKRS+GJAHR partitioning and 4-8 parallel readers, each reader handles one partition independently:

- Reader 1 extracts RBUKRS='1000' AND RYEAR=2024
- Reader 2 extracts RBUKRS='1001' AND RYEAR=2024
- Reader 3 extracts RBUKRS='2000' AND RYEAR=2024
- And so on

Each reader consumes 100M rows of memory, not 5B. The total extraction time remains 24-72 hours (depending on data volume), but the system never crashes because no single reader exceeds memory limits. The parallel readers also distribute lock contention across multiple database cursors, reducing blocking on GL posting transactions.

This is the reason SLT is licensed separately and required for enterprise GL extraction: it's not just an extraction tool, it's a safety mechanism that keeps your finance system operational during multi-day bulk loads.

## The Hidden Cost of Not Filtering

Many extraction failures stem from subtle filtering mistakes. Consider this scenario:

You extract ACDOCA successfully for company 1000, fiscal year 2024 (100M rows). Then a user asks: "Can you give me the last 5 years of data?" You modify the WHERE clause to remove GJAHR=2024, hoping to get all years at once.

Your query now tries to read 500M rows (100M × 5 years). It still fails—memory exhaustion—but this time because you removed a critical partition key.

The rule: **always partition on BUKRS+GJAHR (or RYEAR+POPER if you prefer fiscal period granularity).** Never extract more than one fiscal year of one company at a time. If you need 5 years of 10 companies, extract 50 partitions, looping or parallelizing. The extraction takes the same calendar time, but each partition stays under memory limits.

## Real-World Incident: The Consolidation Run That Broke GL

A real example: A multinational runs consolidation at month-end, posting 2M adjustment entries to ACDOCA. A junior data engineer, testing a new extraction, forgets the RYEAR filter and runs:

```sql
SELECT * FROM ACDOCA WHERE BUKRS = '1000'
```

The system tries to fetch 10 years × 12 months × 1000 companies of GL data—billions of rows. Within 5 minutes, SAP hits memory limits. The extraction process hangs and locks the ACDOCA table. Finance staff trying to post GL documents get "table is locked" errors. The accounting close stalls.

The DBA has to kill the extraction process (20 minutes), clear locks (10 minutes), and restart the system (15 minutes). 45 minutes of finance downtime. Auditors later ask: "Why was the GL unavailable during month-end close?" Root cause: missing partition filter.

This exact scenario has shut down finance operations at hundreds of enterprises. It's why this lesson is emphasized so heavily in the academy: partitioning is not optional; it's the difference between a smooth extraction and a financial crisis.

## The Right Way Forward

To extract ACDOCA safely:

1. **Use a released CDS view** (I_JournalEntryItem), not raw ACDOCA
2. **Partition by BUKRS + GJAHR** (always, every time)
3. **Use ODP delta** for ongoing extraction (incremental changes, not full replication)
4. **Use SLT with LTRS parallelism** if you need enterprise-scale, real-time streaming
5. **Monitor ACDOCA growth** (track partition sizes; if one partition exceeds 500M rows, sub-partition further by cost center or posting period)

These patterns apply to every large SAP table. BKPF (document header), EKPO (purchase order lines), VBRK (billing), LIPS (delivery items)—all are dangerous at scale. The extraction patterns you learn on ACDOCA transfer to any enterprise table.

Master ACDOCA extraction, and you've mastered the hardest problem in SAP data engineering.
