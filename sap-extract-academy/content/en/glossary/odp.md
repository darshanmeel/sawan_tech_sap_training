---
term: ODP
fullName: Operational Data Provisioning
slug: odp
shortDefinition: "ODP is SAP's extraction framework for exposing table and view data for real-time extraction. ODP handles authorization, supports full-load and delta, and integrates with CDS views. The modern alternative to legacy BW extractors."
relatedTerms: [Operational Data Provisioning, Delta, Released CDS View, ODQMON, Extractor]
sapDocUrl: "https://help.sap.com/"
seoTitle: "ODP: Operational Data Provisioning in SAP — Plain Explanation"
seoDescription: "ODP is SAP's extraction framework for real-time table data. Supports full-load, delta, authorization, and CDS integration. The modern extraction standard."
updatedAt: 2026-04-22
---

### What is ODP?

**Operational Data Provisioning (ODP)** is SAP's unified extraction framework introduced with SAP NetWeaver 7.4 and made the standard in S/4HANA. ODP replaces a fragmented landscape of legacy BW extractors, DataSources, and custom RFC function modules with a single, consistent API for exposing SAP data to external consumers. Any table, CDS view, or DataSource that is registered as an ODP provider becomes immediately available for extraction via the `RFC_ODP_READ` function module — the same call whether you are pulling `ACDOCA`, a released CDS view like `I_JournalEntryItem`, or a custom Z-table.

ODP operates on a provider-consumer model. The **ODP provider** is the SAP object that publishes data — a transparent table, a CDS view with the `@OData.publish: true` annotation, or a legacy BW DataSource. The **ODP consumer** is whatever external tool connects via RFC to read from that provider. Python scripts using `pyrfc`, Azure Data Factory's SAP ODP connector, Informatica PowerCenter, and commercial extractors like Fivetran all act as ODP consumers. The provider handles authorization enforcement, field projection, and filter pushdown; the consumer simply specifies what it wants and receives pages of data.

### How it works

When an ODP consumer initiates an extraction, it registers a **subscription** against the provider. This subscription is the persistent identity that ODP uses to track what data the consumer has already seen. For a **full-load** extraction the subscription is used only to scope the current request — all rows are returned and no delta state is maintained. For **delta extraction**, the subscription becomes critical: ODP records a watermark after each successful extraction, and subsequent calls return only rows that changed since that watermark. The delta queue is stored in SAP database tables and is visible in the transaction `ODQMON`.

Delta tracking in ODP works differently depending on the provider type. For CDS views with `@Analytics.dataExtract.enabled: true`, SAP uses change document logs or database triggers to populate the delta queue. For transparent tables exposed directly, ODP relies on change pointers or timestamp fields. When your extraction tool calls `RFC_ODP_READ` with `READ_MODE = 'D'` (delta), SAP returns the queued changes and advances the watermark. If the extraction fails mid-way, the watermark is not advanced, so the next run retries the same delta — providing at-least-once delivery semantics. Your pipeline must handle deduplication in the target layer.

ODP also enforces **authorization objects** at the field and row level. If your RFC user does not have the necessary S/4HANA authorization objects (typically `S_TABU_DIS` for tables or specific CDS view authorization objects), ODP will either return no rows or raise an authorization error. This is more secure than direct `SE16N` table browsing but requires careful user setup in `SU01` before extraction begins.

### Why it matters for data extraction

ODP is the central API that makes modern SAP extraction tractable without direct database access. Without ODP, extracting from an SAP system required either ABAP development of custom RFC function modules, direct database connections (rarely permitted for cloud SAP systems), or purchasing expensive middleware. ODP exposes the SAP data model through a documented, supported interface that SAP commits to maintaining across releases. When SAP restructures internal tables in a new S/4HANA release, released CDS views exposed via ODP maintain backward compatibility — your extraction pipeline does not break.

For delta extraction at scale, ODP's queue-based approach is efficient because it avoids full table scans. Instead of extracting all 500 million rows of `ACDOCA` nightly and computing what changed in the warehouse, ODP delivers only the delta — perhaps 50,000 journal entries posted during business hours. This reduces network traffic, SAP system load, and warehouse compute costs. At high volumes, the bottleneck moves from SAP to your ingestion infrastructure, which is the point at which you graduate from ODP to SLT replication.

### Common pitfalls

The most common ODP mistake is not cleaning up stale subscriptions. Every time an extraction tool registers a new subscription name, ODP creates a persistent delta queue in SAP's database. If your tool creates a new subscription on every run (common in poorly configured ADF pipelines or ad-hoc Python scripts), the SAP system accumulates thousands of abandoned queues that consume database space and slow `ODQMON`. Always reuse a stable subscription name per pipeline and explicitly delete subscriptions when decommissioning a pipeline using `ODQMON`.

A second frequent issue is misunderstanding full-load versus delta mode. Developers sometimes configure delta mode for initial load of a large table, expecting ODP to batch efficiently. In delta mode without a prior watermark, ODP does perform a full scan — but it also writes the entire dataset to the delta queue first, doubling the I/O on SAP's database. For initial loads of large tables, always use full-load mode with parallel partitioning (by `GJAHR`, `BUKRS`, or another selective field), then switch to delta mode for subsequent incremental runs.

### In practice

A typical beginner ODP pipeline for extracting `VBAK` (sales order headers) in Python uses `pyrfc` to call `RFC_ODP_READ` with the provider name `VBAK`, a full-load `READ_MODE`, a page size of 100,000 rows, and filters for a specific `VKORG` (sales organisation). The script loops through pages, writes each to Parquet, and uploads to S3. An intermediate pipeline adds delta mode: after the initial load, daily runs call `RFC_ODP_READ` with `READ_MODE = 'D'` using the same subscription name, receiving only changed headers and merging them into the target table using a `MERGE` statement in Snowflake. Monitor queue health in `ODQMON` throughout.
