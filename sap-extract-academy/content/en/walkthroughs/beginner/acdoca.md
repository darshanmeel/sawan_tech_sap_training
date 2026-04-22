---
table: ACDOCA
level: beginner
slug: acdoca
title: "Extract ACDOCA Universal Journal (One Fiscal Year, Generic Target)"
summary: "Beginner extraction of one company code and one fiscal year from the Universal Journal. Introduces the mandatory partitioning strategy for ACDOCA — the heaviest table in S/4HANA — and writes output to a generic landing zone."
estimatedMinutes: 60
prerequisites:
  - "Completed at least one beginner walkthrough (VBAK or BKPF recommended)"
  - "S/4HANA on-premise access with SE80 and SE16N authorization"
  - "Technical RFC user with S_ODP_READ authorization for ABAP_CDS context"
  - "A target landing zone (ADLS, local filesystem, or any supported sink)"
seoTitle: "Extract ACDOCA Universal Journal (One Fiscal Year) — S/4HANA Beginner"
seoDescription: "Beginner walkthrough for extracting ACDOCA Universal Journal from SAP S/4HANA. Learn mandatory partitioning by company code and fiscal year for the heaviest table in S/4HANA."
licenseRelevance: "ODP-based extraction of ACDOCA works under Runtime License. SLT replication of ACDOCA requires Full Use License. This walkthrough uses ODP (CDC connector) and is Runtime-safe."
destinations:
  - ADLS
  - Generic
extractors:
  - ADF
steps:
  - id: step-01
    title: "Confirm the released CDS view I_JournalEntryItem"
    explanation: 'Never extract raw ACDOCA directly. SAP ships <a href="https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/journal-entry-item-cds.html">I_JournalEntryItem</a> as the released CDS view for the Universal Journal. It enforces authorization, applies currency conversion, and exposes the table through ODP without triggering a full table scan.'
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → Search → I_JournalEntryItem"
      helpUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/SE80.html"
    verify: "I_JournalEntryItem opens in SE80 and the header annotation @Analytics.dataExtract: true is present."
    whyItMatters: "A raw SELECT * on ACDOCA exhausts SAP dialog work process memory within seconds on any production system. I_JournalEntryItem is the only extraction-safe path."

  - id: step-02
    title: "Understand ACDOCA partitioning (RBUKRS, RYEAR, POPER)"
    explanation: "ACDOCA primary key fields are MANDT, RBUKRS (company code), RYEAR (reporting year), POPER (posting period), BELNR (document number), and DOCLN (line number). For a beginner extraction, always fix to one company code and one reporting year. This gives a manageable partition that completes in minutes rather than hours."
    sapTransaction:
      code: SE16N
      menuPath: "Execute → ACDOCA → Filter RBUKRS='1000' AND RYEAR=2024"
      helpUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/SE16N.html"
    verify: "You see a row count for RBUKRS='1000' and RYEAR=2024. This is the expected output row count for your first partition. Typical values are 5M-50M rows per company code per year."
    whyItMatters: "ACDOCA without partitioning crashes SAP. Partitioning by RBUKRS+RYEAR is the minimum viable approach and is the pattern you will scale to parallel jobs in intermediate and expert walkthroughs."

  - id: step-03
    title: "Create a source dataset pointing to I_JournalEntryItem"
    explanation: "In your extraction tool (ADF or equivalent), create a new source dataset of type SAP ODP Resource pointing to the I_JournalEntryItem context. Add filter parameters for RBUKRS and RYEAR so you can fix them to one value for this walkthrough."
    codeBlock:
      language: json
      content: |
        {
          "name": "SAP_ACDOCA_Source",
          "properties": {
            "linkedServiceName": { "referenceName": "SAP_S4HANA_Source" },
            "type": "SapOdpResource",
            "typeProperties": {
              "context": "I_JournalEntryItem",
              "objectName": "I_JournalEntryItem",
              "filter": "CompanyCode eq '1000' and FiscalYear eq '2024'"
            }
          }
        }
      caption: "ADF ODP source dataset — replace CompanyCode and FiscalYear with your values"
    verify: "Preview returns rows and the column list includes CompanyCode, FiscalYear, PostingDate, AmountInCompanyCodeCurrency, and CurrencyCode."

  - id: step-04
    title: "Create the target folder structure"
    explanation: "Create a folder path in your landing zone that reflects the partition. A clear naming convention is essential when you scale to multiple company codes and years."
    codeBlock:
      language: plaintext
      content: |
        sap-raw/
          finance/
            universal-journal/
              full-load/
                fy2024/
                  bukrs1000/
      caption: "Recommended folder layout for ACDOCA beginner extraction"
    verify: "The target folder exists and is empty before you run the pipeline."

  - id: step-05
    title: "Configure the copy pipeline and run"
    explanation: "Create a Copy activity with the ACDOCA source and your target sink. Set the sink format to Parquet with Snappy compression — ACDOCA rows are wide and Parquet column pruning will significantly reduce storage. Run the pipeline and monitor progress."
    codeBlock:
      language: json
      content: |
        {
          "name": "CopyACDOCA_FY2024_BuKrs1000",
          "type": "Copy",
          "inputs": [{ "referenceName": "SAP_ACDOCA_Source", "type": "DatasetReference" }],
          "outputs": [{ "referenceName": "ADLS_ACDOCA_Sink", "type": "DatasetReference" }],
          "typeProperties": {
            "source": { "type": "SapOdpSource", "extractionMode": "FullLoad" },
            "sink": {
              "type": "ParquetSink",
              "storeSettings": { "type": "AzureBlobFSWriteSettings" },
              "formatSettings": { "type": "ParquetWriteSetting", "fileExtension": ".parquet" }
            },
            "parallelCopies": 1
          }
        }
      caption: "Pipeline Copy activity JSON (single-thread — safe for beginner run)"
    verify: "Pipeline completes with status Succeeded. The output folder contains one or more .parquet files. Row count in the pipeline monitor matches your SE16N estimate from step 02."
    whyItMatters: "parallelCopies: 1 keeps the extraction single-threaded, which is safest for a first run on ACDOCA. Intermediate walkthrough covers parallel execution."

---

ACDOCA is the Universal Journal — every financial posting in S/4HANA ends up here. Unlike VBAK or LFA1, ACDOCA has no safe beginner path that ignores partitioning. The table routinely exceeds a billion rows in production systems. This walkthrough gives you the minimum viable extraction: one company code, one fiscal year, written to a generic landing zone.

Completing this walkthrough means you have confirmed the partition strategy works and have a Parquet file you can query. Intermediate and expert walkthroughs build on this by adding parallelism, delta extraction, and multi-year full loads.
