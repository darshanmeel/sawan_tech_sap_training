---
term: Delta
fullName: Delta (Change Data Capture)
slug: delta
shortDefinition: "Delta represents only the rows that have changed since the last extraction. Real-time delta captures inserts/updates/deletes immediately; queue-based delta periodically batches changes. Enables streaming architectures without full table replication."
relatedTerms: [ODP, SLT, Operational Data Provisioning, ODQMON, Full Load]
sapDocUrl: "https://help.sap.com/"
seoTitle: "Delta: Change Data Capture in SAP — Plain Explanation"
seoDescription: "Delta captures only changed rows since last extraction. Real-time delta streams immediately; queue-based delta batches changes. Enables efficient incremental loading."
updatedAt: 2026-04-22
---

### What is Delta?

**Delta** — also called **Change Data Capture (CDC)** — is the practice of extracting only the rows that have been inserted, updated, or deleted since the previous extraction run, rather than re-reading the entire table from scratch. If you performed a full extraction of `ACDOCA` yesterday and 100,000 new journal entries were posted today, a delta extraction retrieves only those 100,000 rows. The rest of the table — potentially billions of rows accumulated over years — is left untouched.

The concept sounds straightforward, but the implementation is where SAP systems introduce complexity. SAP does not expose a universal change log at the database level the way some relational databases do with a WAL (write-ahead log). Instead, SAP exposes delta through framework-level constructs: the **Operational Data Provisioning (ODP)** framework, **SLT** trigger-based replication, and legacy BW DataSources. Each mechanism tracks changes differently, and the correct choice depends on the table, the SAP version, and the latency requirement.

### How it works

SAP offers two primary delta mechanisms. **Real-time delta** via ODP and SLT operates at the trigger level: when a posting occurs in `ACDOCA`, a database trigger (in SLT's case) or an ABAP update module (in ODP's case) writes the changed record to a staging queue immediately. An extraction consumer — a Kafka connector, a Fivetran sync, or a custom ODP subscriber — reads from that queue and forwards the data to the target system within seconds or minutes of the originating business event.

**Queue-based delta** using the ODP queue (`ODQMON`) takes a different approach. Changes accumulate in the ODP delta queue on the SAP side, and the consumer polls on a schedule — every 15 minutes, every hour — and drains the queue in batches. This is simpler to operate: the queue handles the buffering, retries are easy to reason about, and `ODQMON` provides a clear view of what has been queued versus delivered. The cost is latency: you will always be one polling interval behind real time. For overnight batch pipelines, that is entirely acceptable. For a near-real-time operational dashboard, it is not.

### Why it matters for data extraction

Delta is not a nice-to-have for production SAP extraction — it is a requirement. `ACDOCA` in a mature SAP S/4HANA system can exceed one billion rows and grow by millions of rows per business day. A full load of that table takes hours and consumes enormous database I/O, competing directly with transactional users. Attempting nightly full loads at scale is operationally unsustainable and often technically infeasible within a maintenance window.

Delta makes high-frequency extraction viable. With a properly configured ODP or SLT delta stream, a pipeline can process changes to `ACDOCA`, `BKPF`, `VBAK`, and `EKKO` continuously, keeping the data warehouse synchronized to within minutes of the SAP system without ever performing another full table scan. The downstream effect is significant: finance teams get near-real-time P&L visibility, procurement teams see purchase order changes as they happen, and supply chain planners work from current inventory rather than last night's snapshot.

### Common pitfalls

**State management** is the most common source of delta failures. Delta extraction is stateful: the consumer must persist a pointer — a timestamp, a sequence number, or an ODP subscription handle — that marks where the last successful extraction ended. If that state is lost (a deployment wipes a configuration database, a container restarts without persistent storage), the consumer does not know where to resume. The result is either a data gap (missed changes) or a full re-extraction to be safe. Always store delta state in durable, backed-up storage outside the extraction process itself.

**Deletes** are frequently mishandled. When a record is physically deleted from an SAP table (rare in transactional systems but possible in master data), a delta stream must signal that deletion to the consumer. ODP encodes deletes as records with a special **after-image** flag; SLT marks deletions with a delete indicator. If the consumer ignores these markers and only upserts records, deleted rows persist in the data warehouse indefinitely, causing reconciliation failures. Verify your pipeline explicitly handles delete events — either by physically removing the row from the warehouse or by setting a soft-delete flag.

**Periodic reconciliation** is essential even with a working delta. Over weeks of operation, bugs, retries, and edge cases accumulate. A full-load reconciliation run — comparing row counts and key checksums between SAP and the warehouse — catches drift before it compounds. Plan for a monthly or quarterly reconciliation window even if delta appears healthy.

### In practice

A global manufacturer runs SLT in real-time delta mode against `ACDOCA`, streaming journal entries to Kafka. The Kafka consumer writes to Snowflake, where finance analysts query a near-real-time P&L. Delta volume averages 200,000 rows per hour during business hours. The full table is 4 billion rows — a full reload would take 40+ hours. With delta, the warehouse is never more than 2 minutes behind SAP, the daily ingestion window is under 30 minutes of total data moved, and the full-load reconciliation runs quarterly on a weekend. This is the production pattern delta enables.
