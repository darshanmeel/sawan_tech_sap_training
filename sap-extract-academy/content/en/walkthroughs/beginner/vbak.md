---
table: VBAK
level: beginner
slug: vbak
title: "Extract VBAK Sales Document Header (Beginner)"
summary: "SAP-side preparation for full-load extraction of the Sales Document Header. Covers the released CDS view I_SalesDocument, technical user setup with minimum authorizations, and post-extraction row-count reconciliation using SE16N."
estimatedMinutes: 45
prerequisites:
  - "Access to an S/4HANA on-premise system with SE80 and SE16N authorization"
  - "Ability to create or request a technical user via SU01"
  - "Awareness of your SAP license type"
licenseRelevance: "Works under both Full Use and Runtime SAP licenses. ODP extraction through the OData API is permitted under all license types. License trap: Runtime vs Full Use →"
destinations:
  - Generic
extractors:
  - ODP
method: odp
seoTitle: "Extract VBAK Sales Document Header (Beginner) — SAP-Side Guide"
seoDescription: "SAP-side beginner guide for VBAK extraction. Confirm released CDS view I_SalesDocument, create RFC user, assign S_ODP_READ, verify with ODQMON and SE16N."
steps:
  - id: step-01
    title: "Confirm the released CDS view I_SalesDocument"
    explanation: 'SAP ships released CDS views for standard tables. For VBAK, the view is <a href="https://help.sap.com/">I_SalesDocument</a>. It carries authorization, delta support, and the <code>@Analytics.dataExtract: true</code> annotation that signals ODP readiness. Using this view is the SAP-recommended approach — extracting raw VBAK bypasses authorization and has no delta support.'
    sapTransaction:
      code: SE80
      menuPath: "Repository Browser → Search → I_SalesDocument"
      helpUrl: "https://help.sap.com/"
    verify: "I_SalesDocument opens in SE80 and the annotation @Analytics.dataExtract: true is visible in the header."
    whyItMatters: "Extracting from a released CDS view respects authorization and provides built-in delta support. Reading VBAK directly skips both. Released views are also more stable across upgrades than raw table layouts."

  - id: step-02
    title: "Check row count in SE16N (establish a reconciliation baseline)"
    explanation: 'Use <a href="https://help.sap.com/">SE16N</a> to count rows in VBAK without filters (or with the filter that matches your intended extraction scope). Write down the number. This is your target: after the extraction, the row count in your landing zone must match this number.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → VBAK → Count"
      helpUrl: "https://help.sap.com/"
    verify: "You have a row count for VBAK. Typical range is 1M–50M rows depending on system size and history retained."

  - id: step-03
    title: "Create a technical RFC user with minimum permissions"
    explanation: 'Create a System-type (non-dialog) user via <a href="https://help.sap.com/docs/SAP_NETWEAVER_750/wm_netweaver_740_ehp1_html/ae58e3c3a8c54e6f9573f3b0ee75ea94.html">SU01</a>. System users cannot log on interactively and do not consume a dialog work process. Never reuse a named user account for automated extraction — it creates audit, security, and performance problems.'
    sapTransaction:
      code: SU01
      menuPath: "User → Create → User type: System"
      helpUrl: "https://help.sap.com/docs/SAP_NETWEAVER_750/wm_netweaver_740_ehp1_html/ae58e3c3a8c54e6f9573f3b0ee75ea94.html"
    verify: "User EXTRACT_VBAK exists in SU01 with User Type = System. The user is locked for interactive logon."

  - id: step-04
    title: "Assign authorizations via PFCG"
    explanation: 'In <a href="https://help.sap.com/docs/SAP_NETWEAVER_750/wm_netweaver_740_ehp1_html/e5e83c2825c34a7896bdb97c0da65fb5.html">PFCG</a>, create a single custom role. Add three authorization objects: S_RFC (RFC_TYPE=FUNC), S_ODP_READ (ODPSOURCE=ABAP_CDS), and S_TABU_DIS (authorization group SD). Generate the profile and assign the role to EXTRACT_VBAK.'
    sapTransaction:
      code: PFCG
      menuPath: "Role → Create → Authorizations → Add Object"
      helpUrl: "https://help.sap.com/docs/SAP_NETWEAVER_750/wm_netweaver_740_ehp1_html/e5e83c2825c34a7896bdb97c0da65fb5.html"
    verify: "In SU01, EXTRACT_VBAK shows one role assigned. In PFCG, the role authorization data contains S_ODP_READ with ODPSOURCE=ABAP_CDS."

  - id: step-05
    title: "Verify the RFC destination is reachable (SM59)"
    explanation: 'Your extraction tool connects to SAP over an RFC destination. Ask your Basis team to check <a href="https://help.sap.com/docs/SAP_NETWEAVER_750/wm_netweaver_740_ehp1_html/sm59.html">SM59</a> for the destination your tool will use. The test connection must pass before any extraction attempt.'
    sapTransaction:
      code: SM59
      menuPath: "RFC Connections → ABAP Connections or TCP/IP → Test Connection"
      helpUrl: "https://help.sap.com/docs/SAP_NETWEAVER_750/wm_netweaver_740_ehp1_html/sm59.html"
    verify: "Test Connection returns green for the RFC destination your tool uses."

  - id: step-06
    title: "Check ODQMON after the tool's first run"
    explanation: 'After your extraction tool makes its first connection, open <a href="https://help.sap.com/">ODQMON</a>. A subscription for I_SalesDocument should appear under context ABAP_CDS. No subscription means the tool did not register with ODP — this usually means it is using an unsupported path or the authorization is incorrect.'
    sapTransaction:
      code: ODQMON
      menuPath: "Subscriptions → Context: ABAP_CDS → I_SalesDocument"
      helpUrl: "https://help.sap.com/"
    verify: "ODQMON shows an active subscription for I_SalesDocument. No error status."
    whyItMatters: "ODQMON is your diagnostic console. If the extraction looks successful in your tool but the data count is wrong, ODQMON will show you why."

  - id: step-07
    title: "Reconcile row counts after extraction"
    explanation: "Return to SE16N and count VBAK rows with the same filters you used in step 02. Compare to the row count your landing zone reports. The counts should match or differ only by in-flight postings that arrived during the extraction window."
    sapTransaction:
      code: SE16N
      menuPath: "Execute → VBAK → Count"
      helpUrl: "https://help.sap.com/"
    verify: "Row count in landing zone matches SE16N count within a tolerable margin."
    whyItMatters: "Row-count reconciliation is the single most important verification in any extraction. Never hand data to the analytics team without it."

troubleshooting:
  - problem: "Test Connection in SM59 fails"
    solution: "Check that network rules allow the tool's server to reach SAP's message server port (usually 3600+systemNumber) and application server host. Engage your Basis team — this is a network or SAP host configuration issue, not an extraction configuration issue."

  - problem: "SAP_ODP_AUTHORIZATION_MISSING error"
    solution: "The EXTRACT_VBAK user lacks S_ODP_READ for context ABAP_CDS. Return to PFCG and add this authorization with ODPSOURCE=ABAP_CDS. Regenerate the profile and test again."

  - problem: "ODQMON shows no subscription after tool runs"
    solution: "The tool may be calling ODP via RFC rather than OData. RFC-based ODP is restricted per SAP Note 3255746. Check the tool's connector configuration and switch to OData mode."

nextSteps:
  - label: "Try the VBAK Intermediate walkthrough — adds delta and Z-field"
    url: "/walkthrough/intermediate/vbak/"
  - label: "License trap: Runtime vs Full Use"
    url: "/articles/runtime-vs-full-use/"
  - label: "Glossary: Operational Data Provisioning (ODP)"
    url: "/glossary/odp/"
updatedAt: 2026-04-22
---

Your finance analytics project needs sales order data in the data lake. Specifically, the header record for every sales order — orders, quotations, contracts. This walkthrough covers the SAP-side work from confirming the released CDS view to verifying the extraction succeeded.

Your tool team handles pipeline configuration (linked services, copy activities, Parquet sinks). This walkthrough is about the SAP side: what to check, which transactions to open, what authorizations to set, and how to know the extraction is correct.

If you complete this in one sitting, budget about 45 minutes. If this is your first time navigating SAP transactions, add 30 minutes.

---

## What you have established

You have confirmed that the SAP side is correctly configured for VBAK extraction: the released CDS view is present, a minimal-permission extraction user is in place, ODP is registering subscriptions, and you have a row-count baseline for reconciliation.

The patterns you have learned — released CDS views, System-type RFC users, S_ODP_READ authorization, ODQMON monitoring, SE16N reconciliation — are the foundation for every S/4HANA extraction. When you move to the intermediate walkthrough, you will add delta processing and a Z-field.
