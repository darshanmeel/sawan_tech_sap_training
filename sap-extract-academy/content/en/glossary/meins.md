---
term: MEINS
fullName: Material Unit of Measure
slug: meins
shortDefinition: "MEINS is a field in MARA (material master) that specifies the base unit of measure for a material: EA (each), KG (kilogram), LT (liter), CM (centimeter), etc. Must be paired with quantity fields when extracting."
relatedTerms: [QUAN, MARA, Material Master, Unit of Measure, Data Dictionary]
sapDocUrl: "https://help.sap.com/"
seoTitle: "MEINS: Material Unit of Measure in SAP — Plain Explanation"
seoDescription: "MEINS specifies the base unit of measure for materials in MARA (EA, KG, L, CM, etc.). Always pair with quantity fields in extraction."
updatedAt: 2026-04-22
---

### What is MEINS?

**MEINS** (from the German *Maßeinheit*, meaning "unit of measure") is the field in the material master table `MARA` that records the **base unit of measure** for a material. It is a 3-character code drawn from SAP's internal unit of measure table (`T006`), which defines every unit the system recognizes: `EA` for each (individual piece), `KG` for kilogram, `LT` for liter, `M` for meter, `CM` for centimeter, `ST` for piece (German *Stück*), and hundreds of others. Every material in SAP has exactly one `MEINS` value, and that value is the reference unit against which all quantities for that material are expressed throughout the system.

`MEINS` is not merely a label or a display hint — it is a **reference field** in the ABAP Data Dictionary. Quantity fields in SAP tables are formally linked to their corresponding unit fields through a `REFSFIELD` (reference field) declaration in `SE11`. When you look up `MARA-LAENG` (material length) in the Data Dictionary, its reference unit field points to `MARA-MEINS`. This linkage means that every quantity stored for a material inherits its dimensional meaning from `MEINS`. Without that field, the number is dimensionless and operationally useless.

### How it works

The `MEINS` field in `MARA` establishes the **base unit of measure** — the primary unit in which a material is managed in inventory, procurement, and production. SAP also supports **alternative units of measure** stored in `MARA`'s companion table `MARM`, which records conversion factors between the base unit and every alternative unit. For example, a beverage material might have `MEINS = LT` (base unit: liter), with an alternative unit of `CS` (case of 24 bottles, each 0.5 liters, making one case = 12 liters). The conversion factor in `MARM` allows SAP to convert purchase orders in cases to inventory in liters seamlessly.

In procurement, the purchase order table `EKPO` carries `MEINS` alongside the ordered quantity `MENGE`. Here `MEINS` refers to the order unit (which may differ from the base unit if a purchasing unit of measure is configured), and `BPRME` holds the price unit. In warehouse management, `LGMNG` (storage location stock quantity) in `MARD` is always expressed in `MEINS` from `MARA`. In sales, `VBAP-MEINS` holds the sales unit. The field name `MEINS` appears across many tables, always playing the same structural role: pairing with an adjacent quantity field to give that quantity its dimensional context.

### Why it matters for data extraction

A quantity without a unit is meaningless in any analytical context. If you extract material stock balances from `MARD` — the table holding storage location stocks — without also extracting `MARA-MEINS`, your data warehouse contains numbers like `1000`, `250`, `5000` with no indication of whether these represent kilograms, liters, pieces, or meters. An analyst building an inventory report cannot determine whether `1000` units of a pharmaceutical material means 1000 individual pills, 1000 grams, or 1000 milliliters — a distinction with serious real-world consequences.

This pairing requirement extends across the entire SAP data model. Wherever a quantity field (`QUAN` type in the ABAP Data Dictionary) appears, there is a corresponding unit field (`UNIT` type) nearby. Extraction pipelines that select quantity fields without their unit companions produce semantically broken datasets. The problem is compounded when multiple materials are extracted together: one material uses `KG`, another uses `EA`, another uses `M2` (square meter). Without `MEINS`, you cannot even normalize the quantities to a common base for aggregation, because you do not know which conversion factor to apply.

### Common pitfalls

**Extracting quantity fields without unit fields** is the most common and damaging `MEINS`-related mistake. It typically happens when an analyst or engineer browses `MARD` or `EKPO` in `SE16N`, identifies the quantity columns they need, and builds an extraction that selects only those columns. The unit columns — `MEINS`, `ERFME`, `BPRME` — are not numerically interesting so they are overlooked. The error becomes visible only when business users try to interpret the extracted data and discover that units are missing. Remediation requires a re-extraction of all affected tables and a schema migration in the data warehouse.

**Failing to handle unit code translation** is a subtler problem. SAP's internal unit codes (`LT`, `ST`, `EA`) are not always ISO standard codes. ISO 80000 uses `L` for liter, not `LT`. The ISO unit for piece is not `EA`. If your data warehouse schema uses ISO units or your downstream systems (ERP integrations, EDI exchanges, analytics platforms) expect ISO codes, you need a translation layer that maps SAP internal codes via `T006` to their ISO equivalents. `T006` contains the `ISOCD` field for exactly this purpose. Extract `T006` alongside your material data and join on `MEINS` to resolve ISO codes in the warehouse rather than hardcoding a mapping table.

**Ignoring alternative units of measure from `MARM`** leads to incomplete supply chain analytics. If a consumer goods company purchases in cases (`CS`) but manages inventory in liters (`LT`), procurement reports show case quantities while inventory reports show liters. Without the conversion factors from `MARM`, analysts cannot reconcile purchase order quantities against inventory movements. Any extraction that covers both procurement and inventory for materials with multiple units of measure must include `MARM` to make the data self-consistent.

### In practice

A supply chain analytics team extracts purchase order data from `EKPO` into Snowflake. Their initial extraction includes `MATNR` (material number), `MENGE` (ordered quantity), and `NETPR` (net price) but omits `MEINS`. After loading several months of data, the demand planning team notices that material `MAT-7734` shows an average monthly order quantity of 500, while a neighboring material `MAT-8821` also shows 500. But one is ordered in `KG` and the other in `EA` — a distinction invisible in the extracted data. The team re-extracts `EKPO` with `MEINS` included, joins `MARM` to add conversion factors, and adds `T006` to resolve ISO codes. Downstream dbt models now normalize all quantities to base units using the `MARM` conversion factors, enabling accurate cross-material demand comparisons for the first time.
