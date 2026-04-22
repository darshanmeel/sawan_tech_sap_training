---
table: LFA1
level: intermediate
slug: lfa1
title: "Extract LFA1 with Hourly Delta (Intermediate)"
summary: "SAP-side intermediate guide for LFA1 extraction with ODP delta. Covers creating an ODP subscription in ODQMON, understanding subscription lifecycle, validating delta behavior with manual SAP edits, and monitoring queue health."
estimatedMinutes: 55
prerequisites:
  - "Completed LFA1 Beginner walkthrough"
  - "Understanding of ODP delta concepts from the ODP glossary entry"
licenseRelevance: "All licenses. ODP is application-layer. License trap: Runtime vs Full Use →"
destinations:
  - Generic
extractors:
  - ODP
method: odp
seoTitle: "Extract LFA1 with Hourly Delta (Intermediate) — SAP-Side Guide"
seoDescription: "SAP-side intermediate guide for LFA1 ODP delta extraction. Create and monitor ODQMON subscriptions, test delta with manual vendor changes, understand subscription lifecycle."
steps:
  - id: step-01
    title: "Verify I_Supplier has delta annotation in SE80"
    explanation: 'Open I_Supplier in <a href="https://help.sap.com/">SE80</a> and confirm it carries the delta changeDataCapture annotation required for incremental extraction. If the annotation is absent on your release, you will need to run full-load extractions on every cycle — which is still viable for vendor master given its small size, but is less efficient.'
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → I_Supplier → Annotations"
      helpUrl: "https://help.sap.com/"
    verify: "I_Supplier has @Analytics.dataExtract: true. Delta annotation present or confirmed by Basis team."

  - id: step-02
    title: "Create an ODP subscription in ODQMON"
    explanation: 'Your extraction tool creates subscriptions automatically when it first connects. But you can also inspect existing subscriptions manually via <a href="https://help.sap.com/">ODQMON</a> to understand their state. After the tool runs its first extraction, navigate to the Subscriptions tab, filter by ABAP_CDS context, and find the subscription name your tool created.'
    sapTransaction:
      code: ODQMON
      menuPath: "Subscriptions → Context: ABAP_CDS → I_Supplier"
      helpUrl: "https://help.sap.com/"
    verify: "Subscription for I_Supplier appears after the tool's first run. Status is active."

  - id: step-03
    title: "Test delta behavior with a manual vendor change"
    explanation: 'To confirm the delta mechanism is working, make a controlled change in SAP: update a vendor record in <a href="https://help.sap.com/docs/SAP_NETWEAVER_750/wm_netweaver_740_ehp1_html/ae58e3c3a8c54e6f9573f3b0ee75ea94.html">SU01</a> or in the vendor master transaction (FK02). After the change, wait 5 minutes and check ODQMON. The subscription should show 1 pending record in the delta queue. Then run the delta extraction and confirm that 1 record is fetched and the queue returns to 0.'
    sapTransaction:
      code: FK02
      menuPath: "Vendor → Change → General Data"
      helpUrl: "https://help.sap.com/"
    verify: "After manual vendor change, ODQMON delta queue for I_Supplier shows 1 pending record. After delta extraction, queue returns to 0."
    whyItMatters: "Testing delta with a controlled change before relying on it for production data is essential. It confirms the delta mechanism works end-to-end on your specific system and release."

  - id: step-04
    title: "Understand ODP subscription lifecycle and queue limits"
    explanation: 'ODP subscriptions have a finite queue depth. If the subscriber does not consume the queue within a defined window (typically 48 hours by default, configurable by Basis), the queue entries expire. A subscriber that falls behind more than this window will miss changes and may need a full-load re-init. Ask your Basis team what the queue retention is configured to on your system. [NEEDS_SAP_CITATION — confirm default queue retention settings]'
    sapTransaction:
      code: ODQMON
      menuPath: "Subscriptions → View Queue Depth and Age"
      helpUrl: "https://help.sap.com/"
    verify: "ODQMON shows queue depth for the LFA1 subscription. You understand the retention window configured on your system."

  - id: step-05
    title: "Set up weekly full-load reconciliation"
    explanation: 'Even with hourly delta, run a weekly full-load count comparison. Use <a href="https://help.sap.com/">SE16N</a> to count LFA1 rows in SAP. Compare to your target. If the counts diverge significantly, the delta mechanism may have missed changes. Trigger a full re-init if needed.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → LFA1 → Count"
      helpUrl: "https://help.sap.com/"
    verify: "Weekly SE16N count matches target count within a small margin for in-flight updates."

troubleshooting:
  - problem: "Delta misses some vendor updates"
    solution: "ODP queue may have expired entries if extraction was delayed more than the queue retention window. Re-run a full-load to catch missing data. Ask Basis team to increase queue retention if hourly polling is not feasible."

  - problem: "ODQMON shows subscription in ERROR state"
    solution: "The extraction process may have failed mid-run and left the subscription in a bad state. Reset the subscription in ODQMON (right-click → Reset). Re-run the extraction. If the error persists, review the extraction tool's connection logs and check SM21 (system log) for RFC errors."

nextSteps:
  - label: "Try LFA1 Expert — multi-table extraction with LFB1 and LFBK"
    url: "/walkthrough/expert/lfa1/"
  - label: "License trap: Runtime vs Full Use"
    url: "/articles/runtime-vs-full-use/"
updatedAt: 2026-04-22
---

## Scenario

Your procurement dashboard needs hourly vendor updates. You will implement ODP delta extraction for LFA1, test it with a controlled vendor change, and set up weekly full-load reconciliation to catch any missed changes.

---

## What you have confirmed

The SAP delta mechanism for I_Supplier is working. You can see delta changes appear in ODQMON within minutes of a vendor change, and you understand the subscription lifecycle and queue retention limits. Vendor master is now near-real-time.
