---
table: MARA
level: expert
slug: mara
title: "Extract Extended MARA (20+ Z-Fields, Multi-Table) (Expert)"
summary: "SAP-side expert guide for large-scale MARA extraction with 20+ Z-fields and related tables MARC and MVKE. Covers SE11 Append Structure audit, multi-CDS extension view strategy, Basis transport discipline for Z-field views, and SE16N cross-table reconciliation."
estimatedMinutes: 90
prerequisites:
  - "Completed MARA Intermediate walkthrough"
  - "SE80 proficiency — you can create and activate CDS views"
  - "Understanding of MARC (plant data) and MVKE (sales org data) table relationships"
licenseRelevance: "All licenses. ODP extraction is permitted for all license types. License trap: Runtime vs Full Use →"
destinations:
  - Generic
extractors:
  - ODP
method: odp
seoTitle: "Extract Extended MARA (20+ Z-Fields) — SAP-Side Expert Guide"
seoDescription: "SAP-side expert guide for MARA with 20+ Z-fields and MARC/MVKE joins. SE11 Append Structure audit, CDS extension view strategy, transport discipline, SE16N reconciliation."
steps:
  - id: step-01
    title: "Audit all Z-fields in MARA via SE11 Append Structures"
    explanation: 'When MARA has 20+ Z-fields, they are typically spread across multiple Append Structures (one per development team or project). Use <a href="https://help.sap.com/">SE11</a> to display MARA and expand the Append Structure entries. Document each Append Structure name, its fields, and data types. This becomes the input for your CDS extension view design.'
    sapTransaction:
      code: SE11
      menuPath: "Database Tables → MARA → Display → Append Structures → Expand each"
      helpUrl: "https://help.sap.com/"
    verify: "You have a complete list of all Z-fields in MARA with Append Structure names, field names, and data types. Total Z-field count is documented."

  - id: step-02
    title: "Identify released CDS views for MARC and MVKE"
    explanation: 'The related tables for material master are MARC (plant data per material) and MVKE (sales org data per material). Confirm their released CDS views in <a href="https://help.sap.com/">SE80</a>. Typical view names: I_ProductPlant (MARC) and I_ProductSalesDelivery (MVKE). [NEEDS_SAP_CITATION — confirm exact view names for MARC/MVKE across releases]'
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → Search → I_ProductPlant, I_ProductSalesDelivery"
      helpUrl: "https://help.sap.com/"
    verify: "I_ProductPlant and I_ProductSalesDelivery (or equivalent views) exist with @Analytics.dataExtract: true."

  - id: step-03
    title: "Design CDS extension view strategy for 20+ Z-fields"
    explanation: 'With 20+ Z-fields spread across multiple Append Structures, you have two options: (1) create one large extension view combining all Z-fields, or (2) create multiple smaller extension views grouped by business domain (e.g., one for brand/sustainability fields, one for supply chain fields). Option 2 is more maintainable and easier to transport. Agree the design with your ABAP development team before creating any views.'
    verify: "Extension view design is agreed with ABAP team. Each view covers a logical grouping of Z-fields. Transport strategy is defined (which transport request each view goes into)."

  - id: step-04
    title: "Create extension views with correct transport assignment"
    explanation: 'In <a href="https://help.sap.com/">SE80</a> or ADT, create each extension view. Assign them to the correct transport requests. Each extension view must be activated and transported to production before the extraction runs. A Z-field extension view that is active in development but not in production will cause extraction failures in production.'
    sapTransaction:
      code: SE80
      menuPath: "Create → CDS View Extension (per domain group)"
      helpUrl: "https://help.sap.com/"
    verify: "All extension views are active in SE80 in development. Transport requests are created. Views are transported to production (or confirmed by change management as in progress)."
    whyItMatters: "Transport discipline for CDS extension views is critical. A view that is active in quality but not in production causes silent extraction failures — the extraction runs but the Z-fields are empty. Always verify the production system."

  - id: step-05
    title: "Count rows in MARA, MARC, and MVKE for reconciliation baselines"
    explanation: 'Use <a href="https://help.sap.com/">SE16N</a> to count MARA, MARC, and MVKE separately. MARC count > MARA count (a material can have plant records across multiple plants). MVKE count > MARA count (a material can exist in multiple sales organisations). Document the expected ratios for reconciliation.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → MARA, MARC, MVKE → Count each"
      helpUrl: "https://help.sap.com/"
    verify: "Three row counts documented. MARC >= MARA, MVKE >= MARA (expected). Z-field population rate (% of MARA rows with non-initial ZZ_BRAND) is also noted."

troubleshooting:
  - problem: "Extension view activation fails after transport to production"
    solution: "The underlying Append Structure may not be active in production. Check SE11 for the Append Structure status in production. If it is inactive or missing, the ABAP team needs to transport the Append Structure separately from the CDS extension view."

  - problem: "Z-fields are empty in extraction output for some materials but not others"
    solution: "Not all materials may have values in every Append Structure. Check SE16N for those MATNR values — if ZZ_BRAND is initial in SE16N too, the business process has not populated those materials. This is expected behavior, not an extraction bug."

nextSteps:
  - label: "Compare with ACDOCA Expert for complex multi-table patterns"
    url: "/walkthrough/expert/acdoca/"
  - label: "License trap: Runtime vs Full Use"
    url: "/articles/runtime-vs-full-use/"
updatedAt: 2026-04-22
---

## Scenario

Your company's MARA is heavily extended with custom fields for brand, sustainability, supply chain, and regulatory tracking. Manually managing 20+ Z-field extractions across multiple ABAP teams requires a disciplined approach to CDS extension view design and transport management.

This walkthrough covers the SAP-side work: auditing all Z-fields in SE11, designing a maintainable CDS extension view strategy, managing transports, and reconciling three tables against SE16N baselines.

---

## What you have built

You have a complete material dimension in your target system, including all Z-fields and related plant and sales org data. The CDS extension views are transported to production, the extraction user has correct authorization, and SE16N reconciliation confirms completeness.
