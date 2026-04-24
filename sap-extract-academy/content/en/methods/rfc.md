---
id: rfc
slug: rfc
name: "RFC / BAPI"
shortName: "RFC/BAPI"
tagline: "Works on anything. Fast. Requires a real SAP RFC user and careful row-size handling."
whenToUse: "ECC systems, custom Z-tables, anywhere OData isn't released. Also when you need a known-fast path and can spend a Basis conversation."
seoTitle: "SAP RFC / BAPI Extraction — When to Use, How to Handle"
seoDescription: "RFC_READ_TABLE and custom BAPIs for SAP extraction. License considerations, row-size limits, partitioned reads, walkthroughs."
matrix:
  standardTables: { mark: ok }
  customZTables:  { mark: ok }
  s4:             { mark: ok }
  ecc:            { mark: ok, label: "Best" }
  fivetranNative: { mark: ok, label: "Enterprise" }
  agentRequired:  { mark: ok }
  sapBasisNeeded: { mark: ok, label: "RFC user" }
  customPvTables: { mark: ok }
  volumePerformance: { mark: ok, label: "Fast" }
  licenseRisk:    { mark: bad }
---

## Setup in SAP

1. Create an RFC communication user with `S_RFC` on `SDTX`, `SYST`,
   `/SAPDS/*` function groups as needed. No dialog.
2. For wide tables, use `/SAPDS/RFC_READ_TABLE2` (Fivetran/SAP Data Services
   ships this) instead of stock `RFC_READ_TABLE` — stock is capped at 512 bytes
   per row.
3. If you own the BAPI, expose a custom Function Module returning a flat
   structure; that bypasses the row-width limit entirely.

## How to handle

- **Row-width cap** — stock `RFC_READ_TABLE` truncates long rows silently. Either
  switch to `/SAPDS/RFC_READ_TABLE2`, split the column list into multiple calls
  and join downstream, or ship a custom FM.
- **Parallelism** — partition with `WHERE` clauses on a stable key. Watch
  `SM50` on the SAP side — a 16-way parallel read will happily pin every
  available dialog work process.
- **Z-column changes** — appending a Z-column via `SE11` append structure
  becomes visible on the next RFC call without redeployment, but the caller
  must list it explicitly in `FIELDS`.

## Tradeoffs

Everything works. Fastest stable option for ECC. Downside: you need a real
communication user, the connector has to be enterprise-grade (agent-based for
most tools), and there's meaningful Basis involvement to provision and monitor
the RFC destination.
