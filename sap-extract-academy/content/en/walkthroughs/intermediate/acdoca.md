---
table: ACDOCA
level: intermediate
slug: acdoca
title: "Extract ACDOCA One Company/Year via ODP (Intermediate)"
summary: "Partial ACDOCA extraction (one company code, current fiscal year) via ODP and the released CDS view I_JournalEntryItem. Avoids raw table pitfalls. Python/Snowflake."
estimatedMinutes: 90
prerequisites:
  - "Completed any Intermediate walkthrough"
  - "Understanding of ACDOCA size/complexity from table overview"
licenseRelevance: "All licenses. ODP is application-layer, works under Runtime License."
destinations:
  - Snowflake
extractors:
  - Python
steps:
  - id: step-01
    title: "Confirm ACDOCA is massive"
    explanation: "Use <a href='/glossary/acdoca/'>ACDOCA</a> SE16N to count rows in one company code for one fiscal year. Budget 2-4 hours for extraction if rows exceed 100M."
    sapTransaction:
      code: SE16N
      menuPath: "Execute → ACDOCA, filter RBUKRS='1000' AND RYEAR=2024"
      helpUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/SE16N.html"
    verify: "You know the row count for your partition. If > 500M, move to Expert walkthrough."
  
  - id: step-02
    title: "Use I_JournalEntryItem CDS view (NOT raw ACDOCA)"
    explanation: "Raw SELECT * on ACDOCA crashes SAP. Always use <a href='https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/journal-entry-item-cds.html'>I_JournalEntryItem</a>, which enforces authorization and applies currency conversion."
    sapTransaction:
      code: SE80
      menuPath: "Search → I_JournalEntryItem"
      helpUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/SE80.html"
    verify: "CDS view exists with @Analytics.dataExtract: true."
  
  - id: step-03
    title: "Extract with fiscal year + company code filters"
    explanation: "Python/pyrfc with ODP. Filter: RBUKRS='1000' AND RYEAR=2024. Set timeouts high (60 min) because ACDOCA is slow even with filters."
    codeBlock:
      language: python
      content: |
        filter_str = "(RBUKRS='1000' AND RYEAR=2024)"
        result = conn.call('RFC_ODP_READ', ..., FILTER=filter_str, ROWCOUNT=1000000)
      caption: "Filtered ODP extraction"
    verify: "Extraction completes. Logs show 'Fetched X million rows'."
  
  - id: step-04
    title: "Stream to Snowflake to avoid memory issues"
    explanation: "Don't load all rows into Python memory. Stream in batches of 100K rows, upsert to Snowflake in micro-batches."
    verify: "Snowflake table fills incrementally. Monitor via Snowflake query history."
  
  - id: step-05
    title: "Reconcile with BKPF totals"
    explanation: "Sum amounts in ACDOCA (by company, year) and compare to BKPF aggregates. They should match (within rounding)."
    codeBlock:
      language: sql
      content: |
        SELECT SUM(AMOUNT_DEBIT) FROM ACDOCA WHERE RBUKRS='1000' AND RYEAR=2024
        -- should match manual BKPF total for same company/year
      caption: "Reconciliation query"
    verify: "Totals match within 0.01%."

troubleshooting:
  - problem: "ODP extraction times out after 2 hours"
    solution: "ACDOCA partition is > 500M rows. Use the Expert walkthrough with SLT instead."
  
  - problem: "I_JournalEntryItem CDS view is slow (> 200M rows)"
    solution: "Add posting period filter: AND POPER >= '001' AND POPER <= '012' to further narrow range."

nextSteps:
  - label: "Try ACDOCA Expert for ultra-large extractions"
    url: "/walkthrough/expert/acdoca/"
  - label: "Table overview: ACDOCA Universal Journal"
    url: "/tables/acdoca/"

seoTitle: "Extract ACDOCA One Company/Year via ODP — S/4HANA Intermediate"
seoDescription: "Intermediate ACDOCA extraction: one company, one fiscal year via ODP and I_JournalEntryItem CDS view. Avoids raw table memory exhaustion."
updatedAt: 2026-04-22
---

## Scenario

Your finance team needs ACDOCA data for year-end close analytics. You'll extract one company, one fiscal year — enough for meaningful analysis without hitting system limits. This walkthrough teaches the safe approach; the Expert walkthrough scales to multi-year, multi-company via SLT.

Estimated time: 90 minutes (depends on partition size).

---

## What you've built

You've successfully extracted ACDOCA without crashing SAP. You used the released CDS view (which every SAP professional should), streamed data to avoid memory exhaustion, and reconciled totals. This is the correct, professional approach to ACDOCA extraction.

When you need more years or companies, the Expert walkthrough scales these patterns via SLT and Kafka.
