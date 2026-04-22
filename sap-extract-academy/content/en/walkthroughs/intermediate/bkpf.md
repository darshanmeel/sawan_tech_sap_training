---
table: BKPF
level: intermediate
slug: bkpf
title: "Extract BKPF Multi-Year with Python ODP"
summary: "Full extraction of multiple fiscal years (2022-2024), partitioned by BUKRS and GJAHR. Python/pyrfc with parallel loading."
estimatedMinutes: 75
prerequisites:
  - "Completed BKPF Beginner"
  - "Python/pyrfc expertise"
licenseRelevance: "All licenses."
destinations:
  - Snowflake
extractors:
  - Python
steps:
  - id: step-01
    title: "Design multi-year extraction strategy"
    explanation: "Extract 2022, 2023, 2024 in parallel. Each year partitioned by BUKRS for further parallelism."
    codeBlock:
      language: python
      content: |
        years = [2022, 2023, 2024]
        companies = [1000, 1001, 2000]
        tasks = [
          (year, bukrs)
          for year in years
          for bukrs in companies
        ]
      caption: "Multi-year, multi-company task matrix"
    verify: "9 extraction tasks planned (3 years × 3 companies)."
  
  - id: step-02
    title: "Execute parallel extractions"
    explanation: "Use ThreadPoolExecutor to run up to 4 parallel pyrfc connections. Each extracts one (BUKRS, GJAHR) partition."
    verify: "All 9 partitions complete in ~30 minutes (vs sequential 90+ minutes)."
  
  - id: step-03
    title: "Load into Snowflake with partitioned schema"
    explanation: "Store in ACCOUNTING.BKPF_RAW partitioned by GJAHR and BUKRS."
    verify: "ACCOUNTING.BKPF_RAW has 9 partitions, all populated."
  
  - id: step-04
    title: "Reconcile aggregate totals"
    explanation: "For each fiscal year and company code, sum amounts in Parquet and compare to SAP via FM_GET_DOCUMENT_HEADER RFC (if available)."
    verify: "Total amounts match within 0.01% (allowance for rounding)."

troubleshooting:
  - problem: "ThreadPoolExecutor exhausts SAP connection pool"
    solution: "Limit to 4 parallel threads. Queue remaining tasks."

nextSteps:
  - label: "Try BKPF Expert"
    url: "/walkthrough/expert/bkpf/"

seoTitle: "Extract BKPF Multi-Year with Python ODP"
seoDescription: "Intermediate BKPF extraction: multi-year (2022-2024), multi-company partitioned loading via Python and ODP. Parallel processing and reconciliation."
updatedAt: 2026-04-22
---

## Scenario

Your finance warehouse needs 3 years of accounting documents. You'll extract in parallel by fiscal year and company code to minimize extraction time.

---

## What you've built

You've mastered multi-dimensional partitioning (fiscal year × company code) and parallel extraction. Finance can now run ad-hoc reports across years without waiting for sequential loads.
