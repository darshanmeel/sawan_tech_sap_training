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
    explanation: 'Create a System-type (non-dialog) user via <a href="https://help.sap.com/">SU01</a>. System users cannot log on interactively and do not consume a dialog work process. Never reuse a named user account for automated extraction — it creates audit, security, and performance problems.'
    sapTransaction:
      code: SU01
      menuPath: "User → Create → User type: System"
      helpUrl: "https://help.sap.com/"
    verify: "User EXTRACT_VBAK exists in SU01 with User Type = System. The user is locked for interactive logon."

  - id: step-04
    title: "Assign authorizations via PFCG"
    explanation: 'In <a href="https://help.sap.com/">PFCG</a>, create a single custom role. Add three authorization objects: S_RFC (RFC_TYPE=FUNC), S_ODP_READ (ODPSOURCE=ABAP_CDS), and S_TABU_DIS (authorization group SD). Generate the profile and assign the role to EXTRACT_VBAK.'
    sapTransaction:
      code: PFCG
      menuPath: "Role → Create → Authorizations → Add Object"
      helpUrl: "https://help.sap.com/"
    verify: "In SU01, EXTRACT_VBAK shows one role assigned. In PFCG, the role authorization data contains S_ODP_READ with ODPSOURCE=ABAP_CDS."

  - id: step-05
    title: "Verify the RFC destination is reachable (SM59)"
    explanation: 'Your extraction tool connects to SAP over an RFC destination. Ask your Basis team to check <a href="https://help.sap.com/">SM59</a> for the destination your tool will use. The test connection must pass before any extraction attempt.'
    sapTransaction:
      code: SM59
      menuPath: "RFC Connections → ABAP Connections or TCP/IP → Test Connection"
      helpUrl: "https://help.sap.com/"
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

stepsSlt:
  - id: slt-step-01
    title: "Basis: confirm Full Use licence in SLICENSE"
    explanation: 'SLT replication is only permitted under a Full Use SAP licence. Ask your Basis team to open <a href="https://help.sap.com/">SLICENSE</a> and confirm the installed licence type. A Runtime licence is not enough — replicating through SLT under Runtime is a contract breach. If the licence is Runtime, stop this walkthrough and use the ODP variant instead.'
    sapTransaction:
      code: SLICENSE
      menuPath: "System → Licence → Installed Licences"
      helpUrl: "https://help.sap.com/"
    verify: "Installed licence row shows a product line that explicitly permits SLT replication (typically SAP S/4HANA Full Use or equivalent). Screenshot this and attach to your design doc."
    whyItMatters: "Licence verification is the single most common thing SLT projects skip — and the single most expensive thing to discover at go-live. Always front-load this check."

  - id: slt-step-02
    title: "Developer: inspect VBAK and I_SalesDocument in ADT"
    explanation: 'Open VBAK and the released CDS view <a href="https://help.sap.com/">I_SalesDocument</a> in <a href="https://help.sap.com/">ABAP Development Tools (ADT)</a> in Eclipse. You need to see two things. First, the raw table columns of VBAK (MANDT, VBELN, ERDAT, AUART, VKORG, VTWEG, KUNNR …) — SLT replicates the raw table, not the CDS view, so the raw layout is what lands in the target. Second, the released CDS view so you understand what downstream analytics would normally consume; SLT output will need a comparable semantic layer on top.'
    sapTransaction:
      code: ADT (Eclipse)
      menuPath: "Project Explorer → System → Dictionary → Database Tables → VBAK"
      helpUrl: "https://help.sap.com/"
    verify: "In ADT you can see the VBAK table definition with its 100+ raw columns and its delivery class A (application table). You can open I_SalesDocument source and read the SELECT projection. Note that the column names differ (raw VBAK is technical, CDS is semantic) — your downstream layer must map between them."
    whyItMatters: "SLT is raw-table replication. If your team is used to CDS semantic names (SalesDocument, CreationDate), the SLT output (VBELN, ERDAT) will surprise them. Agreeing on the naming mapping now avoids a rename project later."

  - id: slt-step-03
    title: "Basis: configure the SLT replication object in LTRC"
    explanation: 'Your Basis team opens <a href="https://help.sap.com/">LTRC</a> on the SLT system and creates a replication configuration pointing at the source S/4HANA and the target (RFC destination for a database, or a logging-table-based sink). Add table VBAK with replication mode "Load + Replication" for full load plus ongoing delta.'
    sapTransaction:
      code: LTRC
      menuPath: "Configurations → Create → Source: S/4HANA system · Target: ... · Replication"
      helpUrl: "https://help.sap.com/"
    verify: "LTRC shows a configuration row for VBAK with status Configured. The source and target RFC destinations both test green."
    whyItMatters: "LTRC is the SLT control plane. Everything else — triggers, parallelism, delta — is configured from here."

  - id: slt-step-04
    title: "Basis: set parallel reader count in LTRS"
    explanation: 'For a small table like VBAK, one or two parallel readers is enough. Your Basis team opens <a href="https://help.sap.com/">LTRS</a> and sets the Reader/Job count for VBAK. Keep initial load jobs ≤ 2 for a beginner setup; more readers generate more dialog-process pressure and are rarely needed for a header-only table.'
    sapTransaction:
      code: LTRS
      menuPath: "Specific Settings → Performance Options → Number of Parallel Jobs"
      helpUrl: "https://help.sap.com/"
    verify: "LTRS shows VBAK with a reader count of 1 or 2 and a calculation type appropriate for the key (most commonly KEY_BASED for VBAK)."

  - id: slt-step-05
    title: "Basis: start replication and monitor in LTCO"
    explanation: 'Trigger Load + Replication from LTRC and watch progress in <a href="https://help.sap.com/">LTCO</a>. LTCO shows per-table load status, replication lag, and job health. For VBAK the initial load should complete in minutes; once it is in Replication state, inserts and updates on the source appear at the target within seconds.'
    sapTransaction:
      code: LTCO
      menuPath: "Control → Configurations → VBAK"
      helpUrl: "https://help.sap.com/"
    verify: "LTCO shows VBAK with status Replication (green). The row count on the target matches the source, and a new order posted on the source appears in the target within a minute."
    whyItMatters: "LTCO is where you discover problems. A VBAK stuck in Initial Load means the target is slower than the source or a trigger failed — either way you need Basis before Analytics gets curious."

  - id: slt-step-06
    title: "Basis + developer: confirm no ODP subscription is needed"
    explanation: "SLT does not use ODP — it writes straight into the target through triggers and the SLT read module. So there is nothing to check in ODQMON for this path. If your design mentions ODQMON or ABAP_CDS context, it is accidentally the ODP design — reopen the method picker and switch to ODP."
    verify: "Your design doc says SLT everywhere and does not mention ODP/ODQMON/ABAP_CDS. If it does, it is mixing two methods and one of them is wrong."

  - id: slt-step-07
    title: "Row-count reconcile against source"
    explanation: 'Compare VBAK row count between source and target. Use <a href="https://help.sap.com/">SE16N</a> on the source with the same filter, compare against SELECT COUNT(*) on the target. A delta of zero is the goal; small positive deltas on an active source are normal and explained by the handful of orders posted during the counting window.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → VBAK → Count → (record the number)"
      helpUrl: "https://help.sap.com/"
    verify: "Source and target counts match exactly, or differ by a small number you can explain (count of orders posted during the reconciliation window)."

stepsRfc:
  - id: rfc-step-01
    title: "Developer: inspect VBAK structure in SE11 or ADT"
    explanation: 'RFC direct reads the raw table. Open VBAK in <a href="https://help.sap.com/">SE11</a> (classic) or in <a href="https://help.sap.com/">ADT</a> (modern). Note the key fields (MANDT, VBELN) and the authorization group — for sales documents this is usually V or VB. You will need the correct authorization group in PFCG later.'
    sapTransaction:
      code: SE11
      menuPath: "Database Table → VBAK → Display → Delivery and Maintenance"
      helpUrl: "https://help.sap.com/"
    verify: "You can read the delivery class (A), the authorization group (V or VB), and the full key list for VBAK."
    whyItMatters: "RFC direct extraction bypasses released CDS views, so you inherit no authorization, no annotation, and no built-in delta. Knowing the raw structure up front is the only thing keeping the extraction honest."

  - id: rfc-step-02
    title: "Measure row count in SE16N (reconciliation baseline)"
    explanation: 'Count rows in VBAK with the filter you intend to extract. Record the number. This is the count the landing zone must match after the extract completes. Without this number, reconciliation is impossible.'
    sapTransaction:
      code: SE16N
      menuPath: "Execute → VBAK → Enter filter → Count"
      helpUrl: "https://help.sap.com/"
    verify: "You have a number in hand (or in the design doc) for VBAK under your chosen filter."

  - id: rfc-step-03
    title: "Basis: create technical user via SU01"
    explanation: 'Ask Basis to create a System-type user (not Dialog) in <a href="https://help.sap.com/">SU01</a>. System users cannot log on interactively. Without a dedicated system user, any extraction that runs on behalf of a named person becomes an audit finding.'
    sapTransaction:
      code: SU01
      menuPath: "User → Create → User type: System"
      helpUrl: "https://help.sap.com/"
    verify: "EXTRACT_VBAK exists with type System and is locked for interactive logon."

  - id: rfc-step-04
    title: "Basis: role with S_RFC + S_TABU_DIS (authgroup V) in PFCG"
    explanation: 'In <a href="https://help.sap.com/">PFCG</a>, create a single-role profile. Add <code>S_RFC</code> with RFC_TYPE=FUNC, and <code>S_TABU_DIS</code> with DICBERCLS=V (the Sales authorization group covering VBAK). Do <strong>not</strong> grant S_TABU_DIS with * — that is a finding.'
    sapTransaction:
      code: PFCG
      menuPath: "Role → Create → Authorizations → Add Object"
      helpUrl: "https://help.sap.com/"
    verify: "In SU01 the extraction user shows the role. In PFCG the role contains exactly the two objects above, scoped to the minimum needed."

  - id: rfc-step-05
    title: "Basis: test RFC destination in SM59"
    explanation: 'The tool calls SAP over an RFC destination defined in <a href="https://help.sap.com/">SM59</a>. Ask Basis to Test Connection and Test Authorization against the destination the tool uses. Both must pass before a single row is extracted.'
    sapTransaction:
      code: SM59
      menuPath: "RFC Connections → ABAP Connections or TCP/IP → Test Connection → Test Authorization"
      helpUrl: "https://help.sap.com/"
    verify: "Test Connection returns green. Test Authorization returns green for the extraction user."

  - id: rfc-step-06
    title: "Basis: watch SM50 during the first extraction"
    explanation: 'During the first run, ask Basis to keep <a href="https://help.sap.com/">SM50</a> open on the application server hosting the RFC. RFC direct consumes dialog work processes for the lifetime of the call. If the extraction dominates the work-process pool, finance users will notice.'
    sapTransaction:
      code: SM50
      menuPath: "Processes → Filter by User: EXTRACT_VBAK"
      helpUrl: "https://help.sap.com/"
    verify: "At any moment during the extract, total dialog-process utilisation on the app server stays below 80%. If it spikes higher, throttle the extraction to one concurrent call."

  - id: rfc-step-07
    title: "Row-count reconcile after extraction"
    explanation: "Return to SE16N with the same filter used in step 02. Compare to the row count in the landing zone. Matching or in-flight-only delta = success. Anything else, investigate before trusting the data."
    sapTransaction:
      code: SE16N
      menuPath: "Execute → VBAK → same filter → Count"
      helpUrl: "https://help.sap.com/"
    verify: "Landing-zone count matches SE16N count within a tolerable margin (e.g. new orders posted during the extraction window)."

stepsRef:
  - id: ref-step-01
    title: "What VBAK is and why extract it"
    explanation: 'VBAK is the sales document <em>header</em>. One row per order, quotation, or contract. The released CDS view for this table is I_SalesDocument — it is authorisation-aware, delta-capable, and ODP-ready. For line items, the corresponding table is VBAP.'
    verify: "You can explain in one sentence what lives in VBAK and why analytics teams want it."

  - id: ref-step-02
    title: "Methods at a glance (ODP / SLT / RFC direct)"
    explanation: 'ODP is the recommended path — runs under both Runtime and Full Use licences, reads through the released CDS view, and plays nicely with ODQMON for monitoring. SLT is raw-table replication with live delta, requires a Full Use licence, and replicates to the target at the database level. RFC direct is a last-resort path with no delta and requires careful authorization scoping.'
    verify: "You can name the one reason an organisation would pick each method."

  - id: ref-step-03
    title: "Where the actual build happens"
    explanation: "Switch the method picker above to ODP, SLT, or RFC direct to see the SAP-side workflow for that specific approach. Each variant gives you the transactions, the authorisations, and the verification steps a Basis team and ABAP developer would actually run."
    verify: "You know which method you are going to build and have switched the picker to that method."

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
