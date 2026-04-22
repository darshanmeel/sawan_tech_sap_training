---
table: VBAK
level: intermediate
slug: vbak
title: "Extract VBAK with Delta and Z-Field (Intermediate)"
summary: "SAP-side intermediate guide for VBAK extraction with delta processing and a custom Z-field. Covers ODP delta queue mechanics in ODQMON, CDS extension view creation in SE80 for Z-field inclusion, and checking delta subscription health."
estimatedMinutes: 60
prerequisites:
  - "Completed VBAK Beginner walkthrough"
  - "Understanding of ODP delta concepts from the ODP glossary entry"
licenseRelevance: "All license types. CDS extension views are application-layer. License trap: Runtime vs Full Use →"
destinations:
  - Generic
extractors:
  - ODP
method: odp
seoTitle: "Extract VBAK with Delta and Z-Field (Intermediate) — SAP-Side Guide"
seoDescription: "SAP-side intermediate guide for VBAK with ODP delta and custom Z-field via CDS extension view. ODQMON subscription monitoring, delta queue mechanics."
steps:
  - id: step-01
    title: "Verify I_SalesDocument supports delta extraction"
    explanation: 'Open I_SalesDocument in <a href="https://help.sap.com/">SE80</a> and inspect the delta annotation. For ODP delta to work, the view must carry <code>@Analytics.dataExtraction.delta.changeDataCapture.automatic: true</code>.'
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → I_SalesDocument → Annotations"
      helpUrl: "https://help.sap.com/"
    verify: "I_SalesDocument has @Analytics.dataExtract: true. Delta annotation is present or Basis team confirms delta is supported."

  - id: step-02
    title: "Check for the custom Z-field ZZ_REGION in VBAK"
    explanation: 'Your S/4HANA system has a custom Z-field ZZ_REGION on VBAK (added via an Append Structure). Confirm this field exists in the table definition using <a href="https://help.sap.com/">SE11</a> before building a CDS extension view to expose it.'
    sapTransaction:
      code: SE11
      menuPath: "Data Dictionary → Database Tables → VBAK → Display → Fields"
      helpUrl: "https://help.sap.com/"
    verify: "ZZ_REGION appears in the VBAK field list under an Append Structure entry."
    whyItMatters: "Z-fields added via Append Structures are part of the physical table but are not included in standard released CDS views. You must expose them explicitly through a CDS extension view to make them available for ODP extraction."

  - id: step-03
    title: "Create a CDS extension view to expose ZZ_REGION"
    explanation: 'In <a href="https://help.sap.com/">SE80</a> or ABAP Development Tools (ADT), create a CDS extension view that adds ZZ_REGION to I_SalesDocument. The extension view must not modify the released view — it extends it.'
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → Create → CDS View Extension"
      helpUrl: "https://help.sap.com/"
    codeBlock:
      language: abap
      content: |
        @AccessControl.authorizationCheck: #CHECK
        @Analytics.dataExtract: true
        extend view I_SalesDocument with ZI_SalesDocument_Ext {
          vbak.ZZ_REGION
        }
      caption: "Reference: CDS extension view to expose ZZ_REGION — adjust to your naming conventions"
    verify: "Extension view ZI_SalesDocument_Ext is active in SE80. Activating it does not raise errors or modify I_SalesDocument itself."

  - id: step-04
    title: "Monitor the ODP delta subscription in ODQMON"
    explanation: 'After your extraction tool registers and runs its init-delta, check <a href="https://help.sap.com/">ODQMON</a>. Confirm the subscription exists and is in an active (not stuck) state. Note: the first delta after init returns 0 records — this is normal per <a href="https://support.sap.com/notes/2884410">SAP Note 2884410</a>.'
    sapTransaction:
      code: ODQMON
      menuPath: "Subscriptions → Context: ABAP_CDS → I_SalesDocument (or ZI_SalesDocument_Ext)"
      helpUrl: "https://help.sap.com/"
    verify: "Subscription is active. After init run, delta queue shows 0 pending records (expected). After subsequent changes in SAP, queue shows pending records matching number of changed documents."

  - id: step-05
    title: "Validate Z-field data in SE16N"
    explanation: 'Before handing data to your analytics team, verify that ZZ_REGION values look correct. Use <a href="https://help.sap.com/">SE16N</a> to browse VBAK and check ZZ_REGION values for a sample of document numbers. Then confirm those same values appear in your target system for the same VBELN keys.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → VBAK → Show ZZ_REGION for sample VBELN"
      helpUrl: "https://help.sap.com/"
    verify: "ZZ_REGION values in your target match ZZ_REGION values in SE16N for the same VBELN records."

troubleshooting:
  - problem: "ZZ_REGION is NULL in extraction output"
    solution: "The CDS extension view may not be active or may not be the source your tool is pointing at. Confirm the extension view is active in SE80 and that your tool's ODP source is configured to use ZI_SalesDocument_Ext (not the base I_SalesDocument). Also confirm the ABAP transport containing the extension view is in the production system."

  - problem: "Delta subscriptions accumulate in ODQMON without being consumed"
    solution: "Check whether your extraction scheduler is running. Stale subscriptions that accumulate more than a few days of delta entries can cause performance issues in ODQMON. If the subscriber is no longer active, delete it in ODQMON to prevent queue buildup."
    sapNoteUrl: "https://support.sap.com/notes/2884410"

nextSteps:
  - label: "Try VBAK Expert — SLT push replication for real-time scenarios"
    url: "/walkthrough/expert/vbak/"
  - label: "Glossary: Operational Data Provisioning delta"
    url: "/glossary/odp/"
  - label: "License trap: Runtime vs Full Use"
    url: "/articles/runtime-vs-full-use/"
updatedAt: 2026-04-22
---

## Scenario

Your analytics team now needs near-real-time sales data. Daily delta extracts are sufficient — you do not need sub-minute updates, but every morning's refresh should catch all yesterday's new and changed orders. Your company also added a custom Z-field ZZ_REGION to sales documents for regional analysis.

This walkthrough covers the SAP-side changes: confirming delta support, creating a CDS extension view for ZZ_REGION, and verifying that the delta queue in ODQMON is healthy. Your tool team configures the delta poll schedule.

---

## What you have confirmed

The SAP side supports delta extraction for VBAK, the Z-field is exposed through a CDS extension view, and the ODQMON subscription is healthy. Your tool team can now configure daily delta polls. When you need sub-minute real-time updates — for example, to feed a live sales dashboard — move to the Expert walkthrough and SLT.
