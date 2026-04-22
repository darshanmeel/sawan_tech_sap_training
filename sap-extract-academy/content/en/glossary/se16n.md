---
term: SE16N
fullName: Table Data Browser (Generic)
slug: se16n
shortDefinition: "SE16N is the SAP transaction for browsing table data with filtering and sorting, replacing legacy SE16. You use SE16N to count rows, verify data quality, and manually test filter conditions before automating extraction."
relatedTerms: [SE11, Data Dictionary, Query, Table Browser, SM50]
sapDocUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/SE16N.html"
seoTitle: "SE16N: Table Data Browser in SAP — Plain Explanation"
seoDescription: "SE16N is the data browser for querying SAP tables with filters and sorts. Test data quality and row counts before automating extraction."
updatedAt: 2026-04-22
---

SE16N (Data Browser, generic version) is the SAP transaction for querying table data interactively. Open SE16N, enter a table name (ACDOCA, BKPF, VBAK), apply filters, and browse results. It replaces the older SE16 with a modern interface supporting complex filters, sorting, and exports to Excel. SE16N is your first diagnostic tool for understanding table contents.

In extraction planning, you use SE16N to: **(1) count rows** (ACDOCA for company 1000, fiscal year 2024 might have 100M rows), **(2) verify data quality** (do all BUKRS values exist?), **(3) test filter conditions** (how many rows remain after filtering BUKRS=1000 AND GJAHR=2024?), and **(4) understand typical values** (what cost centers appear? what currencies are used?). This intelligence informs your extraction strategy.

SE16N queries can be slow on huge tables (ACDOCA SELECT * might timeout), so you always apply filters. The count alone (without data) is fast via SE16N's aggregation. Don't use SE16N for bulk export of billions of rows; use it for sampling, testing, and understanding. For bulk extraction, use ODP, SLT, or Python/pyrfc.
