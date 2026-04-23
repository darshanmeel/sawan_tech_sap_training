---
term: MANDT
fullName: Client / Mandant
slug: mandt
shortDefinition: "MANDT is a 3-digit field present in every SAP table that identifies which client (tenant) the row belongs to. Multi-client systems use MANDT to isolate data. Always filter MANDT in extraction to ensure correct client data."
relatedTerms: [Client, Tenant, Data Partitioning, SE16N, Database Keys]
sapDocUrl: "https://help.sap.com/"
seoTitle: "MANDT: SAP Client/Tenant Identifier — Plain Explanation"
seoDescription: "MANDT is the client/tenant field in all SAP tables. Multi-client systems use MANDT to isolate data; always filter MANDT in extraction."
updatedAt: 2026-04-22
---

### What is MANDT?

**MANDT** (from the German word *Mandant*, meaning "client") is a 3-character field that appears as the **first column in virtually every SAP database table**. It is SAP's implementation of multi-tenancy at the database level. A single SAP database instance — one set of physical database files, one set of application servers — can host multiple logically isolated **clients**, each with completely separate master data, transactional data, customizing settings, and user management. `MANDT` is the field that enforces this isolation: every row in every table belongs to exactly one client, identified by its 3-digit `MANDT` value.

In a typical enterprise SAP landscape, the client structure follows a predictable pattern: `100` or `PRD` is the production client holding live business data; `200` or `QAS` is the quality assurance client used for testing; `300` or `DEV` is the development client; and there may be additional clients for training, sandbox, or migration purposes. All of these clients share the same underlying database, meaning a direct database query without a `MANDT` filter returns rows from all clients indiscriminately.

### How it works

`MANDT` is always the leading field in a SAP transparent table's primary key. The full primary key for `BKPF` (accounting document header) is `MANDT + BUKRS + BELNR + GJAHR`. For `MARA` (material master general data), it is `MANDT + MATNR`. This means the database index for every table is organized first by `MANDT`, making client-filtered queries extremely efficient — a `WHERE MANDT = '100'` clause leverages the leading primary key index position and eliminates all non-production rows at the index level, before any table data is read.

The SAP ABAP runtime automatically injects a `MANDT` filter into every open SQL statement based on the client that the current ABAP session is logged into. A program running in client `100` and executing `SELECT * FROM BKPF` will automatically see `WHERE MANDT = '100'` in the actual database query, even though the ABAP source code did not write it. This transparency is convenient for ABAP developers but creates a blind spot for extraction engineers: when you move outside the ABAP layer — to direct database queries, RFC table reads, or JDBC connections to the underlying HANA or Oracle database — the automatic `MANDT` filter disappears entirely, and you must add it yourself.

### Why it matters for data extraction

The extraction risk from `MANDT` is subtle but severe. If an extraction pipeline connects to the SAP database directly (via HANA Studio, JDBC, or a database-level connector) and issues a query like `SELECT * FROM ACDOCA`, it will return rows from every client on the system — production, quality assurance, development, and training. A data warehouse that ingests this unfiltered result set will contain a mix of real financial postings and test postings created during development and QA testing. The test data may include artificially large transactions, reversed test postings, and entries for non-existent company codes. Downstream reports, financial reconciliations, and regulatory submissions built on this warehouse will be incorrect, and the corruption may not be immediately obvious.

Most extraction frameworks that work through SAP's ABAP layer — ODP, SLT, RFC-based tools — inherit the ABAP runtime's automatic `MANDT` filtering and connect to a specific client. This is the safe path: because the connection is client-bound, the extractor only ever sees data for one client. The risk area is extraction methods that bypass the ABAP layer: direct HANA SQL, database-level replication tools (Oracle GoldenGate, HANA Smart Data Integration at the database tier), or custom scripts using database drivers. These methods require explicit `WHERE MANDT = '100'` filters in every query, and that requirement must be enforced in code review, pipeline testing, and production monitoring.

### Common pitfalls

**Hardcoding the wrong `MANDT` value** is a common and difficult-to-detect error in hand-written extraction scripts. A script developed and tested against a QA system where production data is client `100` may be deployed to a production system where the production client is `200`. The script silently extracts the wrong client's data. The fix is to always parameterize `MANDT` in extraction scripts, derive it from the connection configuration, and add a validation step that confirms the extracted row count matches an independently verified count from `SE16N` or `SE16` on the correct client.

**Assuming extraction tools always filter `MANDT` correctly** without verifying is also risky. Third-party extraction tools may document that they "use the connected client," but bugs exist, and some tools expose configuration options that can inadvertently disable client filtering. When onboarding any new extraction tool against an SAP source, always validate its `MANDT` behavior: extract from a table where you know the row count per client (such as `T001`, which holds company codes), compare the extracted row count against `SE16N`, and confirm only the expected client's rows are present.

**Overlooking `MANDT` in key construction** causes join failures in the data warehouse. Because `MANDT` is part of every primary key, joins between SAP-sourced tables in the warehouse must include `MANDT` in the join condition, just as the original SAP code did. A join between `BKPF` and `BSEG` in the warehouse on only `BUKRS + BELNR + GJAHR`, omitting `MANDT`, produces a cross-client Cartesian product if both tables contain data from more than one client.

### In practice

A financial data platform team extracts `ACDOCA` and `BKPF` from an SAP S/4HANA system via HANA JDBC for performance reasons. Their initial pipeline queries both tables without a `MANDT` filter. Row count validation during UAT reveals that the warehouse contains 1.4x more `ACDOCA` rows than expected. Investigation shows that client `200` (QA) contains substantial test data that passed through the filter-free extraction. The team adds `WHERE MANDT = :client_id` as a mandatory bind parameter to every query, stored in a pipeline configuration file that is environment-specific. They add a pipeline startup assertion that reads the `MANDT` value from the configuration and verifies it against the `T000` table (which lists all clients) to confirm the client exists and is marked as a production client before any extraction proceeds.
