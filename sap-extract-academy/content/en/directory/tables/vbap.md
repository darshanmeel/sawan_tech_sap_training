---
slug: vbap
name: VBAP
title: "VBAP — Sales Document Items"
mode: both
module: SD
module_name: Sales
description_one_liner: >
  Sales document line items — one row per order position, joined to VBAK via
  (MANDT, VBELN) and carrying material, quantity, price, schedule pointers.
description_one_liner_ecc: >
  In ECC, the authoritative sales-document line-item table; same key structure
  and role as in S/4HANA.
typical_rows: "50M – 1B"
volume_class: heavyweight
released_cds: I_SalesDocumentItem
columns_total: 380
scope_lock: >
  Always co-extract with VBAK. Keep (VBELN, POSNR) as the target primary key;
  any deduplication strategy that loses POSNR collapses line-level detail.
scope_lock_ecc: >
  Same rule as S/4 — VBAK/VBAP consistency is the downstream requirement; the
  tables themselves are well-behaved.
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
    source: VBAK
    description: Sales document number; parent key into VBAK.
  - name: POSNR
    type: NUMC
    length: 6
    key: true
    source: null
    description: Item number within the sales document; 000010/000020/… step of ten.
  - name: MATNR
    type: CHAR
    length: 40
    key: false
    source: MARA
    description: Material number ordered on this line.
  - name: MATWA
    type: CHAR
    length: 40
    key: false
    source: MARA
    description: Material entered by the user — may differ from MATNR after substitution.
  - name: PSTYV
    type: CHAR
    length: 4
    key: false
    source: TVAP
    description: Item category driving pricing, delivery, and billing behavior.
  - name: POSEX
    type: CHAR
    length: 6
    key: false
    source: null
    description: Item number supplied on the purchase order from the customer.
  - name: KWMENG
    type: QUAN
    length: 15
    key: false
    source: null
    description: Cumulative order quantity in sales-unit terms.
  - name: VRKME
    type: UNIT
    length: 3
    key: false
    source: T006
    description: Sales unit of measure.
  - name: NETWR
    type: CURR
    length: 15
    key: false
    source: null
    description: Net value of the item in document currency.
  - name: NETPR
    type: CURR
    length: 11
    key: false
    source: null
    description: Net price per unit.
  - name: WERKS
    type: CHAR
    length: 4
    key: false
    source: T001W
    description: Plant from which this item will be delivered.
  - name: LGORT
    type: CHAR
    length: 4
    key: false
    source: T001L
    description: Storage location within the plant.
  - name: ABGRU
    type: CHAR
    length: 2
    key: false
    source: TVAG
    description: Reason for rejection — non-empty means this line was cancelled.
  - name: ERDAT
    type: DATS
    length: 8
    key: false
    source: null
    description: Item creation date; can differ from VBAK-ERDAT for items added later.
  - name: ERNAM
    type: CHAR
    length: 12
    key: false
    source: null
    description: User who created this item.
extract_methods:
  - id: odp-cds
    name: "ODP via CDS view"
    flavor: "I_SalesDocumentItem"
    tagline: "The released line-item view; Runtime-safe."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `I_SalesDocumentItem` exposes VBAP with authorizations applied. Partition
      by `VKORG` (inherited from the parent header) and `ERDAT` windows; join
      to `I_SalesDocument` on the target for header attributes.
    walkthrough_slug: null
  - id: slt
    name: "SLT replication"
    flavor: null
    tagline: "Real-time replication when operational reporting demands it."
    license: full
    latency: realtime
    volume: any
    body_markdown: |
      SLT handles VBAP's volume without drama; primary key is stable and delta
      tracking is reliable. Use when the downstream ATP or fulfillment story
      needs sub-minute latency.
    walkthrough_slug: null
  - id: cds-direct
    name: "CDS view via OData"
    flavor: "I_SalesDocumentItem"
    tagline: "OData for per-order lookups; too slow for history."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      Practical only for small working sets — a specific customer, a specific
      order date window. OData paging overhead dominates past a few million
      rows on VBAP scale.
    walkthrough_slug: null
  - id: bw-extractor
    name: "BW Extractor (classic)"
    flavor: "2LIS_11_VAITM"
    tagline: "LO-Cockpit item extractor with native delta handling."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `2LIS_11_VAITM` is the reference extractor for sales items; works in ECC
      and S/4. LO-Cockpit setup is required once per source client.
    walkthrough_slug: null
notes:
  - date: "2026-01"
    headline: "I_SalesDocumentItem schema updates in 2025 FPS01"
    body_markdown: |
      S/4HANA 2025 FPS01 extended the released item view with new fields
      around sustainability-tracking attributes. Refresh your metadata cache
      before the next pipeline deploy. [NEEDS_SAP_CITATION]
    sap_note: null
    sap_note_url: null
  - date: "2025-09"
    headline: "Archiving parity with VBAK"
    body_markdown: |
      Items archive alongside their parent documents via SD_VBAK. If you
      extract VBAP without matching archive-access configuration, long-tail
      items will disappear from reconciliation silently.
    sap_note: null
    sap_note_url: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/7b24a64d9d0941bda1afa753263d9e39/c8f04453d2e57425e10000000a44176d.html"
ingestion_guidance:
  snowflake: |
    **Snowflake ingestion.** Snowpipe from a stage partitioned by `ERDAT`
    month handles steady-state flow; full-history reloads run in parallel
    `COPY INTO` jobs keyed on `VKORG`.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** Auto Loader to a Delta landing table, Z-ordered
    on (VKORG, MATNR), keeps downstream reporting queries fast. DLT handles
    the VBAK/VBAP referential check as an expectation.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Mirroring via Datasphere is the low-overhead option;
    Dataflow Gen2 fits when you want cleansing in the ingestion layer.
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
    source: VBAK
    description: Sales document number.
  - name: POSNR
    type: NUMC
    length: 6
    key: true
    source: null
    description: Item number within the sales document.
  - name: MATNR
    type: CHAR
    length: 18
    key: false
    source: MARA
    description: Material number — note the ECC 18-char length vs S/4 40-char extended length.
  - name: PSTYV
    type: CHAR
    length: 4
    key: false
    source: TVAP
    description: Item category.
  - name: KWMENG
    type: QUAN
    length: 15
    key: false
    source: null
    description: Order quantity in sales-unit terms.
  - name: VRKME
    type: UNIT
    length: 3
    key: false
    source: T006
    description: Sales unit of measure.
  - name: NETWR
    type: CURR
    length: 15
    key: false
    source: null
    description: Net value in document currency.
  - name: NETPR
    type: CURR
    length: 11
    key: false
    source: null
    description: Net price per unit.
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
  - name: ABGRU
    type: CHAR
    length: 2
    key: false
    source: TVAG
    description: Rejection reason.
columns_total_ecc: 358
extract_methods_ecc:
  - id: bw-extractor
    name: "BW Extractor (classic)"
    flavor: "2LIS_11_VAITM"
    tagline: "Canonical ECC sales-item extractor; native delta."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `2LIS_11_VAITM` is the LO-Cockpit reference path for VBAP in ECC. LO
      setup and the V3 update collect-delta pattern are one-time
      configuration.
    walkthrough_slug: null
  - id: slt
    name: "SLT replication"
    flavor: null
    tagline: "Real-time path when batch latency is unacceptable."
    license: full
    latency: realtime
    volume: any
    body_markdown: |
      SLT against ECC VBAP is mechanically identical to S/4. Mind the MATNR
      length difference (18 chars in ECC, 40 in S/4) if both systems feed the
      same downstream warehouse.
    walkthrough_slug: null
  - id: rfc
    name: "Direct RFC read"
    flavor: "RFC_READ_TABLE"
    tagline: "Ad-hoc only; don't build pipelines on this."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      `RFC_READ_TABLE` is workable for a few thousand rows and bright-line
      queries. Anything larger hits the 512-byte row-length truncation.
    walkthrough_slug: null
notes_ecc:
  - date: "2025-05"
    headline: "MATNR length 18 vs 40 — cross-system pipelines"
    body_markdown: |
      Pipelines that combine ECC VBAP and S/4 VBAP in the same landing table
      must normalize on the 40-character MATNR shape; truncation on the ECC
      side is silent and loses data for extended materials. [NEEDS_SAP_CITATION]
    sap_note: null
    sap_note_url: null
ingestion_guidance_ecc:
  snowflake: |
    **Snowflake ingestion.** Same pattern as S/4 — Snowpipe or `COPY INTO`
    from an object stage. Extractor deltas and SLT change streams both land
    cleanly.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** Auto Loader to Delta; Z-order on (VKORG, MATNR)
    for reporting performance.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Dataflow Gen2 through the SAP HANA or SAP Table
    connectors via an on-prem gateway.
  fabric_docs_url: "https://learn.microsoft.com/en-us/fabric/data-factory/connector-sap-hana-overview"
_source:
  - "https://help.sap.com/docs/SAP_PROFITABILITY_PERFORMANCE_MANAGEMENT/7fa13890d47b4c69bbb62175e84e4aa8/f888cd4253d3401a9f3e9ea181eec3c0.html"
  - "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/ee6ff9b281d8448f96b4fe6c89f2bdc8/abf7dc3d11d24976b77c1e78fe24b8a8.html"
---

VBAP is the sales-document line-item table. One row per line on any sales
order, quotation, contract, or inquiry; always joined to VBAK via
`(MANDT, VBELN)`. In both ECC and S/4 the shape and primary key are stable —
the differences show up at the edges: material-number length (18 vs 40), the
released CDS view `I_SalesDocumentItem` in S/4, extension fields around
sustainability tracking.

For extract pipelines, VBAK+VBAP is one logical entity; anything that pulls
items without headers breaks every downstream join. Partition by `VKORG`
(inherited from the parent header) for parallel extraction and treat
`(VBELN, POSNR)` as the inviolable target primary key.
