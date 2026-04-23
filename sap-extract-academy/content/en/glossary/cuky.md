---
term: CUKY
fullName: Currency Key
slug: cuky
shortDefinition: "CUKY is a SAP data type field that stores a currency code (e.g., USD, EUR, JPY). Often paired with amount fields; you must extract both CUKY and its corresponding amount to properly interpret the value."
relatedTerms: [CURR, QUAN, MEINS, Z-field, ACDOCA, Data Dictionary]
sapDocUrl: "https://help.sap.com/"
seoTitle: "CUKY: Currency Key in SAP — Plain Explanation"
seoDescription: "CUKY is a currency key field (USD, EUR, JPY, etc.) in SAP. Always paired with amount fields; extract both CUKY and amount to interpret values correctly."
updatedAt: 2026-04-22
---

### What is CUKY?

CUKY (Currency Key) is one of SAP's fundamental data types, used to store a 3-character ISO currency code: `USD`, `EUR`, `JPY`, `CHF`, `GBP`, `CNY`, and so on. In SAP's Data Dictionary (`SE11`), CUKY is not just a field convention — it is a formal data type that carries semantic meaning at the metadata level. When a field is defined with the CUKY data type, SAP's dictionary machinery knows it is a currency key, and any associated amount field (typed `CURR`) that references this CUKY field inherits the currency context.

CUKY fields appear throughout SAP's financial and procurement tables. In `BKPF`, the field `WAERS` is CUKY and stores the document currency of the accounting posting. In `ACDOCA`, there are multiple CUKY fields: `RHCUR` (company code currency), `RKCUR` (controlling area currency), `RCCUR` (cost object currency), `RCRCUR` (transaction currency), and others. In `EKPO` (purchase order line items), `WAERS` carries the purchase order currency. Every one of these CUKY fields has one or more companion `CURR` amount fields that are meaningless without it.

### How it works

In `SE11`, the CUKY relationship is declared explicitly at the data element level, not just by naming convention. When you open the data element for an amount field — for example, `DMBTR` (amount in document currency in `BKPF`) — the Dictionary shows a **Currency/Quantity field** reference that points to `WAERS` as the reference currency key field. This metadata drives several SAP behaviors: the ABAP runtime enforces that when you move amounts between internal tables, the currency key travels with it; ALV grids format amounts with the correct decimal places for the given currency; and BW extraction frameworks use this reference to set up correct currency conversion steps.

The pairing is enforced structurally in the Database Dictionary. You cannot define a `CURR` field in a table without declaring which `CUKY` field it references. If you look at `BKPF` in `SE11`, you will see that `DMBTR` has a reference field of `WAERS` and a reference table of `BKPF` — meaning "look in the current row's `WAERS` field to know the currency of this amount." The same pattern repeats for every CURR/CUKY pair in the system.

In `ACDOCA`, the multi-currency architecture means a single journal entry line item stores the same economic event in up to six currencies simultaneously. Each currency dimension has its own CUKY field and one or more CURR fields. For example, the transaction currency amount is stored in `TRSHB` with its currency in `TCURR`; the local (company code) currency amount is in `HSL` with its currency in `RHCUR`; the group currency amount is in `KSL` with its currency in `RKCUR`. An extraction that captures only the amounts without the corresponding CUKY fields produces a completely uninterpretable result for finance users.

### Why it matters for data extraction

The most direct extraction consequence of CUKY is this: **an amount without its currency key is not a number — it is an error waiting to happen**. A data warehouse column named `document_amount` containing the value `1500000` tells you nothing if the currency is missing. Is it 1.5 million USD? 1.5 million JPY (about $10,000)? 1.5 million IRR (about $30)? The orders-of-magnitude difference makes the field not just useless but actively dangerous if used in financial reporting.

For extraction planning, this means every `CURR` field on your extraction list must be accompanied by its companion `CUKY` field, and these pairs must be kept together in the data model — not split across different tables or stages. In a Snowflake data model, the `document_currency_key` column belongs in the same row and the same table as `document_amount`, never in a separate lookup table that might not join correctly for every row.

Modern extraction tools handle CUKY pairing correctly when they introspect the SAP Data Dictionary metadata. Fivetran, for example, reads the `SE11` reference field declarations and automatically includes CUKY companion fields whenever a CURR field is selected. ODP-based extraction via CDS views also preserves the pairing because the CDS view definition carries the same metadata as the underlying table. The risk lies in **manual extraction approaches**: hand-written SQL queries against the SAP schema, Python scripts using `RFC_READ_TABLE` with an explicit field list, or custom ABAP programs that SELECT only the amount fields and discard the currency fields as "not needed for now."

### Common pitfalls

The most common CUKY pitfall is **partial field selection** in manual extractors. A developer building a `pyrfc` script to pull `BKPF` might select `BUKRS`, `BELNR`, `GJAHR`, `BLDAT`, `DMBTR` and consider that sufficient for a financial document header extract. `WAERS` (the document currency CUKY field) is left off the list because "we only care about the amount." In a single-currency company where everything posts in USD, this appears to work fine for months — until the company acquires a European subsidiary that posts in EUR, and the warehouse suddenly contains a mixture of USD and EUR amounts in the same column with no way to distinguish them.

A second pitfall is **multi-currency confusion in ACDOCA**. `ACDOCA` stores amounts in multiple currency types simultaneously. Extractors that grab all `CURR` fields from `ACDOCA` without understanding which CUKY field governs each amount often produce incorrectly paired output — for example, pairing the transaction currency amount `TRSHB` with the company code currency key `RHCUR` instead of the transaction currency key `TCURR`. The resulting data appears plausible but is wrong for any posting where the transaction currency differs from the company code currency. Always map the CURR-to-CUKY pairing from `SE11` before writing the field list for `ACDOCA` extraction.

Finally, watch for **custom append structure amounts without CUKY references**. Developers adding custom `CURR` fields to append structures on `MARA`, `VBAK`, or `EKKO` sometimes omit the CUKY reference declaration in `SE11`, either from oversight or because they hardcode the currency assumption into the business logic. If a custom amount field has no CUKY reference in `SE11`, interrogate the developer who built it: is the currency always USD? Is it stored separately? Is the assumption documented anywhere? An undocumented hardcoded currency assumption is a time bomb in any multi-currency environment.

### In practice

Consider extracting `EKPO` (purchase order line items) for a procurement analytics project. The key amount fields are `NETWR` (net order value) and `BRTWR` (gross order value), both paired with `WAERS` (the purchasing document currency from `EKKO`). Note that `WAERS` lives in `EKKO` (header), not in `EKPO` (line item) — so a line-item-only extraction of `EKPO` without joining `EKKO.WAERS` is missing the currency key entirely. Your extraction must join `EKKO` to `EKPO` on `EBELN` and carry `WAERS` into the line-item output. In the Snowflake target, the fact table for PO line items must include `waers` as a non-nullable column adjacent to every amount field. This is not optional polish — it is what makes the amounts interpretable.
