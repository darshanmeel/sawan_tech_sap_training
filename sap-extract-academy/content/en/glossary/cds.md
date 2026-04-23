---
term: CDS
fullName: Core Data Services
slug: cds
shortDefinition: "CDS is SAP's declarative language for defining data models and views. CDS views are the modern, supported way to expose SAP data; they enforce authorization, apply currency conversion, and avoid raw table queries."
relatedTerms: [ODP, Released CDS View, I_SalesDocument, I_JournalEntryItem, ABAP]
sapDocUrl: "https://help.sap.com/"
seoTitle: "CDS: Core Data Services in SAP — Plain Explanation"
seoDescription: "CDS is SAP's language for defining data views. CDS views enforce authorization and apply transformations, making them the safe, supported way to extract SAP data."
updatedAt: 2026-04-22
---

### What is CDS?

Core Data Services (CDS) is SAP's declarative framework for defining data models, views, associations, and calculations directly at the database layer. A CDS view is conceptually similar to a SQL view — it defines a named query over one or more tables — but it adds SAP-specific capabilities that SQL alone cannot provide: **authorization checks** enforced at the data layer, **currency and unit conversion** annotations, **associations** that define relationships between entities without requiring explicit JOINs in consumer code, and **annotations** that drive UI generation, OData exposure, and ODP extraction behavior.

CDS was introduced as part of SAP HANA's strategy to push computation from the application server down to the database layer. Instead of fetching raw data into ABAP and transforming it in memory, CDS views execute transformations as close to the data as possible. For S/4HANA systems running on HANA, this means CDS views can leverage HANA's columnar storage and in-memory processing for dramatically better performance than equivalent ABAP SELECT statements.

The practical significance for data extraction is that SAP has made CDS views the **official, published interface** for accessing SAP data. Raw table extraction — `SELECT * FROM BKPF` — is unsupported, unstable across upgrades, and potentially dangerous on HANA (where a full table scan of `ACDOCA` with hundreds of millions of rows can exhaust memory and crash the system). CDS views are the supported path.

### How it works

CDS views are written in a dialect of SQL extended with SAP-specific syntax, authored in ADT (ABAP Development Tools), and transported like any other ABAP object. A minimal CDS view looks similar to a SQL `CREATE VIEW` statement, but adds an `@` annotation prefix for metadata. SAP delivers two categories of CDS views: **private views** (no prefix or `P_` prefix) used internally within the SAP application layer, and **released views** (prefixed `I_` for interface views, `C_` for consumption views, `A_` for API views in RAP) that are explicitly published for external use and governed by SAP's compatibility promise.

The **`I_` (interface) CDS views** are the ones relevant to extraction. `I_JournalEntryItem` wraps `ACDOCA`, `I_SalesDocument` wraps `VBAK`/`VBAP`, `I_Product` wraps `MARA`, `I_PurchasingDocument` wraps `EKKO`/`EKPO`. These views join the raw tables, apply access control via **DCLS (Access Control objects)**, compute derived fields, handle multi-currency amounts, and present a stable field surface that SAP maintains across releases. When SAP restructures the underlying tables (as happened extensively in the move from ECC to S/4HANA with `BSEG` to `ACDOCA`), the `I_` views absorb the change and maintain backward compatibility.

For ODP extraction, CDS views must carry the annotation `@Analytics.dataExtract: true` (or the equivalent depending on the SAP release) to be registered as ODP providers under the `ABAP_CDS` extraction context. You can inspect which CDS views are ODP-enabled in transaction `ODQMON` by browsing the `ABAP_CDS` context, or by searching for the annotation in ADT.

### Why it matters for data extraction

CDS views are the correct and safe extraction surface for SAP data, and understanding them at depth is non-negotiable for anyone building serious extraction pipelines. The three concrete reasons are authorization, stability, and delta support.

**Authorization**: CDS views with DCLS (Data Control Language Statements) enforce row-level and field-level security automatically, based on the calling user's SAP authorizations. This means an extraction running under a correctly authorized RFC user will automatically receive only the data that user is permitted to see — which is exactly what you want for production extraction. Raw table access via `RFC_READ_TABLE` bypasses this entirely, which is both a security risk and a compliance problem in regulated industries.

**Stability**: SAP's upgrade compatibility promise applies to released `I_` CDS views. If SAP restructures the underlying tables in a future release, the `I_` view interface remains stable. An extraction built on `I_JournalEntryItem` continues to work after an SAP upgrade; an extraction built directly on `ACDOCA` may break if SAP adds, removes, or renames columns — which happens with support packages and upgrade bundles.

**Delta support**: ODP-enabled CDS views provide delta extraction out of the box. The delta mechanism is managed by the ODP framework using the view's change tracking metadata. For `I_JournalEntryItem`, delta captures new journal entry postings since the last extraction. This is far more reliable than timestamp-based delta on `ACDOCA` directly, because ODP manages sequence tracking and handles resets.

### Common pitfalls

The most critical pitfall is using **private or unreleased CDS views** for extraction. Views without the `I_` prefix or an explicit SAP release annotation are internal implementation details. SAP can change, rename, or delete them in any support pack without notice. An extraction pipeline built on an unreleased view will break silently after an upgrade — often without an error, just with missing or incorrect data.

A second pitfall is **ignoring access control annotations**. A CDS view annotated with `@AccessControl.authorizationCheck: #CHECK` will apply DCLS rules and silently return zero rows for an RFC user who lacks the required authorizations — no error, just an empty result. If your extraction returns fewer rows than expected, check the view's access control annotation in ADT before investigating extraction logic. Setting up the RFC user's authorizations correctly (company codes, plant ranges, controlling areas) is a Basis task, but identifying the need for it is an extraction engineer's responsibility.

Finally, watch for **currency and unit fields in CDS views**. CDS views often apply currency conversion annotations that produce computed currency fields different from the raw database values. If you extract `I_JournalEntryItem` and compare `AmountInCompanyCodeCurrency` to the raw `ACDOCA-HSL` field, you may see differences where the view has applied a conversion rule. Always trace the CDS view's annotations in ADT to understand what transformations are applied to each field before assuming the extracted value equals the raw stored value.

### In practice

A practical extraction design: you need to build a general ledger fact table in Snowflake from an S/4HANA system. The wrong approach is `SELECT * FROM ACDOCA` via `RFC_READ_TABLE` — ACDOCA has over 300 columns, no authorization enforcement, and will likely time out or crash for any meaningful date range. The right approach is to subscribe to `I_JournalEntryItem` via ODP in the `ABAP_CDS` context, which delivers a curated field set of ~80 columns, enforces authorization, and provides delta extraction keyed to the document posting sequence. You configure the extraction in your tool (Fivetran, ADF, pyrfc with ODP calls), run an initial load scoped to the last three fiscal years, and then activate delta to capture ongoing postings. This approach is stable across SAP upgrades, auditable, and scalable to billions of rows with proper ODP subscriber management.
