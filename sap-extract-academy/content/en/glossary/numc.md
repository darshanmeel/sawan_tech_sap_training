---
term: NUMC
fullName: Numeric Character String
slug: numc
shortDefinition: "NUMC is a SAP data type for numeric strings with leading zeros preserved (e.g., '00001234'). Common for codes and IDs that must display leading zeros but are treated as numbers in SAP."
relatedTerms: [CHAR, Data Dictionary, SE11, Field Type]
sapDocUrl: "https://help.sap.com/"
seoTitle: "NUMC: Numeric Character Type in SAP — Plain Explanation"
seoDescription: "NUMC is a numeric character field that preserves leading zeros (00001234). Used for codes and IDs that need to display leading zeros."
updatedAt: 2026-04-22
---

### What is NUMC?

**NUMC** (Numeric Character) is a SAP ABAP data type that stores strings containing only numeric digits, while unconditionally preserving **leading zeros**. It is defined in the ABAP Data Dictionary with a fixed length, so a `NUMC(10)` field always contains exactly 10 characters — padding with zeros from the left when the actual value is shorter. Common NUMC fields include `BELNR` (accounting document number), `KOSTL` (cost center), `EKGRP` (purchasing group), and `LIFNR` (vendor account number). Despite looking like numbers, these values are fundamentally character strings: alphabetical sorting, string concatenation, and equality matching all apply, not arithmetic.

The distinction from a plain `CHAR` field is semantic. NUMC tells SAP — and extraction tools that read ABAP dictionary metadata — that only digit characters are valid. SAP enforces this at input validation time. From an extraction standpoint, however, NUMC and `CHAR` behave identically: both transfer as fixed-length strings over RFC, and both must land in a `VARCHAR` or `TEXT` column in the target warehouse.

### How it works

In `SE11`, the Data Dictionary viewer, each table field shows its data type and length. When you inspect `BSEG-BELNR`, you'll see `NUMC` with length 10. The ABAP runtime stores this as a 10-byte character array. When SAP serialises a table row for RFC transfer (for example, when your extraction calls `RFC_READ_TABLE` or `RFC_ODP_READ`), NUMC fields arrive as zero-padded strings. A document number internally stored as `1234` arrives over the wire as `0000001234`.

The SAP HANA database underneath S/4HANA stores NUMC columns as `NVARCHAR` with a fixed-length constraint. When CDS views are defined over NUMC fields, the CDS metadata carries the domain type, which is how ODP-aware extractors know to treat the column as a string. Tools like Fivetran read ABAP dictionary metadata before extraction and map NUMC to `VARCHAR` in the target automatically.

### Why it matters for data extraction

The leading-zero problem is one of the most common subtle data quality failures in SAP extraction projects. If a Python script reads the RFC response and coerces field values into Python `int` or `float` objects — which many generic CSV or dataframe libraries do by default when a column looks numeric — `0000001234` becomes `1234`. That truncated value is then loaded into Snowflake, BigQuery, or Databricks as an integer or as a string `'1234'`. Every subsequent `JOIN` between the fact table and a dimension keyed on `KOSTL` silently produces no matches, because `'00001234' != '1234'`. The extraction appears to succeed, row counts are correct, but business metrics are wrong.

When planning any extraction, open `SE11`, look up the source table, and audit every field with type NUMC. Document which fields require string treatment. In your target schema, define those columns as `VARCHAR` or `STRING` with sufficient length (match the NUMC length exactly). If you use dbt, add a `LPAD(column, 10, '0')` transformation as a safeguard for any pipeline stage that might have silently dropped leading zeros. Never rely on visual inspection of sample data alone — a cost center of `1234` looks fine until you encounter `0001234` in production and discover the mismatch.

### Common pitfalls

A frequent mistake is configuring pandas `read_csv` or a Spark `read.csv` with `inferSchema=True` when processing RFC extract files. Both engines will detect an all-numeric column and cast it to `LongType` or `int64`, stripping leading zeros before the data ever reaches the warehouse. Always specify schemas explicitly. Similarly, JSON serialisation of RFC results in Python will preserve NUMC as a string, but only if you do not call `int()` on the value anywhere in the pipeline — a common shortcut when developers want to "normalise" identifiers.

Another pitfall arises in join keys across systems. If a CRM system stores vendor IDs without leading zeros and SAP NUMC fields include them, the reconciliation query will fail or produce duplicates. Canonicalise NUMC values to their full zero-padded form at ingestion time, not at query time, so that the canonical form is what gets indexed and compared.

### In practice

Suppose you are extracting the `EKPO` (purchase order item) table and joining it to a vendor master lookup built from `LFA1`. The vendor account field `EKPO-LIFNR` is `NUMC(10)`, and `LFA1-LIFNR` is also `NUMC(10)`. Your Python extractor reads both tables, converts each RFC response row to a Python dict, and writes to Parquet. If you don't enforce string typing in your Parquet writer schema, Parquet will infer `INT64` for `LIFNR` in whichever table happens to have all short values. The join in your warehouse will return zero rows. The fix: define the Parquet schema with `pa.field('LIFNR', pa.string())` before writing, then validate with `LPAD(LIFNR, 10, '0')` in your dbt staging layer.
