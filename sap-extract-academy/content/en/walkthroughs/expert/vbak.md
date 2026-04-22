---
table: VBAK
level: expert
slug: vbak
title: "Extract VBAK via SLT Push to Kafka (Expert)"
summary: "Enterprise-scale VBAK extraction using SAP Landscape Transformation (SLT) push replication to Apache Kafka with log compaction. Includes multi-partition strategy and Z-field handling at scale."
estimatedMinutes: 120
prerequisites:
  - "Completed VBAK Intermediate"
  - "S/4HANA system with SLT configured (RFC connection to source)"
  - "Kafka cluster (3+ brokers, min 20GB storage)"
  - "Full Use SAP License (SLT requires it)"
licenseRelevance: "SLT replication of VBAK requires Full Use SAP License. This is NOT permitted under Runtime License."
destinations:
  - Kafka
extractors:
  - SLT
steps:
  - id: step-01
    title: "Verify SLT is installed and licensed"
    explanation: "<a href='https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/SLT.html'>SAP Landscape Transformation (SLT)</a> replicates tables at the database level, capturing every insert/update/delete. Confirm license with SAP."
    sapTransaction:
      code: LTCO
      menuPath: "Administration → System → License"
      helpUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/license.html"
    verify: "Full Use License is visible and SLT is listed as an active module."

  - id: step-02
    title: "Configure SLT Kafka connector"
    explanation: "In the SLT cluster (HANA appliance or separate instance), configure the Kafka RFC destination and login credentials."
    sapTransaction:
      code: SM59
      menuPath: "RFC Connections → Create → TCP/IP"
      helpUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/SM59.html"
    verify: "Test connection returns green for the Kafka RFC destination."

  - id: step-03
    title: "Create Kafka topics for VBAK"
    explanation: "Create a compacted Kafka topic for VBAK: vbak-source-topic, replication=3, log.retention=-1, log.cleanup.policy=compact."
    codeBlock:
      language: bash
      content: |
        kafka-topics --create --topic vbak-source-topic \
          --partitions 10 \
          --replication-factor 3 \
          --config log.cleanup.policy=compact \
          --config log.retention.ms=-1
      caption: "Kafka topic creation"
    verify: "Topic vbak-source-topic exists with 10 partitions and log compaction enabled."

  - id: step-04
    title: "Configure SLT Replication Object for VBAK"
    explanation: "In LTCO, create a new replication object: source table VBAK, target Kafka topic vbak-source-topic. Include all fields, enable key-based delta (to leverage log compaction)."
    sapTransaction:
      code: LTCO
      menuPath: "Replication Objects → Create"
      helpUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/LTCO.html"
    verify: "Replication object VBAK_KAFKA is created with status ACTIVE."

  - id: step-05
    title: "Define partitioning strategy"
    explanation: "To avoid hot partitions, partition VBAK by VKORG (sales org) at the SLT level. This distributes load evenly across Kafka partitions."
    codeBlock:
      language: plaintext
      content: |
        Partition key: VKORG (Sales Organization)
        Rationale: Sales orgs are typically 10-20 distinct values, distributing rows evenly.
        Alternative: VBELN_HASH % 10 for numeric key distribution.
      caption: "Partitioning strategy"
    verify: "In LTCO, the replication object shows VKORG as partition key."

  - id: step-06
    title: "Perform initial full load via SLT"
    explanation: "Trigger a full load: SLT reads all VBAK rows and pushes to Kafka in a single batch. Depending on VBAK size, this may take hours."
    sapTransaction:
      code: LTCO
      menuPath: "Replication Objects → VBAK_KAFKA → Full Replication"
      helpUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/LTCO.html"
    verify: "Full load completes. Kafka topic vbak-source-topic has partitions filled with VBAK rows."

  - id: step-07
    title: "Enable real-time delta (CDC)"
    explanation: "After full load, SLT automatically captures deltas from the VBAK log. New/changed rows are pushed to Kafka in near-real-time (typically sub-minute latency)."
    verify: "In LTCO, monitor shows 'DELTA' status and a heartbeat/row count in LTRS."

  - id: step-08
    title: "Consume from Kafka and land in Snowflake"
    explanation: "Use Kafka Connect (Snowflake Connector) or Python Kafka consumer to read vbak-source-topic and upsert into Snowflake. Use VBELN (document number) + MANDT as the upsert key."
    codeBlock:
      language: python
      content: |
        from kafka import KafkaConsumer
        import snowflake.connector
        
        consumer = KafkaConsumer('vbak-source-topic', bootstrap_servers=['kafka:9092'])
        
        for message in consumer:
          row = json.loads(message.value)
          # INSERT or UPDATE Snowflake on (MANDT, VBELN)
      caption: "Kafka consumer for Snowflake upsert"
    verify: "Consumer runs and rows appear in Snowflake VBAK table in real-time."

  - id: step-09
    title: "Monitor SLT replication lag"
    explanation: "In LTRS, monitor the delta queue. Confirm replication lag is within your SLA (e.g., < 5 minutes)."
    sapTransaction:
      code: LTRS
      menuPath: "Monitor → Replication Status"
      helpUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/LTRS.html"
    verify: "LTRS shows green status, replication lag < SLA."

  - id: step-10
    title: "Handle multi-Z-field scenarios"
    explanation: "At scale, VBAK may have 5+ Z-fields. Confirm SLT includes all in the Kafka payload. If custom extraction is needed, use parallel SLT jobs per VKORG to avoid contention."
    verify: "VBAK records in Kafka and Snowflake include all Z-fields (verified via SELECT *)"

troubleshooting:
  - problem: "SLT replication lag exceeds SLA"
    solution: "SLT processes sequentially. Parallelize by creating separate replication objects per VKORG or company code. Scale Kafka brokers. Monitor network bandwidth."
  
  - problem: "Snowflake upsert is slow"
    solution: "Kafka Snowflake connector batches rows; adjust batch size and commit interval. Use MERGE statements instead of individual INSERTs."

nextSteps:
  - label: "Compare with ACDOCA Expert for ultra-large-scale patterns"
    url: "/walkthrough/expert/acdoca/"
  - label: "Glossary: SAP Landscape Transformation"
    url: "/glossary/slt/"

seoTitle: "Extract VBAK via SLT to Kafka (Expert) — Enterprise Scale"
seoDescription: "Expert VBAK extraction at enterprise scale using SAP Landscape Transformation (SLT) push replication to Kafka. Real-time CDC, partitioning, and multi-Z-field handling."
updatedAt: 2026-04-22
---

## Scenario

Your company's real-time analytics platform needs VBAK updates in near-real-time. SLT push replication to Kafka is the industry-standard approach: it captures every change at the database level and delivers rows to Kafka faster than any application-level extraction.

You have SLT licensed (Full Use), a Kafka cluster, and Snowflake ready. This walkthrough covers the end-to-end setup from SLT configuration to Snowflake upserts.

Estimated time: 2 hours setup + tuning.

---

## What you've built

You've built an enterprise-scale, real-time VBAK pipeline. SLT replicates changes within minutes, Kafka provides durable queueing and partitioning, and Snowflake maintains an up-to-date replica. This architecture supports analytics dashboards refreshing every few minutes and can be extended to 10+ tables using the same patterns.
