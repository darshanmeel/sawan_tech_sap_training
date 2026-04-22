---
table: VBAK
level: expert
slug: vbak
title: "Extract VBAK via SLT Push Replication (Expert)"
summary: "SAP-side expert guide for enterprise-scale VBAK extraction via SLT. Covers Full Use license verification, SLT replication object configuration in LTCO, SM59 RFC destination validation, LTRS parallel reader setup, and LTRS lag monitoring."
estimatedMinutes: 120
prerequisites:
  - "Completed VBAK Intermediate walkthrough"
  - "Full Use SAP license confirmed in writing"
  - "Basis team available for SLT configuration"
licenseRelevance: "SLT replication of VBAK requires Full Use SAP License. This is NOT permitted under Runtime License. License trap: Runtime vs Full Use →"
destinations:
  - Generic
extractors:
  - SLT
method: slt
seoTitle: "Extract VBAK via SLT (Expert) — SAP-Side Guide"
seoDescription: "SAP-side expert guide for VBAK SLT push replication. SLICENSE check, LTCO replication object, SM59 RFC destination, LTRS lag monitoring."
steps:
  - id: step-01
    title: "Verify Full Use License in SLICENSE"
    explanation: 'Open <a href="https://help.sap.com/">SLICENSE</a> and confirm SLT Landscape Transformation is listed as Active, Type = Full Use. Get written confirmation from your SAP licensing contact. SLT will run on any system regardless of license — SAP enforces compliance through audits, not technical blocks.'
    sapTransaction:
      code: SLICENSE
      menuPath: "License Overview → Check SLT entry"
      helpUrl: "https://help.sap.com/"
    verify: "SLICENSE shows SLT Landscape Transformation = Active, Full Use. Written licensing confirmation exists."

  - id: step-02
    title: "Validate the RFC destination for the target system (SM59)"
    explanation: 'SLT pushes data to a target system via an RFC destination. Confirm the RFC destination your Basis team has configured points to the correct target and the connection test passes. Use <a href="https://help.sap.com/">SM59</a> to run the test. A failed RFC destination will silently drop replication data without SLT raising an error in LTCO.'
    sapTransaction:
      code: SM59
      menuPath: "RFC Connections → TCP/IP → Test Connection"
      helpUrl: "https://help.sap.com/"
    verify: "Test Connection returns green for the RFC destination your SLT replication object uses."

  - id: step-03
    title: "Configure SLT replication object for VBAK in LTCO"
    explanation: 'Work with your Basis team to create a replication object for VBAK in <a href="https://help.sap.com/">LTCO</a>. For VBAK, partition by VKORG (sales organisation) to distribute load evenly across SLT readers. Confirm the replication object is in ACTIVE status before triggering any load.'
    sapTransaction:
      code: LTCO
      menuPath: "Replication Objects → Create → Source Table: VBAK → Partition Key: VKORG"
      helpUrl: "https://help.sap.com/"
    verify: "LTCO shows a VBAK replication object with VKORG as partition key. Status = ACTIVE."

  - id: step-04
    title: "Perform initial full load via LTCO"
    explanation: 'Trigger the full replication in <a href="https://help.sap.com/">LTCO</a>. SLT reads all VBAK rows and pushes them to the target. Depending on VBAK size, this takes minutes to hours. Monitor progress via LTCO status and confirm SM50 work process utilization stays safe.'
    sapTransaction:
      code: LTCO
      menuPath: "Replication Objects → VBAK_REP → Full Replication"
      helpUrl: "https://help.sap.com/"
    verify: "Full load completes. LTCO status switches from RUNNING to DELTA automatically."

  - id: step-05
    title: "Confirm real-time delta and monitor lag in LTRS"
    explanation: 'After full load, SLT captures changes from VBAK in near-real-time. Monitor lag in <a href="https://help.sap.com/">LTRS</a>. Expected lag for VBAK is under 60 seconds. If lag grows continuously, investigate SM50 for SLT process saturation or network issues between SAP and the target.'
    sapTransaction:
      code: LTRS
      menuPath: "Monitor → Replication Status → Lag"
      helpUrl: "https://help.sap.com/"
    verify: "LTRS shows DELTA status and replication lag within SLA (e.g., under 60 seconds for VBAK)."

  - id: step-06
    title: "Handle Z-fields at scale"
    explanation: 'If VBAK has multiple Z-fields (more than 5), SLT may need a field-mapping configuration to include them in the replication object. Confirm with your Basis team that all Z-fields are included in the LTCO replication object definition. If a Z-field was added after the initial replication object was created, it may need to be added manually and a partial re-init triggered. [NEEDS_SAP_CITATION — confirm SLT behavior when Z-fields are added post-configuration]'
    sapTransaction:
      code: LTCO
      menuPath: "Replication Objects → VBAK_REP → Field Mapping"
      helpUrl: "https://help.sap.com/"
    verify: "LTCO field mapping includes all VBAK Z-fields. Target system records include Z-field values."

troubleshooting:
  - problem: "SLT replication lag exceeds SLA"
    solution: "Add a second SLT replication object scoped to a subset of sales organisations to distribute the load. Scale your target sink infrastructure if it is the bottleneck. Check SM50 to confirm SLT processes are not queued waiting for work processes."

  - problem: "SM59 test connection fails after LTCO is configured"
    solution: "The target system's RFC configuration has changed. The Basis team needs to update the SM59 destination with the correct host, port, and credentials. SLT does not alert you if the RFC destination breaks — it silently drops replication events."

nextSteps:
  - label: "Compare with ACDOCA Expert for ultra-large-scale patterns"
    url: "/walkthrough/expert/acdoca/"
  - label: "Glossary: SAP Landscape Transformation"
    url: "/glossary/slt/"
  - label: "License trap: Runtime vs Full Use"
    url: "/articles/runtime-vs-full-use/"
updatedAt: 2026-04-22
---

## Scenario

Your analytics platform needs VBAK updates in near-real-time. SLT push replication to your target is the approach: it captures every insert, update, and delete at the database level and delivers them faster than any application-level extraction.

This walkthrough covers SAP-side configuration: license check, RFC destination validation, LTCO replication object setup, and LTRS lag monitoring. Your infrastructure team owns the target sink; your Basis team owns LTCO and LTRS configuration.

---

## What you have built

You have coordinated an enterprise-scale, real-time VBAK replication from SAP. SLT replicates changes within the target SLA, and you have confirmed SM59, LTCO, and LTRS are all healthy. This architecture extends to 10+ tables using the same SAP-side patterns.
