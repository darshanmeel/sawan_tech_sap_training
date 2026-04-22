---
table: MARA
level: intermediate
slug: mara
title: "Extract MARA with Z-Fields via CDS Extension"
summary: "Material master extraction with custom Z-fields (ZZ_BRAND, ZZ_SUSTAINABILITY). Uses CDS extension view to safely expose Z-fields."
estimatedMinutes: 60
prerequisites:
  - "Completed MARA Beginner"
  - "SE80 expertise"
licenseRelevance: "All licenses."
destinations:
  - Snowflake
extractors:
  - Python
steps:
  - id: step-01
    title: "Identify Z-fields in MARA"
    explanation: "Your MARA has Z-fields: ZZ_BRAND (20 char), ZZ_SUSTAINABILITY (1 char). Confirm in SE11."
    sapTransaction:
      code: SE11
      menuPath: "Data Dictionary → Tables → MARA → Fields → Find Z*"
      helpUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/SE11.html"
    verify: "ZZ_BRAND and ZZ_SUSTAINABILITY appear in MARA."
  
  - id: step-02
    title: "Create CDS extension view for Z-fields"
    explanation: "In SE80, create a CDS extension view ZPROD_ZFIELDS that adds Z-fields to I_Product without modifying the released view."
    codeBlock:
      language: abap
      content: |
        @AccessControl.authorizationCheck: #CHECK
        define view ZPROD_ZFIELDS as select from I_Product
        {
          *,
          mara.ZZ_BRAND,
          mara.ZZ_SUSTAINABILITY
        }
      caption: "CDS extension view"
    verify: "View ZPROD_ZFIELDS appears in SE80 with @Analytics.dataExtract: true."
  
  - id: step-03
    title: "Extract via the extension view"
    explanation: "Use pyrfc to extract from ZPROD_ZFIELDS instead of I_Product. This includes Z-fields safely."
    verify: "Python script successfully reads ZZ_BRAND and ZZ_SUSTAINABILITY values."
  
  - id: step-04
    title: "Land in Snowflake with Z-field columns"
    explanation: "Parquet schema now includes ZZ_BRAND and ZZ_SUSTAINABILITY. Store in Snowflake MATERIAL table."
    verify: "SELECT ZZ_BRAND, ZZ_SUSTAINABILITY FROM MATERIAL returns expected values."

  - id: step-05
    title: "Document Z-field lineage"
    explanation: "In your data dictionary, document: MARA.ZZ_BRAND → MATERIAL.ZZ_BRAND, MARA.ZZ_SUSTAINABILITY → MATERIAL.ZZ_SUSTAINABILITY. Note that these are append-structure fields (custom, not part of standard table)."
    verify: "Data dictionary includes Z-field lineage."

troubleshooting:
  - problem: "CDS extension view won't save (syntax error)"
    solution: "Ensure @AccessControl.authorizationCheck is present. Test in SE80 with Ctrl+F12."

nextSteps:
  - label: "Try MARA Expert"
    url: "/walkthrough/expert/mara/"

seoTitle: "Extract MARA with Z-Fields via CDS Extension"
seoDescription: "Intermediate MARA extraction with custom Z-fields using CDS extension views. Safe, non-invasive Z-field extraction."
updatedAt: 2026-04-22
---

## Scenario

Your company extended MARA with Z-fields for brand and sustainability tracking. You need these in the data warehouse without modifying the released CDS view.

---

## What you've built

You've extracted MARA with Z-fields via a safe, maintainable CDS extension view. The data warehouse now includes brand and sustainability dimensions.
