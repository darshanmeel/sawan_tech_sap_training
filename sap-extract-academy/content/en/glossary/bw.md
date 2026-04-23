---
term: BW
fullName: SAP Business Warehouse
slug: bw
shortDefinition: "SAP BW is SAP's legacy business intelligence and data warehousing solution. Now superseded by S/4HANA Embedded Analytics and cloud solutions (SAP Analytics Cloud), but still used for enterprise reporting in many organizations."
relatedTerms: [S/4HANA, ODP, Operational Data Provisioning, SAP Analytics Cloud]
sapDocUrl: "https://help.sap.com/"
seoTitle: "BW: SAP Business Warehouse in SAP — Plain Explanation"
seoDescription: "SAP BW is the legacy business intelligence platform. Now superseded by S/4HANA Analytics and cloud solutions, but still widely used for enterprise reporting."
updatedAt: 2026-04-22
---

### What is SAP BW?

SAP BW (Business Warehouse) is SAP's purpose-built business intelligence and data warehousing platform, released in the mid-1990s and for decades the dominant way large enterprises performed reporting and analytics on their SAP ERP data. BW is a standalone SAP system — it runs on its own application server, its own database, and connects to source systems (ECC, CRM, HR, third-party) through a dedicated extraction and loading framework. Data extracted from ERP tables like `BKPF`, `VBAK`, `LFA1`, and `KNA1` was loaded into BW, modeled into dimensional structures, and then exposed to reporting tools like BEx Query Designer and, later, SAP BusinessObjects.

The scale of organizational investment in BW is significant. Large enterprises have BW systems containing hundreds of **InfoProviders**, thousands of queries, years of historical data, and trained user communities. This investment explains why BW hasn't simply disappeared despite being technically superseded — migrating a mature BW environment to a modern cloud data warehouse is a multi-year program, not a weekend project.

### How it works

BW's architecture is built around two core concepts: **DataSources** (extraction objects that pull data from source systems) and **InfoProviders** (storage and computation objects inside BW that hold the modeled data). The extraction process uses a protocol called **DataSource/BW Service API**, and more recently **ODP (Operational Data Provisioning)**, to pull data from the source ERP system into BW's **Persistent Staging Area (PSA)**, then transform and load it into InfoProviders.

InfoProviders come in several types. **InfoCubes** (now called CompositeProviders in BW/4HANA) store data in a star schema: a central fact table surrounded by dimension tables, optimized for MDX queries from BEx. **DataStore Objects (DSOs)** store data in a flat, key-based structure, more like a staging table, and are used for data reconciliation and line-item reporting. **InfoObjects** represent the master data dimension — `0MATERIAL`, `0CUSTOMER`, `0COSTCENTER` — which are loaded separately and joined at query time.

Delta handling in BW is managed through the DataSource's **delta mechanism**, which can be timestamp-based, delta pointer-based, or using BW's own **delta queue** (maintained in tables like `ROOSGEN` and `ROOSPRMSC` in the source ERP system). Understanding BW's delta mechanisms is essential if you're migrating a BW extraction to a modern tool — you need to replicate not just the data, but the delta capture logic.

### Why it matters for data extraction

BW is relevant to modern extraction engineers in two ways. First, many current data architectures include BW as a **source system** for migration or co-existence pipelines. If your organization is moving from BW to Snowflake, Databricks, or BigQuery, you need to extract data from BW InfoProviders, not from the ERP tables directly. BW InfoProviders may contain years of historical data that no longer exists in the ERP source (due to archiving), custom transformations that are documented only in BW transfer rules, and business logic embedded in BW routines that must be replicated in the target warehouse.

Second, BW's extraction infrastructure — specifically the **ODP framework** — was originally developed to serve BW and is now the primary mechanism for extracting SAP data to any external system. Understanding BW's ODP origins helps you understand why ODP behaves the way it does: delta queues, extraction contexts (`SAPI` for legacy DataSources, `ABAP_CDS` for CDS views), and subscriber management all reflect design decisions made for BW that have been generalized for broader use.

The BW **BEx query layer** is also worth understanding for extraction planning. Many business definitions — KPIs, key figures, restricted key figures — exist only as BEx query definitions, not in ERP tables. Migrating these definitions to a modern BI tool requires reading BEx query metadata (transaction `RRMX` or the BEx Query Designer) and rebuilding equivalent measures in the target environment.

### Common pitfalls

The most common mistake in BW migration projects is **extracting from BW instead of the source ERP**. BW data is already aggregated, transformed, and potentially de-normalized compared to the source. Extracting from an InfoCube gives you the BW data model, not the source data model. If your migration goal is to rebuild the warehouse on modern infrastructure with correct grain and lineage, you should extract from the source ERP tables or CDS views and rebuild the BW transformation logic in your target platform — not replicate BW's already-transformed output.

A second pitfall is **delta queue abandonment**. When you set up an ODP subscription from BW and then abandon it without properly closing the subscription (transaction `ODQMON`), the delta queue continues to accumulate entries in the source ERP system. Orphaned ODP subscriptions in `ODQMON` are a known performance issue in ERP systems that have had multiple failed extraction experiments — the queue tables grow indefinitely and can cause space and performance problems.

Finally, BW **transformation rules and routines** are often the repository of the most critical business logic in an organization, and they are almost never documented anywhere other than the BW system itself. Before decommissioning BW, extract and review every transformation rule, every start routine, and every end routine — these may contain currency conversion logic, unit normalization, exception handling for dirty data, and cross-system reconciliation logic that must be preserved in the target.

### In practice

A realistic migration scenario: your organization runs SAP ECC with a BW 7.5 system that contains an InfoCube `ZFICO_ACTUALS` holding five years of posted actuals. The ERP archiving policy has archived `BKPF`/`BSEG` records older than 18 months, meaning the ERP tables no longer have the full five years. For the migration, you must extract from the BW InfoCube via ODP (using extraction context `BW`) to get the historical data, then switch to ERP-sourced ODP extraction (using `ABAP_CDS` or `SAPI`) for the rolling 18-month window and ongoing delta. This dual-source approach requires understanding both BW's ODP provider and the ERP ODP setup — and reconciling any differences in how currency and unit fields were handled across the two systems.
