---
id: slt
slug: slt
name: "SLT replication"
shortName: "SLT"
tagline: "Real-time row-level replication. Full-Use license, substantial Basis setup."
whenToUse: "When latency under a minute matters — regulatory reporting, near-real-time analytics, CDC for downstream systems. Not for a one-shot extract."
seoTitle: "SAP SLT Replication — When to Use, How to Handle"
seoDescription: "SLT (Landscape Transformation) replication for real-time SAP table CDC. Licensing, LTRC/LTRS setup, Z-columns via rule assignment."
matrix:
  standardTables: { mark: ok }
  customZTables:  { mark: ok }
  s4:             { mark: ok }
  ecc:            { mark: ok }
  fivetranNative: { mark: bad }
  agentRequired:  { mark: bad }
  sapBasisNeeded: { mark: ok, label: "Substantial" }
  customPvTables: { mark: ok }
  volumePerformance: { mark: ok, label: "Real-time" }
  licenseRisk:    { mark: warn, label: "Full Use" }
---

## Setup in SAP

1. Install the SLT add-on on a dedicated system (or co-deploy with Datasphere /
   Data Intelligence). Create a replication configuration in `LTRC`.
2. In `LTRS`, add each source table you want to replicate and map it to the
   target. Rule assignments happen here — Z-columns, filters, and field-level
   transformations are expressed as ABAP in rule blocks.
3. Start the initial load. SLT reads the cluster table entries via the DB
   interface, not RFC — performance is a function of the source DB, not the
   SAP work processes.

## How to handle

- **Full-Use license required** — SLT reads below the SAP application layer, so
  a Runtime license typically doesn't cover it. Get the license question
  answered before you start.
- **Z-columns** — add the column to the target structure in `LTRS`, then write
  a field- or event-related rule in ABAP to populate it. The rule runs for
  every replicated row.
- **Init load strategy** — for heavyweight tables, split the initial load
  across multiple partitions (LTRC provides a parallelism dial). A full
  reinit on a 1B-row table will saturate the source DB if unpartitioned.

## Tradeoffs

The only option that gives you genuine sub-minute latency across every SAP
table, including custom Z and cluster tables. In return you commit to an
SLT system, a Full-Use license discussion, and ongoing Basis ownership of the
replication runtime.
