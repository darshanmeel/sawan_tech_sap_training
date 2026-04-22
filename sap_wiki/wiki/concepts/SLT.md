---
topic: SLT
type: concept
module: Cross-module
verified_date: 2026-04-22
primary_sap_source: "[NEEDS_SAP_CITATION]"
related: [ODP, LTRC, LTRS, note_3255746, ACDOCA]
---

# SLT — SAP Landscape Transformation Replication Server

## Summary

SAP Landscape Transformation (SLT) Replication Server is SAP's trigger-based, real-time database replication solution. Unlike ODP (which works through the ABAP application layer), SLT operates at the database level — it installs triggers on source tables that fire on insert/update/delete, immediately replicating changes to a target system.

SLT is not affected by SAP Note 3255746. It is a separate licensed product, not a component of ODP. This makes SLT the primary compliant alternative when real-time ODP via RFC would otherwise have been used.

Source: `raw/notes/SAP_NOTES_REFERENCE.md`, [NEEDS_SAP_CITATION for installation details]

## How SLT Differs from ODP

| Dimension | ODP | SLT |
|---|---|---|
| Transport mechanism | ABAP RFC / OData | Database triggers |
| Latency | Near-real-time (seconds to minutes) | Sub-second to seconds |
| License | Included (restrictions per Note 3255746) | Separate SLT license required |
| Table scope | Only released/annotated extractors and CDS views | Any database table, including cluster tables |
| BSEG support | Only via extractor (cluster table workaround) | Direct table replication |
| Target systems | BW/4HANA, third-party via RFC/OData | SAP HANA, non-SAP databases |
| Setup complexity | Lower | Higher (SLT server required) |

Source: `raw/notes/SAP_NOTES_REFERENCE.md`, [NEEDS_SAP_CITATION for latency specs]

## When to Use SLT vs ODP

**Use SLT when:**
- Real-time (sub-second) latency is required
- You need to replicate tables with no extractor or CDS view available
- You need to replicate cluster tables (BSEG, PCL* tables) — ODP cannot do this without the BW extractor
- Your ODP connector is RFC-based and you need a compliant path after Note 3255746
- You need to replicate custom Z-tables directly

**Use ODP when:**
- Near-real-time (minutes) is acceptable
- The data source has a released extractor or annotated CDS view
- You want to avoid the SLT license cost and infrastructure
- You are connecting to BW/4HANA or an OData-capable consumer

[SME_KNOWLEDGE]

## License Requirements

SLT requires a **separate license** from the base SAP ERP license. It is not included in standard S/4HANA or ECC licenses.

[NEEDS_SAP_CITATION — specific license SKU]

The master installation note: [SAP Note 1577441](https://support.sap.com/notes/1577441)

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

## Architecture

SLT runs as a separate system (the "SLT server") that sits between the source SAP system and the target. It:

1. Connects to the source SAP database via DB link
2. Creates logging tables on the source (one per replicated table)
3. Installs database triggers that write changes to logging tables
4. Reads logging tables and streams changes to the target

The SLT server can be co-deployed on the source SAP system (embedded) or as a standalone server.

[NEEDS_SAP_CITATION]

## Key Transactions

| Transaction | Purpose |
|---|---|
| LTRC | SLT replication cockpit — main monitoring and configuration UI |
| LTRS | SLT settings — configure connections, replication objects |
| IUUC_REPL_APPL | Advanced settings for replication applications |

See: [[LTRC]]

Source: [NEEDS_SAP_CITATION]

## Common Gotchas

- **Cluster tables:** SLT can replicate cluster tables (BSEG, PCL*) because it works at the database level. ODP cannot. [SME_KNOWLEDGE]
- **Lag accumulation:** During high-volume batch posting (e.g., month-end close), SLT logging tables can accumulate a large backlog. Monitor in LTRC. [SME_KNOWLEDGE]
- **Index impact:** Database triggers add overhead to every INSERT/UPDATE/DELETE on replicated tables. Test on a non-production system first. [NEEDS_SAP_CITATION for benchmarks]
- **MANDT filtering:** SLT does not automatically add client filter. Verify filtering logic if the target system is multi-client. [SME_KNOWLEDGE]

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

## Related Concepts

- [[ODP]] — alternative extraction framework; ODP via RFC restricted by Note 3255746
- [[LTRC]] — the transaction used to monitor and manage SLT replication
- [[note_3255746]] — the compliance note; SLT is explicitly not affected

## Raw Sources

- `raw/notes/SAP_NOTES_REFERENCE.md`
- `raw/pdfs_md/` — pending Docling conversion of SLT PDF(s)

## Changelog

- 2026-04-22: Created from SAP_NOTES_REFERENCE.md; pdfs_md/ enrichment pending
