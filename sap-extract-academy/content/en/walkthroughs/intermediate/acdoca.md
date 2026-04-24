---
table: ACDOCA
slug: acdoca
title: "Extract ACDOCA One Company/Year via ODP"
summary: "SAP-side guide for ACDOCA extraction. Focuses on confirming the I_JournalEntryItem CDS view, understanding ODP delta queue behavior, monitoring with ODQMON, and SE16N reconciliation for a single fiscal year partition."
estimatedMinutes: 90
prerequisites:
  - "Technical extraction user (System type) created in SU01 with S_RFC and S_ODP_READ authorizations"
  - "SAP license type confirmed (Runtime or Full Use) — affects which extraction method is permitted"
licenseRelevance: "ODP extraction via OData is permitted under Runtime and Full Use licenses. License trap: Runtime vs Full Use →"
destinations:
  - Generic
extractors:
  - ODP
  - SLT
method: odp
seoTitle: "Extract ACDOCA One Company/Year via ODP — SAP-Side Guide"
seoDescription: "SAP-side guide for ACDOCA extraction. ODQMON delta queue behavior, CDS view validation, ODP first-delta gotcha, SE16N reconciliation."
steps:
  - id: step-01
    title: "Confirm ACDOCA partition size in SE16N"
    explanation: 'Before running any extraction, use <a href="https://help.sap.com/">SE16N</a> to count rows for your intended partition. Filter on RBUKRS (company code) and RYEAR (fiscal year). If the count exceeds 500M rows for a single partition, move to the Expert walkthrough — that volume requires SLT or sub-partition strategies not covered here.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → ACDOCA → Filter RBUKRS='1000' AND RYEAR=2024 → Count"
      helpUrl: "https://help.sap.com/"
    verify: "Row count is below 500M. Write it down for reconciliation."

  - id: step-02
    title: "Confirm I_JournalEntryItem CDS view and delta annotation"
    explanation: 'In <a href="https://help.sap.com/">SE80</a>, open I_JournalEntryItem and inspect the annotations. For delta extraction you need <code>@Analytics.dataExtraction.delta.changeDataCapture.automatic: true</code>. If that annotation is absent, the view supports only full-load extraction — delta will not work.'
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → I_JournalEntryItem → Annotations"
      helpUrl: "https://help.sap.com/"
    verify: "I_JournalEntryItem has @Analytics.dataExtract: true. Check for the delta changeDataCapture annotation. If absent, confirm with your Basis team whether a support package is needed to enable it."
    whyItMatters: "If you run a delta extraction against a view that lacks the CDC annotation, ODP returns all rows on every run — the same behavior as a full load but without you realising it. This leads to duplicate data in your target."

  - id: step-03
    title: "Monitor the ODP subscription in ODQMON"
    explanation: 'After your extraction tool registers, open <a href="https://help.sap.com/">ODQMON</a> and navigate to the ABAP_CDS context. Find the subscription for I_JournalEntryItem. Note: after an init-delta run, the first delta request returns 0 records. This is correct ODP behavior — the delta mechanism captures changes from the init point forward, not from before it. <a href="https://support.sap.com/notes/2884410">SAP Note 2884410</a> documents this.'
    sapTransaction:
      code: ODQMON
      menuPath: "Subscriptions → Context: ABAP_CDS → I_JournalEntryItem"
      helpUrl: "https://help.sap.com/"
    verify: "Subscription for I_JournalEntryItem appears. After init, delta queue shows 0 pending records — this is expected."

  - id: step-04
    title: "Reconcile extracted row count against SE16N"
    explanation: 'After the full-load extraction completes, return to <a href="https://help.sap.com/">SE16N</a> and recount ACDOCA rows for the same RBUKRS and RYEAR partition. The count in your target system should match within a small window for in-flight postings.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → ACDOCA → Filter RBUKRS='1000' AND RYEAR=2024 → Count"
      helpUrl: "https://help.sap.com/"
    verify: "Target row count matches SE16N count within a tolerable margin for in-flight transactions."

  - id: step-05
    title: "Add posting period filter if the partition is still too large"
    explanation: 'If SE16N shows your RBUKRS+RYEAR partition is too large (e.g., 200M+ rows) for a safe ODP extraction, add a posting period filter. In <a href="https://help.sap.com/">SE16N</a>, filter on POPER (posting period, values 001–012 for months) to count rows per quarter. Then extract one quarter at a time.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → ACDOCA → Filter RBUKRS='1000' AND RYEAR=2024 AND POPER='001' → Count"
      helpUrl: "https://help.sap.com/"
    verify: "Each quarterly partition (e.g., POPER='001' through '003') has a manageable row count. Adjust partition granularity accordingly."

stepsSlt:
  - id: slt-01
    title: "Confirm Full Use license and SLT system access"
    explanation: 'SLT requires a <strong>Full Use license</strong> — it reads ACDOCA directly, bypassing the CDS authorization layer. Confirm license with your SAP Basis team before proceeding. Then confirm you have access to transaction <code>LTRC</code> on the SLT system (which may be a separate SAP system from the source ERP).'
    sapTransaction:
      code: LTRC
      menuPath: "SLT system → LTRC → Check mass transfer list"
      helpUrl: "https://help.sap.com/"
    verify: "LTRC opens without authorization error. Confirm with Basis that Full Use license is active."

  - id: slt-02
    title: "Create a Mass Transfer ID in LTRC"
    explanation: 'In <code>LTRC</code>, create a new mass transfer configuration. Select your source system (the ERP where ACDOCA lives) and your target system (Kafka topic, database, or secondary HANA). Give the mass transfer a descriptive name (e.g., <code>MT_ACDOCA_PROD</code>). SLT will use this ID to track all replication state for ACDOCA.'
    sapTransaction:
      code: LTRC
      menuPath: "LTRC → New → Mass Transfer → Source: ERP system → Target: your destination"
      helpUrl: "https://help.sap.com/"
    verify: "Mass Transfer ID created and visible in LTRC overview."

  - id: slt-03
    title: "Add ACDOCA as a replication object with partitioning"
    explanation: 'Inside the mass transfer, add <code>ACDOCA</code> as a replication table. In the partitioning settings, define partition keys: <strong>RBUKRS</strong> (company code) and <strong>GJAHR</strong> (fiscal year). This is the most important configuration step — without partitioning, SLT reads the entire table in a single pass, which will overwhelm both SAP and the target. Each RBUKRS+GJAHR combination becomes an independent partition that LTRS can replicate in parallel.'
    sapTransaction:
      code: LTRC
      menuPath: "Mass Transfer → Table Settings → Add Table: ACDOCA → Partitioning: RBUKRS + GJAHR"
      helpUrl: "https://help.sap.com/"
    verify: "ACDOCA appears in table list with partition keys RBUKRS and GJAHR defined."

  - id: slt-04
    title: "Configure parallel readers in LTRS"
    explanation: 'Navigate to transaction <code>LTRS</code> (Replication Server) and set the number of parallel reader processes for your mass transfer. Start with <strong>4 parallel readers</strong>. Each reader handles one partition (one RBUKRS+GJAHR combination) simultaneously. Monitor SM50 on the source ERP during the first run — if dialog processes exceed 70% utilization, reduce readers to 2 and re-test.'
    sapTransaction:
      code: LTRS
      menuPath: "LTRS → Mass Transfer → Advanced Settings → Number of Parallel Jobs: 4"
      helpUrl: "https://help.sap.com/"
    verify: "LTRS shows 4 parallel job slots configured. SM50 on source ERP has capacity to support them."

  - id: slt-05
    title: "Start initial load and monitor in LTCO"
    explanation: 'Activate the replication in <code>LTRC</code>. SLT will immediately begin the full initial load, reading each RBUKRS+GJAHR partition across your configured readers. Open transaction <code>LTCO</code> to monitor progress: you will see rows-per-second throughput, per-partition status (running / complete / error), and any failed partitions. Expect the initial load of a large ACDOCA (10B+ rows) to take 24–72 hours depending on partition count and reader configuration.'
    sapTransaction:
      code: LTCO
      menuPath: "LTCO → Mass Transfer → ACDOCA → Initial Load Status"
      helpUrl: "https://help.sap.com/"
    verify: "LTCO shows partitions processing. Throughput is steady (rows/second visible). No partitions in ERROR state."

  - id: slt-06
    title: "Verify delta replication after initial load completes"
    explanation: 'Once the initial load finishes, SLT automatically switches to delta mode — it triggers on every ACDOCA insert or update and replicates the change to the target within seconds. To verify: post a test document in the source ERP (or identify a recent posting in <code>SE16N</code>), then confirm it appears in the target within 60 seconds. Check <code>LTCO</code> for delta lag — it should show near-zero pending records under normal conditions.'
    sapTransaction:
      code: LTCO
      menuPath: "LTCO → Mass Transfer → ACDOCA → Delta Status → Pending Records"
      helpUrl: "https://help.sap.com/"
    verify: "Delta lag in LTCO shows < 100 pending records. Test document posted in ERP appears in target within 60 seconds."

  - id: slt-07
    title: "Reconcile row count against SE16N"
    explanation: 'After initial load completes, run a count in <code>SE16N</code> for each RBUKRS+GJAHR partition and compare to the count in your target system. Use the same filters: <code>RBUKRS=1000, GJAHR=2024</code>. Small discrepancies of a few hundred rows are normal (in-flight postings during the load window). A discrepancy of thousands of rows indicates a missed partition or a stuck reader — check LTCO for ERROR partitions and re-trigger them.'
    sapTransaction:
      code: SE16N
      menuPath: "SE16N → ACDOCA → Filter RBUKRS='1000' AND GJAHR=2024 → Count"
      helpUrl: "https://help.sap.com/"
    verify: "Target row count matches SE16N within a 0.01% tolerance. Re-trigger any ERROR partitions in LTCO."

toolSteps:
  - tool: custom
    label: "Custom (Python / pyrfc) — partition-based ODP extraction"
    steps:
      - title: "Extract ACDOCA with company code and fiscal year partitioning"
        explanation: "Use pyrfc to extract ACDOCA via I_JournalEntryItem with ODP, filtering by RBUKRS (company code) and GJAHR (fiscal year). Extract one partition at a time to avoid timeout and memory issues on large tables."
        code: |
          import pyrfc
          import pandas as pd
          import boto3
          from io import BytesIO
          import pyarrow.parquet as pq
          import pyarrow as pa
          
          def extract_acdoca_partition(rbukrs, gjahr):
              """Extract one ACDOCA partition via ODP."""
              conn = pyrfc.Connection(
                  ashost='sap-prod.company.com',
                  sysnr='00', client='100',
                  user='EXTRACT_ACDOCA', passwd='<password>'
              )
              
              # Full load extraction for single partition
              result = conn.call(
                  'RODPS_REPL_ODP_EXTRACT',
                  SUBSCRIBER_NAME=f'PYTHON_ACDOCA_{rbukrs}_{gjahr}',
                  SUBSCRIBER_TYPE='2',
                  SUBSCRIBER_PROCESS='FULL_LOAD',
                  DATA_AREA='ABAP_CDS',
                  ENTITY_NAME='I_JournalEntryItem',
                  MAX_RECORDS=500000,
                  FIELDS=[{'FIELDNAME': '*'}],
                  FILTERS=[
                      {'FIELDNAME': 'RBUKRS', 'SIGN': 'I', 'OPTION': 'EQ', 'LOW': rbukrs},
                      {'FIELDNAME': 'GJAHR', 'SIGN': 'I', 'OPTION': 'EQ', 'LOW': str(gjahr)}
                  ]
              )
              
              records = result.get('DATA', [])
              df = pd.DataFrame(records)
              
              print(f"ACDOCA {rbukrs}/{gjahr}: {len(df)} rows extracted")
              return df
          
          # Extract multiple partitions
          s3 = boto3.client('s3')
          partitions = [
              ('1000', 2024),
              ('1000', 2023),
              ('2000', 2024),
          ]
          
          for rbukrs, gjahr in partitions:
              df = extract_acdoca_partition(rbukrs, gjahr)
              
              if len(df) > 0:
                  # Write to S3 as Parquet
                  table = pa.Table.from_pandas(df)
                  buf = BytesIO()
                  pq.write_table(table, buf, compression='snappy')
                  buf.seek(0)
                  s3.put_object(
                      Bucket='my-sap-landing-bucket',
                      Key=f'sap/acdoca/full/{rbukrs}_{gjahr}_acdoca.parquet',
                      Body=buf.getvalue()
                  )
        language: python
        verify: "Each partition extracts without timeout. S3 files appear with correct row counts. Row count in S3 matches SE16N count for the same RBUKRS+GJAHR filter."

  - tool: adf
    label: "Azure Data Factory — partition-based ODP extraction"
    steps:
      - title: "Set up parameterized Copy Activity with company code and fiscal year partitioning"
        explanation: "In ADF, create a pipeline with pipeline parameters for RBUKRS (company code) and GJAHR (fiscal year). Use a Copy Activity with OData source pointing to I_JournalEntryItem. Add filters in the OData query to extract one partition at a time. Loop over all required partitions using ForEach."
        verify: "Pipeline runs for each RBUKRS+GJAHR combination. ADLS folder structure shows separate files per partition (e.g., acdoca/full/1000_2024/). Row count per partition matches SE16N."

  - tool: databricks
    label: "Databricks — partition-based ODP extraction with Delta Lake"
    steps:
      - title: "Extract ACDOCA via Spark and write to Delta Lake"
        explanation: "Use Databricks Spark connector for OData or direct RFC-to-Spark readers to extract ACDOCA. Partition the extraction by RBUKRS and GJAHR. Write to Delta Lake format in ABFS (Azure Blob Storage), enabling incremental updates and schema evolution for downstream delta runs."
        verify: "Delta table created in Databricks workspace. Partitioned by RBUKRS and GJAHR. Can run SELECT COUNT(*) WHERE RBUKRS='1000' AND GJAHR=2024 and see row count matching SE16N."

  - tool: fivetran
    label: "Fivetran — full load via OData"
    steps:
      - title: "Configure Fivetran OData connector for I_JournalEntryItem"
        explanation: "In Fivetran, create a new connector using the OData source type. Point to your SAP OData service for I_JournalEntryItem. Define a custom query or API filter to extract one company code + fiscal year per sync run. Set the schedule for hourly or daily depending on your refresh cadence. Fivetran will handle state management and automatic delta detection if available."
        verify: "Fivetran connector syncs I_JournalEntryItem data to your data warehouse (Snowflake, Redshift, BigQuery, etc.). Row count in destination table matches SE16N for the same partition. Logs show successful full load with no errors."

troubleshooting:
  - problem: "ODP extraction times out after 2 hours"
    solution: "The partition is more than 500M rows. Use the Expert walkthrough which covers SLT parallel readers for ACDOCA at that scale."

  - problem: "First delta run returns 0 records — is this a bug?"
    solution: "No. This is documented ODP behavior per SAP Note 2884410. After an init-delta, the first delta request returns 0 records because no changes have occurred since the init point. Subsequent delta runs will return only changed records."

  - problem: "ODQMON shows subscription stuck in 'FETCHING' state"
    solution: "The extraction process is still running or has hung. Check SM50 for active ABAP processes owned by your extraction user. If the process is not active, the subscription may be corrupted. Reset it in ODQMON and restart the extraction."
    sapNoteUrl: "https://support.sap.com/notes/2884410"

nextSteps:
  - label: "Table overview: ACDOCA Universal Journal"
    url: "/tables/acdoca/"
  - label: "License trap: Runtime vs Full Use"
    url: "/articles/runtime-vs-full-use/"
updatedAt: 2026-04-22
---

<div class="callout info">
<strong>Applies to other tables too.</strong> The same patterns work for any SAP table — replace <code>ACDOCA</code> (and its CDS view <code>I_JournalEntryItem</code>) in the code below with the table and view you want. Partition keys change per table (<code>BUKRS + GJAHR</code> here; <code>BUKRS + BUDAT</code> for BKPF; <code>VKORG</code> for VBAK; just <code>MATNR</code> or <code>LIFNR</code> for master data), but the ODP / SLT / RFC mechanics are the same. See <a href="/tables/">the table directory</a> for the full list and each table's recommended partition strategy.
</div>

## Scenario

Your finance team needs ACDOCA data for year-end close analytics. You will extract one company code, one fiscal year — enough for meaningful analysis without hitting system limits. This walkthrough focuses on the SAP-side checks: confirming delta capability, monitoring ODP subscriptions, and understanding the first-delta behavior that surprises most teams on their first run.

Estimated time: 90 minutes.

---

## What you have confirmed

You have verified that I_JournalEntryItem supports delta extraction on your system, understand that the first ODP delta returns 0 records (by design), and have a reconciliation baseline. When you need more years or company codes, the Expert walkthrough scales these patterns via SLT.
