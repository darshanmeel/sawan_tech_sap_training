---
term: Delta
fullName: Delta (Change Data Capture)
slug: delta
shortDefinition: "Delta represents only the rows that have changed since the last extraction. Real-time delta captures inserts/updates/deletes immediately; queue-based delta periodically batches changes. Enables streaming architectures without full table replication."
relatedTerms: [ODP, SLT, Operational Data Provisioning, ODQMON, Full Load]
sapDocUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/operational-data-provisioning.html"
seoTitle: "Delta: Change Data Capture in SAP — Plain Explanation"
seoDescription: "Delta captures only changed rows since last extraction. Real-time delta streams immediately; queue-based delta batches changes. Enables efficient incremental loading."
updatedAt: 2026-04-22
---

Delta (Change Data Capture, or CDC) represents only the rows that have changed since the last extraction. If you extracted ACDOCA yesterday and today 100 new postings arrive, delta extraction brings only those 100 rows, not the billion+ existing rows. Delta is what makes real-time extraction feasible: instead of full-loading 500GB nightly, you stream 100MB of changes every minute.

SAP offers two delta mechanisms: **(1) Real-time delta** via ODP and SLT, which captures changes immediately as they occur, pushing to Kafka or ODP queues; **(2) queue-based delta** using the ODP queue (ODQMON), which batches changes and exposes them for polling. Real-time is faster; queue-based is simpler to monitor and retry.

For enterprise extraction, delta is essential. ACDOCA full-load takes days; delta runs in minutes. The trade-off: you must track state (what was the last delta timestamp?), handle deletes (mark-as-deleted or prune?), and reconcile periodically (does the warehouse match SAP?) to catch corruption. Every walkthrough in this academy progresses from full-load (beginner) to delta streaming (expert).
