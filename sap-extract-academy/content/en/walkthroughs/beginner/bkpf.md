---
table: BKPF
level: beginner
slug: bkpf
title: "Extract BKPF Accounting Document Header (One Fiscal Year)"
summary: "SAP-side preparation for beginner BKPF extraction. Covers fiscal year and company code partitioning, the released CDS view I_AccountingDocument, authorization setup, and SE16N row-count reconciliation."
estimatedMinutes: 50
prerequisites:
  - "Completed VBAK or LFA1 beginner walkthrough"
  - "S/4HANA access with SE80, SE16N, and SU01 authorization"
licenseRelevance: "ODP extraction is permitted under all license types. License trap: Runtime vs Full Use →"
destinations:
  - Generic
extractors:
  - ODP
method: odp
seoTitle: "Extract BKPF Accounting Documents (One Year) — SAP-Side Beginner Guide"
seoDescription: "SAP-side beginner guide for BKPF extraction. Confirm I_AccountingDocument CDS view, partition by BUKRS+GJAHR, assign authorizations, verify with ODQMON."
steps:
  - id: step-01
    title: "Identify the released CDS view I_AccountingDocument"
    explanation: 'For BKPF, the released CDS view is <a href="https://help.sap.com/">I_AccountingDocument</a>. It exposes accounting document headers through ODP with authorization enforcement. Confirm it exists in your system and carries the <code>@Analytics.dataExtract: true</code> annotation.'
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → I_AccountingDocument"
      helpUrl: "https://help.sap.com/"
    verify: "I_AccountingDocument appears in SE80 with @Analytics.dataExtract: true."

  - id: step-02
    title: "Understand BKPF partitioning (BUKRS, GJAHR)"
    explanation: 'BKPF is a large financial table. Its primary key includes MANDT, BUKRS (company code), GJAHR (fiscal year), and BELNR (document number). Use <a href="https://help.sap.com/">SE16N</a> to count rows for one company code and one fiscal year. That partition count is your extraction target and your reconciliation baseline.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → BKPF → Filter BUKRS='1000' AND GJAHR=2024 → Count"
      helpUrl: "https://help.sap.com/"
    verify: "You see a row count for BUKRS='1000' and GJAHR=2024. Write it down."

  - id: step-03
    title: "Confirm the extraction user has FI authorization group"
    explanation: 'BKPF data is finance-sensitive. Verify the extraction user (created in the VBAK beginner walkthrough or equivalent) has <code>S_TABU_DIS</code> with authorization group <code>FC</code> (Finance) in addition to the S_RFC and S_ODP_READ already in place. If you are reusing EXTRACT_VBAK, check via <a href="https://help.sap.com/docs/SAP_NETWEAVER_750/wm_netweaver_740_ehp1_html/e5e83c2825c34a7896bdb97c0da65fb5.html">PFCG</a> whether the role covers finance tables.'
    sapTransaction:
      code: PFCG
      menuPath: "Role → Display → Authorization Data → S_TABU_DIS"
      helpUrl: "https://help.sap.com/docs/SAP_NETWEAVER_750/wm_netweaver_740_ehp1_html/e5e83c2825c34a7896bdb97c0da65fb5.html"
    verify: "S_TABU_DIS includes authorization group FC or the extraction user receives rows in a preview without authorization errors."

  - id: step-04
    title: "Verify ODQMON subscription after first tool connection"
    explanation: 'After your extraction tool makes its first connection attempt, check <a href="https://help.sap.com/">ODQMON</a>. A subscription for I_AccountingDocument should appear under context ABAP_CDS.'
    sapTransaction:
      code: ODQMON
      menuPath: "Subscriptions → Context: ABAP_CDS → I_AccountingDocument"
      helpUrl: "https://help.sap.com/"
    verify: "Subscription for I_AccountingDocument is active. No errors in ODQMON."

  - id: step-05
    title: "Reconcile row count after extraction"
    explanation: "After the extraction completes, run the SE16N count again with the same BUKRS and GJAHR filter. Compare the result to the row count your landing zone reports."
    sapTransaction:
      code: SE16N
      menuPath: "Execute → BKPF → Filter BUKRS='1000' AND GJAHR=2024 → Count"
      helpUrl: "https://help.sap.com/"
    verify: "Row count in landing zone matches SE16N count. Sample documents show posting dates in fiscal year 2024, company code 1000."

troubleshooting:
  - problem: "Filter condition returns zero rows in tool preview"
    solution: "In ODP, filter syntax is case-sensitive. BUKRS='1000' uses single quotes; GJAHR is numeric — in many extractors GJAHR=2024 (no quotes). Verify the exact syntax your tool expects."

  - problem: "Extraction times out despite BUKRS+GJAHR filter"
    solution: "Even one company code plus one fiscal year can hold 100M+ rows on large systems. If SE16N shows more than 100M rows for your partition, consider sub-partitioning by document type (BLART) or posting date month. Alternatively, use the Intermediate walkthrough which covers this."

nextSteps:
  - label: "Try BKPF Intermediate — multi-year, multi-company extraction"
    url: "/walkthrough/intermediate/bkpf/"
  - label: "Table overview: BKPF Accounting Document"
    url: "/tables/bkpf/"
  - label: "License trap: Runtime vs Full Use"
    url: "/articles/runtime-vs-full-use/"
updatedAt: 2026-04-22
---

Your finance team needs accounting documents in the data lake for reconciliation and analytics. BKPF is large, so you start small: one company code, one fiscal year. This walkthrough covers the SAP-side preparation — confirming the CDS view, checking authorizations for financial data, and knowing how to verify the extraction with ODQMON and SE16N.

For fiscal year 2024 on a mid-sized system, expect 5M–30M document headers in one company code. That is a safe beginner partition for ODP-based extraction.

---

## What you have established

You have the SAP side ready for BKPF extraction: released CDS view confirmed, financial authorization checked, ODQMON subscription verified, and a row-count reconciliation baseline recorded. Your tool team can now run the extraction against I_AccountingDocument with confidence that the SAP configuration is correct.

When 2025 arrives, you will repeat steps 02 and 05 with GJAHR=2025 — the rest stays the same.
