---
term: S/4HANA
fullName: SAP S/4HANA (SAP Suite 4 High-Performance Analytics)
slug: s4hana
shortDefinition: "S/4HANA is SAP's latest ERP platform, released in 2015. It replaces older ERP versions (R/3, ECC) with modern architecture: in-memory database (HANA), cloud-first design, simplified data models, and embedded analytics."
relatedTerms: [ECC, ERP, HANA Database, CDS, ODP, S/4HANA Cloud]
sapDocUrl: "https://help.sap.com/"
seoTitle: "S/4HANA: SAP's Modern ERP Platform — Plain Explanation"
seoDescription: "S/4HANA is SAP's latest ERP system (released 2015). Replaces ECC with in-memory database, cloud design, simplified models, and embedded analytics."
updatedAt: 2026-04-22
---

### What is S/4HANA?

**SAP S/4HANA** (Suite 4 High-Performance Analytics) is SAP's fourth-generation ERP platform, generally available since 2015. It replaces the previous generation — SAP ERP (also called ECC, or Enhancement Package-based SAP R/3) — with an architecture rebuilt from the ground up for the SAP HANA in-memory database. The "S/4" designates the fourth major suite generation; "HANA" signifies that SAP HANA is the only supported database, eliminating the decades-long multi-database abstraction layer that SAP ECC maintained across Oracle, DB2, SQL Server, and MaxDB.

S/4HANA is available in two deployment models. **S/4HANA on-premise** (also called S/4HANA OP) is a customer-managed installation on private infrastructure or hyperscaler IaaS, with full access to the underlying HANA database, Basis configuration, and ABAP development environment. **S/4HANA Cloud** (RISE with SAP) is a SAP-managed multi-tenant SaaS offering where direct database access is not available, ABAP modifications are restricted, and extraction relies exclusively on published OData APIs and released CDS views. The extraction patterns for these two deployment models differ significantly, and you must know which one your organisation runs before designing a pipeline.

### How it works

S/4HANA's most consequential architectural change for data extraction is the **simplification of the Finance data model**. In ECC, financial postings were distributed across multiple tables: `BKPF` (document header), `BSEG` (document line items), and several index tables (`BSIS`, `BSAS`, `BSID`, `BSAD`, etc.) that pre-aggregated open and cleared items by account type. S/4HANA consolidates these into the **Universal Journal** table `ACDOCA`, which stores every financial posting as a single line item with full account and organisational assignment. The index tables are retained as compatibility views but are populated from `ACDOCA` on read, not maintained as primary data. For extraction, this means `ACDOCA` is the single authoritative source for all financial line-item data — simpler, but at 500+ columns and billions of rows in large enterprises, it demands careful field selection and partitioning strategy.

Beyond finance, S/4HANA introduces **Core Data Services (CDS) views** as first-class data model objects. SAP publishes hundreds of **released CDS views** — prefixed `I_` for interface views — that represent stable, documented, and version-controlled data access interfaces. `I_JournalEntryItem` wraps `ACDOCA`; `I_SalesDocument` wraps `VBAK`/`VBKD`; `I_PurchaseOrderItem` wraps `EKPO`. Extracting via a released CDS view via ODP insulates your pipeline from internal table restructuring that SAP may perform in future releases, because SAP commits to maintaining the released view's signature across upgrades.

### Why it matters for data extraction

S/4HANA defines the extraction landscape that this academy is built around. The three pillars of modern SAP extraction — **ODP**, **released CDS views**, and **SLT** — are all S/4HANA-native capabilities. ODP is available on ECC too, but its integration with CDS views is an S/4HANA feature. SLT replication to external systems (Kafka, cloud storage) is supported and actively developed for S/4HANA, with less robust support for legacy ECC. If your organisation is planning an S/4HANA migration, the data extraction architecture should be redesigned at the same time — extracting from ECC and then re-extracting from S/4HANA after migration doubles the pipeline build work.

The HANA in-memory database provides extraction performance advantages that shape pipeline design. Full table scans of `ACDOCA` that would take hours on an Oracle database with ECC can complete in minutes on HANA with proper partition pruning. This changes the economics of full-load versus delta extraction: with HANA, re-extracting a full year partition of `ACDOCA` monthly may be more reliable than maintaining a complex delta pipeline, depending on your data volume and latency requirements. However, full-load extraction still consumes HANA buffer pool memory and CPU, so it must be scheduled during off-peak windows or using dedicated HANA secondary tenants.

### Common pitfalls

The most frequent S/4HANA extraction mistake is **querying ECC-era tables directly** instead of using released CDS views. Developers familiar with ECC will instinctively reach for `BSEG` when they need financial line items. In S/4HANA, `BSEG` is a compatibility view backed by `ACDOCA`, and querying it via `RFC_READ_TABLE` bypasses the HANA columnar query optimisation, resulting in poor performance and potentially incomplete data for documents that only exist in the Universal Journal. Always use `ACDOCA` or `I_JournalEntryItem` for financial extraction in S/4HANA.

A second pitfall is treating S/4HANA Cloud (RISE) identically to S/4HANA on-premise. In S/4HANA Cloud, RFC connections to custom namespaces are restricted, direct table access via `SE16N` is not available for most tables, and ODP extraction is limited to SAP-released providers. Pipelines built for on-premise that use `RFC_READ_TABLE` against custom Z-tables will fail in Cloud. Plan your extraction architecture around the deployment model your organisation has contracted, not the one you are most familiar with.

### In practice

In the expert walkthrough for financial data extraction, the source is `I_JournalEntryItem` (the released CDS view over `ACDOCA`) rather than `ACDOCA` directly. The extraction is partitioned by `FiscalYearPeriod` and `CompanyCode` to distribute the RFC load across time windows. Delta extraction uses ODP's delta mode against the CDS view, which leverages SAP's HANA-optimised change capture for the Universal Journal. The result lands in a Snowflake schema where `ACDOCA` data is modelled into a finance mart using dbt, with separate fact tables for AP, AR, and GL balances — each joining to the shared organisational dimension tables sourced from `T001` (company codes), `SKA1` (G/L accounts), and `CSKS` (cost centre master).
