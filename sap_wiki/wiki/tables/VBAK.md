---
topic: VBAK
type: table
module: SD
verified_date: 2026-04-22
primary_sap_source: "[NEEDS_SAP_CITATION]"
related: [VBAP, ODP, note_3255746, note_576886]
---

# VBAK — Sales Document Header (SD)

## Summary

VBAK is the Sales and Distribution (SD) module's document header table, containing one row per sales document. Each sales document type (sales order, quotation, contract, returns order, scheduling agreement) has a header row in VBAK and item rows in VBAP.

VBAK exists in both ECC and S/4HANA with the same structure. Unlike ACDOCA (which is S/4HANA only), VBAK is present across releases and the same ODP extractors work on both.

[NEEDS_SAP_CITATION]

## Key Technical Facts

- **Table type:** Transparent table (SD)
- **Rows per header:** 1 row per sales document
- **Primary key:** MANDT, VBELN [NEEDS_SAP_CITATION]
- **Partner table:** VBAP (items), VBKD (business data), VBUK (status), VBEP (schedule lines)
- **Delta method:** AIE via BW extractor

## Child Tables

| Table | Content |
|---|---|
| VBAP | Sales document items (one row per line item) |
| VBKD | Business data (payment terms, incoterms) |
| VBUK | Document status (delivery status, billing status) |
| VBUP | Item status |
| VBEP | Schedule lines |
| KONV | Condition records (pricing) |

The standard BW extractors join these tables into a flat structure. Direct table reads require manual joins across all relevant tables.

[NEEDS_SAP_CITATION]

## Extraction Paths

### Path 1: ODP via Extractor — `2LIS_11_VAHDR` (Header)

- **ODP context:** `SAPI`
- **Base tables:** VBAK, VBKD, VBUK
- **Delta method:** AIE (after-image records)
- **Delta trigger:** [SAP Note 576886](https://support.sap.com/notes/576886) — delta fires only when fields in the extract structure are affected
- **Release confirmation:** [SAP Note 2232584](https://support.sap.com/notes/2232584)
- **License status:** Restricted via RFC per Note 3255746; compliant via OData

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

### Path 2: ODP via Extractor — `2LIS_11_VAITM` (Item)

- **ODP context:** `SAPI`
- **Base tables:** VBAK, VBAP, VBKD, VBUK, VBUP
- **Delta method:** AIE
- **Release confirmation:** [SAP Note 2232584](https://support.sap.com/notes/2232584)

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

### All SD Extractors

| Extractor | Tables | Content |
|---|---|---|
| `2LIS_11_VAHDR` | VBAK, VBKD, VBUK | Header data |
| `2LIS_11_VAITM` | VBAK, VBAP, VBKD, VBUK, VBUP | Item data |
| `2LIS_11_VASCL` | VBAK, VBAP, VBEP | Schedule lines |
| `2LIS_11_VASTI` | VBUP | Item status |
| `2LIS_11_VASTH` | VBUK | Header status |

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

## Delta Behavior — Note 576886

[SAP Note 576886](https://support.sap.com/notes/576886) defines when a delta record fires for sales documents:

- Delta fires **only** when a field in the extract structure changes
- If a field not in the extract structure changes (e.g., an SD status field not in the extractor), no delta fires
- **Inquiry documents (category A) are NOT extracted** by standard 2LIS_11_* extractors

This means delta completeness depends on which fields your use case needs. If you need a field not in the extract structure, you must enhance the extractor via LBWE.

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

## Z-Field Extensibility

To add custom Z-fields to VBAK extraction:

**ECC / on-prem S/4HANA:**
1. Add Z-field via Append Structure on VBAK
2. Add field to LIS communication structure `MCVBAK` (via LBWE)
3. Enhance extraction structure in LBWE
4. Field appears in 2LIS_11_VAHDR

**S/4HANA (CDS path):**
1. Extend `I_SalesDocument` CDS view with the Z-field [NEEDS_SAP_CITATION]
2. Field appears in ABAP_CDS extraction

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

## Setup Table Requirement

For LIS-based extractors (2LIS_11_*), a **setup table fill** is required before first extraction. This is done in transaction `OLI7BW` (Sales application `11`). Without this step, the first full extraction returns 0 records.

[NEEDS_SAP_CITATION for OLI7BW transaction name confirmation]

## Note 3255746 Compliance

- `2LIS_11_VAHDR` / `2LIS_11_VAITM` via RFC-based ODP → **restricted**
- Via OData → **compliant**
- SLT direct replication of VBAK → **compliant**

Source: `raw/notes/SAP_NOTES_REFERENCE.md`, [[note_3255746]]

## Common Gotchas

- **No inquiry documents:** Category A documents (inquiries) are excluded from 2LIS_11_* extractors by design. If your use case needs inquiries, you need a custom extractor or SLT. [SME_KNOWLEDGE from SAP Note 576886]
- **VBAP item count:** VBAK header + VBAP items must be loaded separately. Do not try to flatten at extraction — join in the target. [SME_KNOWLEDGE]
- **Status fields:** Header status is in VBUK, item status in VBUP. If you only extract VBAK, you miss status. Use 2LIS_11_VAHDR which includes VBUK join. [SME_KNOWLEDGE]
- **Setup table lock:** OLI7BW locks the SD tables during setup run. Run during a low-traffic window (e.g., weekend). [SME_KNOWLEDGE]

## Related Concepts

- [[ODP]] — extraction framework used for 2LIS_11_* extractors
- [[note_3255746]] — compliance note for RFC-based ODP
- [[SLT]] — compliant alternative for real-time VBAK replication

## Raw Sources

- `raw/notes/SAP_NOTES_REFERENCE.md`

## Changelog

- 2026-04-22: Created from SAP_NOTES_REFERENCE.md
