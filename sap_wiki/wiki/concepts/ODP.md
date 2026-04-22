---
topic: ODP
type: concept
module: Cross-module
verified_date: 2026-04-22
primary_sap_source: "[NEEDS_SAP_CITATION]"
related: [SLT, CDS_views, ACDOCA, VBAK, BSEG, ODQMON, note_3255746]
---

# ODP — Operational Data Provisioning

## Summary

Operational Data Provisioning (ODP) is SAP's framework for exposing data sources for extraction. Introduced with SAP NetWeaver 7.4 and made generally available for external consumers in later releases, ODP provides a standardized extraction API built on top of SAP's existing BW extractor infrastructure and CDS view annotations.

ODP works through **extraction contexts** (which data source type you're targeting) and **subscriptions** (stateful delta tracking per consumer). The framework manages delta queues, tracks what each subscriber has seen, and provides both full and delta extraction modes.

[NEEDS_SAP_CITATION]

## Extraction Contexts

ODP exposes data through three main contexts. The context determines which underlying technology serves the data:

| Context | What It Covers | Delta Type |
|---|---|---|
| `SAPI` | Classic BW extractors (2LIS_*, 0FI_*, 0MM_*, etc.) | AIE (After-Image with Extractor) |
| `ABAP_CDS` | ABAP CDS views annotated for extraction | CDC or timestamp-based |
| `SLT~<SLT_ID>` | SLT-replicated tables (SLT acts as ODP provider) | Trigger-based CDC |

Source: `raw/notes/SAP_NOTES_REFERENCE.md`, [NEEDS_SAP_CITATION for context enum]

### SAPI Context (Classic BW Extractors)

The `SAPI` context uses existing BW DataSource extractors. These extractors exist on every ECC and S/4HANA system. They were designed for BW/4HANA but ODP exposes them to third-party tools.

- Master list of released extractors: [SAP Note 2232584](https://support.sap.com/notes/2232584)
- Supplement releases: [SAP Note 3198662](https://support.sap.com/notes/3198662)
- Delta method: **AIE** — the extractor generates after-image records (the full record after change, tagged as insert/update/delete)

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

### ABAP_CDS Context (CDS Views)

The `ABAP_CDS` context extracts from ABAP CDS views that carry `@Analytics.dataExtraction` annotations. This is the recommended path for S/4HANA systems.

- Delta requires annotation `@Analytics.dataExtraction.delta.changeDataCapture.automatic: true`
- CDS delta behavior documented in: [SAP Note 2884410](https://support.sap.com/notes/2884410)
- Key gotcha: after an init-delta run, the **first delta request returns 0 records** — this is normal. The CDC mechanism captures changes from the init point forward.

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

### SLT Context

When SLT replicates a table into a staging area, it can act as an ODP provider. This exposes the SLT-replicated data to ODP consumers. Less common than the SAPI and ABAP_CDS paths.

Source: [NEEDS_SAP_CITATION]

## Delta Types

| Delta Type | Mechanism | Used In |
|---|---|---|
| AIE (After-Image with Extractor) | Extractor generates delta records | SAPI context extractors |
| CDC (Change Data Capture) | Trigger or log-based change capture | ABAP_CDS annotated views |
| Timestamp | Compares timestamp field on extract | Older extractors, some custom sources |

Source: `raw/notes/SAP_NOTES_REFERENCE.md`, [NEEDS_SAP_CITATION for timestamp type]

## Subscription Model

ODP is **stateful**. Each consumer registers a **subscription** identifying itself. ODP tracks what data each subscriber has received. This means:

- Multiple consumers can extract the same source independently
- Each gets their own delta queue
- A subscriber that falls behind does not affect other subscribers
- Subscriptions are visible and manageable in transaction **ODQMON**

[NEEDS_SAP_CITATION]

## Availability and Release Matrix

ODP availability depends on system release, DMIS add-on version, and specific DataSource:

- Availability by release: [SAP Note 2481315](https://support.sap.com/notes/2481315)
- DMIS installation guide: `raw/pdfs_md/Installation_Guide_ODP_DMIS_2018_SP03.md`

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

## Note 3255746 — Critical Compliance Warning

**SAP Note 3255746 (February 2024)** states that ODP via RFC function modules is **no longer permitted** for third-party tools. This affects:

- Azure Data Factory SAP CDC connector
- Qlik Replicate
- Google Cloud Data Fusion
- Informatica ODP connector
- Fivetran ODP connector

**Compliant alternatives:**
- ODP via OData API (slower, but permitted)
- SLT replication (not affected by this note)

Every walkthrough covering ODP must mention this note. Full details: [[note_3255746]]

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

## Monitoring

Use transaction **ODQMON** to:
- View all ODP subscriptions on the system
- Check queue status (pending records, errors)
- Cancel or reset stuck subscriptions
- Diagnose failed extraction runs

See: [[ODQMON]]

## Common Gotchas

- **0-record first delta:** After init, the first delta run returns 0 records. This is correct behavior, not a bug. ([SAP Note 2884410](https://support.sap.com/notes/2884410))
- **RFC vs OData:** Most third-party connectors use RFC internally. If using a tool that hasn't explicitly confirmed OData compliance, assume RFC (and therefore Note 3255746 risk). [SME_KNOWLEDGE]
- **Setup tables for SAPI:** Some LIS extractors (2LIS_*) require a setup table fill before first extraction (transactions OLI1BW, OLI2BW, OLI3BW). [NEEDS_SAP_CITATION]

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

## Related Concepts

- [[SLT]] — alternative extraction framework, real-time, unaffected by Note 3255746
- [[CDS_views]] — the ABAP_CDS source used in modern S/4HANA ODP extractions
- [[ODQMON]] — transaction for monitoring ODP subscriptions and queues
- [[note_3255746]] — the compliance note that restricts RFC-based ODP usage

## Raw Sources

- `raw/notes/SAP_NOTES_REFERENCE.md`
- `raw/pdfs_md/SAP_Operational_Data_Provisioning__ODP_.md` (pending conversion)
- `raw/pdfs_md/Installation_Guide_ODP_DMIS_2018_SP03.md` (pending conversion)

## Changelog

- 2026-04-22: Created from SAP_NOTES_REFERENCE.md; pdfs_md/ pending enrichment after Docling conversion
