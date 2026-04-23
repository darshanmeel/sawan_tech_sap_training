---
term: VBELN
fullName: Sales and Distribution Document Number
slug: vbeln
shortDefinition: "VBELN is the primary key field for sales documents (VBAK table). It's a 10-digit document number that uniquely identifies a sales order, delivery, invoice, or return. Common extraction partition key."
relatedTerms: [VBAK, Sales Document, Primary Key, MANDT, BUKRS]
sapDocUrl: "https://help.sap.com/"
seoTitle: "VBELN: Sales Document Number in SAP — Plain Explanation"
seoDescription: "VBELN is the sales document number field in VBAK. Uniquely identifies orders, deliveries, invoices. Key partitioning field for extraction."
updatedAt: 2026-04-22
---

### What is VBELN?

`VBELN` is the **sales and distribution document number** field in SAP — a 10-character, left-zero-padded `NUMC` field that serves as the primary key identifier for virtually every document in the SD (Sales and Distribution) module. A value of `0001234567` is a sales order number. `0080000123` might be a delivery document. `9000100456` might be a billing document. The field name `VBELN` appears across a family of related tables, and its values are what connect an order to its deliveries and its deliveries to their invoices through the full order-to-cash process.

Understanding `VBELN` is mandatory before extracting any sales data from SAP. It is not just a key field — it is the spine of the SD data model. Every table in the SD module that holds document data is structured around `MANDT` (client) and `VBELN` as the primary key or the leading key fields. When you design an extraction of sales data for a data warehouse, you are designing around `VBELN` whether you realise it or not. Getting the `VBELN` model right — its cardinality relationships, its typing, and its role as a join key — determines whether your downstream analytics are correct.

### How it works

`VBELN` is defined as a `NUMC` field of length 10, meaning it stores only digit characters but is typed as a character string, not a number. This is critical for extraction: a `VBELN` value of `0001234567` must be stored and loaded as the string `"0001234567"`, not as the integer `1234567`. If you cast it to an integer during extraction or loading, the leading zeros are stripped, and the value becomes unrecognisable to any SAP-aware logic. This is the most common `VBELN` extraction bug, and it surfaces subtly — the data warehouse loads, joins appear to work, but reconciliation against SAP SE16N fails because your warehouse `VBELN` values don't match the SAP source.

The same `VBELN` field name appears in multiple tables but holds different document types depending on the table context. In `VBAK` (sales order header) and `VBAP` (sales order items), `VBELN` is the sales order number. In `LIKP` (delivery header) and `LIPS` (delivery items), `VBELN` is the delivery document number. In `VBRK` (billing header) and `VBRP` (billing items), `VBELN` is the billing document number. These are different number ranges and different document types — a `VBELN` in `VBRK` is not the same logical entity as a `VBELN` in `VBAK`, even though the field name is identical. The link between them is stored in the document flow table `VBFA`, which maps source `VBELN` to subsequent `VBELN` values across document types.

### Why it matters for data extraction

For extraction design, `VBELN` drives two decisions: **join architecture** and **partitioning strategy**. The join architecture must follow the SD document model correctly. `VBAK` joins to `VBAP` on `MANDT` and `VBELN`. `VBAP` links to `LIPS` via `VBFA`, not via a direct foreign key. `VBRP` links back to `VBAP` via `AUREL` (settlement reference) fields, not via `VBELN` directly. If you attempt to join `VBAK` to `VBRK` on `VBELN`, you will get no matches — or worse, wrong matches from an unintended cross-join — because they are different document types with different number ranges. The correct path goes through `VBFA`.

For partitioning, `VBELN` is useful as a range partition key on large tables. `VBAK` can accumulate tens of millions of rows in high-volume sales environments. Partitioning by `VBELN` range (dividing the numeric space of document numbers into equal bands) allows parallel readers to each process a slice. However, range partitioning on `VBELN` only works well if document numbers were assigned sequentially and the number range is well-understood. If multiple number range objects assigned `VBELN` values from non-contiguous ranges (a common customization), range partitioning may produce highly uneven partitions. In those cases, partitioning by `VKORG` (sales organisation) or by `ERDAT` (creation date) ranges is more reliable.

### Common pitfalls

The leading-zero stripping problem deserves emphasis because it is so common. Data engineers who have worked primarily with integer keys in other databases naturally assume numeric-looking fields should be stored as numbers. SAP's `NUMC` type is explicitly designed to prevent this — it is a character type that enforces digit-only content — but many extraction tools (especially those using `RFC_READ_TABLE` or generic OData calls) return `NUMC` fields as strings and then the downstream ETL casts them to integer for "efficiency." The result is broken joins and failed reconciliations. Always preserve the full 10-character string representation of `VBELN`, including leading zeros, from extraction through to the final warehouse key column.

Another pitfall is the **document type filtering** problem. `VBAK` contains sales orders, but also quotations (`AUART = AG`), contracts (`AUART = WK1`), scheduling agreements, and other document categories. If your extraction is supposed to deliver only sales orders but does not filter on `AUART`, your extract will include all document types, inflating row counts and creating join mismatches when downstream logic assumes all `VBAK` rows are orders. Always check the `AUART` (document type) distribution in SE16N and confirm the intended scope before committing to an extraction filter.

### In practice

A retail company extracts sales data from SAP ECC to a cloud data warehouse for revenue analytics. Their extraction pipeline pulls `VBAK`, `VBAP`, `VBRK`, and `VBRP` with a filter on `ERDAT >= 2023-01-01`. In the warehouse, they attempt to join `VBAK` to `VBRK` on `VBELN` to link orders to invoices, and the join returns zero rows. Investigation reveals that `VBELN` in `VBAK` uses number range `01` (values starting with `00`), while `VBELN` in `VBRK` uses number range `90` (values starting with `90`). They are entirely different number series for different document types. The correct join path — through `VBFA` which explicitly maps document flow — is implemented instead. Additionally, they discover that their ETL had cast `VBELN` from `VBAP` to `BIGINT`, stripping leading zeros and breaking the join to `VBAP` for all orders with numbers below `1000000000`. Fixing both issues — using the correct join path and preserving `VBELN` as a string — resolves the analytics discrepancy and brings warehouse revenue figures into reconciliation with SAP.
