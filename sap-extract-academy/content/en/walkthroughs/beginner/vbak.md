---
table: VBAK
level: beginner
slug: vbak
title: "Extract VBAK to ADLS (Beginner)"
summary: "Full-load extraction of the Sales Document Header from S/4HANA to ADLS Gen2 as Parquet files. Uses Azure Data Factory's SAP CDC connector with the released CDS view I_SalesDocument. No Z-fields, no delta — the simplest production-like scenario."
estimatedMinutes: 45
prerequisites:
  - "Access to an S/4HANA on-premise system with SE80 and authorization to create a technical user"
  - "An Azure subscription with rights to create Data Factory and Storage Account resources"
  - "A Windows VM or workstation for the Self-Hosted Integration Runtime (6 GB RAM minimum)"
licenseRelevance: "Works under both Full Use and Runtime SAP licenses. The ODP-based path used by ADF's SAP CDC connector is application-layer extraction, which is permitted under all license types."
destinations:
  - ADLS
extractors:
  - ADF
steps:
  - id: step-01
    title: "Confirm the released CDS view for VBAK"
    explanation: 'SAP ships released CDS views for many standard tables. These views come with business logic, authorization, and delta support built in — they are always the preferred extraction source over raw tables. For VBAK, the view is <a href="https://help.sap.com/">I_SalesDocument</a>.'
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → Search → I_SalesDocument"
      helpUrl: "https://help.sap.com/"
    verify: "You can open I_SalesDocument in SE80 and confirm it has the annotation @Analytics.dataExtract: true in its header."
    whyItMatters: 'Extracting from a released CDS view is the SAP-recommended approach. It respects authorization, applies business logic (currency translation, unit conversion), and exposes data through <a href="/glossary/odp/">ODP</a> cleanly. Reading VBAK directly skips all of this.'
  
  - id: step-02
    title: "Create a technical RFC user in SAP"
    explanation: 'The extraction process needs a dedicated SAP user with minimal permissions. Never use a dialog user. Create a Communication or System type user via <a href="https://help.sap.com/">SU01</a>.'
    sapTransaction:
      code: SU01
      menuPath: "User → Create"
      helpUrl: "https://help.sap.com/"
    codeBlock:
      language: plaintext
      content: |
        User name: EXTRACT_VBAK
        User type: System
        First name: Extract
        Last name: VBAK Service User
      caption: "Recommended user settings"
    verify: "The user EXTRACT_VBAK appears in SU01's user list and is locked for interactive login."

  - id: step-03
    title: "Assign authorizations to the RFC user"
    explanation: 'The user needs three authorization objects: <a href="https://help.sap.com/">S_RFC</a> (RFC call), S_TABU_DIS (table display), and S_ODP_READ (ODP read access).'
    sapTransaction:
      code: PFCG
      menuPath: "Role → Create → Authorizations"
      helpUrl: "https://help.sap.com/"
    verify: "In SU01, the EXTRACT_VBAK user has a single custom role assigned that grants S_RFC for RFC_TYPE=FUNC, S_TABU_DIS for authorization group SD, and S_ODP_READ for context ABAP_CDS."

  - id: step-04
    title: "Install the Self-Hosted Integration Runtime"
    explanation: "Azure Data Factory connects to SAP through a Self-Hosted Integration Runtime (SHIR) that runs on a Windows VM with network access to the SAP system. The SHIR also requires the SAP .NET Connector (NCo) 3.0 installed separately."
    verify: "In the ADF portal, the new SHIR shows Status: Running and the NCo 3.0 library is installed on the VM."
    whyItMatters: "SHIR is the bridge between Azure and your SAP system. Without it, ADF cannot reach SAP. Most extraction errors at this stage trace back to SHIR network rules or a missing NCo library."

  - id: step-05
    title: "Create an ADF linked service for SAP CDC"
    explanation: "In the Azure Data Factory studio, create a new linked service of type SAP CDC. Point it at your SAP system's application server hostname and system number. Use the EXTRACT_VBAK user credentials."
    codeBlock:
      language: json
      content: |
        {
          "name": "SAP_S4HANA_Source",
          "type": "SapOdpLinkedService",
          "typeProperties": {
            "server": "<YOUR_SAP_HOST>",
            "systemNumber": "00",
            "clientId": "100",
            "language": "EN",
            "userName": "EXTRACT_VBAK",
            "password": { "type": "SecureString", "value": "<SECURE>" },
            "connectVia": { "referenceName": "SHIR-name", "type": "IntegrationRuntimeReference" }
          }
        }
      caption: "Linked service JSON (replace placeholders)"
    verify: "The Test Connection button returns green in the ADF linked service editor."

  - id: step-06
    title: "Create the ADF source dataset"
    explanation: "Create a dataset on the linked service that targets the CDS view I_SalesDocument through ODP. ADF's SAP CDC connector handles the ODP subscription transparently."
    verify: "The dataset preview loads a sample of rows from I_SalesDocument with the expected VBAK columns (VBELN, AUART, VKORG, ERDAT, NETWR)."

  - id: step-07
    title: "Create the ADLS Gen2 storage and container"
    explanation: "In the Azure portal, create a Storage Account with hierarchical namespace enabled (ADLS Gen2). Create a container named sap-raw. Within it, create a folder path vbak/full-load/."
    verify: "The container sap-raw exists and you can browse to sap-raw/vbak/full-load/ in Azure Storage Explorer."

  - id: step-08
    title: "Create the ADF sink dataset"
    explanation: "Create a second dataset pointing at the ADLS container, format Parquet, compression Snappy. Set the file path to sap-raw/vbak/full-load/ and use a date-based file naming pattern."
    verify: "The sink dataset's Test Connection returns green and the file path is correct."

  - id: step-09
    title: "Build the ADF pipeline with a Copy activity"
    explanation: "Create a new pipeline. Add a Copy activity. Source = the SAP CDC dataset, Sink = the ADLS Parquet dataset. Configure Run mode = Full on Every Run for this first scenario. Save and publish the pipeline."
    verify: "The pipeline exists in Published state in ADF and has no validation errors."

  - id: step-10
    title: "Run the pipeline and verify data in ADLS"
    explanation: "Trigger the pipeline with Trigger Now. Monitor progress in the Monitor tab. When complete, browse to the ADLS container and confirm one or more Parquet files exist containing VBAK data."
    verify: "At least one Parquet file exists under sap-raw/vbak/full-load/. Opening it with a tool like Azure Data Studio or a pandas notebook shows rows with VBAK columns and a row count that roughly matches the table count from SE16N."
    whyItMatters: "Row count reconciliation between SAP (via SE16N) and the target (via Parquet file count) is the most important verification in any extraction. Always reconcile after the initial load."

troubleshooting:
  - problem: "Linked service Test Connection fails with SAP SNC error"
    solution: "SNC (Secure Network Communication) is a TLS layer for SAP RFC. Either disable SNC in the linked service if your SAP system allows plaintext on the RFC port, or configure SNC with a certificate. For beginner scenarios, plaintext within a secure network is acceptable."
    sapNoteUrl: "https://launchpad.support.sap.com/#/notes/2362078"
  
  - problem: "Pipeline fails with SAP_ODP_AUTHORIZATION_MISSING"
    solution: "The EXTRACT_VBAK user lacks S_ODP_READ for context ABAP_CDS. Return to PFCG and add this authorization with parameter ODPSOURCE = ABAP_CDS."
  
  - problem: "Parquet files are empty (0 rows written)"
    solution: "The CDS view filter likely excluded all rows. Check the ADF dataset's filter settings. For a full load, there should be no WHERE clause."

nextSteps:
  - label: "Try the VBAK Intermediate walkthrough — adds delta and one Z-field"
    url: "/walkthrough/intermediate/vbak/"
  - label: "Read: Why Reading ACDOCA Directly Breaks Your SAP System"
    url: "/articles/why-acdoca-breaks-sap/"
  - label: "Glossary: Operational Data Provisioning (ODP)"
    url: "/glossary/odp/"

seoTitle: "Extract VBAK to ADLS Parquet (Beginner) — S/4HANA Walkthrough"
seoDescription: "Step-by-step beginner walkthrough for extracting VBAK (sales document header) from SAP S/4HANA to Azure Data Lake Storage Gen2 using ADF and the released CDS view."
updatedAt: 2026-04-22
---

## Scenario

Your team's finance analytics project needs sales order data in the data lake. Specifically, they want the header record for every sales order — orders, quotations, contracts — loaded into ADLS Gen2 as Parquet. This is the classic first SAP extraction task.

You've been handed access to an S/4HANA on-premise system and an Azure subscription. No Z-fields, no delta, no tight SLA — just get the data out correctly and hand it to the analytics team. This walkthrough covers every step from SAP authorization to a successful row-count reconciliation.

If you complete this in one sitting, budget about 45 minutes. If this is your first time touching SAP, add an hour for navigating the screens.

---

## What you've built

You now have a working extraction pipeline from S/4HANA's sales document header to an Azure Data Lake. Every row of VBAK, accessed through the released CDS view I_SalesDocument, lands in Parquet files under a predictable folder structure. Row count reconciliation confirms nothing was dropped.

The patterns you've learned — released CDS views, technical RFC users with minimum authorizations, ADF SAP CDC connector, ADLS Parquet with date-partitioned folders — are the foundation for every S/4HANA extraction you'll build next. When you're ready, the intermediate walkthrough for VBAK adds delta processing and introduces CDS extension views for Z-fields.
