---
id: odp
slug: odp
name: "OData / ODP via CDS"
shortName: "OData"
tagline: "The default for S/4HANA. Runtime-license compatible, scales with partitioning."
whenToUse: "Any S/4HANA table that doesn't need sub-minute latency. Works on ECC too, with fewer released views."
seoTitle: "SAP OData / ODP Extraction — When to Use, How to Handle"
seoDescription: "OData via ODP/CDS is the SAP-recommended extraction path on S/4HANA. Licensing, setup, scaling, and walkthroughs."
matrix:
  standardTables: { mark: ok }
  customZTables:  { mark: bad }
  s4:             { mark: ok, label: "Best" }
  ecc:            { mark: warn, label: "Limited" }
  fivetranNative: { mark: ok }
  agentRequired:  { mark: bad }
  sapBasisNeeded: { mark: warn, label: "Auth only" }
  customPvTables: { mark: bad }
  volumePerformance: { mark: warn, label: "Slow" }
  licenseRisk:    { mark: bad }
---

## Setup in SAP

1. Confirm the CDS view exists and is released for ODP consumption. Use
   `RODPS_REPL_TEST` to validate that the provider can stream deltas.
2. Create a technical user with `S_RFC` and `S_ODP_READ` authorizations only —
   don't give it dialog access.
3. Expose the ODP context (`ABAP_CDS`) on the SAP Gateway if your sink consumes
   over HTTP, or use the native RFC ODP API if going through a Microsoft/SAP CDC
   connector.

## How to handle

- **First-delta gotcha** — the first read on a new subscription does a full
  initialization. For heavyweight tables (ACDOCA, BSEG) this can run for hours.
  Always run the init on a maintenance window and monitor with `ODQMON`.
- **Partitioning** — split by a stable key (`RYEAR` + `RBUKRS` for FI tables,
  `ERDAT` + plant for logistics). Never run unpartitioned against a table over
  100M rows.
- **Schema drift** — if the underlying CDS view adds a column, downstream
  schemas must be refreshed explicitly. ODP won't fail; it will silently drop
  the new column.

## Tradeoffs

Runtime-license safe, no dialog user needed, works with every mainstream
connector. The cost is latency — even with parallelism you're reading through
an SAP gateway, so a 500M-row table takes real time. Custom Z-tables require a
CDS extension on top, which needs ABAP help.
