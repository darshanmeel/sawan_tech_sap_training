---
term: DATS
fullName: Date (8-digit format)
slug: dats
shortDefinition: "DATS is SAP's date data type stored as YYYYMMDD (8 digits). Example: 20260422 for April 22, 2026. SAP handles DATS-to-local-date conversion automatically, but extractors must preserve the format."
relatedTerms: [TIMS, Data Dictionary, SE11, Date Conversion]
sapDocUrl: "https://help.sap.com/"
seoTitle: "DATS: SAP 8-Digit Date Format — Plain Explanation"
seoDescription: "DATS is SAP's date type, stored as YYYYMMDD (8 digits, e.g., 20260422). Extractors must preserve format or dates become unreadable."
updatedAt: 2026-04-22
---

### What is DATS?

**DATS** is SAP's native date data type, representing any calendar date as an 8-digit string in `YYYYMMDD` format. April 22, 2026 is stored internally as `20260422`; January 1, 1990 is `19900101`. The format is defined in the **ABAP Data Dictionary** (`SE11`) and applies uniformly to every date field across the SAP system — from posting dates in financial documents, to validity periods in contracts, to planned delivery dates in procurement. There is no timezone component in `DATS`; it is a pure calendar date.

SAP's application layer performs locale-aware formatting on the way out. When a user opens `SE16N` and sees `2026-04-22` or `22.04.2026`, that is the SAP GUI applying a user-specific date format mask on top of the raw `DATS` value. The underlying database column always holds exactly 8 characters. This distinction is easy to miss but critical for extractors: what the user sees in the GUI and what the database actually stores are different representations of the same value.

### How it works

In ABAP programs, a `DATS` field behaves like a character string of fixed length 8, but the ABAP runtime understands its semantics and allows date arithmetic. `BUDAT - 30` gives you a date 30 days earlier without any manual parsing. When RFC-enabled function modules return `DATS` fields over a remote connection, the raw 8-digit string is transmitted, and the calling system must interpret it. This is where extraction tools diverge in quality.

Well-built extraction tools — ODP connectors, certified Fivetran connectors, and RFC-aware libraries like `pyrfc` — read the ABAP metadata for each field and recognize when a field's type is `DATS`. They then automatically convert `20260422` to ISO 8601 (`2026-04-22`) or to a native date type in the target system. Poorly written extractors treat every character field as a plain string. When that happens, `20260422` lands in your data warehouse as a `VARCHAR`, date range queries silently return wrong results, and `DATE_DIFF` functions throw type errors.

### Why it matters for data extraction

High-volume SAP tables are dense with `DATS` fields. `BKPF` (accounting document header) carries `BUDAT` (posting date), `BLDAT` (document date), and `CPUDT` (entry date), all typed `DATS`. `ACDOCA` (the universal journal) carries `POPER` for fiscal period and `BUDAT` inherited from the posting. `EKKO` and `VBAK` each carry multiple date fields governing delivery windows, pricing validity, and document creation. If any of these are loaded as raw strings, downstream BI and analytics will silently compute incorrect time-series metrics.

The safest convention for cloud data warehouses is to convert `DATS` to ISO 8601 (`YYYY-MM-DD`) at extraction time. Snowflake, BigQuery, and Redshift all have native `DATE` types that accept ISO 8601 strings on load. If you load `20260422` as a `VARCHAR` instead, you can still parse it later using `TO_DATE('20260422', 'YYYYMMDD')`, but every downstream model must remember to call that function — a maintenance burden that compounds across hundreds of fields. Get the type right at the source.

### Common pitfalls

The most common `DATS` mistake is treating the 8-digit value as an integer. Some hand-rolled SQL extractors cast `DATS` columns to `INTEGER`, producing values like `20260422`. Integer arithmetic then produces nonsense: `20260422 - 20260101` equals `321`, not 111 days. Date functions reject it entirely. If you discover this problem in a live data warehouse, the remediation requires a full re-extraction and backfill of every affected column.

A subtler pitfall involves **null dates**. SAP represents an unset `DATS` field as `00000000` (eight zeros), not as a SQL `NULL`. If your extraction pipeline does a naive type cast to a native date type, `00000000` will either throw a conversion error or produce a nonsensical date like year zero. The correct handling is to map `00000000` explicitly to `NULL` before loading. Check your extraction tool's documentation for how it handles this; ODP-based connectors typically handle it automatically, but custom scripts must implement the guard explicitly.

### In practice

Imagine extracting `BKPF` to build a month-end close report in Snowflake. Your pipeline lands the table overnight and you run `SELECT COUNT(*) FROM bkpf WHERE BUDAT BETWEEN '2026-04-01' AND '2026-04-30'`. If `BUDAT` was loaded as a string in `YYYYMMDD` format, the lexicographic comparison actually works here — but only because ISO-like strings sort correctly. The moment a business user writes `DATEADD(day, -1, BUDAT)` in a Snowflake worksheet, the query fails with a type error. Enforcing the `DATE` type at ingestion time — and mapping `00000000` to `NULL` — eliminates this entire class of downstream failure.
