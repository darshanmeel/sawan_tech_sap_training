---
table: LFA1
level: beginner
slug: lfa1
title: "Extract LFA1 Vendor Master to ADLS (Beginner)"
summary: "Full-load extraction of vendor master general data from S/4HANA to ADLS using ADF and the released CDS view I_Supplier. The simplest table extraction — small volume, stable data, no delta required."
estimatedMinutes: 40
prerequisites:
  - "Access to an S/4HANA on-premise system with SE80"
  - "Azure Data Factory and ADLS Gen2 infrastructure (from VBAK Beginner walkthrough)"
  - "EXTRACT_VBAK technical user (can reuse from VBAK walkthrough)"
licenseRelevance: "Works under all SAP license types. ODP extraction is application-layer and permitted for all licenses."
destinations:
  - ADLS
extractors:
  - ADF
steps:
  - id: step-01
    title: "Verify the I_Supplier CDS view exists"
    explanation: "Vendor master is exposed via the <a href='https://help.sap.com/"
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → Search → I_Supplier"
      helpUrl: "https://help.sap.com/"
    verify: "I_Supplier appears in SE80 with @Analytics.dataExtract: true."
  
  - id: step-02
    title: "Create ADF source dataset for I_Supplier"
    explanation: "Use the SAP CDC linked service (from VBAK Beginner) and create a new source dataset targeting I_Supplier through ODP."
    verify: "Dataset preview shows vendor records with LIFNR, NAME1, LAND1, ORT01."

  - id: step-03
    title: "Create ADLS folder structure"
    explanation: "In the sap-raw container, create a subfolder vendor/full-load/ for the LFA1 Parquet files."
    verify: "Folder vendor/full-load/ exists in Azure Storage Explorer."

  - id: step-04
    title: "Create ADF sink dataset to ADLS"
    explanation: "Create a Parquet sink dataset pointing to sap-raw/vendor/full-load/. Use Snappy compression."
    verify: "Sink dataset Test Connection returns green."

  - id: step-05
    title: "Build and run the ADF pipeline"
    explanation: "Create a new pipeline with a single Copy activity. Source = I_Supplier dataset, Sink = ADLS Parquet dataset. Trigger and monitor."
    verify: "Pipeline completes successfully and Parquet files appear in sap-raw/vendor/full-load/."

  - id: step-06
    title: "Verify row count in ADLS"
    explanation: "Query the Parquet files to count rows. Cross-check with SE16N count of LFA1 to ensure no data loss."
    verify: "Row count in Parquet matches (or is very close to) LFA1 count in SAP. Sample columns (LIFNR, NAME1, LAND1) have expected values."

  - id: step-07
    title: "Document the pipeline"
    explanation: "Add tags and descriptions to the ADF pipeline. Note that this is a full-load, weekly refresh scenario. Include a link to this walkthrough in the documentation."
    verify: "Pipeline has meaningful tags (e.g., 'vendor-master', 'weekly', 'sap-extract') and description."

  - id: step-08
    title: "Schedule the pipeline for weekly runs"
    explanation: "Use ADF's Schedule trigger to run the pipeline every Sunday at 2 AM UTC. Adjust based on your maintenance window."
    verify: "A Schedule trigger exists on the pipeline and shows the next scheduled execution."

troubleshooting:
  - problem: "ODP_NO_DATA_AVAILABLE error"
    solution: "The CDS view might have no data or be filtered. Verify LFA1 has vendors via SE16N. Remove any filter conditions from the ADF dataset."
  
  - problem: "Parquet file is empty after successful pipeline run"
    solution: "Check if the I_Supplier CDS view applies a hidden filter (e.g., only active vendors). Review the CDS view definition in SE80."
  
  - problem: "ADF pipeline times out"
    solution: "LFA1 is small but if it has millions of vendors, partition the extract by LAND1 (country) in multiple ADF iterations."

nextSteps:
  - label: "Try the LFA1 Intermediate walkthrough — add hourly delta"
    url: "/walkthrough/intermediate/lfa1/"
  - label: "Table overview: LFA1 Vendor Master"
    url: "/tables/lfa1/"
  - label: "Glossary: Operational Data Provisioning"
    url: "/glossary/odp/"

seoTitle: "Extract LFA1 Vendor Master to ADLS (Beginner) — S/4HANA"
seoDescription: "Beginner walkthrough for extracting vendor master data (LFA1) from SAP S/4HANA to ADLS using ADF. Simple, stable data — perfect for your first full-load extraction."
updatedAt: 2026-04-22
---

## Scenario

Your procurement analytics team needs a weekly feed of all active vendors in the system. Vendor master is small, stable, and doesn't change hourly. A simple full-load every Sunday morning is perfect.

This walkthrough reuses the ADF infrastructure from VBAK Beginner (same linked service, same ADLS storage) and focuses on the patterns unique to vendor master: confirming the CDS view, understanding the table structure, and validating data quality.

Estimated time: 40 minutes (faster than VBAK because it reuses infrastructure).

---

## What you've built

You've successfully extracted vendor master data to the data lake. The weekly pipeline is in place and will auto-run every Sunday. Your procurement team now has a current, authoritative vendor list in Parquet format, ready for analytics.

You've also learned that extraction patterns are reusable: same ADF infrastructure, same SHIR, same RFC user, just pointed at a different CDS view. When you're ready for the next table (materials, customers, accounts), you'll reuse this pattern.
