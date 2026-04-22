---
table: ACDOCA
level: beginner
slug: acdoca
title: "Extract ACDOCA to Your Cloud Platform (Beginner)"
summary: "Full-load extraction of ACDOCA from S/4HANA to any cloud platform using ODP via the released CDS view I_JournalEntryItem. Partitioned by fiscal year to keep the extract manageable. Tool-agnostic — the same configuration works in ADF, Fivetran, Qlik, Matillion, and any tool that supports ODP/ABAP_CDS."
estimatedMinutes: 15
prerequisites:
  - "Access to an S/4HANA on-premise system (not ECC — ACDOCA is S/4HANA only)"
  - "A technical SAP user account you control, or a BASIS team contact who can create one"
  - "An extraction tool that supports ODP with context ABAP_CDS (ADF SAP CDC, Qlik Replicate, Fivetran, Matillion, etc.)"
  - "Write access to your cloud platform's raw/landing zone"
licenseRelevance: "IMPORTANT — Read SAP Note 3255746 before choosing your extraction tool. SAP updated this note in February 2024 (version 4): ODP via RFC is no longer permitted. This affects ADF SAP CDC connector, Qlik Replicate, Fivetran ODP connector, and most third-party tools. The compliant paths are: ODP via OData (slower, ~10x), SLT replication (separate license), or SAP Datasphere. If your tool uses RFC to call ODP, confirm the status with your SAP account executive before going live. Full note at: https://support.sap.com/notes/3255746 (SAP login required)"
destinations:
  - Generic Cloud
extractors:
  - ODP/CDS
steps:
  - id: step-01
    title: "Understand what you're about to extract"
    explanation: "ACDOCA is SAP's Universal Journal — the single table that stores every financial posting in S/4HANA. It replaced BSEG (GL line items), COEP (CO postings), and several other FI/CO tables. Every GL entry, every cost center posting, every internal order settlement lands here. At a mid-size enterprise ACDOCA has 500M rows. At a large one it has 3B+ rows. You are not extracting a small table. This is manageable if you do it right. It is a problem if you do it wrong."
    verify: "You understand: ACDOCA exists only in S/4HANA (not ECC). On ECC, use BSEG + 0FI_GL_50 extractor instead. Confirm with your BASIS team which system type you're connecting to before proceeding."
    whyItMatters: "Connecting to an ECC system and searching for ACDOCA will return 0 rows — the table schema exists in ECC for compatibility but is always empty. If your first extract returns 0 rows, check the system type first."

  - id: step-02
    title: "Understand why SELECT * is not an option"
    explanation: "Three reasons you cannot do a direct table read on ACDOCA. First: size. A 1B-row extract in one request will run for hours and put significant load on your SAP system's dialog work processes — your BASIS team will terminate it. [SME_KNOWLEDGE] Second: license. Direct table read of ACDOCA via RFC (e.g. RFC_READ_TABLE) requires Full Use license. If you're on Runtime Use license, you are blocked at the authorization level. Third: correctness. ACDOCA stores amounts in multiple currency fields (HSL, KSL, MSL, TSL, WSL) that only make sense with their paired currency code fields. The released CDS view handles these correctly via @Semantics annotations. A raw table read does not. The safe path: ODP via CDS view I_JournalEntryItem."
    verify: "You will not use RFC_READ_TABLE on ACDOCA. RFC_READ_TABLE is explicitly not intended for productive use ([SAP Note 382318](https://support.sap.com/notes/382318)) and will either be blocked by authorization (Runtime license) or will cause visible system slowdown."
    whyItMatters: "This is not a theoretical concern. RFC_READ_TABLE on ACDOCA is blocked for Runtime Use license holders by authorization. For Full Use license holders, it still runs but puts serious load on the SAP application server. Note 382318 documents that RFC_READ_TABLE is not for production use."

  - id: step-03
    title: "Check your license and talk to your BASIS team"
    explanation: "Before touching your extraction tool, confirm these five items with your BASIS team. This is a checklist, not a lecture — email it to them."
    codeBlock:
      language: plaintext
      content: |
        BASIS CHECKLIST — ACDOCA Extraction Setup

        1. LICENSE
           Confirm Runtime Use License covers ODP via CDS extraction.
           If your tool connects via RFC to call ODP, confirm Note 3255746
           compliance status with your SAP account executive.
           Note 3255746 (Feb 2024): RFC-based ODP no longer permitted.
           Compliant alternative: ODP via OData, or SLT replication.

        2. RFC DESTINATION
           Provide the RFC destination name for this system.
           (SAP transaction SM59 → R/3 Connections → find the system)

        3. S_RFC AUTHORIZATION
           Extraction user needs S_RFC with:
             RFC_TYPE = FUNC
             RFC_NAME = RFCPING, DDIF_FIELDINFO_GET, /SAPDS/RFC_READ_TABLE2

        4. S_ODP_READ AUTHORIZATION
           Extraction user needs S_ODP_READ with:
             ODPSOURCE_TYPE = ABAP_CDS
             ODPSOURCE = I_JOURNALENTRYITEM (or * for all CDS)
             ODPCONTEXT = ABAP_CDS

        5. ODQMON ACCESS
           Request read access to transaction ODQMON
           so you can monitor delta queues after extraction runs.
      caption: "Send this to your BASIS team before starting configuration"
    verify: "Your extraction user can log in to the SAP system, and your BASIS team has confirmed S_RFC and S_ODP_READ are assigned. Ask them to run SU01 → your username → Authorizations and confirm both objects are present."
    whyItMatters: "Missing S_ODP_READ with context ABAP_CDS is the most common cause of failed ACDOCA extractions. The error message varies by tool but often looks like SAP_ODP_AUTHORIZATION_MISSING or simply returns 0 rows without an error. [SME_KNOWLEDGE]"

  - id: step-04
    title: "Find and verify I_JournalEntryItem in SAP"
    explanation: "Log in to your SAP system and open SE80 (ABAP Workbench) or ADT (SAP ABAP Development Tools in Eclipse). Search for the CDS view I_JournalEntryItem. You are looking for two things: the view exists and is active, and it carries extraction annotations enabling ODP consumption."
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → Other Objects → select 'CDS Entity' → enter I_JournalEntryItem → press Enter → switch to Source Code tab"
      helpUrl: "[NEEDS_SAP_CITATION]"
    codeBlock:
      language: abap
      content: |
        -- In SE80: after opening I_JournalEntryItem, switch to the
        -- "Source Code" tab and look for these annotations near the top:

        -- This annotation enables ODP extraction of this view:
        @Analytics.dataExtraction.enabled: true

        -- This annotation enables delta (CDC) extraction:
        @Analytics.dataExtraction.delta.changeDataCapture.automatic: true

        -- If you see both, the view supports full + delta ODP extraction.
        -- If only the first is present, full extraction works but delta does not.
        -- If neither is present, this view is not ODP-enabled on your system.
      caption: "Annotations to verify in SE80 source view — source: wiki/concepts/CDS_views.md"
    verify: "I_JournalEntryItem opens in SE80 without error and the @Analytics.dataExtraction.enabled annotation is present. If the view does not exist or has no annotation, your S/4HANA release may not include this view — confirm with BASIS. On S/4HANA on-prem, use I_JournalEntryItem. On S/4HANA Cloud, this view is confirmed released. Delta behavior documented in [SAP Note 2884410](https://support.sap.com/notes/2884410)."
    whyItMatters: "Some S/4HANA releases or SPS levels have I_JournalEntryItem deactivated or use a different CDS view. Confirming in SE80 before tool configuration saves hours of debugging later. [SME_KNOWLEDGE] The safer confirmed on-prem extractor path is 0FI_ACDOCA_10 via SAPI context — if I_JournalEntryItem is not available on your system, use that instead."

  - id: step-05
    title: "Select your initial fields"
    explanation: "For your first extraction, start with the core financial fields only. Add currency fields, extension fields, and segment fields in the Intermediate walkthrough once you have the pipeline working."
    codeBlock:
      language: plaintext
      content: |
        FIELDS TO INCLUDE IN INITIAL EXTRACT:

        MANDT      -- Client (filter this = your client number, e.g. 100)
        RLDNR      -- Ledger (0L = leading ledger)
        RBUKRS     -- Company Code
        GJAHR      -- Fiscal Year  ← your partition key
        BELNR      -- Accounting Document Number
        DOCLN      -- Document Line Item
        BLART      -- Document Type
        BUDAT      -- Posting Date
        RACCT      -- Account Number (G/L Account)
        PRCTR      -- Profit Center
        KOSTL      -- Cost Center
        WAERS      -- Transaction Currency
        RHCUR      -- Company Code Currency
        HSL        -- Amount in Company Code Currency
        KSL        -- Amount in Global Currency

        FIELDS TO SKIP FOR NOW (add in Intermediate):
        TSL, WSL, MSL  -- Additional currency amounts (confusing without context)
        ZZFIELD*       -- Customer Z-fields (require CDS Extension View understanding)
        SEGMENT fields -- PSEGMENT, RFAREA (segment reporting — add later)
      caption: "Starting field selection for ACDOCA beginner extract — source: wiki/tables/ACDOCA.md"
    verify: "You have a field list of ~15 fields. You have excluded all Z-fields (ZZFIELD*, ZFIELD*) and secondary currency amounts (TSL, WSL, MSL) for now."
    whyItMatters: "I_JournalEntryItem exposes 200+ fields. Extracting all of them on a 1B-row table creates a very wide, very slow extract. [SME_KNOWLEDGE] Start narrow — add fields as analytics teams ask for them."

  - id: step-06
    title: "Set up partitioning — the single most important step"
    explanation: "Never extract all of ACDOCA in one request. Partition by GJAHR (fiscal year) and optionally RBUKRS (company code). Start with the current fiscal year and a single company code. This is not optional — an unpartitioned ACDOCA extract at a large enterprise will consume SAP dialog work processes for hours and trigger BASIS team intervention."
    codeBlock:
      language: sql
      content: |
        -- Your extraction tool will expose ODP filters as a WHERE clause.
        -- For your first run, use this filter:

        GJAHR = '2024' AND RBUKRS = '1000'

        -- Expected row count at a mid-size enterprise: 5M to 50M rows
        -- Expected row count at a large enterprise: 50M to 200M rows per year
        -- If your first extract returns > 200M rows on one year + company code,
        -- split further by BUDAT (posting date) quarter.

        -- DO NOT run without a GJAHR filter.
        -- DO NOT use GJAHR as an integer — it is VARCHAR(4) in SAP.
        --   GJAHR = '2024'   ✓ correct
        --   GJAHR = 2024     ✗ will return 0 rows or error in most tools
      caption: "ODP filter for ACDOCA initial extract — replace with your values"
    verify: "Your extraction tool shows a GJAHR filter value set to a string (quoted year, e.g. '2024') and a RBUKRS filter set to your company code. If your system has one company code, RBUKRS filter is optional but still recommended for the first run."
    whyItMatters: "GJAHR partitioning is the standard approach for ACDOCA initial load. [SME_KNOWLEDGE] Load year by year: historical years as a one-time full load, current year with delta afterwards. This maps naturally to how finance teams consume the data — by fiscal year."

  - id: step-07
    title: "Configure your extraction tool"
    explanation: "In whatever tool you are using (ADF SAP CDC, Qlik, Fivetran, Matillion, custom client), configure the ODP source with these exact settings. Pay attention to the delta type — ABAP_CDS uses CDC (Change Data Capture), not AIE. This is a common misconfiguration."
    codeBlock:
      language: plaintext
      content: |
        ODP CONFIGURATION — ACDOCA Beginner Extract

        ODP Context:     ABAP_CDS
        Object Name:     I_JournalEntryItem
        Delta Type:      CDC  (Change Data Capture — correct for ABAP_CDS context)
                         NOTE: AIE is the delta type for SAPI extractor context,
                         not ABAP_CDS. If your tool only shows AIE, check your
                         ODP context — it may be set to SAPI instead of ABAP_CDS.
        Extraction Mode: Full (for first run)
        RFC Destination: <provided by BASIS team from SM59>

        Filter:
          GJAHR = '2024'          (string, not integer)
          RBUKRS = '1000'         (replace with your company code)

        Field Selection:
          Use the field list from Step 5.
          If your tool requires explicit field selection, enter each field.
          If your tool selects all fields by default, create an exclusion list.

        LICENSE COMPLIANCE — SAP Note 3255746 (Feb 2024):
          If your tool connects via RFC to call ODP (most tools do),
          RFC-based ODP is no longer permitted per SAP's updated terms.
          Full note: https://support.sap.com/notes/3255746
          Compliant alternatives:
            - ODP via OData (same configuration, ~10x slower)
            - SLT replication (separate license, real-time capable)
          Review with your SAP account executive before go-live.
      caption: "Exact ODP settings — copy to your tool's configuration"
    verify: "Your tool shows ODP context ABAP_CDS, object I_JournalEntryItem, delta type CDC, and the filter fields. The test connection succeeds. If it fails with an authorization error, return to Step 3 and recheck S_ODP_READ."
    whyItMatters: "ABAP_CDS is the exact string — not 'CDS', not 'ODP_CDS', not 'ABAP CDS'. Most tools present a dropdown. If you do not see ABAP_CDS as an option, your tool version may not support CDS-based ODP. Check vendor documentation. The delta type CDC distinction matters: using AIE on an ABAP_CDS source will produce incorrect delta behavior. [SME_KNOWLEDGE]"

  - id: step-08
    title: "Run your first extract and monitor in ODQMON"
    explanation: "Trigger the extraction. While it runs, open ODQMON in SAP to watch the delta queue. This is how you monitor every ACDOCA extraction — know how to read it before your first production run."
    sapTransaction:
      code: ODQMON
      menuPath: "Enter ODQMON in transaction code bar → Context: ABAP_CDS → Queue Name: I_JOURNALENTRYITEM → Subscriber: your tool's subscription name → F8 to execute"
      helpUrl: "[NEEDS_SAP_CITATION]"
    codeBlock:
      language: plaintext
      content: |
        ODQMON — WHAT YOU'RE LOOKING FOR

        Status: FETCHING      → extract is running, rows are being sent
        Status: EXTRACTED     → extract complete, ready for next delta
        Status: INITIALIZED   → subscription initialized, no data fetched yet
        Status: ERROR         → something failed, check the Details column

        IMPORTANT — FIRST DELTA AFTER INIT RETURNS 0 RECORDS:
        After your first full extraction (init), the next delta run will
        return 0 records. This is NORMAL, not a bug.
        The CDC mechanism captures changes from the init point forward.
        The delta after that 0-record run will contain actual changes.
        Source: SAP Note 2884410 (https://support.sap.com/notes/2884410)

        STUCK QUEUE — one-line fix:
        If status stays FETCHING for > 30 min on a small extract,
        the subscription may be stuck. In ODQMON, select the subscription
        and choose Edit → Reset Delta → confirm. Then re-trigger extraction.
        Warning: Reset forces the next run to be a full load.

        Row count check:
        ODQMON shows "Extracted Units" — this is the row count sent.
        Compare to SE16N count for ACDOCA WHERE GJAHR = '2024'
        AND RBUKRS = '1000'. They should match within ~1% (timing skew).
      caption: "ODQMON reading guide for ACDOCA extraction"
    verify: "ODQMON shows status EXTRACTED after the run completes. The Extracted Units count is non-zero and plausible for your filter (5M to 200M rows per fiscal year is normal; < 10K rows suggests the filter excluded almost everything — recheck GJAHR format is a quoted string)."
    whyItMatters: "ODQMON is your primary debugging tool for all ODP extractions. If you do not know how to read it, the first stuck queue will cost hours. The 0-record first delta is the most common 'bug' that isn't a bug — knowing this upfront prevents a false alarm escalation. [SME_KNOWLEDGE]"

  - id: step-09
    title: "Load into your cloud platform — data type guidance"
    explanation: "When creating your target table schema, SAP field types do not map cleanly to SQL or cloud data types. ACDOCA has several fields where the wrong data type causes subtle bugs that are hard to find later."
    codeBlock:
      language: sql
      content: |
        -- ACDOCA target table: recommended data types

        MANDT      VARCHAR(3)        -- not INTEGER
        RLDNR      VARCHAR(2)        -- ledger, e.g. '0L'
        RBUKRS     VARCHAR(4)        -- company code, e.g. '1000'
        GJAHR      VARCHAR(4)        -- NOT INTEGER — '2024' not 2024
        BELNR      VARCHAR(10)       -- document number, leading zeros matter
        DOCLN      VARCHAR(6)        -- line item, leading zeros matter
        BLART      VARCHAR(2)        -- document type
        BUDAT      DATE              -- SAP sends YYYYMMDD, most tools convert
        RACCT      VARCHAR(10)       -- G/L account, leading zeros matter
        PRCTR      VARCHAR(10)       -- profit center
        KOSTL      VARCHAR(10)       -- cost center
        WAERS      VARCHAR(5)        -- transaction currency code, NOT DECIMAL
        RHCUR      VARCHAR(5)        -- company code currency code, NOT DECIMAL
        HSL        DECIMAL(23, 2)    -- amount in company code currency
        KSL        DECIMAL(23, 2)    -- amount in global currency

        -- PARTITIONING (cloud platform specific):
        --   Partition by: GJAHR
        --   Cluster/sort by: RBUKRS, RACCT
        --   This aligns with how analysts typically filter the data

        -- CRITICAL: Currency CODE fields (WAERS, RHCUR) are VARCHAR not DECIMAL.
        -- They contain values like 'USD', 'EUR', 'GBP'.
        -- Currency AMOUNT fields (HSL, KSL) are DECIMAL.
        -- Confusing the two causes silent data loss.
      caption: "Target table schema — ACDOCA on any cloud platform"
    verify: "Your target table exists with GJAHR as VARCHAR(4) and WAERS as VARCHAR(5). Run a SELECT DISTINCT GJAHR FROM your_table — the result should be '2024', a four-character string. If you see 2024 as an integer, the type is wrong and leading-zero fiscal years will be corrupted."
    whyItMatters: "GJAHR as INTEGER seems harmless but breaks fiscal year comparisons — SAP uses '0001' for fiscal year 1 in some configurations, leading zeros in document numbers (BELNR) are significant for matching back to SAP, and partition pruning fails in Snowflake and BigQuery when analysts filter WHERE GJAHR = '2024' on an INTEGER column. [SME_KNOWLEDGE]"

nextSteps:
  - label: "ACDOCA Intermediate — adding delta loads and Z-fields"
    url: "/walkthrough/intermediate/acdoca/"
  - label: "ACDOCA Expert — SLT real-time replication"
    url: "/walkthrough/expert/acdoca/"
  - label: "Glossary: Operational Data Provisioning (ODP)"
    url: "/glossary/odp/"
  - label: "Glossary: ODQMON — the delta queue monitor"
    url: "/glossary/odqmon/"
  - label: "Article: Why Reading ACDOCA Directly Breaks Your SAP System"
    url: "/articles/why-acdoca-breaks-sap/"

troubleshooting:
  - problem: "Extract returns 0 rows"
    solution: "Check three things in order: (1) GJAHR filter — confirm it is a string value in quotes, not an integer. (2) RBUKRS — confirm the company code exists in this system. Run SE16N on ACDOCA with your filter to verify row count directly in SAP. (3) S_ODP_READ authorization — missing this returns 0 rows silently in some tools."

  - problem: "Tool returns SAP_ODP_AUTHORIZATION_MISSING"
    solution: "Return to Step 3. The extraction user needs S_ODP_READ with ODPCONTEXT = ABAP_CDS and ODPSOURCE = I_JOURNALENTRYITEM (or * for all sources). Ask BASIS to add this in PFCG and regenerate the user's profile."

  - problem: "ODQMON shows ERROR status"
    solution: "In ODQMON, select the affected subscription and choose Details — the error message is usually specific. Common causes: (1) RFC connection timeout — check SM59 for the RFC destination status. (2) Memory exceeded — your filter is not selective enough, reduce the GJAHR range. (3) I_JournalEntryItem not activated — BASIS needs to activate the CDS view in SE80."

  - problem: "ODP subscription stuck in INITIALIZED state"
    solution: "The subscription was created but extraction never ran. This is normal after a new subscription setup. Simply re-trigger the extraction. The first run after subscription creation is always a full load."

  - problem: "First delta after full load returns 0 records"
    solution: "This is expected behavior, not a bug. After an init/full load, the CDC mechanism records the starting point. The first delta finds no changes since that point. Run a second delta — it will contain actual changes. Source: SAP Note 2884410."

  - problem: "Note 3255746 — my tool uses ODP via RFC, what do I do?"
    solution: "Short term: continue using it but document the risk for your compliance team. RFC-based ODP still works technically — SAP's enforcement mechanism is contract renewal audits, not immediate system lockout. [SME_KNOWLEDGE] Long term: (1) Check if your tool vendor offers an OData mode — some vendors have added compliant paths. (2) Consider SLT for real-time use cases. (3) For batch, ODP via OData is compliant but expect 5-10x slower throughput. Full note: https://support.sap.com/notes/3255746"

seoTitle: "Extract ACDOCA to Cloud — Beginner Walkthrough (S/4HANA)"
seoDescription: "Step-by-step beginner guide to extracting ACDOCA from SAP S/4HANA to any cloud platform. Covers ODP via I_JournalEntryItem, GJAHR partitioning, ODQMON monitoring, and cloud data type mapping."
updatedAt: 2026-04-22
---

## Scenario

Your analytics team needs financial data — GL line items, cost center postings, profit center actuals. In S/4HANA, all of that lives in ACDOCA. You know SQL. You know your cloud platform. You just need to get the data out safely without breaking SAP or violating your license agreement.

ACDOCA is not technically complex to extract once you understand three things: why direct table reads are off-limits, how to use the released CDS view instead, and why you must partition by fiscal year from the start. This walkthrough covers all three, then walks you through the actual configuration step by step.

**Before you start:** ACDOCA exists only in S/4HANA. If you are on ECC, stop here — you want the BSEG walkthrough instead, which covers the 0FI_GL_50 extractor path. Confirm your system type with your BASIS team if you are not sure.

**On licensing:** SAP Note 3255746 (updated February 2024) states that ODP via RFC is no longer permitted. Most extraction tools use ODP via RFC. Read Step 7 carefully and review the note with your SAP account executive before going to production. The extraction will technically work. The question is whether it is permitted under your contract.

---

## What you've built

After completing this walkthrough you have: a working ODP connection to I_JournalEntryItem for GJAHR = current year, verified in ODQMON, loaded into your cloud platform with correct data types and GJAHR partitioning. You understand what ACDOCA is, why you cannot read it directly, and how to add more fiscal years incrementally.

The Intermediate walkthrough adds delta loads so you stop doing full reloads, and introduces Z-fields for the customer extension fields your finance team inevitably needs.
