---
slug: acdoca
name: ACDOCA
title: "ACDOCA — Universal Journal"
mode: s4-only
module: FI
module_name: Finance
description_one_liner: >
  Universal Journal — the consolidated line-item accounting table in S/4HANA,
  covering G/L, A/P, A/R, costing, and profitability in one source of truth.
typical_rows: "1B – 100B"
volume_class: heavyweight
released_cds: I_JournalEntryItem
columns_total: 348
scope_lock: >
  Partition by RYEAR and POPER from the first line of code. Every other rule is
  downstream of this one.
equivalent_in_ecc:
  - slug: bkpf
    role: "document header"
  - slug: bseg
    role: "line items"
  - slug: coep
    role: "CO postings"
  - slug: glt0
    role: "GL totals (aggregated)"
columns:
  - name: MANDT
    type: CLNT
    length: 3
    key: true
    source: T000
    description: Client identifier — filter to your operating client before anything else.
  - name: RCLNT
    type: CLNT
    length: 3
    key: true
    source: T000
    description: Record client; matches MANDT in single-client systems, distinct in cross-client replication.
  - name: RLDNR
    type: CHAR
    length: 2
    key: true
    source: T881
    description: Ledger identifier — leading ledger is usually 0L; extension ledgers get their own codes.
  - name: RBUKRS
    type: CHAR
    length: 4
    key: true
    source: T001
    description: Company code; the natural high-level partition axis for parallel extracts.
  - name: GJAHR
    type: NUMC
    length: 4
    key: true
    source: null
    description: Fiscal year; paired with RYEAR it determines the accounting period bucket.
  - name: BELNR
    type: CHAR
    length: 10
    key: true
    source: null
    description: Accounting document number within the company code and fiscal year.
  - name: DOCLN
    type: CHAR
    length: 6
    key: true
    source: null
    description: Six-character zero-padded line item number within the document.
  - name: RYEAR
    type: NUMC
    length: 4
    key: false
    source: null
    description: Reporting year; primary partition key for time-sliced extraction.
  - name: POPER
    type: NUMC
    length: 3
    key: false
    source: null
    description: Posting period 001–016; secondary partition key for sub-year slicing.
  - name: RACCT
    type: CHAR
    length: 10
    key: false
    source: SKA1
    description: G/L account; resolve against SKA1/SKAT for readable account names.
  - name: HSL
    type: CURR
    length: 23
    key: false
    source: null
    description: Amount in company-code currency; paired with RHCUR for the currency code.
  - name: WSL
    type: CURR
    length: 23
    key: false
    source: null
    description: Amount in transaction currency; paired with RWCUR.
  - name: RHCUR
    type: CUKY
    length: 5
    key: false
    source: TCURC
    description: Company-code currency ISO code; join to TCURC for descriptive name.
  - name: RWCUR
    type: CUKY
    length: 5
    key: false
    source: TCURC
    description: Transaction currency ISO code.
  - name: KOKRS
    type: CHAR
    length: 4
    key: false
    source: TKA01
    description: Controlling area; drives CO reporting aggregation.
  - name: BUDAT
    type: DATS
    length: 8
    key: false
    source: null
    description: Posting date; frequently used for time-series filtering on top of RYEAR/POPER.
  - name: KTOSL
    type: CHAR
    length: 3
    key: false
    source: null
    description: Transaction key — useful for distinguishing postings by technical origin.
extract_methods:
  - id: odp-cds
    name: "ODP via CDS view"
    flavor: "I_JournalEntryItem"
    tagline: "The default, safe path. Runtime-license compatible, works at any scale with partitioning."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      Consume `I_JournalEntryItem` via the ODP context `ABAP_CDS`. Partition
      parallel extraction jobs by `RYEAR` and `RBUKRS` so no single worker ever
      scans the full table. The view applies authorization, currency handling,
      and released-contract guarantees — three things a raw SELECT can't give
      you. This is the SAP-recommended path for S/4HANA extraction.
    walkthrough_slug: acdoca
  - id: slt
    name: "SLT replication"
    flavor: null
    tagline: "Real-time replication when latency matters more than license cost."
    license: full
    latency: realtime
    volume: any
    body_markdown: |
      SAP LT Replication Server streams row-level changes from ACDOCA to a
      target system (Kafka, HANA, another database) in near real-time. Needs a
      Full Use license because SLT reads the source table directly. Useful when
      downstream reporting requires sub-minute freshness; expensive otherwise.
    walkthrough_slug: acdoca
  - id: cds-direct
    name: "CDS view via OData"
    flavor: "I_JournalEntryItem"
    tagline: "Browser- or pipeline-friendly REST access to the same released view."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      The released view is also exposed as an OData service. Pull pages with
      `$top`/`$skip`/`$filter` from any HTTP client. Fine for small extracts or
      ad-hoc reconciliation; page-size limits make it unworkable past a few
      hundred million rows.
    walkthrough_slug: acdoca
  - id: rfc
    name: "Direct RFC read"
    flavor: "RFC_READ_TABLE / custom function module"
    tagline: "Escape hatch when ODP and SLT are both unavailable."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      Calls `RFC_READ_TABLE` (or a customer function module) to pull rows in
      chunks. Bypasses the CDS view, so you inherit none of its authorization
      or currency logic. Acceptable for low-volume, short-lived jobs; never the
      right choice for a production warehouse pipeline on ACDOCA.
    walkthrough_slug: acdoca
  - id: bw-bridge
    name: "BW Bridge"
    flavor: null
    tagline: "Datasphere's managed bridge when you already own the SAP BW/4HANA licensing."
    license: bw-bridge
    latency: batch
    volume: any
    body_markdown: |
      BW Bridge surfaces ABAP CDS content inside SAP Datasphere as managed
      artifacts. Sensible when your org has already standardized on BW/4HANA or
      Datasphere; otherwise adds a license and an operational layer for no new
      data-engineering benefit.
    walkthrough_slug: acdoca
notes:
  - date: "2026-03"
    headline: "Extension ledger fields formalized in I_JournalEntryItem"
    body_markdown: |
      The released CDS view added explicit fields for extension ledger
      attribution. Extracts that relied on positional slicing should re-pull
      the schema before the next run.
    sap_note: null
    sap_note_url: null
  - date: "2025-10"
    headline: "I_JournalEntryItem metadata refresh (S/4HANA 2023 FPS02)"
    body_markdown: |
      The 2023 FPS02 shipment refreshed the Finance CDS catalog. Confirm your
      pipeline's view version still matches the S/4 release you're extracting
      from — older ABAP clients can silently serve cached metadata.
    sap_note: null
    sap_note_url: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/0fa84c9d9c634132b7c4abb9ffdd8f06/ca03bbfc892d4474be69934d6f5c783d.html"
ingestion_guidance:
  snowflake: |
    **Snowflake ingestion.** Most teams land ACDOCA via Snowpipe from an ADLS
    or S3 stage (continuous, file-triggered) or via scheduled `COPY INTO` for
    batch. Snowflake's Kafka Connector is the third option when you're
    streaming from SLT via Kafka. Partition the external stage by RYEAR/POPER
    so Snowpipe and downstream queries stay cheap.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** Auto Loader against a cloud stage is the default
    — it handles schema evolution and incremental file detection without a
    metastore hack. Delta Live Tables wraps Auto Loader with expectations and
    orchestration when you want a managed pipeline. Lakehouse Federation is
    the escape hatch for federated reads without physical replication.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Mirroring (via Datasphere) keeps a live replica in
    OneLake with no pipeline code. Dataflow Gen2 is the classic ETL path when
    you need transformations in-flight. OneLake shortcuts are the zero-copy
    option when your landing zone already holds ACDOCA extracts in Delta.
  fabric_docs_url: "https://learn.microsoft.com/en-us/fabric/mirroring/overview"
related_articles:
  - slug: acdoca-complete-walkthrough
    title: "ACDOCA Extraction: Three Patterns from Beginner to Enterprise"
  - slug: why-acdoca-breaks-sap
    title: "Why Reading ACDOCA Directly Breaks Your SAP System"
  - slug: runtime-vs-full-use
    title: "Runtime vs Full Use SAP License: The Extraction Architect's Guide"
  - slug: sap-runtime-license-trap
    title: "The SAP Runtime License Trap: Why SLT Replication Costs More Than You Think"
_source:
  - "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/651d8af3ea974ad1a4d74449122c620e/523b8a55559ad007e10000000a44538d.html"
  - "https://help.sap.com/docs/SAP_S4HANA_CLOUD/0fa84c9d9c634132b7c4abb9ffdd8f06/ca03bbfc892d4474be69934d6f5c783d.html"
---

ACDOCA is the Universal Journal in SAP S/4HANA. It consolidates what ECC spread
across BKPF + BSEG + COEP + GLT0 and related tables into a single line-item
ledger, with every posting carrying its full dimensional context (G/L account,
profit center, segment, cost center, profitability dimensions, extension
ledger). For data engineers, this is the table that makes S/4 financial
reporting tractable — and the table most likely to blow up an extract pipeline
if approached naively.

The critical thing is scale. A mid-sized S/4HANA tenant will have tens of
billions of rows in ACDOCA after a few years of postings. A `SELECT *` against
the raw table will crash a SAP dialog work process within seconds; even a
properly-hinted SQL query rarely finishes without partitioning on reporting
year and posting period. The released CDS view `I_JournalEntryItem` is the
supported extraction contract — it applies authorization, handles currency
conversion consistently, and protects against accidental full-table scans via
its consumption annotations.
