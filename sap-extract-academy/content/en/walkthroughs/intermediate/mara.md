---
table: MARA
slug: mara
title: "Extract MARA with Z-Fields via CDS Extension"
summary: "SAP-side guide for MARA extraction with custom Z-fields. Covers identifying Z-fields in SE11 Append Structures, creating a CDS extension view in SE80, confirming the extension view activates cleanly, and verifying Z-field values with SE16N."
estimatedMinutes: 60
prerequisites:
  - "SE80 familiarity — you can open and read a CDS view"
  - "Access to SE11 to inspect table field lists"
  - "Technical extraction user (System type) created in SU01 with S_RFC and S_ODP_READ authorizations"
licenseRelevance: "All licenses. CDS extension views are application-layer. License trap: Runtime vs Full Use →"
destinations:
  - Generic
extractors:
  - ODP
method: odp
seoTitle: "Extract MARA with Z-Fields via CDS Extension — SAP-Side Intermediate"
seoDescription: "SAP-side guide for MARA Z-field extraction. SE11 Append Structure identification, CDS extension view creation in SE80, Z-field validation with SE16N."
steps:
  - id: step-01
    title: "Identify Z-fields in MARA via SE11"
    explanation: 'Your MARA table carries custom Z-fields added through Append Structures. Open <a href="https://help.sap.com/">SE11</a>, display the MARA table definition, and scroll to the field list. Append Structure fields are grouped separately. In this walkthrough, the target Z-fields are ZZ_BRAND (20-char) and ZZ_SUSTAINABILITY (1-char).'
    sapTransaction:
      code: SE11
      menuPath: "Data Dictionary → Database Tables → MARA → Display → Fields → Find Z*"
      helpUrl: "https://help.sap.com/"
    verify: "ZZ_BRAND (CHAR 20) and ZZ_SUSTAINABILITY (CHAR 1) appear in the MARA field list under an Append Structure entry."
    whyItMatters: "Z-fields in Append Structures are part of the physical table but are not visible in the standard released CDS view. You must expose them explicitly. Knowing the exact field names and data types before creating the extension view prevents activation errors."

  - id: step-02
    title: "Check that the Append Structure has data"
    explanation: 'Use <a href="https://help.sap.com/">SE16N</a> to browse MARA rows and confirm that ZZ_BRAND contains expected values. If all values are empty (initial), the Z-field may not yet be populated from the upstream business process. Extracting empty Z-fields is harmless but produces no analytical value.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → MARA → Add column ZZ_BRAND → Browse sample rows"
      helpUrl: "https://help.sap.com/"
    verify: "ZZ_BRAND contains non-initial values for at least a subset of materials. You know what expected values look like (e.g., 'PREMIUM', 'STANDARD')."

  - id: step-03
    title: "Create a CDS extension view to expose Z-fields"
    explanation: 'In <a href="https://help.sap.com/">SE80</a> or ABAP Development Tools (ADT), create an extension view that adds ZZ_BRAND and ZZ_SUSTAINABILITY to I_Product. The extension view must carry <code>@AccessControl.authorizationCheck: #CHECK</code> — without it, unauthorized users can read the Z-fields. Activate the view and verify it has no syntax errors.'
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → Create → CDS View Extension"
      helpUrl: "https://help.sap.com/"
    codeBlock:
      language: abap
      content: |
        @AccessControl.authorizationCheck: #CHECK
        @Analytics.dataExtract: true
        extend view I_Product with ZPROD_ZFIELDS {
          mara.ZZ_BRAND,
          mara.ZZ_SUSTAINABILITY
        }
      caption: "Reference: CDS extension view for MARA Z-fields — adjust names to match your system"
    verify: "ZPROD_ZFIELDS is active in SE80. Activation log shows no errors. The base view I_Product is not modified."

  - id: step-04
    title: "Verify the extension view returns Z-field data"
    explanation: 'From <a href="https://help.sap.com/">SE80</a>, run a data preview on ZPROD_ZFIELDS and confirm ZZ_BRAND and ZZ_SUSTAINABILITY values appear alongside standard MARA fields.'
    sapTransaction:
      code: SE80
      menuPath: "ZPROD_ZFIELDS → Data Preview"
      helpUrl: "https://help.sap.com/"
    verify: "Preview shows MATNR, MTART, ZZ_BRAND, ZZ_SUSTAINABILITY columns with expected values."

  - id: step-05
    title: "Cross-check Z-field values with SE16N after extraction"
    explanation: 'After extraction, pick a sample of MATNR values and compare ZZ_BRAND values in your target system against the SE16N MARA values for the same material numbers.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → MARA → Show ZZ_BRAND for sample MATNR"
      helpUrl: "https://help.sap.com/"
    verify: "ZZ_BRAND values in target match ZZ_BRAND values in SE16N for the same MATNR records."

troubleshooting:
  - problem: "CDS extension view activation fails with syntax error"
    solution: "Check the exact syntax against your ABAP CDS documentation. Common issues: missing @AccessControl annotation, incorrect field name (must match SE11 exactly), using MARA. prefix when the table alias is different in I_Product. Check the activation log in SE80 for the specific error message."

  - problem: "Z-field values are empty in extraction output but not in SE16N"
    solution: "The extension view may be pointing to the wrong table alias. In SE80, inspect I_Product's FROM clause to find the alias used for MARA rows. Use that alias in the extension view (e.g., if I_Product uses alias 'prod', use 'prod.ZZ_BRAND' not 'mara.ZZ_BRAND')."

toolSteps:
  - tool: custom
    label: "Custom (Python / pyrfc) — full load with Z-fields"
    steps:
      - title: "Extract MARA with Z-fields via extension view"
        explanation: "Use pyrfc to extract from ZPROD_ZFIELDS (the extension view you created in SAP-side step 03). The Z-fields ZZ_BRAND and ZZ_SUSTAINABILITY now appear in the extracted DataFrame."
        code: |
          import pyrfc
          import pandas as pd
          import boto3
          from io import BytesIO
          import pyarrow.parquet as pq
          import pyarrow as pa
          
          conn = pyrfc.Connection(
              ashost='sap-prod.company.com',
              sysnr='00', client='100',
              user='EXTRACT_MARA', passwd='<password>'
          )
          
          # Full load extraction using extension view with Z-fields
          result = conn.call(
              'RODPS_REPL_ODP_EXTRACT',
              SUBSCRIBER_NAME='PYTHON_MARA_FULL',
              SUBSCRIBER_TYPE='2',
              SUBSCRIBER_PROCESS='FULL_LOAD',
              DATA_AREA='ABAP_CDS',
              ENTITY_NAME='ZPROD_ZFIELDS',  # Extension view with Z-fields
              MAX_RECORDS=100000,
              FIELDS=[{'FIELDNAME': '*'}]  # All fields including ZZ_BRAND, ZZ_SUSTAINABILITY
          )
          
          records = result.get('DATA', [])
          df = pd.DataFrame(records)
          
          print(f"MARA: {len(df)} rows extracted")
          print(f"Columns: {list(df.columns)}")
          
          # Verify Z-fields are present
          assert 'ZZ_BRAND' in df.columns, "ZZ_BRAND missing from extraction"
          assert 'ZZ_SUSTAINABILITY' in df.columns, "ZZ_SUSTAINABILITY missing from extraction"
          
          print(f"ZZ_BRAND sample values: {df['ZZ_BRAND'].value_counts().head()}")
          print(f"ZZ_SUSTAINABILITY sample values: {df['ZZ_SUSTAINABILITY'].value_counts()}")
          
          # Write to S3 with Z-field validation
          s3 = boto3.client('s3')
          table = pa.Table.from_pandas(df)
          buf = BytesIO()
          pq.write_table(table, buf, compression='snappy')
          buf.seek(0)
          s3.put_object(
              Bucket='my-sap-landing-bucket',
              Key=f'sap/mara/full/mara_with_zfields.parquet',
              Body=buf.getvalue()
          )
          
          conn.close()
        language: python
        verify: "ZZ_BRAND and ZZ_SUSTAINABILITY columns appear in the extracted DataFrame. Z-field values match values from SE16N MARA for the same MATNR records."

  - tool: adf
    label: "Azure Data Factory — full load with extension view"
    steps:
      - title: "Configure source to use ZPROD_ZFIELDS extension view"
        explanation: "In ADF Copy Activity, set the source OData service to point to ZPROD_ZFIELDS instead of the base I_Product. All fields including ZZ_BRAND and ZZ_SUSTAINABILITY are now available. Write directly to Azure Data Lake Storage or Synapse table."
        verify: "Pipeline output includes MATNR, MTART, ZZ_BRAND, and ZZ_SUSTAINABILITY columns. Z-field values appear in the target dataset."

  - tool: databricks
    label: "Databricks — full load with Spark"
    steps:
      - title: "Extract MARA via Spark OData connector"
        explanation: "Use Databricks Spark with an ODP/OData connector to extract from ZPROD_ZFIELDS (or I_Product if no Z-fields are needed). Write the resulting DataFrame as a Delta table in Databricks, partitioned by common filter columns if needed."
        verify: "Delta table created in Databricks with all MARA columns including Z-fields. SELECT COUNT(*) matches SE16N row count."

  - tool: fivetran
    label: "Fivetran — scheduled full load"
    steps:
      - title: "Configure Fivetran OData connector for MARA with Z-fields"
        explanation: "In Fivetran, create a connector to ZPROD_ZFIELDS (or I_Product) using OData source type. Configure schedule for daily or weekly full-load syncs. Fivetran will detect the extension view automatically and include all Z-field columns in the schema."
        verify: "Fivetran connector syncs successfully. Target warehouse table includes MATNR, MTART, ZZ_BRAND, ZZ_SUSTAINABILITY columns. Row count matches SE16N."

nextSteps:
  - label: "License trap: Runtime vs Full Use"
    url: "/articles/runtime-vs-full-use/"
updatedAt: 2026-04-22
---

<div class="callout info">
<strong>Applies to other tables too.</strong> The same patterns work for any SAP table — replace <code>MARA</code> (and its CDS view <code>I_Product</code>) in the code below with the table and view you want. Master data like MARA and LFA1 usually extracts in a single pass without partitioning; transactional tables need a partition key (<code>BUKRS + GJAHR</code> for ACDOCA, <code>BUKRS + BUDAT</code> for BKPF, <code>VKORG + ERDAT</code> for VBAK). The ODP / SLT / RFC mechanics are identical. See <a href="/tables/">the table directory</a> for the full list and each table's recommended strategy.
</div>

## Scenario

Your company extended MARA with Z-fields for brand and sustainability tracking. You need these fields in the data warehouse without modifying the released CDS view.

This walkthrough covers the SAP-side work: identifying Z-fields in SE11, creating a CDS extension view, and verifying the Z-field data is correctly exposed. Your tool team points the extraction at the extension view instead of the base I_Product view.

---

## What you have confirmed

You have created and activated a CDS extension view that exposes MARA Z-fields, confirmed the Z-field values look correct in SE80 data preview, and cross-checked against SE16N. The data warehouse now includes brand and sustainability dimensions in the next extraction run.
