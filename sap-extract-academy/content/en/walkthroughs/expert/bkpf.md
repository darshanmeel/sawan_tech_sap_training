---
table: BKPF
level: expert
slug: bkpf
title: "Extract BKPF + BSEG at Enterprise Scale (Expert)"
summary: "SAP-side expert guide for extracting BKPF (accounting document headers) and BSEG (line items) at enterprise scale via SLT. Covers BKPF/BSEG cardinality, LTCO configuration for both tables, LTRS parallel reader setup, and ODQMON join-coherence monitoring."
estimatedMinutes: 120
prerequisites:
  - "Full Use SAP license confirmed"
  - "Technical extraction user created in SU01 (type: System) with RFC access to the SAP system"
  - "Basis team available for SLT configuration"
licenseRelevance: "SLT requires Full Use License. License trap: Runtime vs Full Use →"
destinations:
  - Generic
extractors:
  - SLT
method: slt
seoTitle: "Extract BKPF + BSEG at Scale (Expert) — SAP-Side Guide"
seoDescription: "SAP-side expert guide for enterprise BKPF and BSEG extraction via SLT. Cardinality analysis, LTCO dual-table configuration, LTRS parallelism, join-coherence verification."
steps:
  - id: step-01
    title: "Understand BKPF + BSEG cardinality in SE16N"
    explanation: 'BKPF (header, 1 row per document) joins to BSEG (line items, N rows per document). For a fiscal year partition, use <a href="https://help.sap.com/">SE16N</a> to count both tables. The BSEG/BKPF row ratio is typically 8–15×. Understanding this ratio is essential for sizing your target storage and estimating full-load time.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → BKPF → Filter BUKRS='1000' AND GJAHR=2024 → Count; repeat for BSEG"
      helpUrl: "https://help.sap.com/"
    verify: "You have row counts for both BKPF and BSEG for the same BUKRS+GJAHR partition. BSEG/BKPF ratio is documented."

  - id: step-02
    title: "Configure separate SLT replication objects for BKPF and BSEG in LTCO"
    explanation: 'In <a href="https://help.sap.com/">LTCO</a>, create two replication objects: one for BKPF (partition key BUKRS+GJAHR), one for BSEG (partition key BUKRS+GJAHR+BUZEI — adding line item for finer partitioning). Separate objects let you monitor and manage each table independently. This is important because BSEG full load will take significantly longer than BKPF.'
    sapTransaction:
      code: LTCO
      menuPath: "Replication Objects → Create → BKPF (BUKRS+GJAHR); Create → BSEG (BUKRS+GJAHR+BUZEI)"
      helpUrl: "https://help.sap.com/"
    verify: "LTCO shows two active replication objects: BKPF_REP and BSEG_REP. Partition keys are correctly configured."

  - id: step-03
    title: "Configure LTRS parallel readers for BSEG"
    explanation: 'BSEG is typically 10× larger than BKPF. Configure more parallel readers for BSEG in <a href="https://help.sap.com/">LTRS</a> to compensate. For BKPF, 2 readers is usually sufficient. For BSEG, start with 4 and increase to 8 if the full load takes longer than expected without causing SM50 saturation.'
    sapTransaction:
      code: LTRS
      menuPath: "Administration → Settings → BKPF: 2 readers; BSEG: 4 readers"
      helpUrl: "https://help.sap.com/"
    verify: "LTRS shows correct reader counts per replication object. SM50 confirms work process utilization is within safe limits."

  - id: step-04
    title: "Trigger full replication for both tables and monitor"
    explanation: 'Start both full replications from <a href="https://help.sap.com/">LTCO</a>. Monitor SM50 to ensure combined load from both replications stays safe. BKPF full load completes first; it will switch to DELTA while BSEG is still in full load. This is normal and expected — the two tables replicate independently.'
    sapTransaction:
      code: LTCO
      menuPath: "Replication Objects → BKPF_REP → Full Replication; BSEG_REP → Full Replication"
      helpUrl: "https://help.sap.com/"
    verify: "Both replication objects show RUNNING status. BKPF completes and shows DELTA; BSEG is still RUNNING. SM50 work process utilization below 80%."

  - id: step-05
    title: "Monitor join coherence — no orphan BSEG rows"
    explanation: 'After both full loads complete, verify referential integrity: every BSEG row must have a matching BKPF header. Because the two tables replicate independently, there is a window where a BSEG row exists in your target before the BKPF header arrives. For data quality checks, allow 24 hours after both full loads complete before running orphan queries — the small window closes once DELTA is stable for both tables.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → BSEG → Filter BUKRS+GJAHR → Count. Verify matches BKPF line item total."
      helpUrl: "https://help.sap.com/"
    verify: "SE16N BKPF count × average line items ≈ SE16N BSEG count for the same partition. In your target, after 24 hours: orphan BSEG rows (no matching BKPF) = 0."

troubleshooting:
  - problem: "LTRS parallel readers cause lock contention in SAP"
    solution: "Reduce reader count from 8 to 4 for BSEG. Add a 30-second delay between reader launches in LTRS configuration. This reduces the burst of parallel reads and allows other SAP processes to access BSEG without lock waits."

  - problem: "BSEG target lag is much higher than BKPF"
    solution: "BSEG is 10× larger — a higher lag during full load is expected. Once both tables are in DELTA mode, the lag should equalise. If BSEG delta lag remains high after full load completes, your target sink may be the bottleneck. Investigate target write throughput."

nextSteps:
  - label: "Study ACDOCA Expert for maximum-scale patterns"
    url: "/walkthrough/expert/acdoca/"
  - label: "License trap: Runtime vs Full Use"
    url: "/articles/runtime-vs-full-use/"
updatedAt: 2026-04-22
---

## Scenario

Your finance warehouse needs real-time GL entries (BKPF + BSEG combined). You will use SLT parallel readers and two separate replication objects to stream billions of line items with sub-minute latency.

This walkthrough focuses on the SAP-side work: cardinality analysis, LTCO dual-table configuration, LTRS tuning, and verifying join coherence between BKPF and BSEG once both full loads complete.

---

## What you have built

You have coordinated an enterprise-scale GL fact table fed by real-time SLT replication of BKPF and BSEG. The SAP-side configuration is correct, join coherence is verified, and the delta queue is stable. Finance can now run sub-minute financial close processes on current data.
