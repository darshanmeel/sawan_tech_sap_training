---
table: BKPF
level: beginner
slug: bkpf
title: "Extract BKPF Accounting Header (One Fiscal Year)"
summary: "Beginner extraction of one company code, one fiscal year of accounting documents. Introduces fiscal year and company code partitioning — essential for large financial tables."
estimatedMinutes: 50
prerequisites:
  - "Completed VBAK or LFA1 beginner walkthrough"
  - "ADF infrastructure and EXTRACT_VBAK user"
  - "S/4HANA access; finance module"
licenseRelevance: "All license types. ODP is application-layer."
destinations:
  - ADLS
extractors:
  - ADF
steps:
  - id: step-01
    title: "Identify the I_AccountingDocument CDS view"
    explanation: "<a href='https://help.sap.com/"
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → I_AccountingDocument"
      helpUrl: "https://help.sap.com/"
    verify: "View exists with @Analytics.dataExtract: true."
  
  - id: step-02
    title: "Understand BKPF partitioning (BUKRS, GJAHR)"
    explanation: "BKPF is large. The primary key is MANDT, BUKRS (company code), GJAHR (fiscal year), BELNR (document number). Always partition extractions by BUKRS and GJAHR to avoid memory exhaustion."
    sapTransaction:
      code: SE16N
      menuPath: "Execute → BKPF"
      helpUrl: "https://help.sap.com/"
    verify: "You see rows with BUKRS='1000' and GJAHR='2024' (or latest year). Count them — this is your expected row count for one partition."

  - id: step-03
    title: "Create ADF source dataset with BUKRS and GJAHR filters"
    explanation: "Create the I_AccountingDocument source dataset. Add parameters for BUKRS and GJAHR so you can partition the extraction. For this beginner walkthrough, fix them to one company code and one fiscal year."
    codeBlock:
      language: json
      content: |
        {
          "name": "SAP_BKPF_Source",
          "properties": {
            "linkedServiceName": { "referenceName": "SAP_S4HANA_Source" },
            "annotations": [],
            "type": "SapOdpResource",
            "typeProperties": {
              "context": "I_AccountingDocument",
              "filter": "BUKRS='1000' AND GJAHR=2024"
            }
          }
        }
      caption: "Dataset with fiscal year filter"
    verify: "Preview shows documents from company code 1000, fiscal year 2024 only."

  - id: step-04
    title: "Create ADLS folder structure"
    explanation: "In sap-raw, create finance/accounting/full-load/fy2024/bukrs1000/."
    verify: "Folder structure exists."

  - id: step-05
    title: "Create sink dataset and pipeline"
    explanation: "Sink to ADLS Parquet under finance/accounting/full-load/fy2024/bukrs1000/. Build pipeline with Copy activity."
    verify: "Pipeline succeeds."

  - id: step-06
    title: "Verify document count matches SAP"
    explanation: "Count rows in the Parquet file. Cross-check with SE16N (BUKRS=1000, GJAHR=2024) row count."
    verify: "Row count matches. Sample documents show posting dates in 2024, company code 1000."

  - id: step-07
    title: "Document the partitioning strategy"
    explanation: "For future fiscal years or additional company codes, clone this ADF pipeline and adjust the BUKRS and GJAHR filters. Document the folder structure so downstream users understand the partition scheme."
    verify: "Runbook or README in ADLS documents: 'finance/accounting/full-load/fy[YEAR]/bukrs[CODE]/'."

troubleshooting:
  - problem: "Filter condition doesn't work in ADF source dataset"
    solution: "In ADF, the ODP filter syntax is case-sensitive and space-sensitive. Use BUKRS='1000' and GJAHR=2024 (no quotes on numeric GJAHR)."
  
  - problem: "Extraction times out despite filter"
    solution: "Even one company code + one fiscal year can be large (100M+ rows). If timeout persists, partition further by BLART (document type) or BUDAT (posting date)."

nextSteps:
  - label: "Try BKPF Intermediate — multi-year, multi-company code"
    url: "/walkthrough/intermediate/bkpf/"
  - label: "Table overview: BKPF Accounting Document"
    url: "/tables/bkpf/"

seoTitle: "Extract BKPF Accounting Documents (One Year) — S/4HANA Beginner"
seoDescription: "Beginner walkthrough for extracting accounting document header (BKPF) from SAP S/4HANA. Learn fiscal year and company code partitioning for large financial tables."
updatedAt: 2026-04-22
---

## Scenario

Your finance team needs accounting documents in the data lake for reconciliation and analytics. BKPF is large, so you'll start small: one company code, one fiscal year. This teaches you the partitioning pattern you'll use for multi-year, multi-company extractions later.

Estimated time: 50 minutes.

---

## What you've built

You've extracted BKPF using a partitioned approach. You now understand that financial tables require careful partitioning by fiscal year and company code. The folder structure (finance/accounting/full-load/fy[YEAR]/bukrs[CODE]/) is repeatable — when 2025 arrives, you'll clone this pipeline, adjust filters, and extract new data to the same structure.
