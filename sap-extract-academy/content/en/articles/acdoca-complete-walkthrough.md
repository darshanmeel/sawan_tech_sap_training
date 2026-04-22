---
title: "ACDOCA Extraction: The Complete Walkthrough from Beginner to Enterprise"
slug: acdoca-complete-walkthrough
publishDate: 2026-04-22
readingTimeMinutes: 12
author: "SAP Extract Academy"
summary: "A complete guide to extracting ACDOCA (the universal journal) from beginner to enterprise scale. Three patterns: simple ODP, multi-company parallelism, and real-time SLT replication. Choose your path based on data volume and latency requirements."
relatedWalkthroughs:
  - slug: acdoca
    level: intermediate
  - slug: acdoca
    level: expert
  - slug: bkpf
    level: expert
seoTitle: "ACDOCA Extraction: Complete Guide Beginner to Enterprise"
seoDescription: "Learn ACDOCA extraction at three levels: simple ODP, parallel extraction, enterprise SLT streaming. Choose your pattern based on data volume and latency."
updatedAt: 2026-04-22
---

ACDOCA (Accounting Entries, Contract Accounting, Investment) is the universal journal of S/4HANA. It's where every GL posting lives—every accounting entry from FI (Finance), CO (Controlling), MM (Materials), SD (Sales), HR (Payroll). For analytics, ACDOCA is the single source of truth. For data extraction, it's the most challenging table in SAP.

This article guides you through three extraction patterns, from beginner (simple, one company/year) to expert (billions of rows, real-time streaming). You'll understand the trade-offs and choose the pattern that fits your business.

## Pattern 1: Beginner – One Company, One Year via ODP

**When to use this pattern**: You need GL data for a single company and fiscal year (e.g., year-end close for one operating company), volumes are under 500M rows, and you can tolerate a one-time 2-4 hour extraction window.

**Architecture**:
```
SAP S/4HANA (ACDOCA)
        ↓
   ODP Provider
        ↓
  Python/pyrfc
        ↓
  Snowflake
```

**Steps**:

1. **Connect via Python/pyrfc** to your SAP system
2. **Call RFC_ODP_READ** with filter: `RBUKRS='1000' AND RYEAR=2024`
3. **Stream in batches** of 100k rows to avoid memory exhaustion in Python
4. **Upsert to Snowflake** as data arrives
5. **Reconcile** GL totals (sum of GL_ACDOCA_RAW in Snowflake = sum in SAP)

**Pros**:
- Simple, 50 lines of Python
- No licensing issues (ODP is permitted on Runtime License)
- Fast initial setup (< 1 day)
- Built on standard tools (pyrfc, Snowflake)

**Cons**:
- Non-real-time (extraction is one-time, manually triggered)
- Doesn't scale to billions of rows without code change
- No parallelism (single extraction thread)

**Example Code**:
```python
import pyrfc
import snowflake.connector

conn = pyrfc.Client(...)  # RFC connection to SAP

# Fetch ACDOCA for company 1000, year 2024, in batches
filter_str = "(RBUKRS='1000' AND RYEAR=2024)"
result = conn.call('RFC_ODP_READ', 
                   PROVIDER='I_JournalEntryItem',
                   FILTER=filter_str, 
                   ROWCOUNT=100000)

# Connect to Snowflake
snow_conn = snowflake.connector.connect(...)
cursor = snow_conn.cursor()

# Stream and upsert
for row_batch in result:
    cursor.executemany(
        "INSERT INTO GL_ACDOCA_RAW (...) VALUES (...)",
        row_batch
    )
    snow_conn.commit()
```

**When it breaks**: If RBUKRS='1000' AND RYEAR=2024 contains 500M+ rows, you hit memory exhaustion. Move to Pattern 2.

## Pattern 2: Intermediate – Multi-Company Parallel via ODP

**When to use this pattern**: You need 2-5 years of data across 5-20 company codes, volumes are 500M to 5B rows, you want reasonably fast extraction (4-12 hours), and you can use Python with ThreadPoolExecutor.

**Architecture**:
```
SAP S/4HANA (ACDOCA)
        ↓
   ODP Provider
        ↓
  Python ThreadPoolExecutor (4 parallel threads)
        ↓
  Snowflake (partitioned by GJAHR, BUKRS)
```

**Key insight**: Extract each (BUKRS, GJAHR) partition independently in parallel. A 4-thread executor runs 4 partitions concurrently, cutting total time by 4x.

**Steps**:

1. **Define partitions**: Generate a matrix of (BUKRS, GJAHR) pairs
   ```python
   years = [2022, 2023, 2024]
   companies = [1000, 1001, 2000, 2100, 2200]
   partitions = [(bukrs, year) for year in years for bukrs in companies]
   # Result: 15 partitions
   ```

2. **Launch parallel extractions**: Use ThreadPoolExecutor to run 4 concurrent RFC connections
   ```python
   from concurrent.futures import ThreadPoolExecutor
   
   with ThreadPoolExecutor(max_workers=4) as executor:
       futures = [executor.submit(extract_partition, bukrs, year) 
                  for bukrs, year in partitions]
       for future in futures:
           future.result()  # Wait for all to complete
   ```

3. **Extract partition function**:
   ```python
   def extract_partition(bukrs, year):
       conn = pyrfc.Client(...)  # New RFC connection per thread
       filter_str = f"(RBUKRS='{bukrs}' AND RYEAR={year})"
       result = conn.call('RFC_ODP_READ',
                          PROVIDER='I_JournalEntryItem',
                          FILTER=filter_str,
                          ROWCOUNT=100000)
       
       snow_conn = snowflake.connector.connect(...)
       cursor = snow_conn.cursor()
       
       for row_batch in result:
           cursor.executemany("INSERT INTO GL_ACDOCA_RAW (...) VALUES (...)",
                             row_batch)
       snow_conn.commit()
   ```

4. **Reconcile by partition**: For each (BUKRS, GJAHR), verify totals match SAP

**Pros**:
- 4-8x speedup via parallelism
- Handles up to 5B rows (15 partitions × 333M rows each)
- No licensing issues (ODP + Python is Runtime-safe)
- Fault-tolerant (if partition fails, others continue; retry failed partition)
- Moderately complex (150-200 lines of Python)

**Cons**:
- Manual partition definition (if companies/years change, code updates required)
- Still non-real-time (one-time extraction, then manual delta polling)
- Limits to 4 parallel threads (more threads risk SAP connection pool exhaustion or dialog user blocking)

**Data Model in Snowflake**:
```sql
CREATE TABLE GL_ACDOCA_RAW (
    MANDT CHAR(3),
    RBUKRS CHAR(4),  -- partition column 1
    RYEAR CHAR(4),   -- partition column 2
    POPER CHAR(3),
    BELNR CHAR(10),
    ... GL fields ...
)
PARTITION BY (RYEAR, RBUKRS);
```

**When it breaks**: If you need real-time GL updates (posting visible in Snowflake within minutes), or if volumes exceed 5B rows, move to Pattern 3.

## Pattern 3: Expert – Enterprise SLT Real-Time Streaming

**When to use this pattern**: You need real-time GL data (< 5 min lag), volumes are 5B+ rows, you have a Full Use license and SLT installed, and you need sub-minute accounting close.

**Architecture**:
```
SAP S/4HANA (ACDOCA)
           ↓
      SLT + LTRS
   (Parallel readers)
           ↓
  Kafka (30 partitions)
  [Log compaction enabled]
           ↓
Snowflake Kafka Connector
           ↓
Snowflake GL_ACDOCA_RAW
```

**Key differences from Pattern 2**:
- **Full-load via SLT** (not ODP): SLT is built for billions of rows; ODP is not
- **Parallel readers (LTRS)**: 4-8 parallel readers, each handling one partition, running simultaneously
- **Kafka as buffer**: SLT pushes to Kafka; Kafka buffers with log compaction; Snowflake connector polls Kafka
- **Real-time delta**: After full-load completes, SLT automatically switches to delta (only changes flow), with near-zero latency

**Prerequisites**:
- Full Use license (SLT requires this)
- Kafka cluster (10+ brokers, 500GB+ storage, log compaction enabled)
- SLT installed and configured
- SM59 RFC destinations for Kafka cluster

**Steps**:

1. **Check license** (SLICENSE transaction)
   - Verify "SLT Landscape Transformation" = Active, Type = Full Use

2. **Configure SLT replication object** (LTRC transaction)
   ```
   Replication Object Name: ACDOCA_KAFKA
   Source Table: ACDOCA
   Partitioning Strategy: BUKRS + GJAHR (critical!)
   Destination: Kafka topic acdoca-source
   Replication Mode: Full + Delta
   ```

3. **Create Kafka topic** with correct settings
   ```bash
   kafka-topics --create --topic acdoca-source \
     --partitions 30 \
     --replication-factor 3 \
     --config log.cleanup.policy=compact \
     --config log.segment.bytes=1073741824
   ```

4. **Configure LTRS parallel readers** (LTRS transaction)
   ```
   Number of Parallel Readers: 4-8
   Reader Timeout: 60 minutes
   Delay Between Reader Launches: 30 seconds
   ```

5. **Trigger full replication** (LTCO transaction)
   - Click "Full Replication" button
   - Monitor via LTCO status screen
   - Full-load runs 24-72 hours depending on volume

6. **Create Snowflake Kafka Connector** to consume from Kafka
   ```json
   {
     "name": "snowflake-acdoca-sink",
     "config": {
       "connector.class": "com.snowflake.kafka.connector.SnowflakeSinkConnector",
       "topics": "acdoca-source",
       "snowflake.database.name": "FINANCE",
       "snowflake.schema.name": "GL",
       "snowflake.user.name": "KAFKA_USER",
       "key.converter": "org.apache.kafka.connect.storage.StringConverter",
       "value.converter": "org.apache.kafka.connect.json.JsonConverter",
       "buffer.count.records": 10000,
       "buffer.flush.time": 30
     }
   }
   ```

7. **Monitor replication**
   - LTCO: shows replication status (% complete, rows/sec)
   - ODQMON: shows delta queue depth (should be near zero after full-load)
   - Snowflake: watch GL_ACDOCA_RAW row count grow in real-time

8. **Reconcile post-load**
   ```sql
   -- In Snowflake
   SELECT RBUKRS, RYEAR, SUM(AMOUNT_DEBIT), SUM(AMOUNT_CREDIT)
   FROM GL_ACDOCA_RAW
   GROUP BY RBUKRS, RYEAR
   -- Compare with SAP via FM_GET_GL_TOTAL RFC or manual SE16N verification
   ```

**Pros**:
- Real-time GL data (delta lag < 5 min)
- Scales to 10B+ rows (SLT + LTRS + parallelism handle any volume)
- Sub-minute accounting close (no wait for batch extraction)
- Automatic delta after full-load (no manual polling required)
- Kafka as integration hub (other systems can subscribe to GL changes)

**Cons**:
- Most expensive: Full Use license ($500k-$2M/year) + SLT licensing + Kafka infrastructure
- Complex setup: 5+ SAP transactions, Kafka cluster management, Snowflake Kafka connector
- Requires SLT expertise (SLT configuration, partitioning strategy, LTRS tuning)
- Support complexity: if lag grows, is it SAP bottleneck, Kafka bottleneck, or Snowflake bottleneck?

**Monitoring checklist**:
- LTCO replication status (full-load % complete, delta status)
- ODQMON delta queue depth (target: < 1000 unread entries)
- Kafka consumer lag (target: < 30 sec)
- Snowflake query performance (GL analytics should complete in < 30 sec)
- SM50 dialog process utilization (target: < 80%, don't starve finance users)

## Comparison: Which Pattern for You?

| Metric | Pattern 1 | Pattern 2 | Pattern 3 |
|--------|-----------|-----------|-----------|
| **Data Volume** | < 500M rows | 500M–5B rows | 5B+ rows |
| **Latency** | One-time, manual | One-time or 2hr polling | Real-time (< 5 min) |
| **Extraction Time** | 2–4 hours | 4–12 hours | 24–72 hours (for initial), then < 5 min deltas |
| **Setup Complexity** | Simple (50 LOC Python) | Moderate (200 LOC Python) | Complex (5 SAP transactions, Kafka cluster) |
| **Licensing** | Runtime OK | Runtime OK | Full Use required |
| **Cost** | Low (Python dev time) | Low (Python dev time) | High (licenses + Kafka + operations) |
| **Parallelism** | Single-threaded | 4 threads | 4–8 parallel readers |
| **Recommended For** | Single company/year, finance analysts | Multi-year close, data warehouse staging | Enterprise GL, real-time analytics, sub-minute close |

## Real-World Progression

Most enterprises follow this path:

1. **Year 1**: Implement Pattern 1 (simple ODP). Finance gets month-end GL close in 4 hours via Snowflake.
2. **Year 2**: Users ask for 3 years of GL data for analytics. Pattern 1 times out. Upgrade to Pattern 2 (parallel ODP). Extract 3 years in 8 hours.
3. **Year 3**: CFO demands real-time GL for sub-minute close. Finance users want live GL during posting. Pattern 2 doesn't support real-time. Invest in Full Use license and SLT. Implement Pattern 3. GL is now real-time.

Each upgrade requires investment (development time, licensing, infrastructure), but each solves a real business problem at that point in time.

## Key Takeaways

1. **Partition always** (BUKRS + GJAHR minimum). Never SELECT * from ACDOCA.
2. **Use released CDS views** (I_JournalEntryItem), not raw ACDOCA tables.
3. **ODP scales to 5B rows** with proper partitioning and parallelism. SLT scales beyond.
4. **Real-time extraction requires SLT** (and a Full Use license). ODP is batch/polling, not real-time.
5. **Start simple** (Pattern 1), then upgrade architecture as business needs grow.

The three patterns are not rigid; they're a ladder. Climb at your pace, understanding the trade-offs at each rung. Master ACDOCA extraction, and you can extract any SAP table.
