---
term: MANDT
fullName: Client / Mandant
slug: mandt
shortDefinition: "MANDT is a 3-digit field present in every SAP table that identifies which client (tenant) the row belongs to. Multi-client systems use MANDT to isolate data. Always filter MANDT in extraction to ensure correct client data."
relatedTerms: [Client, Tenant, Data Partitioning, SE16N, Database Keys]
sapDocUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/client.html"
seoTitle: "MANDT: SAP Client/Tenant Identifier — Plain Explanation"
seoDescription: "MANDT is the client/tenant field in all SAP tables. Multi-client systems use MANDT to isolate data; always filter MANDT in extraction."
updatedAt: 2026-04-22
---

MANDT (Mandant, the German word for "client") is a 3-digit field present in every SAP database table. MANDT identifies which logical client (tenant) a row belongs to. In multi-client SAP systems, one database instance hosts multiple isolated clients (e.g., 100 = production, 200 = testing, 300 = training). Each client has separate masters and transactional data, but they share the same database and SAP instance.

For extraction, MANDT is critical. If you extract ACDOCA without filtering MANDT=100 and accidentally include test client data (MANDT=200), your data warehouse GL will be corrupted. Most extraction tools (ODP, SLT, Python/pyrfc) automatically filter by the client you're connected to, but hand-rolled SQL queries must explicitly include WHERE MANDT=100 to avoid multi-client corruption.

MANDT is part of every table's primary key (along with BUKRS for company code, VBELN for sales document number, etc.). SE16N automatically filters to the client you're logged into, so you don't see it explicitly; it's behind the scenes. When extracting, verify that your tool is filtering the correct MANDT, especially if you're running extractions across multiple clients (migrating test data to prod, for example).
