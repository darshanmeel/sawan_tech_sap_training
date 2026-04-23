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

### What is ODQMON?

**ODQMON** is the SAP transaction code for the **ODP Queue Monitor**, the central operational console for inspecting and managing ODP (Operational Data Provisioning) delta queues. When any extraction tool — Python via `pyrfc`, Azure Data Factory, Fivetran, or SLT — registers a delta subscription against an ODP provider, SAP creates a persistent queue that tracks which data changes have been captured and which have been delivered to the consumer. ODQMON gives you a real-time view into every active queue: which providers have subscribers, how many unread change records are queued, when the last successful extraction completed, and whether any errors have interrupted delivery.

ODQMON is accessible to Basis administrators and data engineers who have been granted the appropriate S/4HANA authorisation object. It is the first tool you open when a delta extraction falls behind, stops delivering data, or behaves unexpectedly. Understanding ODQMON is non-negotiable for anyone operating a production ODP delta pipeline.

### How it works

The ODQMON screen is organised hierarchically. At the top level you see **providers** — the tables or CDS views that have been configured as ODP sources. Expanding a provider shows its **subscriptions**: one entry per extraction tool or pipeline that has registered against that provider. Each subscription row displays the subscription name (set by the consuming tool), the current **queue depth** (number of unread change records waiting to be fetched), the **last read timestamp**, and the **status** (active, paused, or in error).

Inside a subscription, you can drill into individual **data packets** — the batches of change records that ODP has queued since the last extraction. Each packet has a sequence number, a creation timestamp, and a size in rows. This granularity lets you pinpoint exactly when a queue started building up and how fast it is growing relative to how fast your consumer is reading. ODQMON also exposes management actions: you can **reset a subscription** (delete the watermark and force a re-extraction from scratch), **delete a subscription** (remove the queue entirely — use with caution), or **manually unlock** a queue that is stuck in a locked state due to a failed extraction run.

The underlying queue data is stored in SAP database tables in the `ODQ*` namespace (for example, `ODQDATA`, `ODQMON`, `ODQSUBSCR`). Basis teams sometimes monitor the size of these tables directly via `SE16N` when investigating database growth caused by accumulated queue data.

### Why it matters for data extraction

In a delta extraction architecture, queue depth is your primary health metric. If your pipeline is healthy, queue depth should hover near zero between scheduled extraction windows — SAP posts changes, ODP queues them, and your extractor reads and clears them within minutes. If queue depth is growing monotonically across multiple extraction cycles, you have a **lag problem**: SAP is posting data faster than your consumer can read and acknowledge it. ODQMON quantifies this gap precisely, letting you distinguish between a slow consumer (your pipeline's throughput is insufficient) and a blocked consumer (the extraction is failing and not advancing the watermark at all).

ODQMON is also essential for **subscription hygiene**. Commercial tools and ad-hoc Python scripts often create new subscriptions without cleaning up old ones. Over weeks this accumulates hundreds of zombie subscriptions, each holding a copy of queued data that will never be read. This wastes HANA database space and can slow down ODP queue writes. A regular review of ODQMON — deleting any subscription that has been inactive for more than a defined retention period — is part of ongoing pipeline operations.

For SLT-based pipelines, ODQMON is the complement to `LTRC`. SLT writes its replicated changes into ODP delta queues, which downstream consumers (Kafka connectors, BW extractors) then read via ODP. Monitoring ODQMON ensures that the full chain — from SLT capture to ODP queue to consumer delivery — is flowing without bottlenecks at the queue layer.

### Common pitfalls

A common mistake is resetting a subscription without understanding the downstream impact. When you reset a subscription in ODQMON, the watermark is deleted and ODP will re-deliver all historical data from the beginning on the next extraction run. If your consumer pipeline performs upserts, this is recoverable but wastes time and resources. If it performs appends, you will get duplicate records in the target. Always coordinate subscription resets with your pipeline team and verify that the consumer handles re-delivery correctly.

Another pitfall is ignoring the **error status** column. ODQMON will flag a subscription with a red error status when an extraction failed partway through. Until the error is acknowledged and the queue is unlocked, subsequent extraction attempts may silently do nothing. Developers who do not check ODQMON will see zero rows returned from `RFC_ODP_READ` delta calls and incorrectly conclude that no data has changed, when in fact the queue is locked and full of unread changes.

### In practice

In the expert ACDOCA walkthrough, after configuring SLT to replicate journal entries to Kafka in real time, you open ODQMON and navigate to the `I_JournalEntryItem` provider subscription. During the business day you should see queue depth stay below a few thousand rows at peak posting times, clearing to near zero within the extraction polling interval. If queue depth reaches 500,000 and is still climbing, the bottleneck is either the Kafka connector throughput or a network issue between the ODP consumer host and the SAP system. ODQMON tells you the queue is the symptom; `SM50` (work process monitor) and network traces tell you the cause.
