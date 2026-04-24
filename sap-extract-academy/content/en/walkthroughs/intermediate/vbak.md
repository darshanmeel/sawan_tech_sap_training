---
table: VBAK
slug: vbak
title: "Extract VBAK with Delta and Z-Field"
summary: "SAP-side guide for VBAK extraction with delta processing and a custom Z-field. Covers ODP delta queue mechanics in ODQMON, CDS extension view creation in SE80 for Z-field inclusion, and checking delta subscription health."
estimatedMinutes: 60
prerequisites:
  - "Technical extraction user (System type) created in SU01 with S_RFC and S_ODP_READ authorizations"
  - "SAP S/4HANA access with SE16N and SE80 authorization"
licenseRelevance: "All license types. CDS extension views are application-layer. License trap: Runtime vs Full Use →"
destinations:
  - Generic
extractors:
  - ODP
method: odp
seoTitle: "Extract VBAK with Delta and Z-Field — SAP-Side Guide"
seoDescription: "SAP-side guide for VBAK with ODP delta and custom Z-field via CDS extension view. ODQMON subscription monitoring, delta queue mechanics."
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

toolSteps:
  - tool: custom
    label: "Custom (Python / pyrfc) — delta mode"
    steps:
      - title: "Run delta extraction after init-delta"
        explanation: "After the full load (see Beginner walkthrough), subsequent runs use SUBSCRIBER_PROCESS='DELTA_LOAD'. The first delta after init returns 0 records — this is normal per SAP Note 2884410."
        code: |
          import pyrfc
          import pandas as pd
          import boto3
          from io import StringIO, BytesIO
          import pyarrow as pa
          import pyarrow.parquet as pq
          from datetime import datetime

          conn = pyrfc.Connection(
              ashost='sap-prod.company.com',
              sysnr='00', client='100',
              user='EXTRACT_VBAK', passwd='<password>'
          )

          # Delta load — uses the same SUBSCRIBER_NAME as the full load
          result = conn.call(
              'RODPS_REPL_ODP_EXTRACT',
              SUBSCRIBER_NAME='PYTHON_VBAK_FULL',   # same name as init
              SUBSCRIBER_TYPE='2',
              SUBSCRIBER_PROCESS='DELTA_LOAD',       # changed from FULL_LOAD
              DATA_AREA='ABAP_CDS',
              ENTITY_NAME='ZI_SalesDocument_Ext',    # use extension view for Z-field
              MAX_RECORDS=100000,
              FIELDS=[{'FIELDNAME': '*'}]
          )

          records = result.get('DATA', [])
          df = pd.DataFrame(records)
          print(f"Delta: {len(df)} changed/new records")

          if len(df) > 0:
              # Write delta to S3 with timestamp partition
              ts = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
              s3 = boto3.client('s3')
              table = pa.Table.from_pandas(df)
              buf = BytesIO()
              pq.write_table(table, buf, compression='snappy')
              buf.seek(0)
              s3.put_object(
                  Bucket='my-sap-landing-bucket',
                  Key=f'sap/vbak/delta/{ts}/vbak_delta.parquet',
                  Body=buf.getvalue()
              )
        language: python
        verify: "First run after init returns 0 rows (expected). After posting a new order in SAP, next delta run returns 1+ rows containing that order."

      - title: "Include ZZ_REGION (Z-field) from extension view"
        explanation: "Switch ENTITY_NAME from I_SalesDocument to ZI_SalesDocument_Ext (the CDS extension view created in SAP-side step 03). The ZZ_REGION column now appears in the extracted records."
        code: |
          # Verify ZZ_REGION is present in the extracted DataFrame
          print("Columns:", list(df.columns))
          assert 'ZZ_REGION' in df.columns, "ZZ_REGION missing — check extension view activation"
          print("ZZ_REGION sample:", df['ZZ_REGION'].value_counts().head())
        language: python
        verify: "ZZ_REGION column appears in df.columns. Values match what SE16N shows for the same VBELN records."

  - tool: adf
    label: "Azure Data Factory — delta mode"
    steps:
      - title: "Add Change Data Capture mode to Copy Activity"
        explanation: "In the ADF Copy Activity source settings, change Extraction Mode from Full to Incremental. ADF will manage the delta watermark automatically using the ODP subscription registered in step 02 of the SAP-side flow. Point the source object at ZI_SalesDocument_Ext to include ZZ_REGION."
        verify: "Pipeline run shows Incremental mode. Row count equals number of changed records since last run (check ODQMON for expected count)."

  - tool: databricks
    label: "Databricks — daily delta extraction with Spark"
    steps:
      - title: "Extract VBAK delta via Spark ODP connector"
        explanation: "Use Databricks Spark with an ODP connector to extract from ZI_SalesDocument_Ext (the extension view with ZZ_REGION). Configure a scheduled Databricks job to run daily. Each run appends changed order records to a Delta table, maintaining full change history."
        verify: "Databricks job runs daily. Delta table shows new rows appearing after SAP posting activity. Row count per run equals number of changed orders detected in ODQMON."

  - tool: fivetran
    label: "Fivetran — daily delta sync"
    steps:
      - title: "Configure Fivetran OData connector for daily VBAK delta"
        explanation: "Create a Fivetran connector to ZI_SalesDocument_Ext using OData source type. Set sync frequency to daily. Fivetran detects changes via ODP and syncs only new/modified orders. Include ZZ_REGION in the column mapping."
        verify: "Fivetran syncs daily automatically. Target warehouse receives incremental order changes. ZZ_REGION values populated for new and changed orders."

nextSteps:
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
