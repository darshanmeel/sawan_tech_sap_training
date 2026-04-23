---
slug: ekpo
name: EKPO
title: "EKPO — Purchasing Document Items"
mode: both
module: MM
module_name: Materials
description_one_liner: >
  Purchasing document line items — one row per PO position, joined to EKKO
  via (MANDT, EBELN) and carrying material, plant, quantity, and account
  assignments.
description_one_liner_ecc: >
  In ECC, the authoritative purchasing-item table; same key structure and
  role as in S/4 with the familiar MATNR length difference.
typical_rows: "50M – 500M"
volume_class: heavyweight
released_cds: I_PurchaseOrderItem
columns_total: 340
scope_lock: >
  Always co-extract with EKKO. (EBELN, EBELP) is the inviolable target
  primary key — deduplication that loses EBELP collapses item detail.
scope_lock_ecc: >
  Same rule as S/4. The additional ECC caveat is MATNR width (18 chars), which
  downstream warehouses that feed from both systems must normalize.
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
    source: EKKO
    description: Purchasing document number; parent key into EKKO.
  - name: EBELP
    type: NUMC
    length: 5
    key: true
    source: null
    description: Item number within the purchasing document; 00010/00020/… step of ten.
  - name: LOEKZ
    type: CHAR
    length: 1
    key: false
    source: null
    description: Deletion flag at line level — non-empty means this line was cancelled.
  - name: TXZ01
    type: CHAR
    length: 40
    key: false
    source: null
    description: Short text for the item — often edited away from the material master text.
  - name: MATNR
    type: CHAR
    length: 40
    key: false
    source: MARA
    description: Material number; 40 chars in S/4 (extended) vs 18 in ECC.
  - name: WERKS
    type: CHAR
    length: 4
    key: false
    source: T001W
    description: Plant for which the material is procured.
  - name: LGORT
    type: CHAR
    length: 4
    key: false
    source: T001L
    description: Storage location within the plant.
  - name: MENGE
    type: QUAN
    length: 13
    key: false
    source: null
    description: Order quantity in purchasing unit.
  - name: MEINS
    type: UNIT
    length: 3
    key: false
    source: T006
    description: Purchasing unit of measure.
  - name: BPRME
    type: UNIT
    length: 3
    key: false
    source: T006
    description: Order price unit — may differ from MEINS for price-per-1000 cases.
  - name: NETPR
    type: DEC
    length: 11
    key: false
    source: null
    description: Net price per price-unit in document currency.
  - name: PEINH
    type: DEC
    length: 5
    key: false
    source: null
    description: Price unit; divide NETPR by PEINH to get per-piece price.
  - name: NETWR
    type: CURR
    length: 15
    key: false
    source: null
    description: Net value of the line in document currency.
  - name: KNTTP
    type: CHAR
    length: 1
    key: false
    source: null
    description: Account assignment category (K=cost center, P=project, A=asset, …).
  - name: EFFWR
    type: CURR
    length: 15
    key: false
    source: null
    description: Effective value (NETWR plus conditions) — the true delivered-cost figure.
extract_methods:
  - id: odp-cds
    name: "ODP via CDS view"
    flavor: "I_PurchaseOrderItem"
    tagline: "The released item view; Runtime-safe and authorized."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `I_PurchaseOrderItem` exposes EKPO with authorization and organizational
      filters applied. Partition by `EKORG` (inherited from the header) for
      parallel extraction; join client-side to `I_PurchaseOrder`.
    walkthrough_slug: null
  - id: slt
    name: "SLT replication"
    flavor: null
    tagline: "Real-time replication for operational procurement dashboards."
    license: full
    latency: realtime
    volume: any
    body_markdown: |
      SLT against EKPO handles line-item volume without surprises. Use when
      operational systems need sub-minute latency on open POs.
    walkthrough_slug: null
  - id: cds-direct
    name: "CDS view via OData"
    flavor: "I_PurchaseOrderItem"
    tagline: "OData for per-PO item lookups; too slow for history."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      Practical for approval-system integrations that need line-level detail
      on specific POs. Not suited to history reloads at EKPO volumes.
    walkthrough_slug: null
  - id: bw-extractor
    name: "BW Extractor (classic)"
    flavor: "2LIS_02_ITM"
    tagline: "LO-Cockpit item extractor with native delta handling."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `2LIS_02_ITM` is the reference BW extractor for EKPO. Works in both ECC
      and S/4; delta tracking is built in.
    walkthrough_slug: null
notes:
  - date: "2026-02"
    headline: "I_PurchaseOrderItem schema additions — 2025 FPS01"
    body_markdown: |
      The released item view gained additional supply-chain-resilience fields
      in S/4HANA 2025 FPS01. Re-run metadata inspection before the next
      pipeline deploy. [NEEDS_SAP_CITATION]
    sap_note: null
    sap_note_url: null
  - date: "2025-09"
    headline: "Archiving object MM_EKKO covers EKKO + EKPO"
    body_markdown: |
      Archived purchasing documents leave both EKKO and EKPO via MM_EKKO. If
      you extract EKPO without archive-access configuration, old lines will
      silently disappear from your dimension.
    sap_note: null
    sap_note_url: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/af9ef57f504840d2b81be8667206d485/13c2b853dcfcb44ce10000000a174cb4.html"
ingestion_guidance:
  snowflake: |
    **Snowflake ingestion.** Snowpipe from a partitioned stage handles the
    steady-state flow; history reloads parallelize by `EKORG` via `COPY
    INTO`.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** Auto Loader to Delta, Z-ordered on (EKORG,
    MATNR), gives downstream vendor-spend queries low-latency reads.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Mirroring via Datasphere or Dataflow Gen2 via the
    SAP HANA connector; pick based on whether you need transformations
    in-flight.
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
    source: EKKO
    description: Purchasing document number.
  - name: EBELP
    type: NUMC
    length: 5
    key: true
    source: null
    description: Item number within the purchasing document.
  - name: LOEKZ
    type: CHAR
    length: 1
    key: false
    source: null
    description: Line deletion flag.
  - name: TXZ01
    type: CHAR
    length: 40
    key: false
    source: null
    description: Item short text.
  - name: MATNR
    type: CHAR
    length: 18
    key: false
    source: MARA
    description: Material number — 18 chars in ECC; note S/4 extension to 40.
  - name: WERKS
    type: CHAR
    length: 4
    key: false
    source: T001W
    description: Plant.
  - name: LGORT
    type: CHAR
    length: 4
    key: false
    source: T001L
    description: Storage location.
  - name: MENGE
    type: QUAN
    length: 13
    key: false
    source: null
    description: Order quantity.
  - name: MEINS
    type: UNIT
    length: 3
    key: false
    source: T006
    description: Purchasing unit of measure.
  - name: NETPR
    type: DEC
    length: 11
    key: false
    source: null
    description: Net price.
  - name: NETWR
    type: CURR
    length: 15
    key: false
    source: null
    description: Net value of the line.
  - name: KNTTP
    type: CHAR
    length: 1
    key: false
    source: null
    description: Account assignment category.
columns_total_ecc: 312
extract_methods_ecc:
  - id: bw-extractor
    name: "BW Extractor (classic)"
    flavor: "2LIS_02_ITM"
    tagline: "Canonical ECC purchasing-item extractor."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `2LIS_02_ITM` has been the reference ECC path for EKPO since BW 3.x.
      LO-Cockpit configuration is a one-time setup.
    walkthrough_slug: null
  - id: slt
    name: "SLT replication"
    flavor: null
    tagline: "Real-time path for open-PO visibility."
    license: full
    latency: realtime
    volume: any
    body_markdown: |
      SLT against ECC EKPO is mechanically identical to S/4. Mind the MATNR
      length difference (18 chars ECC, 40 chars S/4) on cross-system pipelines.
    walkthrough_slug: null
  - id: rfc
    name: "Direct RFC read"
    flavor: "RFC_READ_TABLE / BAPI_PO_GETDETAIL"
    tagline: "BAPI for per-PO detail, RFC-read for ad-hoc exports."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      `BAPI_PO_GETDETAIL` returns header + items in one roundtrip; useful for
      approval integrations. `RFC_READ_TABLE` works for small exports but
      hits the 512-byte row-length truncation quickly on EKPO's wide row.
    walkthrough_slug: null
notes_ecc:
  - date: "2025-06"
    headline: "LO-Cockpit extractors continue as the ECC reference for EKPO"
    body_markdown: |
      `2LIS_02_ITM` remains the documented ECC path; no shift has been
      announced. The `RFC_READ_TABLE` 512-byte truncation limit is unchanged.
      [NEEDS_SAP_CITATION]
    sap_note: null
    sap_note_url: null
ingestion_guidance_ecc:
  snowflake: |
    **Snowflake ingestion.** BW extractor output or SLT change-streams via
    Snowpipe against an object stage.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** Auto Loader to Delta; normalize MATNR to
    40 chars in the ingestion job so S/4 and ECC lines co-exist in one table.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Dataflow Gen2 via the SAP HANA or SAP Table
    connector through an on-prem gateway.
  fabric_docs_url: "https://learn.microsoft.com/en-us/fabric/data-factory/connector-sap-hana-overview"
_source:
  - "https://help.sap.com/docs/SAP_PROFITABILITY_PERFORMANCE_MANAGEMENT/7fa13890d47b4c69bbb62175e84e4aa8/23604c0b76d24f90a211ae67d13b8cdc.html"
  - "https://help.sap.com/docs/BI_CONTENT_757/45e4eda3753c458ead20c81f77c55921/e2487053bbe77c1ee10000000a174cb4.html"
---

EKPO is the purchasing-document line-item table — one row per line on every
PO, RFQ, contract, or scheduling agreement in the system. Keyed by
`(MANDT, EBELN, EBELP)` with the parent record in EKKO. Typical volumes run
five to ten times EKKO; a mid-size tenant will sit in the tens to hundreds
of millions of rows.

The extraction pattern is identical to every other header/item pair in SAP:
always co-extract with EKKO, never allow line-without-header or
header-without-line on the target side, and treat `(EBELN, EBELP)` as the
inviolable primary key. The S/4-specific MATNR extension (18→40 chars)
applies here exactly as it does on MARA and VBAP — normalize to 40 chars in
ingestion for any cross-system warehouse.
