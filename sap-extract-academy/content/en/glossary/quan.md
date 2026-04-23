---
term: QUAN
fullName: Quantity
slug: quan
shortDefinition: "QUAN is a SAP data type for numeric quantity fields (order quantities, inventory balances, weights). Like CURR, QUAN fields must be paired with unit fields (MEINS or UOOM) to be interpretable."
relatedTerms: [MEINS, UOOM, CURR, NUMC, Data Dictionary]
sapDocUrl: "https://help.sap.com/"
seoTitle: "QUAN: Quantity Data Type in SAP — Plain Explanation"
seoDescription: "QUAN is the data type for quantities in SAP (order qty, inventory, weights). Always pair with unit fields (MEINS, UOOM) to make quantities meaningful."
updatedAt: 2026-04-22
---

### What is QUAN?

**QUAN** (Quantity) is an ABAP data type used throughout the SAP data model to store numeric measurement values: order quantities on purchase order items, goods receipt quantities, inventory stock balances, delivery weights, and production order quantities. A QUAN field is a fixed-point decimal number with a configurable number of decimal places defined by its associated data element in the ABAP Data Dictionary (`SE11`). Typical examples include `EKPO-MENGE` (purchase order quantity), `MSEG-ERFMG` (quantity in unit of entry for goods movements), and `MARD-LABST` (unrestricted-use stock quantity in the storage location).

The defining characteristic of QUAN is that the numeric value it holds is **meaningless in isolation**. A value of `1000` stored in `MARD-LABST` could mean 1,000 individual units, 1,000 kilograms, 1,000 litres, or 1,000 pieces — completely different business realities with different implications for supply chain planning and financial valuation. This is why SAP always defines a QUAN field with a **reference to a unit field** in the same table or a related table. That pairing is not a convention; it is encoded in the data element definition in the ABAP dictionary and is enforceable by SAP's input validation.

### How it works

In `SE11`, every QUAN data element has a **quantity unit reference** attribute that points to the companion field storing the unit of measure. For example, `MARA-NTGEW` (net weight of a material) references `MARA-GEWEI` (weight unit). `EKPO-MENGE` (purchase order quantity) references `EKPO-MEINS` (purchase order unit of measure). `MARD-LABST` (storage location stock) references `MARA-MEINS` (base unit of measure), which is stored on the material master, not on the inventory record itself — which means you must join across tables to get the full context.

The unit of measure values stored in `MEINS`, `UOOM`, and similar fields follow the SAP **internal unit codes** (ISO-adjacent but not always identical). `KG` means kilogram, `EA` means each, `LT` means litre, `ST` means piece (from German "Stück"), and `PC` also means piece in some contexts. When extracting to a cloud warehouse, you should map these codes to a standardised unit vocabulary (ISO 80000 or your organisation's own standard) in a dimension table rather than relying on the raw SAP codes in fact table joins.

Internally, QUAN fields are stored in the HANA database as `DECIMAL` with the precision and scale defined in the data element. Over RFC (`RFC_ODP_READ` or `RFC_READ_TABLE`), quantities are transferred as strings in character-encoded decimal format, which must be parsed to `DECIMAL` or `FLOAT` in your extraction layer with explicit scale handling.

### Why it matters for data extraction

Supply chain analytics — inventory analysis, procurement spend, demand planning, warehouse management — are built entirely on QUAN fields. If you extract `EKPO-MENGE` without `EKPO-MEINS`, you have a table of order quantities with no unit context. Any aggregate (total ordered quantity, inventory turn calculation, fill rate) is arithmetically computable but semantically invalid: you cannot sum kilograms and pieces as if they were the same thing. Business users will notice within one reporting cycle when the numbers do not reconcile with their operational systems.

The parallel to `CURR`/`CUKY` pairing is exact and instructive. Just as currency amounts require a currency code to be interpretable, quantities require a unit of measure. Both patterns share the same underlying failure mode: numeric extraction without the qualifier field produces data that looks correct but is analytically wrong. In both cases, the fix is enforced at extraction design time — auditing `SE11` for QUAN fields and their unit references, then selecting both fields in every extraction query.

For inventory analytics specifically, the multi-table nature of the unit reference creates a common trap. `MARD` (material stock data by storage location) stores stock quantities but not the base unit of measure — that lives on `MARA` (the material master). An extraction that pulls `MARD` alone and joins only on `MATNR` may work correctly in development, where all materials happen to have been pre-loaded, but fail in production when new materials are created in SAP before the nightly material master extraction runs, leaving the inventory fact table with null units.

### Common pitfalls

The most frequent QUAN-related extraction error is **mixed-unit aggregation**. A SQL query that sums `EKPO-MENGE` across all purchase order items will produce a number that mixes units — if 50% of items are ordered in `KG` and 50% in `PC`, the sum is nonsense. Every aggregate over a QUAN field must either filter to a single unit of measure or perform a unit conversion before summing. Build this constraint into your dbt models as a test: `assert all(unit_of_measure == 'KG')` before any weight aggregation.

A second pitfall is **decimal scale mismatch**. QUAN fields can have different decimal precisions depending on the data element. `EKPO-MENGE` supports up to 3 decimal places for some unit types but is stored with the scale defined in `T006` (units of measure table), which can vary. If your warehouse schema defines all QUAN columns as `DECIMAL(18,2)`, you may silently truncate quantities that SAP stores with 3 or more decimal places. Always inspect the data element definition in `SE11` and consult `T006` for the unit-specific decimal place configuration.

### In practice

When extracting `EKPO` for a procurement analytics use case, the correct field selection includes `MENGE` (ordered quantity) and `MEINS` (purchase order unit of measure) together, as well as `BPRME` (order price unit) and `PEINH` (price unit) if you need to compute unit prices. In your dbt staging model, land both columns in the fact table and create a separate `dim_unit_of_measure` dimension sourced from `T006`. In the mart layer, compute aggregated quantities only within groups sharing the same `MEINS` value, or apply a conversion factor from `T006A` (unit conversions) before cross-unit aggregation. This design makes the unit assumption explicit and queryable rather than hidden in a SQL filter.
