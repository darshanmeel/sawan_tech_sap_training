---
slug: ekko
name: EKKO
title: "EKKO — Purchasing Document Header"
mode: both
module: MM
module_name: Materials
description_one_liner: >
  Purchasing document header — one row per PO, RFQ, or contract; pointer into
  EKPO for line-item detail.
description_one_liner_ecc: >
  In ECC, the same shape and role; the CDS-based extraction path is absent
  and the BW extractor is the primary route.
typical_rows: "5M – 100M"
volume_class: medium
released_cds: I_PurchaseOrder
columns_total: 170
scope_lock: >
  EKKO and EKPO must be extracted consistently by (MANDT, EBELN). A header
  without its items will silently suppress spend from every procurement
  dashboard.
scope_lock_ecc: >
  Same rule as S/4; header/item consistency is the first invariant, not the
  last.
columns:
  - name: MANDT
    type: CLNT
    length: 3
    key: true
    source: T000
    description: Client identifier.
  - name: EBELN
    type: CHAR
    length: 10
    key: true
    source: null
    description: Purchasing document number — join key to EKPO.
  - name: BUKRS
    type: CHAR
    length: 4
    key: false
    source: T001
    description: Company code — a common partition axis for parallel extraction.
  - name: BSTYP
    type: CHAR
    length: 1
    key: false
    source: null
    description: Document category (F=PO, A=RFQ, K=contract, L=scheduling agreement).
  - name: BSART
    type: CHAR
    length: 4
    key: false
    source: T161
    description: Document type within the category; drives number-range and workflow.
  - name: AEDAT
    type: DATS
    length: 8
    key: false
    source: null
    description: Document last-change date; useful for delta filtering.
  - name: ERNAM
    type: CHAR
    length: 12
    key: false
    source: null
    description: User who created the document.
  - name: LIFNR
    type: CHAR
    length: 10
    key: false
    source: LFA1
    description: Vendor account number.
  - name: EKORG
    type: CHAR
    length: 4
    key: false
    source: T024E
    description: Purchasing organization; common parallel-extract axis.
  - name: EKGRP
    type: CHAR
    length: 3
    key: false
    source: T024
    description: Purchasing group responsible for the document.
  - name: WAERS
    type: CUKY
    length: 5
    key: false
    source: TCURC
    description: Document currency.
  - name: BEDAT
    type: DATS
    length: 8
    key: false
    source: null
    description: Document date (PO date).
  - name: FRGZU
    type: CHAR
    length: 8
    key: false
    source: null
    description: Release status — empty means no release strategy; non-empty encodes the current release state.
  - name: MEMORY
    type: CHAR
    length: 1
    key: false
    source: null
    description: Flag marking held/parked documents; filter out for normal reporting.
  - name: LOEKZ
    type: CHAR
    length: 1
    key: false
    source: null
    description: Deletion indicator at header level.
  - name: STAKO
    type: CHAR
    length: 1
    key: false
    source: null
    description: Completion indicator for contracts.
extract_methods:
  - id: odp-cds
    name: "ODP via CDS view"
    flavor: "I_PurchaseOrder"
    tagline: "The released PO view; Runtime-safe."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `I_PurchaseOrder` exposes EKKO with authorization and organizational
      filters applied. Partition by `EKORG` for parallel extraction; co-extract
      EKPO to preserve document integrity.
    walkthrough_slug: ekko
  - id: slt
    name: "SLT replication"
    flavor: null
    tagline: "Real-time replication for spend-analytics freshness."
    license: full
    latency: realtime
    volume: any
    body_markdown: |
      SLT against EKKO is straightforward. Use when a downstream spend-cube
      or vendor-performance system needs sub-minute latency.
    walkthrough_slug: null
  - id: cds-direct
    name: "CDS view via OData"
    flavor: "I_PurchaseOrder"
    tagline: "REST access for per-PO lookups and small extracts."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      OData is good for per-PO lookups driven by approval or invoicing
      systems. Not suited to history reloads at typical PO volumes.
    walkthrough_slug: null
  - id: bw-extractor
    name: "BW Extractor (classic)"
    flavor: "2LIS_02_HDR"
    tagline: "LO-Cockpit purchasing-header extractor with native delta."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `2LIS_02_HDR` is the reference BW extractor for EKKO. Works in both ECC
      and S/4 post-LO-Cockpit activation.
    walkthrough_slug: null
notes:
  - date: "2026-02"
    headline: "I_PurchaseOrder schema additions — 2025 FPS01"
    body_markdown: |
      The released PO view picked up additional fields for supplier
      diversity and sustainability attributes. Refresh your schema inspection
      before the next pipeline deploy. [NEEDS_SAP_CITATION]
    sap_note: null
    sap_note_url: null
  - date: "2025-10"
    headline: "CDS Views for Purchase Orders — catalog update"
    body_markdown: |
      SAP documented additional released CDS views around purchase orders in
      the 2025 release, extending the coverage of authorized extraction paths.
    sap_note: null
    sap_note_url: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/c0c54048d35849128be8e872df5bea6d/6d471dfc743048c3891601fa8ab0dc1e.html"
ingestion_guidance:
  snowflake: |
    **Snowflake ingestion.** Snowpipe from a staged export partitioned by
    `EKORG` is the steady-state pattern; scheduled `COPY INTO` is fine for
    daily batches.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** Auto Loader to a Delta landing table; DLT
    expectations cover EKKO/EKPO referential integrity.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Mirroring via Datasphere is the lowest-overhead
    option; Dataflow Gen2 when cleansing belongs in ingestion.
  fabric_docs_url: "https://learn.microsoft.com/en-us/fabric/mirroring/overview"
columns_ecc:
  - name: MANDT
    type: CLNT
    length: 3
    key: true
    source: T000
    description: Client identifier.
  - name: EBELN
    type: CHAR
    length: 10
    key: true
    source: null
    description: Purchasing document number.
  - name: BUKRS
    type: CHAR
    length: 4
    key: false
    source: T001
    description: Company code.
  - name: BSTYP
    type: CHAR
    length: 1
    key: false
    source: null
    description: Document category (F/A/K/L).
  - name: BSART
    type: CHAR
    length: 4
    key: false
    source: T161
    description: Document type.
  - name: AEDAT
    type: DATS
    length: 8
    key: false
    source: null
    description: Last-change date.
  - name: LIFNR
    type: CHAR
    length: 10
    key: false
    source: LFA1
    description: Vendor account number.
  - name: EKORG
    type: CHAR
    length: 4
    key: false
    source: T024E
    description: Purchasing organization.
  - name: EKGRP
    type: CHAR
    length: 3
    key: false
    source: T024
    description: Purchasing group.
  - name: WAERS
    type: CUKY
    length: 5
    key: false
    source: TCURC
    description: Document currency.
  - name: BEDAT
    type: DATS
    length: 8
    key: false
    source: null
    description: Document date.
  - name: FRGZU
    type: CHAR
    length: 8
    key: false
    source: null
    description: Release status.
  - name: LOEKZ
    type: CHAR
    length: 1
    key: false
    source: null
    description: Header deletion flag.
columns_total_ecc: 158
extract_methods_ecc:
  - id: bw-extractor
    name: "BW Extractor (classic)"
    flavor: "2LIS_02_HDR"
    tagline: "Canonical ECC purchasing-header extractor."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `2LIS_02_HDR` has been the reference path for ECC EKKO for decades.
      LO-Cockpit setup is one-time; delta is handled for you.
    walkthrough_slug: null
  - id: slt
    name: "SLT replication"
    flavor: null
    tagline: "Real-time path when batch windows are too wide."
    license: full
    latency: realtime
    volume: any
    body_markdown: |
      SLT against ECC EKKO mirrors the S/4 approach. Primary key is clean,
      delta tracking is reliable.
    walkthrough_slug: null
  - id: rfc
    name: "Direct RFC read"
    flavor: "RFC_READ_TABLE / BAPI_PO_GETDETAIL"
    tagline: "BAPI-first for per-PO detail; RFC table-read for small exports."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      `BAPI_PO_GETDETAIL` returns a full PO (header + items) in one call and
      is the pragmatic path for approval-system integrations. Not a pipeline
      at scale.
    walkthrough_slug: null
notes_ecc:
  - date: "2025-06"
    headline: "LO-Cockpit extractors remain the ECC reference for EKKO"
    body_markdown: |
      SAP continues to document `2LIS_02_HDR` and `2LIS_02_ITM` as the
      reference path for ECC purchasing extraction. No shift has been
      announced for ECC systems. [NEEDS_SAP_CITATION]
    sap_note: null
    sap_note_url: null
ingestion_guidance_ecc:
  snowflake: |
    **Snowflake ingestion.** BW extractor output or SLT deltas land via
    Snowpipe against an object stage.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** Auto Loader to Delta; DLT for EKKO/EKPO
    referential checks.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Dataflow Gen2 via the SAP HANA or SAP Table
    connector through an on-prem gateway.
  fabric_docs_url: "https://learn.microsoft.com/en-us/fabric/data-factory/connector-sap-hana-overview"
_source:
  - "https://help.sap.com/docs/SAP_PROFITABILITY_PERFORMANCE_MANAGEMENT/7fa13890d47b4c69bbb62175e84e4aa8/a1359f30632b4496ae267a7febad6f92.html"
  - "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/af9ef57f504840d2b81be8667206d485/63fb658bf8fc4a2690a1d8ae0da2eb2f.html"
---

EKKO is the purchasing-document header — one row per PO, RFQ, contract, or
scheduling agreement, keyed by `(MANDT, EBELN)` with `BSTYP` distinguishing
the document category. Typical mid-size tenants hold tens of millions of
rows; large ones push past a hundred million over the life of the system.

EKKO and EKPO must be extracted together. The first invariant, not the last:
a header without its items silently suppresses spend from every downstream
dashboard. Partition parallel extracts by `EKORG` (purchasing organization)
or `BUKRS` (company code); both are indexed and both produce clean
workload-split boundaries.
