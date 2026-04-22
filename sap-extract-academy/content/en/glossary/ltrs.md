---
term: LTRS
fullName: SLT Landscape Transformation Replication Server
slug: ltrs
shortDefinition: "LTRS is the SAP component that runs parallel reader processes for SLT replication. You configure LTRS to run 4-8 parallel readers, each handling a partition (e.g., one company code + fiscal year), dramatically accelerating full-load times."
relatedTerms: [SLT, LTRC, Parallel Readers, Replication Server, Dialog Work Process]
sapDocUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/LTRS.html"
seoTitle: "LTRS: SLT Parallel Replication Server — Plain Explanation"
seoDescription: "LTRS enables parallel reader processes for SLT replication. Configure 4-8 parallel readers to dramatically accelerate full-load extraction of large tables."
updatedAt: 2026-04-22
---

LTRS (Landscape Transformation Replication Server) is the execution engine for SLT replication, responsible for running parallel reader processes. When you configure SLT to extract ACDOCA with BUKRS+GJAHR partitioning, LTRS spawns 4-8 parallel reader processes, each pulling a different partition independently. If you have 10 companies and 3 fiscal years (30 partitions), and LTRS runs 4 readers in parallel, the full load completes ~8x faster than sequential reads.

Parallel readers are SAP work processes (similar to dialog work processes, but dedicated to SLT). Each reader scans a partition, applies filters, and pushes data to Kafka. The trade-off: more readers = faster load, but higher CPU/memory/lock contention on SAP. If you set LTRS to 8 parallel readers and the system bogs down (dialog users complain), you reduce to 4 and add delays between reader launches.

LTRS monitoring shows active reader processes, data throughput (rows/second), and any hangs or errors. In SM50, you'll see multiple wp_SLT_* processes running. The expert walkthrough teaches you to tune LTRS parallelism and monitor load impact. For a 500B row ACDOCA extraction, proper LTRS configuration can mean the difference between a 72-hour load (sequential) and a 12-hour load (8 parallel readers).
