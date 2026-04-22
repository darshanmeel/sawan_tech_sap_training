---
table: ACDOCA
level: intermediate
slug: acdoca
title: "Extract ACDOCA One Company/Year via ODP (Intermediate)"
summary: "SAP-side intermediate guide for ACDOCA extraction. Focuses on confirming the I_JournalEntryItem CDS view, understanding ODP delta queue behavior, monitoring with ODQMON, and SE16N reconciliation for a single fiscal year partition."
estimatedMinutes: 90
prerequisites:
  - "Completed any beginner walkthrough"
  - "Understanding of ACDOCA table structure from the ACDOCA beginner walkthrough or table overview"
  - "SE16N shows you know your partition row count"
licenseRelevance: "ODP extraction via OData is permitted under Runtime and Full Use licenses. License trap: Runtime vs Full Use →"
destinations:
  - Generic
extractors:
  - ODP
method: odp
seoTitle: "Extract ACDOCA One Company/Year via ODP — SAP-Side Intermediate"
seoDescription: "SAP-side intermediate guide for ACDOCA extraction. ODQMON delta queue behavior, CDS view validation, ODP first-delta gotcha, SE16N reconciliation."
steps:
  - id: step-01
    title: "Confirm ACDOCA partition size in SE16N"
    explanation: 'Before running any extraction, use <a href="https://help.sap.com/">SE16N</a> to count rows for your intended partition. Filter on RBUKRS (company code) and RYEAR (fiscal year). If the count exceeds 500M rows for a single partition, move to the Expert walkthrough — that volume requires SLT or sub-partition strategies not covered here.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → ACDOCA → Filter RBUKRS='1000' AND RYEAR=2024 → Count"
      helpUrl: "https://help.sap.com/"
    verify: "Row count is below 500M. Write it down for reconciliation."

  - id: step-02
    title: "Confirm I_JournalEntryItem CDS view and delta annotation"
    explanation: 'In <a href="https://help.sap.com/">SE80</a>, open I_JournalEntryItem and inspect the annotations. For delta extraction you need <code>@Analytics.dataExtraction.delta.changeDataCapture.automatic: true</code>. If that annotation is absent, the view supports only full-load extraction — delta will not work.'
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → I_JournalEntryItem → Annotations"
      helpUrl: "https://help.sap.com/"
    verify: "I_JournalEntryItem has @Analytics.dataExtract: true. Check for the delta changeDataCapture annotation. If absent, confirm with your Basis team whether a support package is needed to enable it."
    whyItMatters: "If you run a delta extraction against a view that lacks the CDC annotation, ODP returns all rows on every run — the same behavior as a full load but without you realising it. This leads to duplicate data in your target."

  - id: step-03
    title: "Monitor the ODP subscription in ODQMON"
    explanation: 'After your extraction tool registers, open <a href="https://help.sap.com/">ODQMON</a> and navigate to the ABAP_CDS context. Find the subscription for I_JournalEntryItem. Note: after an init-delta run, the first delta request returns 0 records. This is correct ODP behavior — the delta mechanism captures changes from the init point forward, not from before it. <a href="https://support.sap.com/notes/2884410">SAP Note 2884410</a> documents this.'
    sapTransaction:
      code: ODQMON
      menuPath: "Subscriptions → Context: ABAP_CDS → I_JournalEntryItem"
      helpUrl: "https://help.sap.com/"
    verify: "Subscription for I_JournalEntryItem appears. After init, delta queue shows 0 pending records — this is expected."

  - id: step-04
    title: "Reconcile extracted row count against SE16N"
    explanation: 'After the full-load extraction completes, return to <a href="https://help.sap.com/">SE16N</a> and recount ACDOCA rows for the same RBUKRS and RYEAR partition. The count in your target system should match within a small window for in-flight postings.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → ACDOCA → Filter RBUKRS='1000' AND RYEAR=2024 → Count"
      helpUrl: "https://help.sap.com/"
    verify: "Target row count matches SE16N count within a tolerable margin for in-flight transactions."

  - id: step-05
    title: "Add posting period filter if the partition is still too large"
    explanation: 'If SE16N shows your RBUKRS+RYEAR partition is too large (e.g., 200M+ rows) for a safe ODP extraction, add a posting period filter. In <a href="https://help.sap.com/">SE16N</a>, filter on POPER (posting period, values 001–012 for months) to count rows per quarter. Then extract one quarter at a time.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → ACDOCA → Filter RBUKRS='1000' AND RYEAR=2024 AND POPER='001' → Count"
      helpUrl: "https://help.sap.com/"
    verify: "Each quarterly partition (e.g., POPER='001' through '003') has a manageable row count. Adjust partition granularity accordingly."

troubleshooting:
  - problem: "ODP extraction times out after 2 hours"
    solution: "The partition is more than 500M rows. Use the Expert walkthrough which covers SLT parallel readers for ACDOCA at that scale."

  - problem: "First delta run returns 0 records — is this a bug?"
    solution: "No. This is documented ODP behavior per SAP Note 2884410. After an init-delta, the first delta request returns 0 records because no changes have occurred since the init point. Subsequent delta runs will return only changed records."

  - problem: "ODQMON shows subscription stuck in 'FETCHING' state"
    solution: "The extraction process is still running or has hung. Check SM50 for active ABAP processes owned by your extraction user. If the process is not active, the subscription may be corrupted. Reset it in ODQMON and restart the extraction."
    sapNoteUrl: "https://support.sap.com/notes/2884410"

nextSteps:
  - label: "Try ACDOCA Expert for ultra-large extractions"
    url: "/walkthrough/expert/acdoca/"
  - label: "Table overview: ACDOCA Universal Journal"
    url: "/tables/acdoca/"
  - label: "License trap: Runtime vs Full Use"
    url: "/articles/runtime-vs-full-use/"
updatedAt: 2026-04-22
---

## Scenario

Your finance team needs ACDOCA data for year-end close analytics. You will extract one company code, one fiscal year — enough for meaningful analysis without hitting system limits. This walkthrough focuses on the SAP-side checks: confirming delta capability, monitoring ODP subscriptions, and understanding the first-delta behavior that surprises most teams on their first run.

Estimated time: 90 minutes.

---

## What you have confirmed

You have verified that I_JournalEntryItem supports delta extraction on your system, understand that the first ODP delta returns 0 records (by design), and have a reconciliation baseline. When you need more years or company codes, the Expert walkthrough scales these patterns via SLT.
