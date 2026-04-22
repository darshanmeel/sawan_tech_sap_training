# SAP Wiki — Master Index

Private knowledge base for Sawan Tech SAP Academy content authoring.
All articles verified by SME. See `CLAUDE.md` for authoring rules.

Last updated: 2026-04-22

---

## Tables

| Article | Module | System | Key Extractors |
|---|---|---|---|
| [ACDOCA](tables/ACDOCA.md) | FI | S/4HANA only | 0FI_ACDOCA_10, I_JournalEntryItem |
| [BSEG](tables/BSEG.md) | FI | ECC (compatibility in S/4) | 0FI_GL_50, 0FI_AR_4, 0FI_AP_4 |
| [VBAK](tables/VBAK.md) | SD | ECC + S/4HANA | 2LIS_11_VAHDR |

---

## Concepts

| Article | Summary |
|---|---|
| [ODP](concepts/ODP.md) | Operational Data Provisioning framework — contexts, delta types, Note 3255746 |
| [SLT](concepts/SLT.md) | SLT Replication Server — trigger-based CDC, real-time, separate license |
| [CDS_views](concepts/CDS_views.md) | ABAP CDS views for extraction — annotations, delta, released views |
| [CDS_extension_views](concepts/CDS_extension_views.md) | How to add Z-fields to released CDS views |

---

## Transactions

| Article | System | Purpose |
|---|---|---|
| [ODQMON](transactions/ODQMON.md) | Source SAP system | Monitor ODP subscriptions and delta queues |
| [LTRC](transactions/LTRC.md) | SLT server | Monitor SLT replication lag and errors |

---

## Licenses & Compliance

| Article | Summary |
|---|---|
| [note_3255746](licenses/note_3255746.md) | ODP RFC no longer permitted (Feb 2024) — affected tools, compliant alternatives |

---

## Cross-Reference: Which Article to Read for Which Task

| Task | Read These |
|---|---|
| Write ACDOCA walkthrough | ACDOCA, ODP, CDS_views, note_3255746 |
| Write VBAK/SD walkthrough | VBAK, ODP, note_3255746 |
| Write BSEG/ECC FI walkthrough | BSEG, ODP, note_3255746 |
| Explain ODP to beginners | ODP, note_3255746 |
| Explain SLT vs ODP | SLT, ODP, note_3255746 |
| Explain Z-field extensibility | CDS_extension_views, CDS_views |
| Diagnose ODP queue issues | ODQMON, ODP |
| Diagnose SLT replication lag | LTRC, SLT |
| Write license/compliance section | note_3255746 |

---

## [NEEDS_SAP_CITATION] Tracker

Articles with unverified SAP Help URLs that need enrichment from pdfs_md/:

- ACDOCA: primary_sap_source, introduction release, primary key, field list
- ODP: primary_sap_source, context enum, SLT context details
- SLT: primary_sap_source, latency specs, license SKU
- CDS_views: most annotation details, SE80/ADT navigation
- CDS_extension_views: most extension syntax details
- BSEG: primary_sap_source, primary key
- VBAK: primary_sap_source, setup table transaction name confirmation
- ODQMON: authorization objects, exact field names
- LTRC: authorization object, exact menu steps, column names

Run Docling on pdfs_md/ content and enrich these articles to resolve markers.
