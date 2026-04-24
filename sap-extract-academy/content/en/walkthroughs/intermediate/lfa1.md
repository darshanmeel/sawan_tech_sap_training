---
table: LFA1
slug: lfa1
title: "Extract LFA1 with Hourly Delta"
summary: "SAP-side guide for LFA1 extraction with ODP delta. Covers creating an ODP subscription in ODQMON, understanding subscription lifecycle, validating delta behavior with manual SAP edits, and monitoring queue health."
estimatedMinutes: 55
prerequisites:
  - "Technical extraction user (System type) created in SU01 with S_RFC and S_ODP_READ authorizations"
  - "SAP S/4HANA access with SE16N and SE80 authorization"
licenseRelevance: "All licenses. ODP is application-layer. License trap: Runtime vs Full Use →"
destinations:
  - Generic
extractors:
  - ODP
method: odp
seoTitle: "Extract LFA1 with Hourly Delta — SAP-Side Guide"
seoDescription: "SAP-side guide for LFA1 ODP delta extraction. Create and monitor ODQMON subscriptions, test delta with manual vendor changes, understand subscription lifecycle."
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
    explanation: 'To confirm the delta mechanism is working, make a controlled change in SAP: update a vendor record in <a href="https://help.sap.com/">SU01</a> or in the vendor master transaction (FK02). After the change, wait 5 minutes and check ODQMON. The subscription should show 1 pending record in the delta queue. Then run the delta extraction and confirm that 1 record is fetched and the queue returns to 0.'
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

toolSteps:
  - tool: custom
    label: "Custom (Python / pyrfc) — hourly delta extraction"
    steps:
      - title: "Run hourly delta extraction for LFA1"
        explanation: "Use pyrfc to call the ODP extraction module every hour. Each call retrieves only changed vendor records since the last delta extraction. Store the delta token to resume from the correct point on the next run."
        code: |
          import pyrfc
          import json
          import pandas as pd
          import boto3
          from datetime import datetime
          from pathlib import Path
          
          STATE_FILE = '/data/lfa1_delta_state.json'
          
          def load_delta_state():
              """Load the last delta token from previous run."""
              if Path(STATE_FILE).exists():
                  with open(STATE_FILE, 'r') as f:
                      return json.load(f)
              return {'delta_token': '0', 'last_run': None}
          
          def save_delta_state(delta_token):
              """Save current delta token for next run."""
              state = {
                  'delta_token': delta_token,
                  'last_run': datetime.utcnow().isoformat()
              }
              with open(STATE_FILE, 'w') as f:
                  json.dump(state, f)
          
          def extract_lfa1_delta():
              """Extract LFA1 delta changes."""
              conn = pyrfc.Connection(
                  ashost='sap-prod.company.com',
                  sysnr='00', client='100',
                  user='EXTRACT_LFA1', passwd='<password>'
              )
              
              state = load_delta_state()
              
              result = conn.call(
                  'RODPS_REPL_ODP_EXTRACT',
                  SUBSCRIBER_NAME='PYTHON_LFA1_DELTA',
                  SUBSCRIBER_TYPE='2',
                  SUBSCRIBER_PROCESS='DELTA_LOAD',
                  DATA_AREA='ABAP_CDS',
                  ENTITY_NAME='I_Supplier',
                  DELTA_TOKEN=state['delta_token'],
                  MAX_RECORDS=10000,
                  FIELDS=[{'FIELDNAME': '*'}]
              )
              
              records = result.get('DATA', [])
              df = pd.DataFrame(records)
              
              new_delta_token = result.get('DELTA_TOKEN', state['delta_token'])
              
              print(f"LFA1 Delta: {len(df)} changed records")
              print(f"Previous delta token: {state['delta_token']}")
              print(f"New delta token: {new_delta_token}")
              
              if len(df) > 0:
                  # Write delta to S3 with timestamp
                  ts = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
                  s3 = boto3.client('s3')
                  
                  # Convert to Parquet
                  import pyarrow as pa
                  import pyarrow.parquet as pq
                  from io import BytesIO
                  
                  table = pa.Table.from_pandas(df)
                  buf = BytesIO()
                  pq.write_table(table, buf, compression='snappy')
                  buf.seek(0)
                  
                  s3.put_object(
                      Bucket='my-sap-landing-bucket',
                      Key=f'sap/lfa1/delta/{ts}/lfa1_delta.parquet',
                      Body=buf.getvalue()
                  )
              
              # Save new delta token for next run
              save_delta_state(new_delta_token)
              
              conn.close()
              return len(df)
          
          # Run extraction (call this hourly via cron or scheduler)
          rows_extracted = extract_lfa1_delta()
          print(f"Extraction complete: {rows_extracted} rows")
        language: python
        verify: "First run returns 0 (no changes since init). After manually changing a vendor in SAP (FK02), next run returns 1+ rows with the changed vendor."

  - tool: adf
    label: "Azure Data Factory — hourly delta schedule"
    steps:
      - title: "Set up scheduled pipeline trigger for hourly delta"
        explanation: "In ADF, create a pipeline with a Copy Activity pointing to I_Supplier with delta mode enabled. Attach a Scheduled Trigger set to run every hour. ADF automatically manages the delta token and incremental load state."
        verify: "Pipeline runs hourly. Each run shows 0–N rows depending on vendor changes in SAP. ODQMON shows subscription status active and queue depth increasing/decreasing with extraction frequency."

  - tool: databricks
    label: "Databricks — hourly delta extraction with Spark"
    steps:
      - title: "Extract LFA1 delta via Spark ODP connector with scheduled job"
        explanation: "Use Databricks Spark with an ODP connector to extract from I_Supplier in delta mode. Create a scheduled Databricks job that runs every hour. Each job run appends changed vendor rows to a Delta table, maintaining a full incremental history."
        verify: "Databricks job runs hourly. Delta table shows new rows appearing within minutes of vendor changes in SAP. Delta transaction log shows incremental appends on each run."

  - tool: fivetran
    label: "Fivetran — automatic hourly sync"
    steps:
      - title: "Configure Fivetran OData connector for hourly incremental sync"
        explanation: "Create a Fivetran connector to I_Supplier using OData source type. Set sync frequency to hourly. Fivetran automatically detects changes in the ODP delta queue and syncs only new/modified vendor records to your target warehouse."
        verify: "Fivetran connector syncs hourly automatically. Sync logs show incremental row counts (0–N per run). Target warehouse table contains cumulative vendor data with change tracking."

nextSteps:
  - label: "License trap: Runtime vs Full Use"
    url: "/articles/runtime-vs-full-use/"
updatedAt: 2026-04-22
---

## Scenario

Your procurement dashboard needs hourly vendor updates. You will implement ODP delta extraction for LFA1, test it with a controlled vendor change, and set up weekly full-load reconciliation to catch any missed changes.

---

## What you have confirmed

The SAP delta mechanism for I_Supplier is working. You can see delta changes appear in ODQMON within minutes of a vendor change, and you understand the subscription lifecycle and queue retention limits. Vendor master is now near-real-time.
