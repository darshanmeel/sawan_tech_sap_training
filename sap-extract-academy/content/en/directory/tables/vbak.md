---
slug: vbak
name: VBAK
title: "VBAK — Sales Document Header"
mode: both
module: SD
module_name: Sales
description_one_liner: >
  Sales document header — one row per sales order, quotation, contract, or
  inquiry; pointer into VBAP for item-level detail.
description_one_liner_ecc: >
  In ECC, the authoritative sales-document header table with the same primary
  key and role as in S/4.
typical_rows: "10M – 200M"
volume_class: medium
released_cds: I_SalesDocument
columns_total: 140
scope_lock: >
  VBAK and VBAP must be extracted consistently by (MANDT, VBELN) — a header
  without its items breaks every order-to-cash reconciliation downstream.
scope_lock_ecc: >
  Same rule applies in ECC; VBAK/VBAP consistency is a hard downstream
  requirement even though the tables themselves behave simply.
columns:
  - name: MANDT
    type: CLNT
    length: 3
    key: true
    source: T000
    description: Client identifier.
  - name: VBELN
    type: CHAR
    length: 10
    key: true
    source: null
    description: Sales document number — the canonical join key with VBAP.
  - name: ERDAT
    type: DATS
    length: 8
    key: false
    source: null
    description: Document creation date; common filter for incremental extraction.
  - name: ERZET
    type: TIMS
    length: 6
    key: false
    source: null
    description: Creation time; pair with ERDAT for true created-at timestamps.
  - name: ERNAM
    type: CHAR
    length: 12
    key: false
    source: null
    description: User who created the document; audit/provenance.
  - name: AUART
    type: CHAR
    length: 4
    key: false
    source: TVAK
    description: Sales document type (OR, QT, CR …) controlling pricing, delivery, billing.
  - name: VKORG
    type: CHAR
    length: 4
    key: false
    source: TVKO
    description: Sales organization — a common partition axis for parallel extraction.
  - name: VTWEG
    type: CHAR
    length: 2
    key: false
    source: TVTW
    description: Distribution channel — part of the sales-area tuple.
  - name: SPART
    type: CHAR
    length: 2
    key: false
    source: TSPA
    description: Division — third leg of the sales area.
  - name: KUNNR
    type: CHAR
    length: 10
    key: false
    source: KNA1
    description: Sold-to customer; head key for customer-driven analytics.
  - name: NETWR
    type: CURR
    length: 15
    key: false
    source: null
    description: Net value of the document in document currency.
  - name: WAERK
    type: CUKY
    length: 5
    key: false
    source: TCURC
    description: Document currency code.
  - name: VDATU
    type: DATS
    length: 8
    key: false
    source: null
    description: Requested delivery date.
  - name: AUGRU
    type: CHAR
    length: 3
    key: false
    source: TVAU
    description: Order reason; useful for attributing lost/won deals.
  - name: ABSTK
    type: CHAR
    length: 1
    key: false
    source: null
    description: Overall rejection status — flag for cancelled/abandoned documents.
extract_methods:
  - id: odp-cds
    name: "ODP via CDS view"
    flavor: "I_SalesDocument"
    tagline: "The safe S/4 path under Runtime License."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `I_SalesDocument` is the released sales-document header view. Extract in
      parallel by `VKORG` and `ERDAT` windows; always co-extract VBAP to keep
      referential integrity on the target side.
    walkthrough_slug: vbak
  - id: slt
    name: "SLT replication"
    flavor: null
    tagline: "Real-time replication for CRM-adjacent reporting."
    license: full
    latency: realtime
    volume: any
    body_markdown: |
      SLT against VBAK is straightforward — stable primary key, predictable
      volume. Use when downstream sales-analytics need sub-minute freshness.
    walkthrough_slug: vbak
  - id: cds-direct
    name: "CDS view via OData"
    flavor: "I_SalesDocument"
    tagline: "REST access for single-order lookups and small exports."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      OData is appropriate for a handful of orders at a time — order-status
      lookups, pipeline spot checks. Not practical for history reloads.
    walkthrough_slug: vbak
  - id: bw-extractor
    name: "BW Extractor (classic)"
    flavor: "2LIS_11_VAHDR"
    tagline: "LO-data extractor with native delta handling."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `2LIS_11_VAHDR` is the classic LO-Cockpit extractor for sales headers.
      Its delta queue mechanism works in both ECC and S/4 and removes the need
      to implement change-capture yourself.
    walkthrough_slug: vbak
notes:
  - date: "2026-01"
    headline: "I_SalesDocument schema additions for 2025 FPS01"
    body_markdown: |
      The released sales-document CDS view picked up new fields in S/4HANA
      2025 FPS01. Re-run your schema inspection before the next pipeline
      deploy or downstream consumers will see unexpected columns.
    sap_note: null
    sap_note_url: "https://help.sap.com/doc/b870b6ebcd2e4b5890f16f4b06827064/2025.001/en-US/WN_OP2025_FPS01_EN.pdf"
  - date: "2025-09"
    headline: "Archiving object SD_VBAK reminder"
    body_markdown: |
      Archived sales documents move out of VBAK into archive files. If your
      extract expects full history, verify your archive-access configuration
      or reconciliation will drift each quarter.
    sap_note: null
    sap_note_url: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/7b24a64d9d0941bda1afa753263d9e39/c8f04453d2e57425e10000000a44176d.html"
ingestion_guidance:
  snowflake: |
    **Snowflake ingestion.** Snowpipe from a staged export partitioned by
    `ERDAT` month works well for VBAK's moderate volumes. `COPY INTO` batch
    loads are fine for daily full-snapshot patterns.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** Auto Loader to a Delta landing table; DLT
    expectations check VBAK/VBAP header-without-item anomalies.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Mirroring via Datasphere is the lowest-maintenance
    path; Dataflow Gen2 handles cleansing and type mapping in flight.
  fabric_docs_url: "https://learn.microsoft.com/en-us/fabric/mirroring/overview"
columns_ecc:
  - name: MANDT
    type: CLNT
    length: 3
    key: true
    source: T000
    description: Client identifier.
  - name: VBELN
    type: CHAR
    length: 10
    key: true
    source: null
    description: Sales document number.
  - name: ERDAT
    type: DATS
    length: 8
    key: false
    source: null
    description: Creation date.
  - name: ERNAM
    type: CHAR
    length: 12
    key: false
    source: null
    description: Creator's user ID.
  - name: AUART
    type: CHAR
    length: 4
    key: false
    source: TVAK
    description: Sales document type.
  - name: VKORG
    type: CHAR
    length: 4
    key: false
    source: TVKO
    description: Sales organization.
  - name: VTWEG
    type: CHAR
    length: 2
    key: false
    source: TVTW
    description: Distribution channel.
  - name: SPART
    type: CHAR
    length: 2
    key: false
    source: TSPA
    description: Division.
  - name: KUNNR
    type: CHAR
    length: 10
    key: false
    source: KNA1
    description: Sold-to party.
  - name: NETWR
    type: CURR
    length: 15
    key: false
    source: null
    description: Net value in document currency.
  - name: WAERK
    type: CUKY
    length: 5
    key: false
    source: TCURC
    description: Document currency.
  - name: VDATU
    type: DATS
    length: 8
    key: false
    source: null
    description: Requested delivery date.
columns_total_ecc: 128
extract_methods_ecc:
  - id: bw-extractor
    name: "BW Extractor (classic)"
    flavor: "2LIS_11_VAHDR"
    tagline: "Canonical ECC sales-header extractor with built-in delta."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `2LIS_11_VAHDR` is the reference ECC extractor for VBAK. LO Cockpit
      setup is required once; after that delta is handled for you.
    walkthrough_slug: vbak
  - id: slt
    name: "SLT replication"
    flavor: null
    tagline: "Real-time path when batch windows aren't acceptable."
    license: full
    latency: realtime
    volume: any
    body_markdown: |
      SLT against ECC VBAK streams row-level changes cleanly. Use only when
      latency requirements force the Full Use license cost.
    walkthrough_slug: vbak
  - id: rfc
    name: "Direct RFC read"
    flavor: "RFC_READ_TABLE"
    tagline: "Ad-hoc lookups only; not a pipeline path."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      `RFC_READ_TABLE` against VBAK works for a few thousand rows. Past that,
      the 512-byte row-length truncation in the standard function module
      starts cutting long fields.
    walkthrough_slug: vbak
notes_ecc:
  - date: "2025-05"
    headline: "LO-Cockpit setup guidance still current"
    body_markdown: |
      SAP confirmed that the classic 2LIS_11_* LO-Cockpit extractor family
      remains the reference path for ECC VBAK extraction. [NEEDS_SAP_CITATION]
    sap_note: null
    sap_note_url: null
ingestion_guidance_ecc:
  snowflake: |
    **Snowflake ingestion.** ECC BW extractor output or SLT change streams land
    via Snowpipe against an object stage. Daily snapshots work too at these
    volumes.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** Auto Loader to Delta handles both snapshot and
    delta patterns; DLT wraps the pipeline with expectations if desired.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Dataflow Gen2 with the SAP HANA or SAP Table
    connector (via an on-prem gateway) is the usual ECC pattern.
  fabric_docs_url: "https://learn.microsoft.com/en-us/fabric/data-factory/connector-sap-hana-overview"
_source:
  - "https://help.sap.com/docs/SAP_PROFITABILITY_PERFORMANCE_MANAGEMENT_CLOUD/299cc31818394e94bf54da6fac6ffcdc/bb1474ba881641fd9e5fab4c5bf36a08.html"
  - "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/ee6ff9b281d8448f96b4fe6c89f2bdc8/87fae757dc3bf032e10000000a441470.html"
---

VBAK is the sales-document header table — every sales order, quotation,
contract, or inquiry in SD lives here as one row, with pointers into VBAP for
line-item detail. The table's shape is nearly identical between ECC and S/4;
the extraction story differs mainly in which method is the current best
practice.

The practical rule is the same on both sides: extract VBAK and VBAP together
with consistent `(MANDT, VBELN)` keys, or every downstream order-to-cash
dashboard will produce quietly wrong numbers when a header arrives without
its items. In S/4, `I_SalesDocument` is the supported contract; in ECC, the
`2LIS_11_VAHDR` LO-Cockpit extractor is still the reference path.
