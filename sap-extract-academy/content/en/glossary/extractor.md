---
term: Extractor
fullName: Data Extractor
slug: extractor
shortDefinition: "An extractor is a reusable SAP component that exposes table data for extraction via ODP or custom querying. Generic extractors exist for all tables; they support filtering, field selection, and delta tracking."
relatedTerms: [ODP, Operational Data Provisioning, Generic Extractor, ABAP, CDS]
sapDocUrl: "https://help.sap.com/"
seoTitle: "Extractor: SAP Data Extractor Component — Plain Explanation"
seoDescription: "Extractors expose SAP table data for extraction. Generic extractors exist for all tables; they support filtering, field selection, and delta tracking."
updatedAt: 2026-04-22
---

### What is an Extractor?

An **extractor** is a reusable SAP-side component that provides structured, controlled access to a data source for extraction purposes. Rather than connecting directly to a database table with raw SQL, extraction frameworks like ODP interact with extractors — which are registered, named components with defined metadata, authorization logic, delta capability, and field selection rules. Every SAP table has at least a **generic extractor** automatically available through the ODP framework. Many key business objects also have **SAP-published specialized extractors**, exposed as CDS views or BW DataSources, that provide richer semantics, join logic, and currency/unit conversion.

The extractor concept exists to give SAP control over what data leaves the system and in what form. A raw database connection bypasses authorization entirely; an extractor enforces it. When you access `ACDOCA` through the CDS view `I_JournalEntryItem`, you are using SAP's officially released extractor for universal journal data. That extractor applies ledger-level authorization objects, respects company code access restrictions, and returns semantically enriched data — amounts in both local and group currency, fiscal period attributes, cost object types. Direct table access gives you none of that automatically.

### How it works

Extractors are registered in the ODP framework under one of several **ODP contexts**: `SAPI` (for BW DataSources), `ABAP_CDS` (for CDS views released with `@Analytics.dataExtract: true`), and `BW` (for SAP BW InfoProviders). When an ODP consumer — Fivetran, SAP Data Services, a custom ABAP program using the ODP API, or a third-party tool — subscribes to an extractor, it creates a named **subscription** in the ODP framework. The framework then manages delta state for that subscription: it records what was last delivered, queues new changes, and guarantees at-least-once delivery.

Under the hood, a generic table extractor delegates to open SQL against the underlying transparent table. A CDS-based extractor executes the CDS view definition, which may join several tables, apply association logic, and invoke ABAP expression functions. A BW DataSource extractor calls the DataSource's ABAP extraction function module (typically named `RODBS_*` or `RSA3`-visible modules). Each type of extractor presents the same ODP interface to the consumer, hiding the underlying complexity. This abstraction is what makes ODP-based extraction tools like Fivetran pluggable across very different SAP data structures.

### Why it matters for data extraction

Choosing the right extractor determines both the quality of the data you receive and the stability of your extraction pipeline. A **generic extractor** on `VBAK` gives you a flat dump of the sales order header table — every column, no joins, no unit conversion, delta tracked by the ODP framework. It is fast to set up and covers any table. A **specialized CDS extractor** like `I_SalesOrder` gives you a semantically aligned view of sales orders with resolved partner function roles, status fields derived from multiple tables, and field names aligned to SAP's public API surface. The specialized extractor is more future-proof: SAP maintains its compatibility across upgrades, whereas direct table structures can change.

Authorization filtering through extractors is a critical and frequently overlooked point. If an extraction user's role does not include authorization for certain company codes (`BUKRS`) in the `F_BKPF_BUK` authorization object, the extractor will silently return only the authorized subset of rows. This means an extraction pipeline can appear to be working correctly — no errors, no warnings — while delivering incomplete data. Always validate row counts against a known-good reference when setting up a new extractor subscription, and ensure the extraction service account's authorizations are scoped to the full data range required.

### Common pitfalls

**Bypassing extractors with direct RFC table reads** is a common shortcut that creates long-term problems. Functions like `RFC_READ_TABLE` and `BBP_RFC_READ_TABLE` read tables directly without going through the ODP framework. They have no delta capability, no authorization enforcement beyond basic table-level access, and no field metadata. Pipelines built on direct RFC table reads must implement their own delta logic (usually a high-watermark timestamp on a field like `AEDAT`), which is fragile and table-specific. As table volumes grow, direct reads become performance bottlenecks. Investing in ODP-based extraction from the start avoids these problems.

**Confusing extractor availability with extractor quality** is another common mistake. A generic extractor is always available, but it exposes the physical table structure — which may change across SAP upgrades and SAP notes. If SAP adds or removes a column from `EKKO` via a support package, your generic extractor field list is suddenly out of date. CDS-based extractors released by SAP (`@VDM.viewType: #CONSUMPTION`) are protected by compatibility promises: SAP will not remove or rename fields without a deprecation period. Where SAP-released CDS extractors exist for the data you need, prefer them over generic table extractors for production pipelines.

### In practice

A data team extracting procurement data chooses between three options for `EKKO` (purchase order headers): a direct RFC table read, a generic ODP extractor on `EKKO`, and the CDS view `I_PurchaseOrder`. The direct RFC read is rejected immediately — no delta, no authorization enforcement. The generic extractor is simpler to configure but exposes raw table columns like `AEDAT` (last changed date) for delta tracking, and column names that require mapping for business users. The CDS view `I_PurchaseOrder` includes resolved supplier names from `LFA1`, purchasing group descriptions from `T024`, and status semantics. The team chooses the CDS extractor for the analytics warehouse and uses `ODQMON` to monitor the subscription. When a support package update adds new fields to the CDS view, they appear automatically in the next extraction without pipeline changes — validating the choice.
