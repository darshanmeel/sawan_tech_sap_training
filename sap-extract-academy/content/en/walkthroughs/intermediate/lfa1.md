---
table: LFA1
level: intermediate
slug: lfa1
title: "Extract LFA1 with Hourly Delta (Intermediate)"
summary: "Full load plus hourly delta extraction. Introduces multiple load patterns: nightly full reconciliation with hourly incremental updates. Python/ODP integration."
estimatedMinutes: 55
prerequisites:
  - "Completed LFA1 Beginner"
  - "Python and pyrfc knowledge"
licenseRelevance: "All licenses. ODP is application-layer."
destinations:
  - Snowflake
extractors:
  - Python
steps:
  - id: step-01
    title: "Plan full + delta strategy"
    explanation: "Weekly full load (Sunday) + hourly delta (Mon-Sat). This balances freshness with extraction overhead."
    verify: "Document: Full load every Sunday 22:00 UTC, delta every hour 00-23:00 UTC."
  
  - id: step-02
    title: "Create ODP subscription for I_Supplier"
    explanation: "Use pyrfc to create a persistent ODP subscription for delta tracking."
    codeBlock:
      language: python
      content: |
        odata_request_param = {
            'DATASOURCE': 'I_Supplier',
            'SUBSCRIPTIONNAME': 'PYTHON_LFA1_HOURLY',
            'MAXDELTAREQUESTS': 100
        }
      caption: "ODP subscription creation"
    verify: "Subscription appears in ODQMON."
  
  - id: step-03
    title: "Implement full load (nightly)"
    explanation: "Python script with pyrfc for full load. Store to Snowflake STAGING_LFA1."
    verify: "Full load completes and STAGING_LFA1 is populated."
  
  - id: step-04
    title: "Implement delta extraction (hourly)"
    explanation: "Separate script that calls ODP delta API, stores sequence number in metadata table, applies changes to production LFA1 table via MERGE."
    verify: "Hourly delta runs and updates production table."

  - id: step-05
    title: "Monitor delta reconciliation"
    explanation: "Weekly, compare row count: full load count should match production count. Investigate deltas if they diverge."
    verify: "Count(STAGING) ≈ Count(LFA1_PROD)"

troubleshooting:
  - problem: "Delta misses some updates"
    solution: "ODP queue may have dropped entries if extraction was delayed >2 days. Re-run full load to catch missing data."

nextSteps:
  - label: "Try LFA1 Expert"
    url: "/walkthrough/expert/lfa1/"

seoTitle: "Extract LFA1 with Hourly Delta (Intermediate)"
seoDescription: "Intermediate LFA1 extraction with full weekly + hourly delta loads. Near-real-time vendor master via ODP delta queues and Python."
updatedAt: 2026-04-22
---

## Scenario

Your procurement dashboard needs hourly vendor updates. Weekly full load with daily/hourly deltas is the pattern.

---

## What you've built

You have a tiered extraction: weekly full reconciliation + hourly incremental updates. Vendor master is now near-real-time.
