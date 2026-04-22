---
table: ACDOCA
level: beginner
slug: acdoca
title: "Extract ACDOCA Universal Journal (One Fiscal Year)"
summary: "Beginner-level SAP-side preparation for extracting one company code and one fiscal year from the Universal Journal. Covers the mandatory partitioning strategy, the released CDS view, and the authorization setup — the SAP work you must complete before any tool runs."
estimatedMinutes: 60
prerequisites:
  - "S/4HANA on-premise access with SE80 and SE16N authorization"
  - "Ability to create or request a technical RFC user via SU01"
  - "Awareness of your SAP license type (Runtime vs Full Use)"
  - "A target landing zone provisioned by your tool team"
licenseRelevance: "ODP-based extraction of ACDOCA is permitted under Runtime License when using the ODP OData API. SLT replication of ACDOCA requires Full Use License. Verify your license covers your chosen method. License trap: Runtime vs Full Use →"
destinations:
  - Generic
extractors:
  - ODP
seoTitle: "Extract ACDOCA Universal Journal (One Fiscal Year) — SAP-Side Guide"
seoDescription: "SAP-side beginner guide for ACDOCA Universal Journal extraction. Confirm released CDS view, set authorizations, understand partitioning — before running any tool."
method: odp
steps:
  - id: step-01
    title: "Confirm the released CDS view I_JournalEntryItem"
    explanation: 'Never extract raw ACDOCA directly. SAP ships <a href="https://help.sap.com/">I_JournalEntryItem</a> as the released CDS view for the Universal Journal. It enforces authorization, applies currency conversion, and exposes the table through <a href="/glossary/odp/">ODP</a> without triggering a full table scan.'
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → Search → I_JournalEntryItem"
      helpUrl: "https://help.sap.com/"
    verify: "I_JournalEntryItem opens in SE80 and the header annotation @Analytics.dataExtract: true is present."
    whyItMatters: "A raw SELECT * on ACDOCA exhausts SAP dialog work process memory within seconds on any production system. I_JournalEntryItem is the only extraction-safe path."

  - id: step-02
    title: "Understand ACDOCA partitioning (RBUKRS, RYEAR)"
    explanation: "ACDOCA primary key fields are MANDT, RBUKRS (company code), RYEAR (reporting year), POPER (posting period), BELNR (document number), and DOCLN (line number). For a beginner extraction, always fix to one company code and one reporting year. This gives a manageable partition that finishes in a predictable time window rather than timing out."
    sapTransaction:
      code: SE16N
      menuPath: "Execute → ACDOCA → Filter RBUKRS='1000' AND RYEAR=2024"
      helpUrl: "https://help.sap.com/"
    verify: "You see a row count for RBUKRS='1000' and RYEAR=2024. Note it. This is your reconciliation target after the extract. Typical values are 5M–50M rows per company code per year."
    whyItMatters: "ACDOCA without partitioning crashes SAP. Partitioning by RBUKRS+RYEAR is the minimum viable approach and is the pattern you will scale to parallel jobs in intermediate and expert walkthroughs."

  - id: step-03
    title: "Create the technical RFC extraction user"
    explanation: 'Create a System-type (non-dialog) user dedicated to extraction via <a href="https://help.sap.com/">SU01</a>. Never use a named dialog user for automated extraction — it consumes a dialog work process and cannot be safely locked after use.'
    sapTransaction:
      code: SU01
      menuPath: "User → Create → User type: System"
      helpUrl: "https://help.sap.com/"
    verify: "User EXTRACT_ACDOCA exists in SU01 with User Type = System and is locked for interactive logon."

  - id: step-04
    title: "Assign authorization objects S_RFC and S_ODP_READ"
    explanation: 'In <a href="https://help.sap.com/">PFCG</a>, create a role for the extraction user. The role must contain S_RFC (RFC_TYPE=FUNC) and S_ODP_READ (ODPSOURCE=ABAP_CDS). S_ODP_READ for ABAP_CDS is the specific authorization needed to read CDS-based ODP sources. Without it, the extraction returns authorization errors immediately.'
    sapTransaction:
      code: PFCG
      menuPath: "Role → Create → Authorization → Add Objects"
      helpUrl: "https://help.sap.com/"
    verify: "In SU01, EXTRACT_ACDOCA has the custom role assigned. In PFCG, the role shows S_ODP_READ with ODPSOURCE=ABAP_CDS in the authorization data."

  - id: step-05
    title: "Verify the ODP subscription in ODQMON"
    explanation: 'After your extraction tool makes its first connection attempt, check <a href="https://help.sap.com/">ODQMON</a> on the SAP side. ODQMON (Operational Delta Queue Monitor) shows all active ODP subscriptions, their queue depth, and any errors. A healthy subscription appears here within seconds of the tool registering.'
    sapTransaction:
      code: ODQMON
      menuPath: "Subscriptions → Context: ABAP_CDS → Search I_JournalEntryItem"
      helpUrl: "https://help.sap.com/"
    verify: "ODQMON shows a subscription for I_JournalEntryItem under context ABAP_CDS. Status is active and queue depth is not growing unboundedly."
    whyItMatters: "ODQMON is your primary SAP-side diagnostic. If the extraction appears to run in your tool but no data arrives, check ODQMON first. A stuck or missing subscription here is the root cause of most full-load failures."

  - id: step-06
    title: "Reconcile row counts between SAP and your target"
    explanation: 'After the extract completes, return to <a href="https://help.sap.com/">SE16N</a> and re-run the count you noted in step 02. Compare this number to the row count in your target system. A mismatch larger than zero suggests the extraction dropped rows — investigate the ODQMON queue for errors before trusting the data.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → ACDOCA → Filter RBUKRS='1000' AND RYEAR=2024 → Count"
      helpUrl: "https://help.sap.com/"
    verify: "Row count in your target matches (or is within a tolerable delta for in-flight postings) the SE16N count from step 02."

troubleshooting:
  - problem: "S_ODP_READ authorization error on first connection"
    solution: "The EXTRACT_ACDOCA user is missing S_ODP_READ with ODPSOURCE=ABAP_CDS. Return to PFCG, add the authorization object with that parameter, and re-generate the profile."

  - problem: "ODQMON shows no subscription after tool connects"
    solution: "The tool may have connected via RFC rather than OData. RFC-based ODP is restricted per SAP Note 3255746. Check your tool's connector documentation and switch to OData mode if available."

  - problem: "Extraction starts but row count in target is far below SE16N"
    solution: "Check the filter parameters in your tool — an overly restrictive filter on posting period (POPER) or document type (BLART) will reduce row counts below the full-partition count."

nextSteps:
  - label: "Try ACDOCA Intermediate — adds parallelism across company codes"
    url: "/walkthrough/intermediate/acdoca/"
  - label: "Table overview: ACDOCA Universal Journal"
    url: "/tables/acdoca/"
  - label: "License trap: Runtime vs Full Use"
    url: "/articles/runtime-vs-full-use/"
updatedAt: 2026-04-22
---

ACDOCA is the Universal Journal — every financial posting in S/4HANA ends up here. Unlike VBAK or LFA1, ACDOCA has no safe beginner path that ignores partitioning. The table routinely exceeds a billion rows in production systems.

This walkthrough focuses on the SAP-side work you must complete before any extraction tool runs: confirming the released CDS view, setting up a minimal-permission extraction user, understanding why partitioning is not optional, and knowing how to verify the extraction worked using ODQMON and SE16N.

Your tool team handles pipeline configuration. This walkthrough is about making sure the SAP side is ready and that you understand what you are asking SAP to do.
