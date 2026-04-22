---
code: ACDOCA
name: "Universal Journal"
slug: acdoca
module: FI
businessDescription: "Universal Journal (subledger, costing, and line-item accounting). Billions of rows; consolidated view of all postings across all document types."
volumeClass: heavyweight
typicalRowCount: "1B-100B"
primaryKey:
  - MANDT
  - RBUKRS
  - RYEAR
  - POPER
  - BELNR
  - DOCLN
releasedCdsView: "I_JournalEntryItem"
cdsViewDocUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/journal-entry-item-cds.html"
sapHelpUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/universal-journal.html"
extractionGotchas:
  - summary: "ACDOCA is the largest table in S/4HANA. Extracting the entire table will timeout. Always partition by RYEAR (reporting year) and POPER (period) at minimum."
    sapNoteOrDocUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/acdoca-partitioning.html"
  - summary: "Raw SELECT * on ACDOCA crashes SAP dialog work processes due to memory exhaustion. Use the released CDS view I_JournalEntryItem instead, or apply row-level filtering with SLT/ODP."
    sapNoteOrDocUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/acdoca-perf.html"
  - summary: "ACDOCA consolidates all accounting: G/L, A/P, A/R, costing, profitability. Each posting appears once with multiple dimensions. Aggregation logic is business-rule dependent."
    sapNoteOrDocUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/acdoca-design.html"
  - summary: "Full Use License required for SLT replication of ACDOCA. ODP extraction (recommended) works under Runtime License. Verify your licensing with SAP before committing to SLT."
    sapNoteOrDocUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/slt-licensing.html"
availableLevels:
  - beginner
  - intermediate
  - expert
seoTitle: "Extract ACDOCA Universal Journal from SAP S/4HANA — Expert Guide"
seoDescription: "ACDOCA is the largest table in S/4HANA (Universal Journal). Learn extraction strategies for billions of rows: partitioning, licensing, CDS views, and performance tuning."
updatedAt: 2026-04-22
---

ACDOCA is the Universal Journal table in SAP S/4HANA, storing consolidated line-item accounting postings across all modules: G/L, A/P, A/R, costing, and profitability. The table is often the largest in S/4HANA installations, with billions of rows accumulated over years. It's the source of truth for financial analytics, audit trails, and balance sheet reconciliation.

ACDOCA extraction is the centerpiece of data warehouse projects but requires disciplined engineering because naive "SELECT *" queries crash SAP systems. Successful extraction depends on partitioning strategy (by fiscal year and period), use of released CDS views, and careful load balancing across parallel jobs.

<a href="https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/universal-journal-overview.html">SAP S/4HANA Universal Journal overview</a> documents the complete design. The <a href="https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/acdoca-arch.html">ACDOCA architecture guide</a> is mandatory reading if you're extracting more than a few years of data. Always use <code>I_JournalEntryItem</code> (the released CDS view) rather than raw ACDOCA — it enforces authorization, applies currency conversion, and protects against accidental full-table scans.
