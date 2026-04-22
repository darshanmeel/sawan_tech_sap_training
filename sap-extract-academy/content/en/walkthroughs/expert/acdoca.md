---
table: ACDOCA
level: expert
slug: acdoca
title: "Extract ACDOCA Enterprise Scale (Expert)"
summary: "Full-enterprise ACDOCA extraction: multiple companies, multiple years, billions of rows. SLT push replication to Kafka with log compaction. Partitioning by BUKRS + GJAHR. The ultimate SAP extraction challenge and this site's flagship walkthrough."
estimatedMinutes: 150
prerequisites:
  - "Completed ACDOCA Intermediate"
  - "Completed BKPF Expert"
  - "SLT licensed and configured (Full Use)"
  - "Kafka cluster (10+ brokers, 500GB+ storage)"
licenseRelevance: "MANDATORY: Full Use SAP License. SLT replication is NOT permitted under Runtime License. Verify licensing with SAP before proceeding."
destinations:
  - Kafka
extractors:
  - SLT
steps:
  - id: step-01
    title: "License check: Full Use or fail fast"
    explanation: "SLT replication of ACDOCA requires Full Use License. Runtime Licenses are rejected by SAP. Check your license certificate in SLICENSE before proceeding. This is non-negotiable."
    sapTransaction:
      code: SLICENSE
      menuPath: "License → License Overview → Check SLT entry"
      helpUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/license.html"
    verify: "License shows 'SLT Landscape Transformation' = Active, Type = Full Use"
    whyItMatters: "Proceeding without correct license will result in licensing violations and potential audit findings. SAP audits SLT usage rigorously."
  
  - id: step-02
    title: "Right-size Kafka infrastructure"
    explanation: "ACDOCA can be 500B+ rows annually. Kafka cluster needs adequate disk space, replication factor 3, and log compaction enabled. Budget 10+ brokers, 500GB minimum."
    codeBlock:
      language: bash
      content: |
        kafka-topics --create --topic acdoca-source \
          --partitions 30 \
          --replication-factor 3 \
          --config log.cleanup.policy=compact \
          --config log.segment.bytes=1073741824
      caption: "Large Kafka topic for ACDOCA"
    verify: "Topic acdoca-source exists with 30 partitions."
  
  - id: step-03
    title: "Configure SLT to partition by BUKRS + GJAHR"
    explanation: "In LTCO, define replication object for ACDOCA with partitioning: BUKRS + GJAHR. This avoids hot partitions and enables parallel SLT readers."
    sapTransaction:
      code: LTCO
      menuPath: "Replication Objects → ACDOCA → Partitioning"
      helpUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/LTCO.html"
    verify: "LTCO shows ACDOCA_KAFKA replication object with partition key BUKRS+GJAHR."
  
  - id: step-04
    title: "Enable LTRS parallel readers (4-8 readers)"
    explanation: "SLT's Landscape Transformation Replication Server (LTRS) can run 4-8 parallel database readers. Each reader processes a company code + fiscal year partition independently."
    sapTransaction:
      code: LTRS
      menuPath: "Administration → Settings → Parallel Readers"
      helpUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/LTRS.html"
    verify: "LTRS shows 4 reader processes active and running."
  
  - id: step-05
    title: "Monitor SAP load during full replication"
    explanation: "ACDOCA full replication will stress SAP for days. Monitor CPU, memory, lock wait times via SM50. Coordinate with SAP Basis to ensure no conflicts with batch jobs."
    sapTransaction:
      code: SM50
      menuPath: "Monitor → Active Sessions"
      helpUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/SM50.html"
    verify: "SM50 shows SLT processes (wp_SLT*) running, CPU usage acceptable (< 80%)."
  
  - id: step-06
    title: "Trigger full load"
    explanation: "In LTCO, trigger full replication. This will run for 24-72 hours depending on ACDOCA size. Kafka topic will fill with billions of rows."
    sapTransaction:
      code: LTCO
      menuPath: "Replication Objects → ACDOCA_KAFKA → Full Replication"
      helpUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/LTCO.html"
    verify: "Replication status = 'RUNNING'. Monitor Kafka topic growth via kafka-log-dirs tool."
  
  - id: step-07
    title: "Switch to real-time delta"
    explanation: "Once full load completes, SLT automatically captures delta. Real-time posting updates flow to Kafka within seconds."
    verify: "LTCO status = 'DELTA'. LTRS shows delta queue depth (should be near zero if no backlog)."
  
  - id: step-08
    title: "Consume from Kafka with Snowflake Connector"
    explanation: "Snowflake Kafka Connector reads acdoca-source topic, applies Z-field transformations (CUKY pairing for currencies), upserts into Snowflake GL_ACDOCA_RAW."
    codeBlock:
      language: json
      content: |
        {
          "name": "snowflake-acdoca-sink",
          "config": {
            "connector.class": "com.snowflake.kafka.connector.SnowflakeSinkConnector",
            "topics": "acdoca-source",
            "snowflake.database.name": "FINANCE",
            "snowflake.schema.name": "GL",
            "snowflake.user.name": "KAFKA_USER",
            "key.converter": "org.apache.kafka.connect.storage.StringConverter",
            "value.converter": "org.apache.kafka.connect.json.JsonConverter"
          }
        }
      caption: "Snowflake Kafka Connector config"
    verify: "Connector status = RUNNING. Snowflake GL_ACDOCA_RAW table grows."
  
  - id: step-09
    title: "Reconcile amounts and cardinality"
    explanation: "Compare aggregate amounts in ACDOCA (SAP) vs GL_ACDOCA_RAW (Snowflake) for each company + year. Cardinality should match exactly. Monitor for 24 hours to ensure delta is stable."
    codeBlock:
      language: sql
      content: |
        SELECT RBUKRS, RYEAR, SUM(AMOUNT_DEBIT), SUM(AMOUNT_CREDIT)
        FROM GL_ACDOCA_RAW
        GROUP BY RBUKRS, RYEAR
        -- Cross-check with SE16N ACDOCA query results
      caption: "Reconciliation query"
    verify: "Totals match exactly. No orphan or duplicate rows."

  - id: step-10
    title: "Document Z-field transformations"
    explanation: "ACDOCA contains CUKY (currency key) and related amount fields (AMOUNT_TRANS in transaction currency vs AMOUNT_LOCAL in local currency). Document the transformation logic in your data dictionary."
    verify: "Data dictionary includes: ACDOCA.AMOUNT_TRANS → GL_ACDOCA_RAW.AMOUNT_TXN_CURRENCY, with conversion rules."

troubleshooting:
  - problem: "SLT replication crashes after 12 hours (memory error in SAP)"
    solution: "Reduce parallel reader count from 8 to 4. Restart full load. This may extend duration but increases stability."
  
  - problem: "Kafka topic lag grows unbounded (Snowflake connector can't keep up)"
    solution: "ACDOCA is faster than Snowflake can ingest. Scale Snowflake compute (increase warehouse size) or add a second consumer instance."
  
  - problem: "License violation notice from SAP"
    solution: "You proceeded without Full Use License. Contact SAP immediately. Undo SLT configuration or purchase Full Use License upgrade."

nextSteps:
  - label: "Glossary: SAP Landscape Transformation"
    url: "/glossary/slt/"
  - label: "Glossary: Operational Data Provisioning"
    url: "/glossary/odp/"
  - label: "Article: Why Reading ACDOCA Directly Breaks Your SAP System"
    url: "/articles/why-acdoca-breaks-sap/"

seoTitle: "Extract ACDOCA Enterprise Scale — Expert S/4HANA Walkthrough"
seoDescription: "Expert-level ACDOCA extraction: billions of rows, enterprise scale, SLT push replication to Kafka, full-use licensing, cardinality reconciliation. The flagship SAP extraction challenge."
updatedAt: 2026-04-22
---

## Scenario

You are the data architect for a multi-billion-dollar enterprise. The CFO needs real-time GL data in the data warehouse: every posting visible within minutes, all historical ACDOCA (decades of data), correct currency handling, and airtight reconciliation to SAP's GL.

This is the ultimate SAP extraction challenge. You have:
- A properly-licensed S/4HANA system (Full Use)
- A Kafka cluster ready for streaming data
- Snowflake warehouse ready for analytics
- 2-3 days to build the pipeline
- Zero tolerance for errors (finance data)

This walkthrough is the culmination of everything you've learned.

---

## What you've built

You have built an enterprise-scale, real-time GL pipeline that streams billions of accounting entries from SAP to your data lake. Every posting from every company in every fiscal year is available in Snowflake within minutes.

ACDOCA at scale is the hardest extraction problem in SAP. You've solved it using the industry-standard approach: SLT partitioning, LTRS parallelism, Kafka queueing, and Snowflake upserts.

The patterns here — partitioning, parallel readers, cardinality reconciliation, Z-field transformations — apply to every large table. BKPF, EKPO, VBRK, LIPS, MSKU — they all follow the same architecture.

You are now ready to extract any SAP table at any scale.

---

## Post-Extraction

Once this pipeline is live, your work shifts to operational excellence:

1. **Monitoring** — Dashboard for replication lag, Kafka topic growth, Snowflake ingestion rate
2. **Alerting** — Slack notifications if lag > 5 min, Kafka space < 50GB free
3. **Reconciliation** — Daily GL reconciliation job comparing SAP aggregates to Snowflake
4. **Documentation** — Runbook for on-call support (how to restart SLT, troubleshoot lag, etc.)
5. **Performance tuning** — Once stable, optimize Snowflake materialized views for BI queries

Good luck. You've earned it.
