---
table: VBAK
level: intermediate
slug: vbak
title: "Extract VBAK with Delta and Z-Field (Intermediate)"
summary: "Full + delta extraction of VBAK with a custom Z-field (ZZ_REGION). Introduces delta queues in ODP, CDS extension views for Z-fields, and incremental load patterns."
estimatedMinutes: 60
prerequisites:
  - "Completed VBAK Beginner"
  - "Understanding of ODP delta concepts from glossary"
lcenseRelevance: "All license types. CDS extension views are application-layer."
destinations:
  - Snowflake
extractors:
  - Python
steps:
  - id: step-01
    title: "Verify the I_SalesDocument CDS extension view supports ZZ_REGION"
    explanation: "Your S/4HANA system has a custom Z-field ZZ_REGION on VBAK. Confirm the released CDS view I_SalesDocument includes this via an extension view or direct annotation."
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → I_SalesDocument"
      helpUrl: "https://help.sap.com/"
    verify: "I_SalesDocument or an associated extension view exposes ZZ_REGION as a field."

  - id: step-02
    title: "Understand ODP delta queues"
    explanation: "<a href='/glossary/odp/'>ODP</a> maintains delta queues for each context (CDS view). The queue tracks insert, update, delete operations. You'll request a delta using a timestamp or sequence number."
    sapTransaction:
      code: ODQMON
      menuPath: "Subscriptions → Search I_SalesDocument"
      helpUrl: "https://help.sap.com/"
    verify: "ODQMON shows an ODP subscription for I_SalesDocument with a delta queue active."

  - id: step-03
    title: "Set up Python environment with pyrfc"
    explanation: "Install pyrfc library for direct SAP RFC calls. This gives you finer control over delta requests than ADF's SAP CDC connector."
    codeBlock:
      language: bash
      content: |
        pip install pyrfc cryptography
        python -c "import pyrfc; print(pyrfc.__version__)"
      caption: "Install pyrfc and verify"
    verify: "pyrfc imports successfully in Python."

  - id: step-04
    title: "Create Python script for full load"
    explanation: "Write a Python script using pyrfc to call RFC_READ_TABLE on I_SalesDocument CDS view. Request all rows (no WHERE clause). Save to Parquet in Snowflake via pyodbc and pandas."
    codeBlock:
      language: python
      content: |
        from pyrfc import Connection
        import pandas as pd
        from snowflake.connector.pandas_tools import write_pandas
        
        conn = Connection(ashost='<SAP_HOST>', sysnr='00', client='100', user='EXTRACT_VBAK', passwd='<pwd>')
        
        query_result = conn.call('RFC_READ_TABLE', QUERY_TABLE='I_SalesDocument', ROWCOUNT=500000)
        df = pd.DataFrame(query_result['DATA'])
        
        sf_conn = snowflake.connector.connect(user='<sf_user>', password='<sf_pwd>', account='<account>')
        write_pandas(sf_conn, df, 'VBAK_FULL_LOAD', auto_create_table=True)
      caption: "Simplified full-load Python script"
    verify: "Script runs and data lands in Snowflake table VBAK_FULL_LOAD."

  - id: step-05
    title: "Capture baseline delta sequence number"
    explanation: "After full load completes, query ODQMON to capture the current ODP sequence number. You'll use this in the delta extract to only get new/changed rows."
    sapTransaction:
      code: ODQMON
      menuPath: "Subscriptions → I_SalesDocument → View Queue"
      helpUrl: "https://help.sap.com/"
    verify: "You note the ODP sequence number (e.g., 12345) as the baseline."

  - id: step-06
    title: "Implement incremental load logic"
    explanation: "Create a second Python script that calls ODP with the previous sequence number to fetch only changed rows. Store the updated sequence number for the next run."
    codeBlock:
      language: python
      content: |
        last_seq = 12345  # from baseline
        delta_result = conn.call('RS_DATASOURCE_DELTA', ..., LAST_SEQ=str(last_seq))
        new_seq = delta_result['NEXTSEQ']
        
        # Apply delta: insert new, update changed, delete removed
        # Store new_seq for next run
      caption: "Delta extraction pseudocode"
    verify: "Delta extraction runs and updates Snowflake with only changed rows."

  - id: step-07
    title: "Schedule daily delta runs"
    explanation: "Use AWS Lambda or a Snowflake task to run the delta extraction daily. Maintain state (last sequence number) in a Snowflake metadata table."
    verify: "Lambda function or Snowflake task executes on schedule and logs show daily delta runs."

  - id: step-08
    title: "Validate Z-field data (ZZ_REGION)"
    explanation: "Check that ZZ_REGION is present in the Snowflake table and contains expected values (e.g., 'EMEA', 'APAC', 'AMER')."
    verify: "SELECT DISTINCT ZZ_REGION FROM VBAK_FULL_LOAD returns expected regional values."

troubleshooting:
  - problem: "pyrfc connection fails with SNC_PARTNER_NOT_REACHED"
    solution: "SNC is enabled on the SAP system. Disable in the connection or configure SNC certificates on the Python machine."
  
  - problem: "Z-field ZZ_REGION is NULL in output"
    solution: "The CDS view may not expose the Z-field directly. Create a CDS extension view in SE80 that appends the Z-field, or extract VBAK raw table separately and join."

nextSteps:
  - label: "Try VBAK Expert — SLT push to Kafka"
    url: "/walkthrough/expert/vbak/"
  - label: "Glossary: Operational Data Provisioning delta"
    url: "/glossary/delta/"

seoTitle: "Extract VBAK with Delta & Z-Fields (Intermediate) — S/4HANA"
seoDescription: "Intermediate walkthrough for VBAK extraction with delta processing and custom Z-field support. Python/pyrfc + Snowflake. ODP delta queues and incremental load patterns."
updatedAt: 2026-04-22
---

## Scenario

Your analytics team now needs near-real-time sales data. Daily delta extracts are sufficient — you don't need sub-minute updates, but every morning's refresh should catch all yesterday's new and changed orders.

Additionally, your company has added a custom Z-field ZZ_REGION to sales documents (EMEA, APAC, AMER) for regional analysis. You'll update the extraction to include this field and implement delta processing.

Estimated time: 60 minutes.

---

## What you've built

You've built a full + delta extraction pattern using pyrfc and ODP delta queues. Your Snowflake table receives a daily update with only changed rows, keeping the data fresh and reducing extraction volume. The Z-field ZZ_REGION is now part of the data pipeline.

This pattern scales: as Z-fields multiply or business rules change, you'll adjust the CDS extension view or raw-table extraction, but the delta mechanism remains the same.
