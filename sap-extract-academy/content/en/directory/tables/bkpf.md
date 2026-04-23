---
slug: bkpf
name: BKPF
title: "BKPF — Accounting Document Header"
mode: both
module: FI
module_name: Finance
description_one_liner: >
  Accounting document header — one row per posted document, with posting
  date, reference, currency, and the pointers into BSEG for line items.
description_one_liner_ecc: >
  Accounting document header in ECC — the header record for every FI document,
  linked to line items in BSEG via (MANDT, BUKRS, BELNR, GJAHR).
typical_rows: "50M – 500M"
volume_class: medium
released_cds: I_OperationalAcctgDocHeader
columns_total: 98
scope_lock: >
  BKPF + BSEG are always extracted together; never pull headers without
  matching line items or you will break every downstream reconciliation.
scope_lock_ecc: >
  In ECC, BKPF is the authoritative header table; in S/4HANA it is a
  compatibility facade over ACDOCA. Pick your mode carefully.
columns:
  - name: MANDT
    type: CLNT
    length: 3
    key: true
    source: T000
    description: Client identifier.
  - name: BUKRS
    type: CHAR
    length: 4
    key: true
    source: T001
    description: Company code — the primary partition axis.
  - name: BELNR
    type: CHAR
    length: 10
    key: true
    source: null
    description: Accounting document number, unique within company code and fiscal year.
  - name: GJAHR
    type: NUMC
    length: 4
    key: true
    source: null
    description: Fiscal year of the document; use with BELNR to join line items.
  - name: BLART
    type: CHAR
    length: 2
    key: false
    source: T003
    description: Document type (SA, KR, DR …); filters which business process the document belongs to.
  - name: BLDAT
    type: DATS
    length: 8
    key: false
    source: null
    description: Document date — the date on the source business document.
  - name: BUDAT
    type: DATS
    length: 8
    key: false
    source: null
    description: Posting date that drives fiscal-period assignment.
  - name: MONAT
    type: NUMC
    length: 2
    key: false
    source: null
    description: Posting period 01–16 derived from BUDAT and the fiscal-year variant.
  - name: CPUDT
    type: DATS
    length: 8
    key: false
    source: null
    description: Entry date — when the document was physically created in SAP.
  - name: WAERS
    type: CUKY
    length: 5
    key: false
    source: TCURC
    description: Document currency; join to TCURC for ISO code resolution.
  - name: KURSF
    type: DEC
    length: 9
    key: false
    source: null
    description: Exchange rate used for local-currency translation.
  - name: XBLNR
    type: CHAR
    length: 16
    key: false
    source: null
    description: Reference document number supplied by the source system or user.
  - name: BKTXT
    type: CHAR
    length: 25
    key: false
    source: null
    description: Document header text — free-text comment, useful for reconciliation lookups.
  - name: STBLG
    type: CHAR
    length: 10
    key: false
    source: null
    description: Reversal document pointer; non-empty means this document has been reversed.
  - name: AWTYP
    type: CHAR
    length: 5
    key: false
    source: null
    description: Reference transaction (RMRP, VBRK …) that originated this FI document.
  - name: USNAM
    type: CHAR
    length: 12
    key: false
    source: null
    description: User who posted the document; audit/provenance field.
extract_methods:
  - id: odp-cds
    name: "ODP via CDS view"
    flavor: "I_OperationalAcctgDocHeader"
    tagline: "The released header view. Safe default under Runtime License."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `I_OperationalAcctgDocHeader` exposes BKPF with authorizations applied.
      Extract in parallel by `BUKRS` and `GJAHR`; always co-extract with BSEG
      to keep referential integrity on the landing side.
    walkthrough_slug: bkpf
  - id: slt
    name: "SLT replication"
    flavor: null
    tagline: "Row-level replication when reporting latency is sub-minute."
    license: full
    latency: realtime
    volume: any
    body_markdown: |
      SLT replicates BKPF writes to a target system transactionally. Useful
      when downstream cash-management or treasury applications need near
      real-time postings. Requires Full Use licensing.
    walkthrough_slug: bkpf
  - id: cds-direct
    name: "CDS view via OData"
    flavor: "I_OperationalAcctgDocHeader"
    tagline: "REST access for pipelines and ad-hoc lookups."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      Surfaces the same released view as a paged OData feed. Practical for
      micro-extracts (a single company code, a single fiscal period); OData
      throughput makes it unsuitable for full history reloads.
    walkthrough_slug: bkpf
  - id: bw-extractor
    name: "BW Extractor (classic)"
    flavor: "0FI_GL_14 / 0FI_GL_4"
    tagline: "The classic extractor family — still present in S/4 for BW compatibility."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      The `0FI_GL_*` DataSources pull BKPF+BSEG together with built-in delta
      handling. Use when your org already operates a BW stack or when you need
      the extractor's delta-marker guarantees without coding them yourself.
    walkthrough_slug: bkpf
notes:
  - date: "2026-02"
    headline: "BKPF in S/4HANA continues as compatibility view"
    body_markdown: |
      SAP reiterated that direct SQL on BKPF in S/4HANA routes through a
      compatibility layer backed by ACDOCA. Long-running reads should target
      `I_OperationalAcctgDocHeader` or ACDOCA directly. [NEEDS_SAP_CITATION]
    sap_note: null
    sap_note_url: null
  - date: "2025-09"
    headline: "eDocument UUIDs persisted in BKPF extension fields"
    body_markdown: |
      For countries with e-invoicing mandates, approved invoice UUIDs are now
      stored in BKPF extension fields. Re-extract your header schema before
      downstream invoice-lookup pipelines break.
    sap_note: null
    sap_note_url: "https://help.sap.com/doc/474a13c5e9964c849c3a14d6c04339b5/100/en-US/a15eaad03a934fb494b51b5e76afeb78.html"
ingestion_guidance:
  snowflake: |
    **Snowflake ingestion.** Land BKPF and BSEG together via Snowpipe or
    scheduled `COPY INTO` from an object-store stage. Partition staged files
    by `(GJAHR, BUKRS)`. Downstream `CREATE TABLE AS SELECT` against the
    landing table produces the reporting shape; avoid materializing joins on
    the raw landing zone.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** Auto Loader to a Delta landing table with the
    same `(GJAHR, BUKRS)` partitioning is the default path. DLT expectations
    catch header-without-line-items anomalies early. Foreign-table reads via
    Lakehouse Federation work for occasional lookups.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Mirroring (via Datasphere) keeps BKPF/BSEG in sync
    with the source at low overhead. Dataflow Gen2 is appropriate when header
    cleansing or currency conversion belongs in the ingestion layer.
  fabric_docs_url: "https://learn.microsoft.com/en-us/fabric/mirroring/overview"
columns_ecc:
  - name: MANDT
    type: CLNT
    length: 3
    key: true
    source: T000
    description: Client identifier.
  - name: BUKRS
    type: CHAR
    length: 4
    key: true
    source: T001
    description: Company code.
  - name: BELNR
    type: CHAR
    length: 10
    key: true
    source: null
    description: Accounting document number.
  - name: GJAHR
    type: NUMC
    length: 4
    key: true
    source: null
    description: Fiscal year.
  - name: BLART
    type: CHAR
    length: 2
    key: false
    source: T003
    description: Document type controlling which business process this document represents.
  - name: BLDAT
    type: DATS
    length: 8
    key: false
    source: null
    description: Document date.
  - name: BUDAT
    type: DATS
    length: 8
    key: false
    source: null
    description: Posting date.
  - name: WAERS
    type: CUKY
    length: 5
    key: false
    source: TCURC
    description: Document currency.
  - name: XBLNR
    type: CHAR
    length: 16
    key: false
    source: null
    description: Reference document number.
  - name: BKTXT
    type: CHAR
    length: 25
    key: false
    source: null
    description: Document header text.
  - name: STBLG
    type: CHAR
    length: 10
    key: false
    source: null
    description: Reversal document pointer.
  - name: AWTYP
    type: CHAR
    length: 5
    key: false
    source: null
    description: Reference transaction originating this FI document.
  - name: USNAM
    type: CHAR
    length: 12
    key: false
    source: null
    description: User who posted the document.
columns_total_ecc: 86
extract_methods_ecc:
  - id: slt
    name: "SLT replication"
    flavor: null
    tagline: "The default ECC path when you need real-time FI data."
    license: full
    latency: realtime
    volume: any
    body_markdown: |
      SLT works as well against ECC as S/4 and is the usual starting point
      when a downstream system needs low-latency FI headers. The table has
      well-behaved primary keys that SLT can track cleanly.
    walkthrough_slug: bkpf
  - id: bw-extractor
    name: "BW Extractor (classic)"
    flavor: "0FI_GL_4 / 0FI_GL_14"
    tagline: "The canonical ECC path for GL line-item extraction."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      The `0FI_GL_*` extractor family was designed for exactly this table. In
      ECC it is still the recommended route for bulk FI extraction — delta
      logic is handled by the extractor itself.
    walkthrough_slug: bkpf
  - id: rfc
    name: "Direct RFC read"
    flavor: "RFC_READ_TABLE"
    tagline: "Low-volume ad-hoc reads when you can't install anything."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      `RFC_READ_TABLE` works against BKPF but is slow once rowcount exceeds a
      few hundred thousand. Treat as an emergency path, not a pipeline.
    walkthrough_slug: bkpf
notes_ecc:
  - date: "2025-07"
    headline: "No S/4-style compatibility concerns in ECC"
    body_markdown: |
      In ECC, BKPF is a real database table. Extracts behave the way old
      hands expect; the S/4HANA compatibility-view caveats do not apply.
    sap_note: null
    sap_note_url: null
ingestion_guidance_ecc:
  snowflake: |
    **Snowflake ingestion.** Same pattern as S/4 — Snowpipe or `COPY INTO`
    against an object-store stage. ECC volumes are typically smaller, so
    batch windows are less constrained.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** Auto Loader against the stage works the same as
    for S/4. ECC BW extractor output lands cleanly as Delta.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Dataflow Gen2 via the SAP HANA or SAP Table
    connectors (through an on-premises data gateway) is the standard path for
    ECC systems.
  fabric_docs_url: "https://learn.microsoft.com/en-us/fabric/data-factory/connector-sap-hana-overview"
_source:
  - "https://help.sap.com/docs/SAP_PROFITABILITY_PERFORMANCE_MANAGEMENT/7fa13890d47b4c69bbb62175e84e4aa8/4b340289e9634b7486c3abf02a853a8f.html"
---

BKPF is the accounting document header — one row per posted FI document, with
pointers into BSEG for the matching line items. In ECC, BKPF is a real,
authoritative table and the natural first stop for any financial-document
extraction. In S/4HANA, BKPF is a compatibility view over ACDOCA: the rows
look the same, the keys are stable, but the underlying storage is different
and the performance characteristics diverge from ECC folklore.

For data engineers, the practical consequence is this: BKPF and BSEG must
always be extracted together, with consistent GJAHR/BELNR keys, or downstream
joins will fail silently when a header arrives without its lines (or vice
versa). In S/4, prefer the released CDS view `I_OperationalAcctgDocHeader` —
it preserves the BKPF shape but routes reads through the ACDOCA-backed
consumption layer and applies authorization.
