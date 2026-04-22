---
table: LFA1
level: expert
slug: lfa1
title: "Extract LFA1 + LFB1 + LFBK (Multi-Table Expert)"
summary: "Advanced extraction of three vendor tables (general, company code, bank details) with complex joins and reconciliation. Enterprise-scale vendor master."
estimatedMinutes: 100
prerequisites:
  - "Completed LFA1 Intermediate"
  - "Understanding of vendor master table relationships"
licenseRelevance: "All licenses."
destinations:
  - Snowflake
extractors:
  - Python
steps:
  - id: step-01
    title: "Understand vendor table structure"
    explanation: "LFA1 (general) links to LFB1 (company code) via LIFNR; LFB1 links to LFBK (bank details). One vendor may have multiple company codes and multiple bank details."
    sapTransaction:
      code: SE80
      menuPath: "Search → LFA1, LFB1, LFBK relationships"
      helpUrl: "https://help.sap.com/"
    verify: "You understand 1:N relationships."
  
  - id: step-02
    title: "Extract all three tables in parallel"
    explanation: "Launch three simultaneous ODP extractions for I_Supplier (LFA1), I_SupplierCompanyCode (LFB1), I_SupplierBankDetail (LFBK). This avoids cascading delays."
    codeBlock:
      language: python
      content: |
        import asyncio
        tasks = [
          asyncio.create_task(extract_supplier()),
          asyncio.create_task(extract_supplier_cc()),
          asyncio.create_task(extract_supplier_bank())
        ]
        await asyncio.gather(*tasks)
      caption: "Parallel extraction"
    verify: "All three tables load into Snowflake simultaneously."
  
  - id: step-03
    title: "Reconcile extracted data"
    explanation: "Validate referential integrity: every LFB1.LIFNR exists in LFA1, every LFBK.LIFNR+BANKL exists in LFB1."
    codeBlock:
      language: sql
      content: |
        SELECT COUNT(*) AS orphan_lfb1 FROM SUPPLIER_CC cc
        WHERE NOT EXISTS (SELECT 1 FROM SUPPLIER s WHERE s.LIFNR = cc.LIFNR);
      caption: "Orphan check"
    verify: "Query returns 0 rows."
  
  - id: step-04
    title: "Create conformed dimension in Snowflake"
    explanation: "Join the three tables into a single VENDOR dimension with denormalized company code and bank details. Store in a Snowflake view."
    verify: "View DIM_VENDOR_COMPLETE exists and queries return expected vendor records with company code and bank details."

  - id: step-05
    title: "Monitor multi-table delta coherence"
    explanation: "When a vendor changes in LFA1 and adds a bank detail in LFBK, ensure both changes land in the same load window to avoid stale data in DIM_VENDOR_COMPLETE."
    verify: "Test by manually changing a vendor in SAP, verifying both LFA1 and LFBK updates reach Snowflake in the same load."

troubleshooting:
  - problem: "LFB1 or LFBK loads fail, LFA1 succeeds"
    solution: "Retry failed extractions independently. Create separate alert rules for each table to avoid cascading failures."

nextSteps:
  - label: "Compare with ACDOCA Expert for ultra-large-scale patterns"
    url: "/walkthrough/expert/acdoca/"

seoTitle: "Extract Vendor Master + Related Tables (Expert) — Snowflake"
seoDescription: "Advanced expert walkthrough: extract LFA1, LFB1, LFBK in parallel with referential integrity checks and conformed dimension creation."
updatedAt: 2026-04-22
---

## Scenario

Your data warehouse needs a complete vendor dimension: general data (LFA1) + company code details (LFB1) + bank info (LFBK). You'll extract all three tables in parallel and validate referential integrity.

---

## What you've built

You now have a robust, multi-table vendor extraction with referential integrity checks. The DIM_VENDOR_COMPLETE view serves downstream fact tables.
