---
term: ADT
fullName: ABAP Development Tools
slug: adt
shortDefinition: "ADT is the modern IDE for ABAP development, built on Eclipse. It replaces the classic SAP GUI-based development tools (SE38, SE11) with a native IDE offering syntax highlighting, refactoring, debugging, and Git integration."
relatedTerms: [ABAP, SE38, SE11, Transport Request]
sapDocUrl: "https://help.sap.com/"
seoTitle: "ADT: ABAP Development Tools in SAP — Plain Explanation"
seoDescription: "ADT is the modern Eclipse-based IDE for ABAP development, replacing classic SAP GUI tools with syntax highlighting, refactoring, and Git support."
updatedAt: 2026-04-22
---

### What is ADT?

ABAP Development Tools (ADT) is the modern integrated development environment for writing, debugging, and managing ABAP code. It runs as a plugin on top of Eclipse, the open-source Java IDE, and connects directly to the SAP backend via a REST-based protocol called **ABAP RESTful Application Programming Model (RAP)** or, for older systems, the ADT backend services. ADT replaced the classic SAP GUI-based toolchain — `SE38` for program editing, `SE11` for Data Dictionary — and brings ABAP development into line with what developers expect from a modern IDE: syntax highlighting, code completion, inline error markers, refactoring tools, integrated unit testing, and Git-based version control via **abapGit**.

For anyone who has worked with VS Code, IntelliJ, or Eclipse for Java development, ADT feels immediately familiar. The learning curve is about navigating SAP's object types and project structure, not the IDE mechanics themselves. ADT is the required environment for all S/4HANA on-premise development and the only supported tool for **ABAP Cloud** development on BTP.

### How it works

ADT connects to one or more SAP systems through an **ABAP Project** configured in Eclipse's Project Explorer. Each project maps to a specific system/client combination, authenticated via your SAP logon credentials. Once connected, the IDE fetches object metadata from the backend in real time — when you open a class or function module, ADT retrieves the source from the SAP system, not from a local copy. Edits are sent back to the system on save, which means ADT is always working against the live system, not a local file system. This is a key conceptual difference from traditional software development.

Navigation is object-centric: you open an ABAP class, a function group, a CDS view, or a database table by name, and ADT resolves it from the connected system. **F3** navigates to the definition of any symbol under the cursor — a function module call, a table field reference, a type definition — which makes tracing logic through deep call stacks much faster than in classic SAP GUI tools where you had to manually find and open each object.

For CDS views specifically, ADT is the only practical editing environment. CDS source files (`.cds` or `.ddls`) are authored in ADT with CDS-aware syntax checking, annotation completion, and a built-in **Data Preview** that lets you run the view and inspect results directly in the IDE without switching to another transaction.

### Why it matters for data extraction

For data architects and extraction engineers, ADT is most valuable as a **read and debug tool** rather than an authoring environment. When you need to understand why a CDS view is returning unexpected results, ADT lets you open the view source, inspect its annotations (especially `@Analytics.dataCategory` and `@OData.publish`), and run a data preview with filter conditions — all without leaving the IDE.

ADT's **ABAP Debugger** is significantly more capable than the classic GUI debugger. You can set **watchpoints** (break when a variable changes value), **external breakpoints** (triggered by a specific user's session), and **exception breakpoints** (break whenever an exception of a given class is raised). When an ODP extraction fails with a cryptic short dump, attaching the ADT debugger to a test extraction run and stepping through the extractor class logic is the fastest path to root cause — faster than reading `ST22` dumps after the fact.

If your organization is building **custom CDS extraction views** — views created specifically to expose data for external consumers, often annotated with `@Analytics.dataExtract: true` — ADT is where those views are developed, tested, and transported. Understanding how to navigate ADT's CDS editor, run a data preview, and read the dependency hierarchy of a CDS view stack is a practical skill for any extraction engineer working in S/4HANA environments.

### Common pitfalls

The most common issue is **connectivity**. ADT requires that the SAP system exposes the ADT backend services (ICF path `/sap/bc/adt`) and that the network allows HTTP/HTTPS traffic on the SAP ICM port (typically 443 or 8443). In highly locked-down enterprise environments, developers often find that SAP GUI (which uses the proprietary DIAG protocol on port 3200+) works fine but ADT is blocked by the corporate firewall. Confirm ICF activation with your Basis team before investing time in ADT setup.

A second pitfall is **authorization**. ADT requires the `S_ADT_RES` authorization object in addition to standard development authorizations. In organizations that strictly control developer access, read-only ADT access (for inspection without the ability to create or change objects) requires a specific role configuration that many Basis teams haven't pre-built. Request this proactively if you need ADT for extraction auditing without a full developer license.

Finally, ADT's **local history** and **Git integration via abapGit** are powerful but require organizational buy-in. Many teams still transport ABAP objects using the classic `SE10`/`STMS` transport chain without Git, which means ADT's version history features don't reflect the full change history unless the team has explicitly connected abapGit. Don't assume Git history in ADT is complete unless you've confirmed abapGit is active on the system.

### In practice

A concrete scenario: you're building an extraction pipeline for a custom CDS view called `ZI_VENDOR_INVOICE_EXTRACT` that a developer created to expose `RBKP` and `RSEG` data. The data preview in ADT shows 10,000 rows for last month but your warehouse is only receiving 8,000 via ODP. You open the view in ADT and notice it has an annotation `@AccessControl.authorizationCheck: #CHECK` — meaning row-level access control is applied based on the calling user's authorizations. The RFC user your extraction tool runs as doesn't have the same company code authorizations as the developer who built the view. You either add the missing authorizations to the RFC user or change the annotation to `#NOT_REQUIRED` (after confirming with security). Without ADT, you'd have spent days debugging the ODP subscription before finding the authorization annotation.
