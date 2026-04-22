---
term: VBELN
fullName: Sales and Distribution Document Number
slug: vbeln
shortDefinition: "VBELN is the primary key field for sales documents (VBAK table). It's a 10-digit document number that uniquely identifies a sales order, delivery, invoice, or return. Common extraction partition key."
relatedTerms: [VBAK, Sales Document, Primary Key, MANDT, BUKRS]
sapDocUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/vbak.html"
seoTitle: "VBELN: Sales Document Number in SAP — Plain Explanation"
seoDescription: "VBELN is the sales document number field in VBAK. Uniquely identifies orders, deliveries, invoices. Key partitioning field for extraction."
updatedAt: 2026-04-22
---

VBELN is a 10-digit field that uniquely identifies a sales document in SAP. Examples: sales order 1234567890, delivery 1000123456, invoice 5000000123. VBELN appears in VBAK (sales header), VBAP (line items), LIKP (delivery header), LIPS (delivery items), VBRK (billing header), VBRP (billing items). It's the primary key linking all sales documents across modules.

For extraction, VBELN is often used as a partition key for parallelism. If VBAK has 100M sales orders and you need to extract all, you might partition by VBELN range: reader 1 extracts VBELN 0000000001–0000010000, reader 2 extracts 0000010001–0000020000, etc. This avoids processing one massive table sequentially. Alternatively, you partition by VKORG (sales organization) or date range (ERDAT posting date), depending on data characteristics.

When extracting sales data to a warehouse, VBELN is the dimension key for joining sales header (VBAK) to line items (VBAP) to delivery (LIKP) to billing (VBRK). Understanding VBELN cardinality (1 header: N line items: M delivery items: K billing items) is critical for join design and reconciliation.
