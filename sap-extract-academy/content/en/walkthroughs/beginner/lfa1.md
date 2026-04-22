---
table: LFA1
level: beginner
slug: lfa1
title: "Extract LFA1 Vendor Master (Beginner)"
summary: "SAP-side preparation for full-load extraction of vendor master general data. Covers the released CDS view I_Supplier, minimum authorization setup, and SE16N reconciliation. The simplest table extraction — small volume, stable data."
estimatedMinutes: 40
prerequisites:
  - "Access to an S/4HANA on-premise system with SE80 and SE16N authorization"
  - "Ability to create or request a technical user via SU01"
licenseRelevance: "Works under all SAP license types. ODP extraction via OData is permitted for all licenses. License trap: Runtime vs Full Use →"
destinations:
  - Generic
extractors:
  - ODP
method: odp
seoTitle: "Extract LFA1 Vendor Master (Beginner) — SAP-Side Guide"
seoDescription: "SAP-side beginner guide for LFA1 vendor master extraction. Confirm I_Supplier CDS view, set authorizations, verify with SE16N and ODQMON."
steps:
  - id: step-01
    title: "Verify the released CDS view I_Supplier"
    explanation: 'Vendor master general data is exposed via the <a href="https://help.sap.com/">I_Supplier</a> CDS view. Confirm it is present in your system and annotated for extraction.'
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → Search → I_Supplier"
      helpUrl: "https://help.sap.com/"
    verify: "I_Supplier appears in SE80 with @Analytics.dataExtract: true."

  - id: step-02
    title: "Count rows in LFA1 (SE16N baseline)"
    explanation: 'Use <a href="https://help.sap.com/">SE16N</a> to count all rows in LFA1 without filters. LFA1 is typically small (thousands to low millions of vendors). Note the count for reconciliation.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → LFA1 → Count (no filter)"
      helpUrl: "https://help.sap.com/"
    verify: "You have a row count for LFA1. Typical range: 50K–2M vendors."

  - id: step-03
    title: "Confirm the extraction user has vendor master authorization"
    explanation: 'Vendor master sits in authorization group MM (Materials Management) for table display. Confirm the extraction user has <code>S_TABU_DIS</code> for group MM in addition to S_RFC and S_ODP_READ. Use <a href="https://help.sap.com/docs/SAP_NETWEAVER_750/wm_netweaver_740_ehp1_html/e5e83c2825c34a7896bdb97c0da65fb5.html">PFCG</a> to check or update.'
    sapTransaction:
      code: PFCG
      menuPath: "Role → Display → Authorization Data"
      helpUrl: "https://help.sap.com/docs/SAP_NETWEAVER_750/wm_netweaver_740_ehp1_html/e5e83c2825c34a7896bdb97c0da65fb5.html"
    verify: "Role covers S_TABU_DIS for authorization group MM (or a broader group that includes vendor master tables)."

  - id: step-04
    title: "Check ODQMON after the first tool run"
    explanation: 'After your extraction tool makes its first connection, verify <a href="https://help.sap.com/">ODQMON</a> shows an active subscription for I_Supplier.'
    sapTransaction:
      code: ODQMON
      menuPath: "Subscriptions → Context: ABAP_CDS → I_Supplier"
      helpUrl: "https://help.sap.com/"
    verify: "Subscription for I_Supplier is active. No errors."

  - id: step-05
    title: "Reconcile vendor count after extraction"
    explanation: "Return to SE16N and count LFA1 again. The row count in your landing zone must match. LFA1 is stable enough that any significant discrepancy indicates a configuration problem, not in-flight updates."
    sapTransaction:
      code: SE16N
      menuPath: "Execute → LFA1 → Count"
      helpUrl: "https://help.sap.com/"
    verify: "Landing zone row count matches SE16N count. Sample columns LIFNR, NAME1, LAND1 have expected values."

troubleshooting:
  - problem: "ODP_NO_DATA_AVAILABLE error in tool"
    solution: "Verify LFA1 has rows via SE16N. Then check if I_Supplier applies a hidden filter — open the view in SE80 and look for WHERE clause conditions that might restrict active vendor status. If the view filters to only active vendors, the extracted count will be less than raw LFA1."

  - problem: "ODQMON shows no subscription"
    solution: "The tool may be using RFC-based ODP, which is restricted per SAP Note 3255746. Confirm the tool is using OData mode and re-run."

nextSteps:
  - label: "Try the LFA1 Intermediate walkthrough — adds hourly delta"
    url: "/walkthrough/intermediate/lfa1/"
  - label: "Table overview: LFA1 Vendor Master"
    url: "/tables/lfa1/"
  - label: "License trap: Runtime vs Full Use"
    url: "/articles/runtime-vs-full-use/"
updatedAt: 2026-04-22
---

Your procurement analytics team needs a periodic feed of all active vendors. LFA1 (vendor master general data) is small, stable, and does not change hourly — a full-load extraction on a weekly or daily schedule is the correct pattern.

This walkthrough covers the SAP-side preparation: confirming the released CDS view, checking authorization for vendor master data, and verifying the extraction with ODQMON and SE16N. Your tool team handles the pipeline and scheduling.

Estimated time: 40 minutes, faster if you have already completed the VBAK beginner walkthrough and your extraction user is already configured.

---

## What you have established

You have confirmed the SAP side is correctly configured for LFA1 extraction. The released CDS view is present, the extraction user has vendor master authorization, and you have a row-count baseline. Your tool team can now configure the extraction pipeline against I_Supplier with confidence.

The patterns here — CDS view, System-type user, ODQMON subscription check, SE16N reconciliation — are identical for every table. When you move to the intermediate walkthrough, you will add delta processing.
