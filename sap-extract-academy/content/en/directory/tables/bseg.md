---
slug: bseg
name: BSEG
title: "BSEG — Accounting Document Line Items"
mode: both
module: FI
module_name: Finance
description_one_liner: >
  Accounting document line items — the detail rows joined to BKPF by
  (MANDT, BUKRS, BELNR, GJAHR). In S/4HANA, a compatibility view over ACDOCA.
description_one_liner_ecc: >
  In ECC, the authoritative line-item table for FI documents; one row per
  posting line, carrying G/L account, amount, cost object, and taxes.
typical_rows: "500M – 10B"
volume_class: heavyweight
released_cds: I_OperationalAcctgDocItem
columns_total: 362
scope_lock: >
  In S/4HANA, BSEG is a compatibility view over ACDOCA. If you can target
  ACDOCA or I_JournalEntryItem directly, do that; BSEG reads pay the
  compatibility-layer tax on every query.
scope_lock_ecc: >
  In ECC, partition by (GJAHR, BUKRS) before anything else — cluster-storage
  scans without these predicates will saturate the database.
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
    description: Company code; inherited from the BKPF parent.
  - name: BELNR
    type: CHAR
    length: 10
    key: true
    source: null
    description: Accounting document number; join key to BKPF.
  - name: GJAHR
    type: NUMC
    length: 4
    key: true
    source: null
    description: Fiscal year; the other half of the BKPF join.
  - name: BUZEI
    type: NUMC
    length: 3
    key: true
    source: null
    description: Line item counter within the document; 001–999.
  - name: BSCHL
    type: CHAR
    length: 2
    key: false
    source: null
    description: Posting key driving debit/credit sign and line-item controls.
  - name: KOART
    type: CHAR
    length: 1
    key: false
    source: null
    description: Account type (S=G/L, D=customer, K=vendor, A=asset, M=material).
  - name: HKONT
    type: CHAR
    length: 10
    key: false
    source: SKA1
    description: General ledger account number.
  - name: KUNNR
    type: CHAR
    length: 10
    key: false
    source: KNA1
    description: Customer number when this line posts to a customer account.
  - name: LIFNR
    type: CHAR
    length: 10
    key: false
    source: LFA1
    description: Vendor number when this line posts to a vendor account.
  - name: DMBTR
    type: CURR
    length: 13
    key: false
    source: null
    description: Amount in local (company-code) currency.
  - name: WRBTR
    type: CURR
    length: 13
    key: false
    source: null
    description: Amount in document currency.
  - name: KOSTL
    type: CHAR
    length: 10
    key: false
    source: CSKS
    description: Cost center on the line; empty for lines without CO-objective.
  - name: AUFNR
    type: CHAR
    length: 12
    key: false
    source: AUFK
    description: Internal order number; another common CO-object.
  - name: MATNR
    type: CHAR
    length: 40
    key: false
    source: MARA
    description: Material number when the posting relates to a goods movement.
  - name: MWSKZ
    type: CHAR
    length: 2
    key: false
    source: T007A
    description: Tax code determining the tax calculation for this line.
extract_methods:
  - id: odp-cds
    name: "ODP via CDS view"
    flavor: "I_OperationalAcctgDocItem"
    tagline: "Authorized, released line-item access in S/4."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `I_OperationalAcctgDocItem` is the recommended route when you want BSEG
      shape but ACDOCA-backed performance. Partition by `GJAHR` and `BUKRS`
      and join client-side to `I_OperationalAcctgDocHeader` for the header
      attributes.
    walkthrough_slug: null
  - id: cds-direct
    name: "CDS view via OData"
    flavor: "I_OperationalAcctgDocItem"
    tagline: "OData access for reconciliation; too slow for bulk."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      The operational line-item view is exposed as an OData feed. Useful for
      spot reconciliation against source systems; don't plan history reloads
      around it — pagination overhead dominates past a few million rows.
    walkthrough_slug: null
  - id: slt
    name: "SLT replication"
    flavor: null
    tagline: "Real-time copy when you own the Full Use license."
    license: full
    latency: realtime
    volume: any
    body_markdown: |
      In S/4, SLT can still target BSEG, but you are effectively replicating
      the compatibility-view output. If ACDOCA is available, SLT against
      ACDOCA is the cleaner path.
    walkthrough_slug: null
  - id: bw-extractor
    name: "BW Extractor (classic)"
    flavor: "0FI_GL_14"
    tagline: "Classic DataSource; carries its own delta logic."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      `0FI_GL_14` extracts headers + line items with native delta tracking.
      Still supported in S/4 for BW compatibility but not the recommended
      direction for new pipelines.
    walkthrough_slug: null
notes:
  - date: "2026-01"
    headline: "BSEG remains compatibility-backed in S/4HANA 2025"
    body_markdown: |
      The 2025 release continues the pattern: BSEG reads in S/4 are served
      from ACDOCA via a compatibility layer. Query performance depends on
      ACDOCA indexing, not on any BSEG-specific storage. [NEEDS_SAP_CITATION]
    sap_note: null
    sap_note_url: null
  - date: "2025-08"
    headline: "Simplification item catalog updates for BSEG"
    body_markdown: |
      SAP's simplification list continues to call out BSEG as a non-persistent
      table in S/4. If you still have custom code writing to BSEG, migrate it
      before the next upgrade window.
    sap_note: null
    sap_note_url: "https://help.sap.com/doc/c34b5ef72430484cb4d8895d5edd12af/2023/en-US/SIMPL_OP2023.pdf"
ingestion_guidance:
  snowflake: |
    **Snowflake ingestion.** Snowpipe continuous ingestion from an object
    stage partitioned by `(GJAHR, BUKRS)` keeps ACDOCA-sized BSEG reloads
    manageable. Kafka Connector is the streaming path from SLT.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** Auto Loader to Delta with Z-ordering on (BUKRS,
    HKONT) materially speeds downstream GL-reporting queries. DLT
    expectations catch orphaned line items early.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Mirroring from Datasphere is the lowest-friction
    path; Dataflow Gen2 over the SAP HANA connector is the classic option
    when you need transformations in-flight.
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
    description: Accounting document number; parent key into BKPF.
  - name: GJAHR
    type: NUMC
    length: 4
    key: true
    source: null
    description: Fiscal year.
  - name: BUZEI
    type: NUMC
    length: 3
    key: true
    source: null
    description: Line item counter within the document.
  - name: BSCHL
    type: CHAR
    length: 2
    key: false
    source: null
    description: Posting key; drives debit/credit direction.
  - name: KOART
    type: CHAR
    length: 1
    key: false
    source: null
    description: Account type — S/D/K/A/M.
  - name: HKONT
    type: CHAR
    length: 10
    key: false
    source: SKA1
    description: General ledger account.
  - name: DMBTR
    type: CURR
    length: 13
    key: false
    source: null
    description: Amount in local currency.
  - name: WRBTR
    type: CURR
    length: 13
    key: false
    source: null
    description: Amount in document currency.
  - name: KUNNR
    type: CHAR
    length: 10
    key: false
    source: KNA1
    description: Customer number for AR postings.
  - name: LIFNR
    type: CHAR
    length: 10
    key: false
    source: LFA1
    description: Vendor number for AP postings.
  - name: KOSTL
    type: CHAR
    length: 10
    key: false
    source: CSKS
    description: Cost center.
columns_total_ecc: 336
extract_methods_ecc:
  - id: slt
    name: "SLT replication"
    flavor: null
    tagline: "The default ECC path for real-time FI extraction."
    license: full
    latency: realtime
    volume: any
    body_markdown: |
      SLT against ECC BSEG works well and is the usual pick when downstream
      systems need sub-minute freshness. Primary key is stable, so delta
      tracking is reliable.
    walkthrough_slug: null
  - id: bw-extractor
    name: "BW Extractor (classic)"
    flavor: "0FI_GL_4 / 0FI_GL_14"
    tagline: "The original path; built to handle BSEG's volume."
    license: runtime
    latency: batch
    volume: any
    body_markdown: |
      The `0FI_GL_*` extractors were designed precisely for BKPF+BSEG bulk
      extraction with delta markers. In ECC this is still the reference
      implementation.
    walkthrough_slug: null
  - id: rfc
    name: "Direct RFC read"
    flavor: "RFC_READ_TABLE"
    tagline: "Emergency path only — cluster storage makes this slow."
    license: runtime
    latency: batch
    volume: small
    body_markdown: |
      BSEG is stored as a cluster table in ECC, so `RFC_READ_TABLE` performance
      is poor even by RFC standards. Acceptable for a few thousand rows of
      reconciliation; never for pipelines.
    walkthrough_slug: null
notes_ecc:
  - date: "2025-06"
    headline: "Cluster-storage reads unchanged in ECC EHP8"
    body_markdown: |
      BSEG remains cluster-stored in ECC and extraction performance continues
      to depend on having proper partition predicates (GJAHR, BUKRS) before
      any pipeline starts reading. [NEEDS_SAP_CITATION]
    sap_note: null
    sap_note_url: null
ingestion_guidance_ecc:
  snowflake: |
    **Snowflake ingestion.** Stage BW extractor output or SLT deltas partitioned
    by (GJAHR, BUKRS); Snowpipe picks files up as they arrive.
  snowflake_docs_url: "https://docs.snowflake.com/en/user-guide/data-load-overview"
  databricks: |
    **Databricks ingestion.** Auto Loader to Delta, Z-ordered on BUKRS/HKONT,
    is the default path for ECC BSEG.
  databricks_docs_url: "https://docs.databricks.com/aws/en/ingestion/"
  fabric: |
    **Fabric ingestion.** Dataflow Gen2 over the SAP HANA connector (with an
    on-prem gateway) is the usual ECC path; Mirroring requires Datasphere.
  fabric_docs_url: "https://learn.microsoft.com/en-us/fabric/data-factory/connector-sap-hana-overview"
_source:
  - "https://help.sap.com/docs/SAP_PROFITABILITY_PERFORMANCE_MANAGEMENT_CLOUD/299cc31818394e94bf54da6fac6ffcdc/a8381f98ab98494d83ef7eeda0e75f58.html"
  - "https://help.sap.com/docs/SAP_S4HANA_CLOUD/c0c54048d35849128be8e872df5bea6d/f585d657f8a28a3de10000000a441470.html"
---

BSEG is the accounting document line-item table. In ECC, it is the canonical
FI line-item store — one row per posting line, every financial document in
the system references back to it. In S/4HANA, BSEG is a compatibility view
over ACDOCA: same shape, same primary key, different underlying storage.

For data engineers the working rule is: in ECC, BSEG is a real table and
extraction planning revolves around partitioning by `(GJAHR, BUKRS)` and
managing cluster-storage read performance. In S/4, prefer ACDOCA or
`I_JournalEntryItem` directly — reading BSEG in S/4 means paying the
compatibility-layer cost on every query without gaining anything ACDOCA
doesn't already give you.
