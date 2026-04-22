---
table: MARA
level: beginner
slug: mara
title: "Extract MARA Material Master to ADLS (Beginner)"
summary: "Full-load extraction of material master general data. Introduces handling of numeric (UOM) and character (classification) fields. No Z-fields yet, but lays groundwork for later."
estimatedMinutes: 45
prerequisites:
  - "Completed VBAK Beginner or VBAK Beginner experience"
  - "ADF infrastructure (linked service, ADLS)"
  - "S/4HANA access and EXTRACT_VBAK user"
licenseRelevance: "All license types. ODP extraction is application-layer."
destinations:
  - ADLS
extractors:
  - ADF
steps:
  - id: step-01
    title: "Locate the I_Product CDS view"
    explanation: "Material master is exposed via <a href='https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/product-cds.html'>I_Product</a>. Verify in SE80."
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → Search → I_Product"
      helpUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/SE80.html"
    verify: "I_Product appears with @Analytics.dataExtract: true."
  
  - id: step-02
    title: "Review MARA key fields (MATNR, MTART, MATKL)"
    explanation: "Use SE16N to browse MARA and understand data patterns. MATNR is the material number (key), MTART is material type (key business dimension), MATKL is product category."
    sapTransaction:
      code: SE16N
      menuPath: "Execute → MARA"
      helpUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/SE16N.html"
    verify: "You can see rows in SE16N with different MTART and MATKL values. Count is reasonable (100K-10M typical)."

  - id: step-03
    title: "Create source dataset for I_Product"
    explanation: "In ADF, create a new source dataset using the SAP CDC linked service, targeting I_Product through ODP."
    verify: "Preview loads material records with columns MATNR, MTART, MATKL, MEINS (UOM)."

  - id: step-04
    title: "Note numeric vs character field handling"
    explanation: "MEINS (UOM) is a 3-char field, often padded (e.g., 'EA ', 'PC '); MATNR is numeric-character (18 digits). Parquet preserves types; you'll handle trimming in downstream SQL if needed."
    verify: "In the preview, observe that MEINS values include trailing spaces and MATNR is zero-padded."

  - id: step-05
    title: "Create ADLS folder structure"
    explanation: "In sap-raw, create material/full-load/ for the extraction."
    verify: "Folder exists in ADLS."

  - id: step-06
    title: "Create sink dataset to ADLS Parquet"
    explanation: "Point to sap-raw/material/full-load/. Snappy compression."
    verify: "Test connection succeeds."

  - id: step-07
    title: "Build and trigger the ADF pipeline"
    explanation: "Copy activity: I_Product → ADLS Parquet."
    verify: "Pipeline completes and files appear."

  - id: step-08
    title: "Validate row count and column count"
    explanation: "Query the Parquet files. Confirm row count matches SE16N. Check that expected columns (MATNR, MTART, MATKL, MEINS) are present with correct data types (MATNR string/numeric, MEINS string)."
    verify: "Parquet row count ≈ SE16N count. MEINS values may have trailing spaces."

  - id: step-09
    title: "Document field transformations needed"
    explanation: "In your data warehouse schema, note that MEINS will need TRIM(), and MATNR may need conversion to numeric or stays as string. Create a data dictionary for the downstream SQL ETL."
    verify: "Data dictionary includes MARA → ADLS mappings with transformation notes."

troubleshooting:
  - problem: "Preview shows very few rows (suspiciously low count)"
    solution: "I_Product may apply a hidden filter (e.g., only active materials). Verify with SE16N MARA count."
  
  - problem: "Parquet file is huge (>10GB for MARA)"
    solution: "Material master is large in some systems. Consider partitioning by MTART (material type) in ADF to parallelize."

nextSteps:
  - label: "Try MARA Intermediate walkthrough — introduces Z-fields"
    url: "/walkthrough/intermediate/mara/"
  - label: "Table overview: MARA Material Master"
    url: "/tables/mara/"

seoTitle: "Extract MARA Material Master to ADLS (Beginner) — S/4HANA"
seoDescription: "Beginner walkthrough for extracting material master (MARA) from S/4HANA to ADLS. Learn field type handling (UOM trimming, numeric keys) and Parquet best practices."
updatedAt: 2026-04-22
---

## Scenario

Your product analytics team needs material master data to build product dimension tables. You'll extract MARA (material master general section) to ADLS as Parquet, focusing on understanding how different field types (numeric-character, UOM strings) come across in the extraction.

This walkthrough builds on VBAK and LFA1 patterns but introduces field type awareness, which becomes critical when you add Z-fields in the intermediate walkthrough.

Estimated time: 45 minutes.

---

## What you've built

You've extracted material master data and learned how field types differ between SAP and Parquet. MEINS (UOM) may have trailing spaces; MATNR is zero-padded numeric-character. Your downstream SQL will account for these via TRIM() and casting. You're now ready to handle Z-fields in the next walkthrough.
