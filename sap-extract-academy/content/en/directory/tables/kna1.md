---
slug: kna1
name: KNA1
title: "KNA1 — Customer Master (General Data)"
mode: both
module: SD
module_name: Sales
description_one_liner: >
  Customer master general data — one row per customer (KUNNR), with name,
  address, country, industry. In S/4HANA, a business-partner shadow.
description_one_liner_ecc: >
  In ECC, the authoritative customer master header; the business-partner
  model is optional rather than enforced.
typical_rows: "50K – 10M"
volume_class: small
released_cds: I_Customer
columns_total: 180
scope_lock: >
  In S/4HANA, KNA1 is a write-through shadow of the business partner model.
  For canonical truth, extract BUT000 / BUT020 and resolve KUNNR via
  CVI_CUST_LINK; use KNA1 only for compatibility joins.
scope_lock_ecc: >
  In ECC, KNA1 is the source of record. The business-partner model is
  optional and typically not used as the authoritative customer store.
columns:
  - name: MANDT
    type: CLNT
    length: 3
    key: true
    source: T000
    description: Client identifier.
  - name: KUNNR
    type: CHAR
    length: 10
    key: true
    source: null
    description: Customer account number — the primary join key across SD tables.
  - name: LAND1
    type: CHAR
    length: 3
    key: false
    source: T005
    description: Country key.
  - name: NAME1
    type: CHAR
    length: 35
    key: false
    source: null
    description: Customer name; primary line used on documents and reports.
  - name: NAME2
    type: CHAR
    length: 35
    key: false
    source: null
    description: Secondary name line — trading name, dba, division.
  - name: ORT01
    type: CHAR
    length: 35
    key: false
    source: null
    description: City in the primary address.
  - name: PSTLZ
    type: CHAR
    length: 10
    key: false
    source: null
    description: Postal code.
  - name: REGIO
    type: CHAR
    length: 3
    key: false
    source: T005S
    description: Region / state / province code.
  - name: STRAS
    type: CHAR
    length: 35
    key: false
    source: null
    description: Street address.
  - name: TELF1
    type: CHAR
    length: 16
    key: false
    source: null
    description: Primary telephone number.
  - name: KTOKD
    type: CHAR
    length: 4
    key: false
    source: T077D
    description: Customer account group; controls field status and numbering.
  - name: STCEG
    type: CHAR
    length: 20
    key: false
    source: null
    description: EU VAT registration number.
  - name: BRSCH
    type: CHAR
    length: 4
    key: false
    source: T016
    description: Industry key — used for reporting segmentation.
  - name: ERDAT
    type: DATS
    length: 8
    key: false
    source: null
    description: Creation date of the customer master record.
  - name: LOEVM
    type: CHAR
    length: 1
    key: false
    source: null
    description: Central deletion flag.
  - name: SPRAS
    type: LANG
    length: 1
    key: false
    source: T002
    description: Communication language.
extract_methods:
  - id: odp-cds
    name: "ODP via CDS view"
    flavor: "I_Customer"
    tagline: "Business-partner-aware customer view in S/4HANA."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `I_Customer` reads the customer through the BP model, applying
      authorizations and joining to `BUT000` / `ADRC` automatically. This is
      the supported contract for S/4 customer extraction.
    walkthrough_slug: null
  - id: cds-direct
    name: "CDS view via OData"
    flavor: "I_Customer"
    tagline: "REST access; fine for single-customer and full-table at master-data scale."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      OData handles master-data volumes comfortably. Useful for CRM-adjacent
      integrations and for ad-hoc reconciliation from external systems.
    walkthrough_slug: null
  - id: rfc
    name: "Direct RFC read"
    flavor: "RFC_READ_TABLE"
    tagline: "Workable at master-data volume; bypasses BP shadow."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      `RFC_READ_TABLE` works against KNA1 for small extracts, but bypasses the
      BP model and misses any attributes that live only in `BUT000`. Prefer
      ODP or OData for anything that will be rerun.
    walkthrough_slug: null
  - id: bw-extractor
    name: "BW Extractor (classic)"
    flavor: "0CUSTOMER_ATTR / 0CUSTOMER_TEXT"
    tagline: "Classic customer-master extractors; native delta."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `0CUSTOMER_ATTR` and `0CUSTOMER_TEXT` are the reference BW extractors
      for KNA1. Attribute extractor handles KNA1 with `ADRC` address joins;
      text extractor handles language-dependent texts.
    walkthrough_slug: null
notes:
  - date: "2026-02"
    headline: "KNA1 continues as business-partner shadow in S/4HANA 2025"
    body_markdown: |
      The BP model remains canonical; KNA1 is maintained for compatibility.
      Pipelines that read KNA1 directly continue to function but won't see
      BP-only attributes (trust scores, external IDs, etc.).
    sap_note: null
    sap_note_url: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/6d31005aa10649649041a0b205f5f4f7/2cf9c5536a51204be10000000a174cb4.html"
  - date: "2025-08"
    headline: "CVI_CUST_LINK for KUNNR ↔ BP number mapping"
    body_markdown: |
      `CVI_CUST_LINK` ties a KNA1 customer to its BP counterpart. Pipelines
      that need the unified party view join through this link rather than
      assuming KUNNR and BP number are identical.
    sap_note: null
    sap_note_url: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/6d31005aa10649649041a0b205f5f4f7/2cf9c5536a51204be10000000a174cb4.html"
ingestion_guidance:
  snowflake: |
    **Snowflake ingestion.** Daily `COPY INTO` snapshot is the standard
    pattern for customer master; Snowpipe is overkill unless your customer
    master genuinely changes hourly.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** Auto Loader writing to a Delta dimension table;
    SCD-2 management belongs in the downstream silver/gold layer.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Mirroring via Datasphere is low-overhead; Dataflow
    Gen2 fits when cleansing or deduplication is part of ingestion.
  fabric_docs_url: "https://learn.microsoft.com/en-us/fabric/mirroring/overview"
columns_ecc:
  - name: MANDT
    type: CLNT
    length: 3
    key: true
    source: T000
    description: Client identifier.
  - name: KUNNR
    type: CHAR
    length: 10
    key: true
    source: null
    description: Customer account number.
  - name: LAND1
    type: CHAR
    length: 3
    key: false
    source: T005
    description: Country key.
  - name: NAME1
    type: CHAR
    length: 35
    key: false
    source: null
    description: Customer name.
  - name: NAME2
    type: CHAR
    length: 35
    key: false
    source: null
    description: Secondary name line.
  - name: ORT01
    type: CHAR
    length: 35
    key: false
    source: null
    description: City.
  - name: PSTLZ
    type: CHAR
    length: 10
    key: false
    source: null
    description: Postal code.
  - name: REGIO
    type: CHAR
    length: 3
    key: false
    source: T005S
    description: Region / state.
  - name: STRAS
    type: CHAR
    length: 35
    key: false
    source: null
    description: Street address.
  - name: KTOKD
    type: CHAR
    length: 4
    key: false
    source: T077D
    description: Customer account group.
  - name: STCEG
    type: CHAR
    length: 20
    key: false
    source: null
    description: EU VAT registration.
  - name: BRSCH
    type: CHAR
    length: 4
    key: false
    source: T016
    description: Industry key.
  - name: LOEVM
    type: CHAR
    length: 1
    key: false
    source: null
    description: Central deletion flag.
columns_total_ecc: 170
extract_methods_ecc:
  - id: bw-extractor
    name: "BW Extractor (classic)"
    flavor: "0CUSTOMER_ATTR / 0CUSTOMER_TEXT"
    tagline: "Canonical ECC customer-master extractors."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `0CUSTOMER_ATTR` and `0CUSTOMER_TEXT` have been the reference path since
      BW 3.x. LO-Cockpit setup is not required for master-data extractors.
    walkthrough_slug: null
  - id: slt
    name: "SLT replication"
    flavor: null
    tagline: "Real-time replication when customer master changes must propagate fast."
    license: full
    latency: realtime
    volume: any
    body_markdown: |
      SLT against ECC KNA1 is mechanically simple. Useful when downstream
      compliance or sanctions screening needs sub-minute freshness.
    walkthrough_slug: null
  - id: rfc
    name: "Direct RFC read"
    flavor: "RFC_READ_TABLE"
    tagline: "Full-table reads are viable at ECC master-data volumes."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      The whole customer master usually fits in a few RFC calls. Acceptable
      for reconciliation; pipelines should still prefer the BW extractor for
      its delta handling.
    walkthrough_slug: null
notes_ecc:
  - date: "2025-06"
    headline: "KNA1 behaves as-expected in ECC — no BP shadowing"
    body_markdown: |
      In ECC, KNA1 is the authoritative customer master; the BP model is
      optional. Pipelines can treat it as the source of truth without the
      S/4-specific CVI_CUST_LINK join. [NEEDS_SAP_CITATION]
    sap_note: null
    sap_note_url: null
ingestion_guidance_ecc:
  snowflake: |
    **Snowflake ingestion.** Same pattern as S/4 — daily snapshot via `COPY
    INTO` from an object stage.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** Auto Loader to Delta for the dimension;
    downstream silver/gold handles SCD-2 and party unification.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Dataflow Gen2 via the SAP HANA connector with an
    on-prem gateway is the usual ECC pattern.
  fabric_docs_url: "https://learn.microsoft.com/en-us/fabric/data-factory/connector-sap-hana-overview"
_source:
  - "https://help.sap.com/docs/SAP_PROFITABILITY_PERFORMANCE_MANAGEMENT/7fa13890d47b4c69bbb62175e84e4aa8/a4bc190b12cb488eb8a67677ee6ea6b7.html"
  - "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/d6c1ceb7e0074cd1a8f28dad8a1a649c/c6ccca55b0107b65e10000000a44147b.html"
---

KNA1 is the customer master header, keyed by `(MANDT, KUNNR)`. Small by SAP
standards — hundreds of thousands to single-digit millions of rows in all but
the largest tenants — but a critical dimension because every SD and AR join
eventually runs through it.

The mode difference is structural: in ECC, KNA1 is the authoritative store
and you can extract it directly. In S/4HANA, the business-partner model
(`BUT000`, `BUT020`, `ADRC`) holds canonical truth and KNA1 is maintained as
a compatibility shadow — BP-only attributes (external IDs, grouping, trust
scores) will only appear if you extract through `I_Customer` or `BUT000`
directly.
