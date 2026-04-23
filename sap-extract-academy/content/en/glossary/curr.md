---
term: CURR
fullName: Currency Amount
slug: curr
shortDefinition: "CURR is a SAP data type for numeric fields representing monetary amounts. A CURR field must be paired with a CUKY (currency key) field to be interpretable; extracting one without the other creates orphaned data."
relatedTerms: [CUKY, QUAN, MEINS, NUMC, Data Dictionary]
sapDocUrl: "https://help.sap.com/"
seoTitle: "CURR: Currency Amount in SAP — Plain Explanation"
seoDescription: "CURR is the data type for monetary amounts in SAP. Always pair with CUKY (currency key); extract both or your data warehouse amounts are meaningless."
updatedAt: 2026-04-22
---

### What is CURR?

CURR (Currency Amount) is SAP's dedicated data type for fields that store monetary values. Unlike a generic numeric field, a CURR field carries formal metadata in the SAP Data Dictionary (`SE11`) that declares it as a currency amount, specifies its decimal precision, and — critically — references a companion `CUKY` field that provides the currency code needed to interpret the number. Examples of CURR fields in common tables: `BKPF-DMBTR` (amount in document currency on the accounting document header), `ACDOCA-HSL` (amount in company code currency on the Universal Journal), `EKPO-NETWR` (net value of a purchase order line item), `VBAP-NETWR` (net value of a sales order line item).

At the database level, CURR is stored as a packed decimal number. SAP does not store the currency symbol or code alongside the amount in the same column — the amount is just a number, and its meaning depends entirely on the companion CUKY field. This separation is deliberate: it allows the same amount field to represent any currency without changing the field definition, because the currency identity is carried by the CUKY field, not by the CURR field itself.

### How it works

In `SE11`, every CURR field has two mandatory reference declarations in its domain or data element: the **reference table** (the table where the companion CUKY field lives) and the **reference field** (the name of the CUKY field in that table). For `BKPF-DMBTR`, the reference table is `BKPF` and the reference field is `WAERS` — meaning "look at the `WAERS` column in the same `BKPF` row to get the currency for this amount." For `VBAP-NETWR`, the reference points to `VBAK-WAERK` (the document currency from the sales order header, since `VBAP` itself doesn't carry the currency key).

This cross-table reference is a crucial detail for extraction design. When the CUKY reference field is in a **different table** than the CURR field — as with `VBAP-NETWR` referencing `VBAK-WAERK` — a line-item-only extraction is incomplete by definition. You cannot extract `VBAP` alone and have interpretable monetary values; you must join `VBAK` and carry the currency key into the output. SAP's CDS views (`I_SalesDocumentItem`) handle this automatically by including the header currency in the view projection. But any manual extraction that works directly on `VBAP` without joining `VBAK` will produce orphaned amounts.

CURR fields have **currency-specific decimal precision**. Japanese yen (`JPY`) has zero decimal places; US dollars (`USD`) have two; some currencies have three. SAP stores amounts with the currency's standard decimal precision already applied. When you extract `DMBTR = 150000` with `WAERS = JPY`, that is 150,000 yen (no decimals). When you extract `DMBTR = 150000` with `WAERS = USD`, that is $1,500.00 (two implied decimal places). If your extraction tool doesn't handle this correctly — typically by reading the `TCURX` table which stores non-standard decimal precision by currency — you will misrepresent values for JPY, KWD, and other non-standard-decimal currencies.

### Why it matters for data extraction

The CURR/CUKY pairing requirement is the single most common source of **silent data correctness failures** in SAP extraction projects. Unlike a missing field (which is obvious) or an extraction error (which is loud), an orphaned CURR field loads successfully into the warehouse, passes schema validation, and appears correct until an accountant tries to reconcile the numbers and discovers that USD and EUR amounts are mixed in the same column with no currency identifier. By that point, the data has often been used in dashboards and reports, making the correction both technically and organizationally painful.

For data architects, the discipline of CURR/CUKY pairing must be enforced at every layer: in the extraction field list, in the staging schema, in the warehouse fact table definition, and in any BI tool metric definitions. A best practice is to name warehouse columns to make the pairing explicit — `document_amount_usd` if you've applied currency conversion, or `document_amount` paired with `document_currency` as adjacent non-nullable columns if you're storing raw values. Never allow a monetary column without an adjacent currency column, and enforce this as a schema constraint where possible.

Multi-currency systems add complexity. An `ACDOCA` row for a cross-currency posting contains amounts in transaction currency, company code currency, controlling area currency, and potentially group and profit center currencies — each as a separate CURR/CUKY pair. An extraction that pulls only the company code currency amounts and discards the transaction currency amounts loses information about the original economic event and prevents downstream currency reconciliation. Full fidelity `ACDOCA` extraction requires bringing all active currency columns — typically six to eight CURR fields and their companion CUKY fields per row.

### Common pitfalls

The most dangerous pitfall is **hardcoded currency assumptions** in extraction scripts. A developer who builds an extraction for a single-currency subsidiary writes a `SELECT NETWR FROM VBAP` query and documents the assumption "all amounts are USD" in a comment. Two years later, the company opens operations in Germany. The assumption is now wrong, but the comment is buried, the downstream model doesn't have a currency column, and the historical data has no currency context. Hardcoded currency assumptions are technical debt that accrues interest invisibly until a multi-currency event makes it catastrophic.

A second pitfall is **decimal precision mismatch**. When loading CURR values from SAP into a target database (Snowflake, BigQuery, Redshift), the decimal precision must match the currency's rules. If your warehouse stores all amounts as `NUMERIC(18, 2)` but receives JPY amounts with zero decimals, the stored value will be correct only if the loading process doesn't divide by 100 assuming two decimal places. Always validate CURR decimal handling with a test case that includes JPY or another zero-decimal currency before signing off on an extraction.

Also watch for **CURR fields in BW InfoCubes and DSOs** during migration projects. BW may have applied currency conversion at load time, transforming all amounts to a single reporting currency. If you extract from BW to get historical data, the CURR fields in BW may already be in EUR (converted from the original transaction currencies). Extracting these BW-converted amounts and treating them as source-currency amounts introduces a systematic error in the target warehouse. Always determine whether BW conversion was applied before using BW-sourced CURR values in a new data model.

### In practice

A controlled extraction test for validating CURR/CUKY handling: query `BKPF` for a set of documents across multiple company codes using `SE16N`, filtering for `WAERS NOT EQUAL USD` to deliberately find non-USD postings. Take ten rows with mixed currencies. Run your extraction and confirm that each row's extracted amount matches `SE16N`, that the currency code is correctly extracted alongside it, and that JPY amounts are not being divided by 100. If all ten rows match `SE16N` exactly — amount and currency — your CURR/CUKY extraction logic is correct. If any amount is off by a factor of 100, you have a decimal precision bug. If any currency is missing or defaulted to `USD`, you have a CUKY pairing bug. Run this test before every go-live of a financial extraction pipeline.
