---
table: BKPF
slug: bkpf
title: "Extract BKPF Multi-Year"
summary: "SAP-side guide for multi-year BKPF extraction. Covers partitioning by BUKRS and GJAHR across multiple years, SM50 load monitoring during multi-partition runs, and ODQMON queue health checks."
estimatedMinutes: 75
prerequisites:
  - "Technical extraction user (System type) created in SU01 with S_RFC and S_ODP_READ authorizations"
  - "SAP S/4HANA access with SE16N and SE80 authorization"
licenseRelevance: "All licenses. ODP via OData API. License trap: Runtime vs Full Use →"
destinations:
  - Generic
extractors:
  - ODP
method: odp
seoTitle: "Extract BKPF Multi-Year — SAP-Side Guide"
seoDescription: "SAP-side guide for multi-year BKPF extraction. Partition by BUKRS+GJAHR, monitor SM50 during parallel runs, verify ODQMON queue health."
steps:
  - id: step-01
    title: "Count rows per partition in SE16N"
    explanation: 'For each fiscal year and company code combination you plan to extract, run a count in <a href="https://help.sap.com/">SE16N</a> with BUKRS and GJAHR filters. Record each count. This gives you a per-partition reconciliation baseline and helps you estimate total extraction time.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → BKPF → Filter BUKRS='1000' AND GJAHR=2022 → Count; repeat for 2023, 2024"
      helpUrl: "https://help.sap.com/"
    verify: "You have row counts for each (BUKRS, GJAHR) combination. Total row count across all partitions is documented."

  - id: step-02
    title: "Confirm I_AccountingDocument CDS view is available for all target years"
    explanation: 'The released CDS view I_AccountingDocument exposes BKPF through ODP. Verify it is active in <a href="https://help.sap.com/">SE80</a>. Also confirm that your extraction does not need data from before the system cut-over date — for systems migrated from ECC to S/4HANA, historical data may not be in BKPF (it may be in BKPF_OLD or have been migrated). [NEEDS_SAP_CITATION — confirm BKPF_OLD behavior for migrated systems]'
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → I_AccountingDocument"
      helpUrl: "https://help.sap.com/"
    verify: "I_AccountingDocument is active. Ask Basis team whether pre-migration documents are in scope and where they are stored."

  - id: step-03
    title: "Monitor SAP system load during multi-partition extraction (SM50)"
    explanation: 'When running multiple partition extractions in parallel, your extraction tool opens multiple RFC connections simultaneously. Each connection consumes a work process. Monitor <a href="https://help.sap.com/">SM50</a> to confirm work process utilization stays below 80%. If it climbs higher, the finance team (who are posting documents) will be affected.'
    sapTransaction:
      code: SM50
      menuPath: "Work Process Overview"
      helpUrl: "https://help.sap.com/"
    verify: "During extraction, SM50 shows work processes for your extraction user (DIA or BTC type) with CPU and status. Total work process utilization stays below 80%."
    whyItMatters: "If your extraction saturates all available work processes, finance users cannot post documents. Coordinate extraction windows with the finance team — run multi-partition extractions outside posting hours."

  - id: step-04
    title: "Check ODQMON for multiple active subscriptions"
    explanation: 'If your tool runs multiple partitions in parallel via multiple ODP subscriptions, <a href="https://help.sap.com/">ODQMON</a> shows all active subscriptions. Monitor that each subscription is progressing and none is stuck in an error or fetching state. A stuck subscription consumes resources and blocks that partition.'
    sapTransaction:
      code: ODQMON
      menuPath: "Subscriptions → Context: ABAP_CDS → Filter by I_AccountingDocument"
      helpUrl: "https://help.sap.com/"
    verify: "All subscriptions for I_AccountingDocument are in active (not error) state. Queue depths are decreasing over time."

  - id: step-05
    title: "Reconcile totals per partition after extraction"
    explanation: 'For each (BUKRS, GJAHR) partition, re-run the SE16N count you recorded in step 01 and compare to the row count in your target. All partitions must reconcile before you sign off on the extraction.'
    sapTransaction:
      code: SE16N
      helpUrl: "https://help.sap.com/"
    verify: "Row counts in target match SE16N for each (BUKRS, GJAHR) partition. Document any acceptable variance for in-flight postings."

troubleshooting:
  - problem: "SM50 shows work process saturation during extraction"
    solution: "Reduce the number of parallel extraction connections. Limit to 3–4 concurrent partitions maximum. Queue remaining partitions to run sequentially after the first batch completes. Run extractions outside peak posting hours."

  - problem: "One partition fails while others succeed"
    solution: "BKPF for a specific fiscal year may have unusual volume (e.g., a year-end closing run generated more documents than normal). Re-run the failed partition with a smaller sub-partition (e.g., add a BLART filter for document types). Check ODQMON for the specific subscription error message."

toolSteps:
  - tool: custom
    label: "Custom (Python / pyrfc) — multi-partition extraction"
    steps:
      - title: "Extract BKPF for multiple fiscal years in parallel"
        explanation: "Use pyrfc to open multiple simultaneous connections (one per BUKRS+GJAHR partition). Each connection runs a full ODP extraction. Monitor SAP work processes (SM50) to ensure utilization stays below 80%."
        code: |
          import pyrfc
          import pandas as pd
          import boto3
          from concurrent.futures import ThreadPoolExecutor
          from io import BytesIO
          import pyarrow.parquet as pq
          import pyarrow as pa
          
          # Define partitions: (company code, fiscal year)
          partitions = [
              ('1000', '2022'),
              ('1000', '2023'),
              ('1000', '2024'),
              ('2000', '2024'),
          ]
          
          def extract_partition(bukrs, gjahr):
              """Extract BKPF for one (BUKRS, GJAHR) partition."""
              conn = pyrfc.Connection(
                  ashost='sap-prod.company.com',
                  sysnr='00', client='100',
                  user='EXTRACT_BKPF', passwd='<password>'
              )
              
              result = conn.call(
                  'RODPS_REPL_ODP_EXTRACT',
                  SUBSCRIBER_NAME=f'PYTHON_BKPF_{bukrs}_{gjahr}',
                  SUBSCRIBER_TYPE='2',
                  SUBSCRIBER_PROCESS='FULL_LOAD',
                  DATA_AREA='ABAP_CDS',
                  ENTITY_NAME='I_AccountingDocument',
                  MAX_RECORDS=500000,
                  FIELDS=[{'FIELDNAME': '*'}],
                  FILTERS=[
                      {'NAME': 'BUKRS', 'SIGN': 'I', 'OPTION': 'EQ', 'LOW': bukrs},
                      {'NAME': 'GJAHR', 'SIGN': 'I', 'OPTION': 'EQ', 'LOW': gjahr}
                  ]
              )
              
              records = result.get('DATA', [])
              df = pd.DataFrame(records)
              print(f"Partition {bukrs}/{gjahr}: {len(df)} rows")
              
              # Write to S3
              s3 = boto3.client('s3')
              table = pa.Table.from_pandas(df)
              buf = BytesIO()
              pq.write_table(table, buf, compression='snappy')
              buf.seek(0)
              s3.put_object(
                  Bucket='my-sap-landing-bucket',
                  Key=f'sap/bkpf/{bukrs}/{gjahr}/bkpf.parquet',
                  Body=buf.getvalue()
              )
              conn.close()
              return len(df)
          
          # Run partitions in parallel (max 4 at a time)
          with ThreadPoolExecutor(max_workers=4) as executor:
              futures = [executor.submit(extract_partition, bukrs, gjahr) 
                        for bukrs, gjahr in partitions]
              total_rows = sum(f.result() for f in futures)
          
          print(f"Total extracted: {total_rows} rows across {len(partitions)} partitions")
        language: python
        verify: "Each partition extracts successfully. Total row count matches SE16N counts summed across all (BUKRS, GJAHR) combinations."

  - tool: adf
    label: "Azure Data Factory — multi-partition extraction"
    steps:
      - title: "Create parameterized Copy Activity for BUKRS and GJAHR"
        explanation: "In ADF, create a pipeline with parameters for BUKRS and GJAHR. The Copy Activity source queries I_AccountingDocument with ODP, filtering on these parameters. Then create a ForEach loop that iterates through all (BUKRS, GJAHR) pairs, calling the parameterized Copy Activity for each."
        verify: "Pipeline runs for all partitions. Row counts per partition visible in ADF monitoring. All data lands in Azure Data Lake Storage organized by BUKRS/GJAHR folder structure."

nextSteps:
  - label: "Try BKPF Expert — SLT parallel readers for enterprise scale"
    url: "/walkthrough/expert/bkpf/"
  - label: "License trap: Runtime vs Full Use"
    url: "/articles/runtime-vs-full-use/"
updatedAt: 2026-04-22
---

## Scenario

Your finance warehouse needs three years of accounting documents. You will extract in parallel by fiscal year and company code to minimize extraction time, while keeping SAP work process utilization safe for concurrent posting activity.

---

## What you have confirmed

You have a per-partition row-count baseline, know how to monitor SAP work process load during parallel extractions, and understand how to use ODQMON to track subscription health across multiple concurrent extractions. Enterprise-scale extraction (billions of rows, SLT) is covered in the Expert walkthrough.
