---
slug: lfa1
name: LFA1
title: "LFA1 — Vendor Master (General Data)"
mode: both
module: MM
module_name: Materials
description_one_liner: >
  Vendor master general data — one row per vendor (LIFNR), name, address
  pointer, country, tax categories. In S/4HANA, usually read through the
  business-partner model (BUT000 / BUT020).
description_one_liner_ecc: >
  In ECC, the authoritative vendor master header table; the business-partner
  model is optional rather than enforced.
typical_rows: "50K – 5M"
volume_class: small
released_cds: I_Supplier
columns_total: 140
scope_lock: >
  In S/4HANA, LFA1 is a write-through shadow of the business partner model —
  extract BUT000 / BUT020 for the canonical truth and use LFA1 only for
  backward-compatible joins.
scope_lock_ecc: >
  In ECC, LFA1 is standalone and self-sufficient; the business-partner model
  is optional, so treat LFA1 as the source of record.
columns:
  - name: MANDT
    type: CLNT
    length: 3
    key: true
    source: T000
    description: Client identifier.
  - name: LIFNR
    type: CHAR
    length: 10
    key: true
    source: null
    description: Vendor account number — the canonical join key across MM tables.
  - name: LAND1
    type: CHAR
    length: 3
    key: false
    source: T005
    description: Country key; resolves to ISO country via T005.
  - name: NAME1
    type: CHAR
    length: 35
    key: false
    source: null
    description: Vendor name; primary line used on invoices and reports.
  - name: NAME2
    type: CHAR
    length: 35
    key: false
    source: null
    description: Secondary name line — trading name, division, etc.
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
    description: Region / state / province code; join to T005S for name.
  - name: SORTL
    type: CHAR
    length: 10
    key: false
    source: null
    description: Search term used for vendor lookup in ERP transactions.
  - name: STRAS
    type: CHAR
    length: 35
    key: false
    source: null
    description: Street address line 1.
  - name: TELF1
    type: CHAR
    length: 16
    key: false
    source: null
    description: Primary telephone number.
  - name: STCEG
    type: CHAR
    length: 20
    key: false
    source: null
    description: EU VAT registration number.
  - name: ERDAT
    type: DATS
    length: 8
    key: false
    source: null
    description: Creation date of the vendor master record.
  - name: KTOKK
    type: CHAR
    length: 4
    key: false
    source: T077K
    description: Account group controlling field-status and numbering.
  - name: SPRAS
    type: LANG
    length: 1
    key: false
    source: T002
    description: Communication language for the vendor.
  - name: LOEVM
    type: CHAR
    length: 1
    key: false
    source: null
    description: Central deletion flag — non-empty means the record is marked for deletion.
extract_methods:
  - id: odp-cds
    name: "ODP via CDS view"
    flavor: "I_Supplier"
    tagline: "Business-partner-aware vendor view in S/4HANA."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `I_Supplier` exposes the BP-backed view of LFA1 in S/4HANA. It applies
      authorization and joins through BUT000 automatically, which matters
      because many attributes have migrated to the BP tables even though LFA1
      still shadows them.
    walkthrough_slug: lfa1
  - id: cds-direct
    name: "CDS view via OData"
    flavor: "I_Supplier"
    tagline: "REST access for per-vendor lookups."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      OData is appropriate for the whole table at most vendor-master volumes
      (tens of thousands of rows fit comfortably in OData paging). Fine for a
      daily full-refresh pattern.
    walkthrough_slug: lfa1
  - id: rfc
    name: "Direct RFC read"
    flavor: "RFC_READ_TABLE"
    tagline: "Emergency lookups when OData isn't configured."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      Master data volumes are small enough that `RFC_READ_TABLE` is acceptable
      for ad-hoc pulls. Still prefer ODP or OData for pipelines — RFC bypasses
      authorization and breaks the BP-shadow pattern.
    walkthrough_slug: lfa1
  - id: bw-extractor
    name: "BW Extractor (classic)"
    flavor: "0VENDOR_ATTR"
    tagline: "Classic attribute extractor with native delta handling."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `0VENDOR_ATTR` is the reference BW extractor for LFA1. Its delta mechanism
      is reliable at master-data volumes and it handles the address-integration
      (`ADRC`) join for you.
    walkthrough_slug: lfa1
notes:
  - date: "2026-02"
    headline: "LFA1 continues as business-partner shadow in S/4HANA 2025"
    body_markdown: |
      The business partner conversion remains the canonical model — LFA1 is
      kept as a compatibility shadow. Pipelines that still read LFA1 directly
      continue to work but miss BP-only fields.
    sap_note: null
    sap_note_url: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/6d31005aa10649649041a0b205f5f4f7/2cf9c5536a51204be10000000a174cb4.html"
  - date: "2025-08"
    headline: "Customer-Vendor Integration (CVI) link tables clarified"
    body_markdown: |
      `CVI_VEND_LINK` ties an LFA1 vendor to its BP counterpart. If your extract
      joins customer + vendor into a unified party dimension, take the BP
      number from `CVI_VEND_LINK` rather than assuming KUNNR = LIFNR.
      [NEEDS_SAP_CITATION]
    sap_note: null
    sap_note_url: null
ingestion_guidance:
  snowflake: |
    **Snowflake ingestion.** Master-data volumes mean a simple daily snapshot
    via `COPY INTO` is usually sufficient; Snowpipe is only necessary if your
    vendor master genuinely churns hourly.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** A daily Auto Loader job writing to a Delta
    dimension table is the standard pattern. SCD-2 management typically
    happens downstream rather than at ingestion time.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Mirroring via Datasphere keeps the vendor dimension
    in sync with minimal ops; Dataflow Gen2 is an alternative when cleansing
    or deduplication belongs in ingestion.
  fabric_docs_url: "https://learn.microsoft.com/en-us/fabric/mirroring/overview"
columns_ecc:
  - name: MANDT
    type: CLNT
    length: 3
    key: true
    source: T000
    description: Client identifier.
  - name: LIFNR
    type: CHAR
    length: 10
    key: true
    source: null
    description: Vendor account number.
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
    description: Vendor name.
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
  - name: KTOKK
    type: CHAR
    length: 4
    key: false
    source: T077K
    description: Account group.
  - name: STCEG
    type: CHAR
    length: 20
    key: false
    source: null
    description: EU VAT registration.
  - name: SPRAS
    type: LANG
    length: 1
    key: false
    source: T002
    description: Communication language.
  - name: LOEVM
    type: CHAR
    length: 1
    key: false
    source: null
    description: Central deletion flag.
columns_total_ecc: 134
extract_methods_ecc:
  - id: bw-extractor
    name: "BW Extractor (classic)"
    flavor: "0VENDOR_ATTR / 0VENDOR_TEXT"
    tagline: "Canonical ECC vendor-master extractors."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `0VENDOR_ATTR` and `0VENDOR_TEXT` are the standard ECC extractors.
      Attribute extractor handles LFA1 and its address joins; text extractor
      handles language-dependent texts.
    walkthrough_slug: lfa1
  - id: slt
    name: "SLT replication"
    flavor: null
    tagline: "Real-time replication when master data changes must propagate immediately."
    license: full
    latency: realtime
    volume: any
    body_markdown: |
      SLT against LFA1 is mechanically easy — small table, stable key. Use
      when a downstream compliance or sanctions-screening system needs
      sub-minute freshness on vendor changes.
    walkthrough_slug: lfa1
  - id: rfc
    name: "Direct RFC read"
    flavor: "RFC_READ_TABLE"
    tagline: "Workable for master-data volumes; not ideal."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      The whole table usually fits comfortably in a single RFC read at ECC
      vendor-master volumes. Acceptable for one-off reconciliation; don't
      build pipelines on it.
    walkthrough_slug: lfa1
notes_ecc:
  - date: "2025-06"
    headline: "LFA1 behaves as-expected in ECC — no S/4-style BP shadowing"
    body_markdown: |
      In ECC the business-partner model is optional; LFA1 is the authoritative
      vendor master and pipelines can treat it as such without the BP caveats
      that apply in S/4. [NEEDS_SAP_CITATION]
    sap_note: null
    sap_note_url: null
ingestion_guidance_ecc:
  snowflake: |
    **Snowflake ingestion.** Daily `COPY INTO` snapshot suffices for ECC vendor
    master volumes; Snowpipe only if change-frequency demands it.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** Auto Loader against the BW extractor output is
    the easiest way to stay incremental at master-data cadence.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Dataflow Gen2 via the SAP Table or SAP HANA connector
    through an on-prem gateway is the usual ECC pattern.
  fabric_docs_url: "https://learn.microsoft.com/en-us/fabric/data-factory/connector-sap-hana-overview"
_source:
  - "https://help.sap.com/docs/SAP_PROFITABILITY_PERFORMANCE_MANAGEMENT/7fa13890d47b4c69bbb62175e84e4aa8/4b41906b182a4993ad8de51e712b80df.html"
  - "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/6d31005aa10649649041a0b205f5f4f7/2cf9c5536a51204be10000000a174cb4.html"
---

LFA1 is the vendor master header — one row per vendor, keyed by client and
vendor number (`LIFNR`). The shape has stayed stable across releases; what
has changed is the surrounding model. In ECC, LFA1 is the authoritative
vendor record. In S/4HANA, vendors live in the business-partner model
(`BUT000`, `BUT020`, `ADRC`) and LFA1 is maintained as a write-through
shadow for backward compatibility.

For pipelines that target S/4 only, read `I_Supplier` (the released
BP-backed view) or join LFA1 → `CVI_VEND_LINK` → `BUT000` explicitly. For
mixed ECC+S/4 landscapes, plan to reconcile on LIFNR first and upgrade to
the BP dimension only when business reporting requires it.
