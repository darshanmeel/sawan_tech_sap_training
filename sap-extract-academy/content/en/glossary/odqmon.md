---
term: ODQMON
fullName: ODP Queue Monitor
slug: odqmon
shortDefinition: "ODQMON is the SAP transaction for monitoring ODP delta queues. Shows extraction status, delta lag, queue depth, and any errors. Essential for troubleshooting slow delta extractions or queue buildup."
relatedTerms: [ODP, Delta, Operational Data Provisioning, Extractor, SM50]
sapDocUrl: "https://help.sap.com/"
seoTitle: "ODQMON: ODP Queue Monitor in SAP — Plain Explanation"
seoDescription: "ODQMON monitors ODP delta queues, showing extraction lag, status, and errors. Essential for troubleshooting slow or stuck delta extractions."
updatedAt: 2026-04-22
---

ODQMON (ODP Queue Monitor) is the SAP transaction where you monitor the health of ODP delta queues. When you set up delta extraction for ACDOCA or BKPF, ODP maintains an internal queue of changes. ODQMON shows: which extractors have queues, how many unread changes are waiting, how long the queue is, the last extraction timestamp, and any errors (queue corrupt, consumer lag, etc.).

ODQMON is your diagnostic tool for slow delta extractions. If Python extraction is lagging (extracting only 100 rows/second when SAP is posting 10k/second), ODQMON shows the queue depth growing. If the queue is maxed at 100k unread changes and stuck, ODQMON tells you. You can manually reset queues, trigger re-extractions, or pause consumers from ODQMON.

In the expert ACDOCA walkthrough, after setting up SLT replication to Kafka, you'll monitor ODQMON to ensure delta queue depth is near zero (meaning SLT is keeping up with postings). If lag grows unbounded, you've hit a bottleneck: either SAP is posting faster than SLT can replicate, or Kafka/Snowflake is slower than expected. ODQMON is the first place to check.
