---
term: SLT
fullName: SAP Landscape Transformation
slug: slt
shortDefinition: "SLT is SAP's licensed tool for high-performance data replication from SAP to external systems (Kafka, databases, data lakes). Enables billions-of-rows extractions with real-time delta, partitioning, and parallel reads."
relatedTerms: [LTRC, LTRS, Real-time Replication, Kafka, Full Use License, ODP]
sapDocUrl: "https://help.sap.com/"
seoTitle: "SLT: SAP Landscape Transformation Replication — Plain Explanation"
seoDescription: "SLT is SAP's licensed tool for high-performance replication to Kafka, databases, data lakes. Handles billions of rows with real-time delta."
updatedAt: 2026-04-22
---

### What is SLT?

**SAP Landscape Transformation Replication Server** (SLT, formerly known as SAP LT Replication Server) is SAP's purpose-built, high-throughput replication tool for moving data from SAP source systems to external targets at enterprise scale. SLT operates as a standalone server — either a dedicated system or an embedded component in the source SAP system — and manages the full replication lifecycle: initial load, delta capture, error handling, and monitoring. Unlike batch-oriented extraction tools, SLT is fundamentally a **continuous replication engine**: once configured, it keeps the target in sync with the source in near real time, pushing changes as they happen rather than waiting for a scheduled job to pull them.

SLT is the answer to the question: "How do I get ACDOCA out of a production SAP system with 5 billion rows without disrupting business operations and without waiting three weeks?" ODP and RFC-based tools are excellent for moderate volumes and scheduled batch patterns, but they are not architected for continuous, high-volume replication of core financial tables. SLT is. It is the tool chosen by enterprises running SAP data lakes, real-time analytical platforms on Kafka, and large-scale HANA Cloud migrations.

### How it works

SLT uses **database trigger-based delta capture** as its foundation. When SLT is configured for a source table (say `BKPF`), it installs logging tables and database triggers on that table in the source SAP database. Every INSERT, UPDATE, or DELETE on `BKPF` writes a delta record to the logging table. The SLT replication engine continuously reads these logging tables, transforms the delta records, and pushes them to the target (Kafka topic, database table, SAP HANA, file system, etc.). This approach captures changes at the database layer — below the ABAP application stack — which means it captures every change regardless of the ABAP program or process that caused it.

For the initial load of very large tables, SLT uses **partitioned parallel reading**. Configuration is done in transaction `LTRC` (Mass Transfer Configuration), where you define the replication mapping and the parallelism settings. Transaction `LTRS` (Replication Settings) controls how many parallel read jobs run per table and how the table is partitioned. For `ACDOCA`, a typical configuration might partition by `RBUKRS` (company code) and `GJAHR` (fiscal year), spawning four to eight parallel ABAP background jobs per partition, each reading a slice and writing to the target. This parallelism is what allows an initial load of billions of rows to complete in 24 to 72 hours rather than weeks. Once the initial load completes, SLT seamlessly transitions to delta replication using the trigger-captured changes.

### Why it matters for data extraction

SLT occupies the top of the extraction capability pyramid. It is the only SAP-native tool that combines true real-time delta (sub-minute latency), partitioned parallel initial loads at billions-of-rows scale, and a robust monitoring and error recovery framework — all within a single, SAP-supported product. For organisations building event-driven data architectures where a Kafka topic must reflect SAP financial postings within seconds of the ABAP posting transaction completing, SLT is the standard solution.

The licensing model matters here. SLT requires a **Full Use License** from SAP — not the Runtime License that covers embedded use. This is a separate, significant cost that SAP audits rigorously. Organisations that attempt to use SLT without the correct license expose themselves to material audit findings. This licensing reality is why SLT is reserved for high-value, high-volume use cases — the commercial justification must match the cost. For smaller tables, lower volumes, or batch-tolerable pipelines, ODP is the pragmatic and license-compliant choice.

### Common pitfalls

The most damaging SLT mistake is under-provisioning the SLT server. Because SLT runs parallel background jobs on the source SAP system (in embedded deployment) or on the SLT server (in standalone deployment), insufficient background work process capacity leads to job queuing, replication lag, and in extreme cases, logging table overflow where delta records are written faster than they are consumed. Before go-live, work process capacity planning — accounting for both initial load parallelism and steady-state delta volume — is mandatory. A table like `ACDOCA` in a high-transaction environment can generate thousands of delta records per minute during peak hours.

Another common pitfall is ignoring the **logging table growth** on the source system. SLT's trigger-based delta mechanism writes every change to a shadow logging table in the source database. If the SLT replication engine falls behind (due to network issues, target downtime, or misconfiguration), these logging tables grow unboundedly. On systems with high transaction volumes, logging tables can consume gigabytes of database space per hour when replication is stalled. Monitoring logging table size and replication lag via `LTRC` is not optional — it is a continuous operational responsibility.

### In practice

A global manufacturing company needs to replicate `ACDOCA` (universal journal, 4.2 billion rows) and `BKPF` (accounting document header, 800 million rows) to a Kafka-based data lake for real-time financial reporting. They deploy SLT in standalone mode on a dedicated server with 32 background work processes. In `LTRC`, they configure two mass transfer objects: one for `ACDOCA` partitioned by `RBUKRS` and `GJAHR` with 8 parallel readers, and one for `BKPF` with 4 parallel readers. The initial load of `ACDOCA` completes in 58 hours. Once the initial load finishes, the trigger-based delta kicks in, and postings made in the source SAP system appear in the Kafka topic within 15 seconds. The financial reporting team now has a live, sub-minute view of journal entries — something that was impossible with the previous nightly ODP batch process.
