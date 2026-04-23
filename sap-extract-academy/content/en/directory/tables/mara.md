---
slug: mara
name: MARA
title: "MARA — Material Master (General Data)"
mode: both
module: MM
module_name: Materials
description_one_liner: >
  Material master general data — one row per material (MATNR), with type,
  group, units of measure, and the anchor row for plant/sales/storage views.
description_one_liner_ecc: >
  In ECC, the same shape and role; MATNR length is 18 characters rather than
  S/4's extended 40.
typical_rows: "100K – 10M"
volume_class: small
released_cds: I_Product
columns_total: 280
scope_lock: >
  MATNR length is 40 in S/4 and 18 in ECC. Pipelines that feed both systems
  into the same warehouse must normalize to the 40-character shape at
  ingestion — silent truncation is the #1 data-quality bug on the material
  master.
scope_lock_ecc: >
  MATNR is 18 characters; many downstream systems have hard-coded that width.
  Plan early if you intend to move to S/4 and adopt the 40-character shape.
columns:
  - name: MANDT
    type: CLNT
    length: 3
    key: true
    source: T000
    description: Client identifier.
  - name: MATNR
    type: CHAR
    length: 40
    key: true
    source: null
    description: Material number — 40 chars in S/4 (extended), widen your target schema accordingly.
  - name: ERSDA
    type: DATS
    length: 8
    key: false
    source: null
    description: Creation date of the material master.
  - name: ERNAM
    type: CHAR
    length: 12
    key: false
    source: null
    description: User who created the material.
  - name: MTART
    type: CHAR
    length: 4
    key: false
    source: T134
    description: Material type (FERT, ROH, HALB …); drives which views must exist.
  - name: MATKL
    type: CHAR
    length: 9
    key: false
    source: T023
    description: Material group used for reporting segmentation.
  - name: MEINS
    type: UNIT
    length: 3
    key: false
    source: T006
    description: Base unit of measure.
  - name: BRGEW
    type: QUAN
    length: 13
    key: false
    source: null
    description: Gross weight in GEWEI unit.
  - name: NTGEW
    type: QUAN
    length: 13
    key: false
    source: null
    description: Net weight in GEWEI unit.
  - name: GEWEI
    type: UNIT
    length: 3
    key: false
    source: T006
    description: Weight unit of measure for BRGEW/NTGEW.
  - name: VOLUM
    type: QUAN
    length: 13
    key: false
    source: null
    description: Volume in VOLEH unit.
  - name: VOLEH
    type: UNIT
    length: 3
    key: false
    source: T006
    description: Volume unit of measure.
  - name: MBRSH
    type: CHAR
    length: 1
    key: false
    source: null
    description: Industry sector (A/M/C…) assigned at material creation; immutable.
  - name: MSTAE
    type: CHAR
    length: 2
    key: false
    source: T141
    description: Cross-plant material status; blocks procurement / usage when set.
  - name: LVORM
    type: CHAR
    length: 1
    key: false
    source: null
    description: Deletion flag at client level; X means marked for central deletion.
  - name: SPART
    type: CHAR
    length: 2
    key: false
    source: TSPA
    description: Division — used in SD pricing and reporting.
extract_methods:
  - id: odp-cds
    name: "ODP via CDS view"
    flavor: "I_Product"
    tagline: "The released product view; Runtime-safe and authorized."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `I_Product` is the released S/4HANA view over the material master. It
      applies authorizations and surfaces the MATNR in its 40-character shape
      automatically. Partition by `MTART` for parallel extraction.
    walkthrough_slug: mara
  - id: cds-direct
    name: "CDS view via OData"
    flavor: "I_Product"
    tagline: "REST access for integration and small extracts."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      OData handles master-data volumes cleanly and is a common integration
      point for PIM and e-commerce systems. Use server-side `$filter` on
      `MATKL` to scope pulls.
    walkthrough_slug: mara
  - id: rfc
    name: "Direct RFC read"
    flavor: "RFC_READ_TABLE / BAPI_MATERIAL_GET_ALL"
    tagline: "BAPI-first when you need multi-view data in one call."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      `BAPI_MATERIAL_GET_ALL` returns MARA plus plant/sales views in one
      roundtrip, which is useful for ad-hoc lookups. `RFC_READ_TABLE` works
      too but gives you only MARA.
    walkthrough_slug: mara
  - id: bw-extractor
    name: "BW Extractor (classic)"
    flavor: "0MATERIAL_ATTR / 0MATERIAL_TEXT"
    tagline: "Classic material-master extractors; native delta."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `0MATERIAL_ATTR` and `0MATERIAL_TEXT` are the reference BW extractors
      for MARA. Attribute extractor handles MARA and its unit-of-measure
      joins; text extractor handles language-dependent descriptions.
    walkthrough_slug: mara
notes:
  - date: "2026-03"
    headline: "MATNR extension to 40 characters — migration reminder"
    body_markdown: |
      SAP continues to call out the MATNR extension (18→40) as the largest
      cross-system data-shape change for procurement pipelines. Target-side
      schemas should be 40 chars; ECC inputs are right-padded.
      [NEEDS_SAP_CITATION]
    sap_note: null
    sap_note_url: null
  - date: "2025-09"
    headline: "Master Data Governance for material — data model note"
    body_markdown: |
      MDG-M continues to be the recommended authoring surface in S/4. MARA is
      still the canonical store; MDG governs change but data lands here.
    sap_note: null
    sap_note_url: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/6d52de87aa0d4fb6a90924720a5b0549/2a500de376504b4386a04d1085a52f22.html"
ingestion_guidance:
  snowflake: |
    **Snowflake ingestion.** Daily `COPY INTO` snapshot is the standard
    pattern; widen your target MATNR column to 40 chars before the first S/4
    pipeline runs.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** Auto Loader to a Delta dimension table. MATNR
    width in the landing schema is 40; cleansing of ECC-sourced rows is a
    right-pad to match.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Mirroring via Datasphere is the cleanest path;
    Dataflow Gen2 when deduplication or enrichment belongs in ingestion.
  fabric_docs_url: "https://learn.microsoft.com/en-us/fabric/mirroring/overview"
columns_ecc:
  - name: MANDT
    type: CLNT
    length: 3
    key: true
    source: T000
    description: Client identifier.
  - name: MATNR
    type: CHAR
    length: 18
    key: true
    source: null
    description: Material number — 18 chars in ECC; note the S/4 extension to 40.
  - name: ERSDA
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
  - name: MTART
    type: CHAR
    length: 4
    key: false
    source: T134
    description: Material type.
  - name: MATKL
    type: CHAR
    length: 9
    key: false
    source: T023
    description: Material group.
  - name: MEINS
    type: UNIT
    length: 3
    key: false
    source: T006
    description: Base unit of measure.
  - name: BRGEW
    type: QUAN
    length: 13
    key: false
    source: null
    description: Gross weight.
  - name: NTGEW
    type: QUAN
    length: 13
    key: false
    source: null
    description: Net weight.
  - name: VOLUM
    type: QUAN
    length: 13
    key: false
    source: null
    description: Volume.
  - name: MBRSH
    type: CHAR
    length: 1
    key: false
    source: null
    description: Industry sector.
  - name: MSTAE
    type: CHAR
    length: 2
    key: false
    source: T141
    description: Cross-plant material status.
  - name: LVORM
    type: CHAR
    length: 1
    key: false
    source: null
    description: Client-level deletion flag.
columns_total_ecc: 240
extract_methods_ecc:
  - id: bw-extractor
    name: "BW Extractor (classic)"
    flavor: "0MATERIAL_ATTR / 0MATERIAL_TEXT"
    tagline: "Canonical ECC material-master extractors."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      The `0MATERIAL_*` extractor family is the reference path. Attribute
      extractor ships MARA + unit joins; text extractor ships MAKT for
      language-dependent descriptions.
    walkthrough_slug: mara
  - id: slt
    name: "SLT replication"
    flavor: null
    tagline: "Real-time path when PIM integration requires sub-minute freshness."
    license: full
    latency: realtime
    volume: any
    body_markdown: |
      SLT against ECC MARA is mechanically simple. Main caveat is the 18-char
      MATNR — pipelines that also pull S/4 must widen the target.
    walkthrough_slug: mara
  - id: rfc
    name: "Direct RFC read"
    flavor: "BAPI_MATERIAL_GET_ALL"
    tagline: "BAPI returns MARA + views in one call; useful for spot checks."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      `BAPI_MATERIAL_GET_ALL` is the pragmatic ECC path for per-material
      lookups that need multi-view data. Not a pipeline path at scale.
    walkthrough_slug: mara
notes_ecc:
  - date: "2025-05"
    headline: "ECC MATNR stays at 18 chars; plan ahead for S/4 migration"
    body_markdown: |
      ECC retains the 18-character MATNR convention. Any landscape preparing
      to adopt S/4 should widen downstream columns first to avoid cutover
      emergencies. [NEEDS_SAP_CITATION]
    sap_note: null
    sap_note_url: null
ingestion_guidance_ecc:
  snowflake: |
    **Snowflake ingestion.** Same daily-snapshot pattern; just keep the target
    MATNR column at 40 chars from day one so ECC and S/4 land in the same
    dimension cleanly.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** Auto Loader to Delta; normalize ECC MATNR to 40
    chars (right-pad) in the ingestion job.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Dataflow Gen2 over the SAP HANA or SAP Table
    connector through an on-prem gateway.
  fabric_docs_url: "https://learn.microsoft.com/en-us/fabric/data-factory/connector-sap-hana-overview"
_source:
  - "https://help.sap.com/docs/SAP_PROFITABILITY_PERFORMANCE_MANAGEMENT/7fa13890d47b4c69bbb62175e84e4aa8/322a2fd8d52948519666b67275aae9ca.html"
  - "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f7fddfe4caca43dd967ac4c9ce6a70e4/b724ba53422bb54ce10000000a174cb4.html"
---

MARA is the material master header — one row per material, keyed by
`(MANDT, MATNR)`. Every downstream MM, SD, and PP table eventually joins
through here, which makes MARA both small in row count and structurally
critical in a warehouse.

The single biggest extraction gotcha is MATNR width. In ECC, MATNR is 18
characters. In S/4HANA, the extended format is 40 characters. Pipelines that
feed both systems into the same warehouse must standardize on 40 at
ingestion; silent truncation on the 18-char side is the most common
data-quality bug on the material master, and it surfaces only after you
start creating materials with longer numbers post-S/4 migration.
