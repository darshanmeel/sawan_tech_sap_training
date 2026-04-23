---
term: LTRS
fullName: SLT Landscape Transformation Replication Server
slug: ltrs
shortDefinition: "LTRS is the SAP component that runs parallel reader processes for SLT replication. You configure LTRS to run 4-8 parallel readers, each handling a partition (e.g., one company code + fiscal year), dramatically accelerating full-load times."
relatedTerms: [SLT, LTRC, Parallel Readers, Replication Server, Dialog Work Process]
sapDocUrl: "https://help.sap.com/"
seoTitle: "LTRS: SLT Parallel Replication Server — Plain Explanation"
seoDescription: "LTRS enables parallel reader processes for SLT replication. Configure 4-8 parallel readers to dramatically accelerate full-load extraction of large tables."
updatedAt: 2026-04-22
---

### What is LTRS?

**LTRS** (Landscape Transformation Replication Server) is the execution engine of SLT replication. Where `LTRC` defines the configuration — what to replicate, how to partition it, which filters to apply — `LTRS` is the component that actually moves the data. It manages the pool of **parallel reader processes** that perform the initial full load, transitions those readers to delta mode once the full load completes, and handles error recovery when individual partitions fail or stall.

LTRS runs on the **SLT server** — which may be a dedicated SAP system or an embedded component within the source SAP system, depending on the deployment architecture. In a standalone SLT setup, LTRS is a separate SAP instance that connects to the source system over RFC and to the target system (Kafka, SAP HANA, S/4HANA) over the configured target adapter. In an embedded SLT setup, LTRS runs within the source system's application server, sharing its work process pool. The distinction matters for resource planning: embedded SLT directly competes with dialog users for work processes, while standalone SLT has its own isolated resource pool.

### How it works

LTRS maintains a **reader process pool** for each mass transfer ID configured in `LTRC`. A reader process is an ABAP work process dedicated to SLT that continuously reads a partition of data from the source table, transforms it (applying field exclusions and any configured mappings), and writes it to the target system. The number of active reader processes at any given moment is the **parallelism level**, which you configure in the LTRS settings for each mass transfer ID.

During the full-load phase, each active reader claims an uncompleted partition from the partition list defined in `LTRC`, reads all rows in that partition using an open SQL cursor, and delivers them to the target. When the partition is complete, the reader marks it done and immediately claims the next uncompleted partition. This work-stealing pattern means that faster readers automatically absorb more partitions, and the full load completes when the last partition is delivered. After a partition's full load is done, SLT activates **delta capture** for it using the logging table that was set up during `LTRC` configuration — so delta and full load run concurrently across different partitions.

You can monitor active readers and their per-partition progress in `SM50` (work process monitor on the SLT server) and in `LTCO` (the SLT monitoring transaction). In `SM50`, LTRS reader processes appear with program names like `IUUC_REPL_APPL` or similar SLT-specific identifiers. Each row in `SM50` corresponds to one active reader. Watching `SM50` during a major full load shows you exactly how many readers are active, which partitions they are processing, and how long each partition read is taking.

### Why it matters for data extraction

LTRS parallelism is the primary lever for controlling full-load duration and system impact. Getting this tuning right is the difference between a feasible extraction project and one that runs for weeks and disrupts production operations. For reference, a single sequential reader processing `ACDOCA` at 500,000 rows per second on well-tuned hardware might complete a 2-billion-row table in roughly 66 minutes of pure read time — but contention, logging overhead, and target write latency typically reduce effective throughput by 60-80%. A realistic sequential full load of a very large financial table can take 24-72 hours. With 8 parallel readers and proper `BUKRS + GJAHR` partitioning providing 40+ independent partitions, that same load completes in 6-12 hours.

The trade-off is system load. Each reader is a work process consuming CPU, memory, and database I/O on the SLT server and generating database reads on the source system. Setting 16 readers when the SLT server has 20 total work processes leaves only 4 for everything else — including the delta writer processes that capture ongoing changes. The practical guidance is to start at 4 parallel readers, observe system metrics for 30 minutes, and increase by 2 readers at a time until either the extraction completes in the target window or resource metrics approach thresholds.

### Common pitfalls

**Setting too many parallel readers without checking work process availability** is the most common LTRS configuration mistake. If you allocate 10 readers for a mass transfer ID but the SLT server only has 12 total background work processes, other SLT operations — delta writes, error retries, administrative tasks — have only 2 slots available. The result is a stalled or corrupted replication. Always confirm the total background work process count on the SLT server (visible in `SM50`) before setting the reader count, and leave at least 30-40% headroom for non-reader operations.

**Leaving reader count at maximum during business hours** after a successful full load is another frequent problem. Once a table's full load completes and delta is active, the delta reader workload is much lighter than the full load. But if the reader count remains at 8 and parallel delta processing is enabled, the SLT server may still be allocating unnecessary resources. Review and reduce reader counts after full loads complete to free work processes for other replication objects or system operations.

**Ignoring stuck partitions** during a full load allows a single slow partition to block overall progress. A partition containing a company code with unusually dense data (a high-transaction parent company, for example) may take 10x longer than the average partition. `LTCO` shows per-partition status. If a partition has been in "running" status for significantly longer than its peers, investigate whether the reader is genuinely making progress (rows-per-second metric in `LTCO`) or whether it has stalled due to a lock or a network issue. Stuck readers can be reset in `LTCO` without restarting the entire replication.

### In practice

A team is performing the initial full load of `ACDOCA` via SLT into a HANA target. The table has 3.5 billion rows, partitioned by `BUKRS + GJAHR` into 120 partitions. The SLT server is a dedicated system with 32 background work processes. The team configures 8 parallel readers in LTRS, reserving the remaining 24 processes for delta writers and system overhead. After 2 hours, `LTCO` shows 28 of 120 partitions complete and delta active on those partitions. Rows-per-second throughput in `LTCO` averages 180,000 per reader. Estimated completion: 14 hours. Midway through, one partition stalls; the team resets it in `LTCO` and it resumes immediately. The full load completes in 16 hours with no production impact — dialog process utilization on the source system remained below 50% throughout.
