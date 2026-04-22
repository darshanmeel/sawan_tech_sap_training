---
table: BKPF
level: expert
slug: bkpf
title: "Extract BKPF + BSEG at Scale (Expert)"
summary: "Enterprise accounting extraction: BKPF (header) + BSEG (line items) joined. SLT with LTRS parallel reads by company code and fiscal year. Handles billions of rows."
estimatedMinutes: 120
prerequisites:
  - "Completed BKPF Intermediate"
  - "Understanding of BSEG (accounting line items)"
  - "Full Use SAP License"
licenseRelevance: "SLT requires Full Use License."
destinations:
  - Kafka
extractors:
  - SLT
steps:
  - id: step-01
    title: "Understand BKPF + BSEG cardinality"
    explanation: "BKPF (header, 1 row per document) joins to BSEG (line items, N rows per document). BSEG is typically 5-20x larger than BKPF."
    verify: "In SE16N, count BKPF vs BSEG for a fiscal year. BSEG/BKPF ratio is typically 8-15."
  
  - id: step-02
    title: "Configure SLT for parallel BKPF + BSEG replication"
    explanation: "In LTCO, create separate replication objects for BKPF and BSEG. For BSEG, partition by BUKRS + GJAHR at the SLT level to avoid hot partitions in Kafka."
    verify: "LTCO shows 2 active replication objects: BKPF_SLT and BSEG_SLT."
  
  - id: step-03
    title: "Use LTRS for parallel reads"
    explanation: "SLT's LTRS (Landscape Transformation Replication Server) can parallelize BSEG extraction by BUKRS + GJAHR. Configure 4-8 parallel readers."
    verify: "LTRS monitor shows multiple reader processes running."
  
  - id: step-04
    title: "Create Kafka topics with correct partitioning"
    explanation: "bkpf-topic: 10 partitions, partition key BUKRS+GJAHR. bseg-topic: 50 partitions, partition key BUKRS+GJAHR+BUZEI (line item number)."
    verify: "Topics exist with correct partition counts."
  
  - id: step-05
    title: "Perform full load and enable real-time delta"
    explanation: "SLT bulk-loads all data to Kafka, then switches to streaming delta."
    verify: "Kafka topics are populated and show active producers."
  
  - id: step-06
    title: "Consume and join in Snowflake"
    explanation: "Kafka consumer (Snowflake Connector or Python) reads both topics, joins BKPF to BSEG on MANDT+BUKRS+GJAHR+BELNR, upserts into SNOWFLAKE.ACCOUNTING.GL_ENTRIES."
    verify: "GL_ENTRIES table has rows with headers joined to line items."
  
  - id: step-07
    title: "Monitor join lag and cardinality"
    explanation: "Confirm no orphan line items (BSEG rows without BKPF headers). Lag should be < 5 minutes."
    verify: "SELECT COUNT(*) FROM BSEG b WHERE NOT EXISTS (SELECT 1 FROM BKPF k WHERE k.BELNR = b.BELNR) returns 0."

troubleshooting:
  - problem: "LTRS parallel readers cause lock contention in SAP"
    solution: "Reduce parallel reader count from 8 to 4. Add delay between reader launches."
  
  - problem: "Kafka BSEG topic has much higher lag than BKPF"
    solution: "BSEG is 10x larger. Increase partition count or add consumer instances."

nextSteps:
  - label: "Study ACDOCA Expert for ultra-scale patterns"
    url: "/walkthrough/expert/acdoca/"

seoTitle: "Extract BKPF + BSEG at Scale (Expert) — SLT & Kafka"
seoDescription: "Expert-level accounting extraction: BKPF headers + BSEG line items via SLT with LTRS parallelism. Kafka streaming and Snowflake joins at enterprise scale."
updatedAt: 2026-04-22
---

## Scenario

Your finance warehouse needs real-time GL entries (BKPF + BSEG combined). You'll use SLT's parallel readers and Kafka to stream billions of line items with sub-minute latency.

---

## What you've built

You've built an enterprise-scale GL fact table fed by real-time SLT replication. Finance can now run sub-minute financial close processes on current data.
