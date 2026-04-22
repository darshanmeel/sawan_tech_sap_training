---
table: LFA1
level: expert
slug: lfa1
title: "Extract Vendor Master Tables LFA1 + LFB1 + LFBK (Expert)"
summary: "SAP-side expert guide for multi-table vendor master extraction. Covers the three-table structure (LFA1 general, LFB1 company code, LFBK bank details), released CDS views, parallel ODP subscription management, and referential integrity verification via SE16N."
estimatedMinutes: 100
prerequisites:
  - "Completed LFA1 Intermediate walkthrough"
  - "Understanding of vendor master table relationships (1:N cardinality)"
licenseRelevance: "All licenses — ODP extraction is permitted for all license types. License trap: Runtime vs Full Use →"
destinations:
  - Generic
extractors:
  - ODP
method: odp
seoTitle: "Extract Vendor Master LFA1 + LFB1 + LFBK (Expert) — SAP-Side Guide"
seoDescription: "SAP-side expert guide for multi-table vendor master extraction. Released CDS views for all three tables, ODQMON multi-subscription monitoring, referential integrity checks."
steps:
  - id: step-01
    title: "Understand vendor table structure and relationships"
    explanation: 'LFA1 (vendor general data) links to LFB1 (vendor company code data) via LIFNR. LFB1 links to LFBK (vendor bank details) via LIFNR+BANKS+BANKL. A single vendor may have records in all three tables. Use <a href="https://help.sap.com/">SE11</a> to inspect the foreign key relationships on each table and confirm the join conditions before building any extraction.'
    sapTransaction:
      code: SE11
      menuPath: "Database Tables → LFB1 → Foreign Keys"
      helpUrl: "https://help.sap.com/"
    verify: "SE11 confirms: LFB1.LIFNR → LFA1.LIFNR (1:N), LFBK.LIFNR → LFA1.LIFNR (1:N). You understand the join conditions."

  - id: step-02
    title: "Confirm released CDS views for all three tables"
    explanation: 'Verify the three released CDS views exist in <a href="https://help.sap.com/">SE80</a>: I_Supplier (LFA1), I_SupplierCompanyCode (LFB1), I_SupplierBankDetail (LFBK — may also appear as I_SupplierBank depending on your release). [NEEDS_SAP_CITATION — confirm view names for LFB1 and LFBK across releases] Each must have @Analytics.dataExtract: true.'
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → Search → I_Supplier, I_SupplierCompanyCode, I_SupplierBankDetail"
      helpUrl: "https://help.sap.com/"
    verify: "All three views exist with @Analytics.dataExtract: true. View names match your system's release."

  - id: step-03
    title: "Count rows in all three tables (SE16N baseline)"
    explanation: 'Use <a href="https://help.sap.com/">SE16N</a> to count LFA1, LFB1, and LFBK separately. Record each count. The LFB1 count will be higher than LFA1 (a vendor can have company code records in multiple company codes). LFBK will typically be lower than LFA1 (not all vendors have bank details).'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → LFA1, LFB1, LFBK → Count each"
      helpUrl: "https://help.sap.com/"
    verify: "Three row counts recorded. LFB1 >= LFA1 (expected). LFBK <= LFA1 (expected)."

  - id: step-04
    title: "Monitor three parallel ODP subscriptions in ODQMON"
    explanation: 'When your tool extracts all three tables in parallel, <a href="https://help.sap.com/">ODQMON</a> shows three separate subscriptions. Monitor all three for status. A failure in LFB1 or LFBK while LFA1 succeeds is a common pattern — retry failed table extractions independently. Create separate monitoring alerts for each subscription.'
    sapTransaction:
      code: ODQMON
      menuPath: "Subscriptions → Context: ABAP_CDS → I_Supplier, I_SupplierCompanyCode, I_SupplierBankDetail"
      helpUrl: "https://help.sap.com/"
    verify: "All three subscriptions are active and progressing. No subscription in ERROR state."

  - id: step-05
    title: "Verify referential integrity after extraction"
    explanation: 'After all three tables extract, verify that every LFB1.LIFNR exists in LFA1 and every LFBK.LIFNR exists in LFA1. Small referential integrity gaps can occur if a vendor was created in LFB1 but the LFA1 record arrived in a different extraction window. Allow a 24-hour delta window before declaring the integrity check a failure — independent table extractions will have small timing gaps.'
    sapTransaction:
      code: SE16N
      menuPath: "Use SE16N to cross-check LIFNR values across all three tables"
      helpUrl: "https://help.sap.com/"
    verify: "After 24 hours: all LFB1 and LFBK rows have matching LIFNR in LFA1. Any orphan rows are investigated and resolved."

troubleshooting:
  - problem: "LFB1 or LFBK extractions fail while LFA1 succeeds"
    solution: "Retry failed table extractions independently. Each ODP subscription is stateful and independent. ODQMON shows the specific error for the failed subscription. Check that the extraction user's S_ODP_READ authorization covers all three CDS views (I_Supplier, I_SupplierCompanyCode, I_SupplierBankDetail)."

  - problem: "LFB1 count in target is significantly lower than SE16N"
    solution: "I_SupplierCompanyCode may apply a filter to specific company codes your user is authorized for (via S_TABU_DIS or a company code authorization object). Verify the extraction user has authorization for all company codes in scope, or document that the extraction is scoped to authorized company codes only."

nextSteps:
  - label: "Compare with ACDOCA Expert for ultra-large-scale patterns"
    url: "/walkthrough/expert/acdoca/"
  - label: "License trap: Runtime vs Full Use"
    url: "/articles/runtime-vs-full-use/"
updatedAt: 2026-04-22
---

## Scenario

Your data warehouse needs a complete vendor dimension: general data (LFA1) + company code details (LFB1) + bank information (LFBK). You will extract all three tables in parallel and verify referential integrity.

This walkthrough covers the SAP-side work: identifying the released CDS views for all three tables, monitoring three parallel ODQMON subscriptions, and verifying join coherence after extraction.

---

## What you have built

You have a robust, multi-table vendor extraction with confirmed referential integrity. All three vendor tables are correctly extracted and reconciled against SE16N baselines. The downstream vendor dimension has complete data for all company code and bank detail combinations.
