---
id: direct-db
slug: direct-db
name: "Direct DB read"
shortName: "Direct DB"
tagline: "JDBC straight to HANA or the underlying DB. Fastest path, highest license risk."
whenToUse: "Usually: don't. When you own the SAP landscape end-to-end and have an explicit license opinion in writing, it's the fastest extraction interface."
seoTitle: "SAP Direct DB Extraction — When to Use, How to Handle"
seoDescription: "Reading SAP tables directly via HANA JDBC. License implications, pool/cluster table traps, walkthroughs."
matrix:
  standardTables: { mark: warn }
  customZTables:  { mark: warn }
  s4:             { mark: bad }
  ecc:            { mark: bad }
  fivetranNative: { mark: ok, label: "DB connector" }
  agentRequired:  { mark: bad }
  sapBasisNeeded: { mark: bad }
  customPvTables: { mark: warn }
  volumePerformance: { mark: ok }
  licenseRisk:    { mark: warn, label: "High" }
---

## Setup

1. Get DB credentials with read access on the SAP schema (`SAPSR3`, `SAPHANADB`,
   or whatever your system uses). This almost always needs a DBA, not a Basis,
   because SAP doesn't provision DB users through its normal tooling.
2. Connect the sink (Fivetran DB connector, Databricks JDBC, custom Python)
   directly to the SAP database. No SAP application layer involvement.
3. Query the raw tables. Columns and types match the SAP Data Dictionary, but
   none of the app-level semantics (currency conversion, authorization, release
   status) are enforced.

## How to handle

- **License risk is real** — SAP's standard licensing reserves "indirect use"
  and most read paths for the application layer. Direct DB reads are often
  contractually restricted. Get the license question answered in writing
  before anything ships to production.
- **Pool and cluster tables** — in ECC, some tables (`BSEG`, `KONV`,
  `RFBLG`) are stored inside cluster tables. A direct SELECT returns
  unreadable binary. On S/4HANA these were flattened, so they read cleanly,
  but you still need to check per-table.
- **Custom Z-tables** — readable directly, but the SAP Data Dictionary is the
  only source of truth for types. The DB catalog has raw storage types
  (`NVARCHAR`, `DECIMAL`) that lose SAP semantics like NUMC leading zeros.

## Tradeoffs

Fastest possible reads and no SAP runtime overhead. Against that: genuine
license exposure, no application-layer protections, cluster-table traps on
ECC, and the operational awkwardness of a DB-level account that Basis
doesn't own. Use as an extraction path of last resort, not a default.
