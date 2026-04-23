---
term: SE16N
fullName: Table Data Browser (Generic)
slug: se16n
shortDefinition: "SE16N is the SAP transaction for browsing table data with filtering and sorting, replacing legacy SE16. You use SE16N to count rows, verify data quality, and manually test filter conditions before automating extraction."
relatedTerms: [SE11, Data Dictionary, Query, Table Browser, SM50]
sapDocUrl: "https://help.sap.com/"
seoTitle: "SE16N: Table Data Browser in SAP — Plain Explanation"
seoDescription: "SE16N is the data browser for querying SAP tables with filters and sorts. Test data quality and row counts before automating extraction."
updatedAt: 2026-04-22
---

### What is SE16N?

`SE16N` is SAP's **Generic Table Data Browser** — the transaction you use to look inside a table and query its contents interactively. You enter a table name (`BKPF`, `VBAK`, `MARA`), define filter conditions, and SE16N executes a SELECT against the database and returns matching rows to your screen. It replaced the older `SE16` transaction with a more capable interface that supports compound filters, column sorting, display variants, and direct export to local spreadsheet files. SE16N is not a development tool; it requires no ABAP knowledge. Any consultant, data engineer, or analyst with the right authorizations can use it to interrogate a live SAP system.

The transaction is foundational to extraction planning because it bridges the gap between the structural metadata you see in SE11 and the actual data living in the system. SE11 tells you what fields exist and what types they are. SE16N tells you what values are actually present, how many rows match a given filter, and whether the data quality is what you expect. Together, SE11 and SE16N are the two tools you use before writing any extraction code or configuring any pipeline.

### How it works

When you enter SE16N and specify a table name, SAP generates a dynamic selection screen based on the table's field definitions pulled from the Data Dictionary. You can enter filter values (equals, ranges, patterns) for any field. The transaction supports multiple selection options per field: single values, ranges (`FROM`/`TO`), exclusion lists, and wildcard patterns. This is equivalent to constructing a SQL `WHERE` clause interactively, without writing SQL.

SE16N sends the query to the underlying database (HANA, Oracle, or DB2 depending on the system) and streams results back. On very large tables, this can be slow or time out if filters are insufficient — SAP imposes a default maximum row limit (typically 500 rows) to protect the system, which you can raise for specific queries but should not remove entirely. One critical feature is the **Count** function: SE16N can return only the row count for a given filter combination without fetching any data rows, which is fast even on tables with billions of rows. This makes SE16N useful for cardinality estimation without risk of overwhelming the system or your session.

### Why it matters for data extraction

Before you can design an extraction pipeline, you need to answer several questions that only data can answer. How many rows does `ACDOCA` have for fiscal year 2023, company code 1000? Are there any null values in `GJAHR` that would break a partition scheme? Does the `BUKRS` field actually contain the expected company codes, or has it been misused to store legacy codes from a migration? SE16N answers all of these. You use it to validate assumptions that, if wrong, would cause extraction failures discovered only in production.

Row counts from SE16N also directly drive architectural decisions. If `BKPF` for a single company code in a single year returns 2 million rows, you know ODP is sufficient. If `ACDOCA` for all company codes returns 3 billion rows, you know you need SLT with partitioning. If a filter on `RYEAR=2024 AND RBUKRS=1000` still returns 50 million rows, you know you need a further partition on `POPER` (posting period) to keep individual extraction batches manageable. None of these decisions can be made from schema alone — SE16N gives you the data-driven evidence.

### Common pitfalls

The most dangerous SE16N mistake is removing the row count limit and running an unfiltered query against a large table. On a system where `ACDOCA` has 5 billion rows, an unfiltered SE16N query will attempt to fetch all of them into your SAP GUI session, consume massive dialog work process memory, potentially trigger a `TSV_TNEW_PAGE_ALLOC_FAILED` error, and in the worst case destabilise the application server for other users. Always apply at least one meaningful filter (`MANDT`, `BUKRS`, `GJAHR`) before executing. Use the Count function first to understand the result set size before fetching rows.

A subtler pitfall is over-trusting SE16N for data quality validation. SE16N shows you whatever is stored in the database, but SAP data quality problems often manifest as logically inconsistent combinations — a cleared document with no clearing date, a billing document without a corresponding delivery — that a simple field-level filter cannot detect. SE16N is sufficient for basic sampling and count verification, but deeper data quality checks require joining tables and applying business rules, which is better done in your target data warehouse after extraction.

### In practice

Suppose you are planning an extraction of sales orders from `VBAK`. You open SE16N, enter `VBAK`, set filter `VKORG = 1000` (sales organisation) and `ERDAT >= 20230101` (creation date from 2023), and click Count. The result comes back: 4.2 million rows. You then add a filter `AUART = ZOR` (standard order type) and recount: 3.8 million rows. You now know your scoped extract is about 3.8 million header records. You switch to `VBAP` (line items), apply the same date and sales org filter, and get 11.4 million rows — roughly 3 line items per order on average, as expected. You sample 20 rows and spot-check that `NETWR` (net value) and `WAERK` (document currency) are both populated. You have now validated the extraction scope, confirmed cardinality, and verified basic field population — all before writing a single line of code.
