---
table: ACDOCA
level: expert
slug: acdoca
title: "Extract ACDOCA Enterprise Scale (Expert)"
summary: "SAP-side expert guide for enterprise-scale ACDOCA extraction via SLT. Covers license verification in SLICENSE, SLT replication object configuration in LTCO, parallel reader setup in LTRS, SM50 load monitoring, and ODQMON delta reconciliation. Full Use license is mandatory."
estimatedMinutes: 150
prerequisites:
  - "Full Use SAP license confirmed in writing with SAP licensing contact"
  - "Basis team available for SLT configuration"
  - "Technical extraction user created in SU01 (type: System) with RFC access to the SAP system"
licenseRelevance: "MANDATORY: Full Use SAP License. SLT replication is NOT permitted under Runtime License. Verify licensing with SAP before proceeding. License trap: Runtime vs Full Use →"
destinations:
  - Generic
extractors:
  - SLT
method: slt
seoTitle: "Extract ACDOCA Enterprise Scale — SAP-Side Expert Guide"
seoDescription: "SAP-side expert guide for ACDOCA enterprise extraction via SLT. SLICENSE check, LTCO configuration, LTRS parallel readers, SM50 monitoring, ODQMON delta reconciliation."
steps:
  - id: step-01
    title: "License check — verify Full Use in SLICENSE"
    explanation: 'SLT replication of ACDOCA requires Full Use License. SAP does not enforce this at the technical level — the transaction will run regardless. But an audit will detect it and the consequences are severe. Open <a href="https://help.sap.com/">SLICENSE</a> and verify that "SLT Landscape Transformation" is listed as Active, Type = Full Use. Get this confirmed in writing from your SAP licensing contact before proceeding.'
    sapTransaction:
      code: SLICENSE
      menuPath: "License → License Overview → Check SLT entry"
      helpUrl: "https://help.sap.com/"
    verify: "SLICENSE shows SLT Landscape Transformation = Active, Type = Full Use. Written confirmation from SAP licensing exists."
    whyItMatters: "Proceeding without confirmed Full Use license results in licensing violations and potential audit findings with retroactive costs. SAP audits SLT usage. Do not rely on the transaction running as proof of license compliance."

  - id: step-02
    title: "Confirm ACDOCA partition sizes before configuring SLT"
    explanation: 'Before configuring SLT, use <a href="https://help.sap.com/">SE16N</a> to count ACDOCA rows per company code (RBUKRS) and fiscal year (RYEAR). This determines how many SLT parallel readers you need and how long the full load will take. At 4 parallel readers, a 2B-row ACDOCA typically takes 48–72 hours for the initial full load.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → ACDOCA → Filter each RBUKRS and RYEAR combination"
      helpUrl: "https://help.sap.com/"
    verify: "You have a per-(RBUKRS, RYEAR) row count. Total row count and number of distinct company code + fiscal year combinations are documented."

  - id: step-03
    title: "Configure SLT replication object in LTCO"
    explanation: 'In <a href="https://help.sap.com/">LTCO</a>, create a replication object for ACDOCA. Set the partitioning key to RBUKRS + RYEAR — this is mandatory for ACDOCA at scale. Without partitioning, SLT readers will attempt to read the entire table in a single pass and cause memory errors. Your Basis team owns the LTCO configuration; your role is to specify the correct partition key and confirm the replication object is set up correctly.'
    sapTransaction:
      code: LTCO
      menuPath: "Replication Objects → Create → Source Table: ACDOCA → Partition Key: RBUKRS+RYEAR"
      helpUrl: "https://help.sap.com/"
    verify: "LTCO shows an ACDOCA replication object with partition key RBUKRS+RYEAR. Your Basis team confirms the SLT cluster is connected and the replication object is in a ready state."

  - id: step-04
    title: "Configure LTRS parallel readers (4–8 readers)"
    explanation: 'In <a href="https://help.sap.com/">LTRS</a>, configure the number of parallel readers. Each reader handles one partition independently. For ACDOCA, 4 readers is the minimum recommended; 8 is the maximum before diminishing returns (and risk of exhausting SAP work processes). Coordinate with Basis on the appropriate value for your system size. [NEEDS_SAP_CITATION — confirm recommended LTRS reader counts for large tables]'
    sapTransaction:
      code: LTRS
      menuPath: "Administration → Settings → Parallel Readers → Set to 4"
      helpUrl: "https://help.sap.com/"
    verify: "LTRS shows 4 reader processes configured. Basis team confirms the SLT cluster has enough resources to run 4 readers without starving productive users."

  - id: step-05
    title: "Monitor SAP system load during full replication (SM50)"
    explanation: 'ACDOCA full replication runs for 48–72 hours and stresses SAP. Monitor <a href="https://help.sap.com/">SM50</a> throughout. SLT processes appear as wp_SLT* or background work processes. Total work process utilization must stay below 80% to avoid impacting finance posting users. Coordinate the full-load timing with your finance team — start during a low-activity window.'
    sapTransaction:
      code: SM50
      menuPath: "Work Process Overview → Filter SLT processes"
      helpUrl: "https://help.sap.com/"
    verify: "SM50 shows SLT processes active during replication. Total work process utilization is below 80%. Finance users are not reporting posting failures."

  - id: step-06
    title: "Trigger and monitor full replication"
    explanation: 'In <a href="https://help.sap.com/">LTCO</a>, trigger the full replication. Monitor progress via LTCO status screen. The status moves through INITIALIZING → RUNNING → COMPLETED (for full load), then automatically switches to DELTA for ongoing change capture. Do not stop or restart the full load unless it errors — an interrupted full load may leave partial data in your target and require a complete restart.'
    sapTransaction:
      code: LTCO
      menuPath: "Replication Objects → ACDOCA_REP → Full Replication"
      helpUrl: "https://help.sap.com/"
    verify: "LTCO status = RUNNING. Progress (% rows replicated) is visible and advancing. Estimate completion time based on current rows/second rate."

  - id: step-07
    title: "Confirm switch to real-time delta after full load"
    explanation: 'After the full load completes, LTCO automatically switches to DELTA mode. Check LTRS to confirm the delta queue is flowing and lag is near zero. Real-time posting updates should now flow to your target within seconds to minutes, depending on SLT configuration and network latency. [NEEDS_SAP_CITATION — confirm typical SLT delta latency figures]'
    sapTransaction:
      code: LTRS
      menuPath: "Monitor → Replication Status → DELTA"
      helpUrl: "https://help.sap.com/"
    verify: "LTCO status = DELTA. LTRS shows delta queue depth near zero (no backlog). New postings in SAP appear in your target within the expected latency window."

  - id: step-08
    title: "Reconcile ACDOCA totals in ODQMON and SE16N"
    explanation: 'After full load, reconcile: (1) Use <a href="https://help.sap.com/">ODQMON</a> to confirm queue depth is near zero and no subscription errors exist. (2) Use <a href="https://help.sap.com/">SE16N</a> to count ACDOCA rows per (RBUKRS, RYEAR) and compare to your target system. Allow for in-flight postings (rows added during the extraction window).'
    sapTransaction:
      code: ODQMON
      menuPath: "Subscriptions → ACDOCA delta status"
      helpUrl: "https://help.sap.com/"
    verify: "ODQMON shows no error states. SE16N per-partition counts match target counts within a tolerable delta for in-flight postings. Document this as the post-load reconciliation record."

troubleshooting:
  - problem: "SLT replication crashes after 12 hours with memory error in SAP"
    solution: "Reduce parallel reader count from 8 to 4 in LTRS. Restart the full load. The extension in duration is worth the gain in stability. Also confirm ACDOCA partition key is correctly set — memory errors during full load are often caused by a missing partition key forcing a single-reader full-table scan."

  - problem: "LTCO shows DELTA status but lag is growing continuously"
    solution: "The SLT process is not keeping up with the posting rate. Check SM50 to confirm SLT processes are running. Potential causes: network bottleneck between SLT and target, resource contention on the SAP system, or the target sink is the bottleneck. Investigate each layer in sequence."

  - problem: "License violation notice from SAP"
    solution: "You proceeded without Full Use license. Contact SAP licensing immediately. Do not decommission SLT before consulting with SAP — unilateral decommissioning after an audit finding can complicate the resolution. Engage your SAP account team."

nextSteps:
  - label: "Glossary: SAP Landscape Transformation"
    url: "/glossary/slt/"
  - label: "Glossary: Operational Data Provisioning"
    url: "/glossary/odp/"
  - label: "Article: Why Reading ACDOCA Directly Breaks Your SAP System"
    url: "/articles/why-acdoca-breaks-sap/"
  - label: "License trap: Runtime vs Full Use"
    url: "/articles/runtime-vs-full-use/"
updatedAt: 2026-04-22
---

## Scenario

You are the data architect for a large enterprise. The CFO needs real-time GL data in the data warehouse: every posting visible within minutes, all historical ACDOCA, correct currency handling, and airtight reconciliation.

This is the most demanding SAP extraction scenario. This walkthrough focuses on the SAP-side configuration work: the license check, SLT setup, parallel reader configuration, system load monitoring, and post-load reconciliation. Your infrastructure team owns the target sink configuration (Kafka, S3, ADLS, or equivalent); your Basis team owns LTCO and LTRS.

Your role is to specify the correct partition strategy, ensure the license is in place, and verify the extraction is complete and accurate.

---

## What you have built

You have coordinated an enterprise-scale, real-time GL extraction from SAP. Every posting from every company in every fiscal year flows to your target within minutes of posting. LTCO and LTRS are configured with the correct partitioning. SM50 confirms SAP is not overloaded. ODQMON and SE16N confirm the data is complete.

The patterns here — license-first, partition-before-running, parallel readers, continuous monitoring — apply to every large table. BKPF, EKPO, VBRK, LIPS all follow the same architecture at scale.
