---
table: MARA
level: beginner
slug: mara
title: "Extract MARA Material Master (Beginner)"
summary: "SAP-side preparation for full-load extraction of material master general data. Covers the released CDS view I_Product, authorization for material master tables, key field characteristics (MATNR, MTART, MEINS), and SE16N reconciliation."
estimatedMinutes: 45
prerequisites:
  - "S/4HANA access with SE80 and SE11 authorization"
licenseRelevance: "All license types. ODP extraction via OData is permitted for all licenses. License trap: Runtime vs Full Use →"
destinations:
  - Generic
extractors:
  - ODP
method: odp
seoTitle: "Extract MARA Material Master (Beginner) — SAP-Side Guide"
seoDescription: "SAP-side beginner guide for MARA material master extraction. Confirm I_Product CDS view, check field types in SE11, assign authorizations, reconcile with SE16N."
steps:
  - id: step-01
    title: "Locate and confirm the released CDS view I_Product"
    explanation: 'Material master general data is exposed via <a href="https://help.sap.com/">I_Product</a>. Confirm it exists in your system and carries the extraction annotation.'
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → Search → I_Product"
      helpUrl: "https://help.sap.com/"
    verify: "I_Product appears in SE80 with @Analytics.dataExtract: true."

  - id: step-02
    title: "Inspect key field characteristics in SE11"
    explanation: 'Before extracting, understand the field types in MARA that affect downstream processing. Use <a href="https://help.sap.com/">SE11</a> to inspect the table definition. Key fields: MATNR (material number — 18-char numeric-character, often zero-padded), MTART (material type — 4-char, important for filtering), MATKL (product category), MEINS (base unit of measure — 3-char, may carry trailing spaces).'
    sapTransaction:
      code: SE11
      menuPath: "Data Dictionary → Database Tables → MARA → Display"
      helpUrl: "https://help.sap.com/"
    verify: "SE11 shows MATNR as CHAR(18), MEINS as UNIT(3), MTART as CHAR(4)."
    whyItMatters: "MATNR is zero-padded in SAP (material 1 is stored as '000000000000000001'). Your downstream SQL may need LTRIM or CAST. MEINS trailing spaces are common and break string joins if not trimmed."

  - id: step-03
    title: "Count materials in SE16N (baseline)"
    explanation: 'Use <a href="https://help.sap.com/">SE16N</a> to count MARA rows. You can optionally filter by MTART to count a specific material type. Write the count down.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → MARA → Count"
      helpUrl: "https://help.sap.com/"
    verify: "You have a total row count for MARA. Typical range: 100K–10M materials."

  - id: step-04
    title: "Confirm the extraction user has MM authorization"
    explanation: 'Material master tables are in authorization group MM. Confirm the extraction user has <code>S_TABU_DIS</code> for group MM (or broader) in <a href="https://help.sap.com/">PFCG</a>.'
    sapTransaction:
      code: PFCG
      helpUrl: "https://help.sap.com/"
    verify: "Role includes S_TABU_DIS for authorization group MM."

  - id: step-05
    title: "Check ODQMON after first tool run"
    explanation: 'Verify an active subscription appears in <a href="https://help.sap.com/">ODQMON</a> for I_Product under context ABAP_CDS.'
    sapTransaction:
      code: ODQMON
      menuPath: "Subscriptions → Context: ABAP_CDS → I_Product"
      helpUrl: "https://help.sap.com/"
    verify: "Active subscription for I_Product. No errors."

  - id: step-06
    title: "Reconcile row count and note field quirks"
    explanation: "After the extraction completes, count rows in your landing zone and compare to SE16N. Then check a sample of MATNR values — confirm they match expected zero-padding. Check MEINS values for trailing spaces."
    sapTransaction:
      code: SE16N
      menuPath: "Execute → MARA → Count"
      helpUrl: "https://help.sap.com/"
    verify: "Row count matches SE16N. Sample MATNR values show expected zero-padding (if present on your system). MEINS values include trailing spaces."

troubleshooting:
  - problem: "Extracted row count is lower than SE16N"
    solution: "I_Product may apply a filter — for example, only active materials (LVORM = ' '). Check the CDS view definition in SE80 for WHERE clause conditions. If this is intentional, document that the extraction represents active materials only."

  - problem: "MATNR values in landing zone are missing leading zeros"
    solution: "Some extraction tools strip leading zeros from MATNR during type casting. Check your tool's type mapping for CHAR fields. Either configure the tool to preserve leading zeros, or add a LPAD transformation downstream."

nextSteps:
  - label: "Try MARA Intermediate — introduces Z-fields via CDS extension"
    url: "/walkthrough/intermediate/mara/"
  - label: "Table overview: MARA Material Master"
    url: "/tables/mara/"
updatedAt: 2026-04-22
---

Your product analytics team needs material master data to build product dimension tables. MARA (material master general section) is a manageable table for a first extraction: typically 100K to 10M rows depending on system size and data retention.

This walkthrough covers the SAP-side work: confirming the released CDS view, understanding how MARA's key fields (MATNR, MEINS) behave in extraction, and reconciling counts with SE16N. The field type quirks you learn here — zero-padding, trailing spaces — apply to dozens of other SAP tables.

---

## What you have established

You have confirmed the SAP side is ready for MARA extraction and you understand the key field characteristics that affect downstream processing. Your tool team can extract from I_Product. In the intermediate walkthrough, you will add Z-fields via a CDS extension view.
