---
topic: BSEG
type: table
module: FI
verified_date: 2026-04-22
primary_sap_source: "[NEEDS_SAP_CITATION]"
related: [BKPF, ACDOCA, ODP, note_3255746]
---

# BSEG — Accounting Document Segment (ECC)

## Summary

BSEG is the FI line item table in SAP ECC (R/3). Together with BKPF (document header), it forms the complete accounting document. BSEG stores one row per document line item (debit/credit entry).

**BSEG is ECC-specific.** In S/4HANA, ACDOCA (Universal Journal) replaces BSEG as the primary FI table. BSEG still exists in S/4HANA as a compatibility structure, but it is no longer the source of truth. For S/4HANA, see [[ACDOCA]].

## Critical Warning — Cluster Table

**BSEG is a cluster table.** This is the most important technical fact about BSEG:

- SAP cluster tables store multiple logical rows compressed into single database rows
- `RFC_READ_TABLE` **cannot read cluster tables** — it returns errors or garbage data
- Direct JDBC table reads on cluster tables also fail or produce incorrect results
- You **must** use the BW extractors (0FI_GL_50, 0FI_AR_4, etc.) or SLT to extract BSEG data

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

## Key Technical Facts

- **Table type:** Cluster table (FI)
- **Partner table:** BKPF (document header — transparent table)
- **Primary key:** MANDT, BUKRS, GJAHR, BELNR, BUZEI [NEEDS_SAP_CITATION]
- **ECC only:** S/4HANA uses ACDOCA

## Extraction Paths

### Path 1: ODP via Extractor — `0FI_GL_50` (General Ledger)

- **ODP context:** `SAPI`
- **Content:** GL line items — joins BKPF (header) + BSEG (items)
- **Supersedes:** `0FI_GL_4` (older extractor — use 0FI_GL_50 for new implementations)
- **Release confirmation:** [SAP Note 2232584](https://support.sap.com/notes/2232584)
- **License status:** Restricted via RFC per Note 3255746; compliant via OData

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

### Path 2: ODP via Extractor — AR/AP Variants

| Extractor | Content |
|---|---|
| `0FI_AR_4` | Accounts Receivable line items |
| `0FI_AP_4` | Accounts Payable line items |

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

### Path 3: SLT (for cluster table scenarios)

SLT operates at the database level and can replicate cluster tables. If you need the raw BSEG structure (not via extractor), SLT is the only viable path.

- **License:** SLT license required
- **License status (Note 3255746):** Not affected

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

### What Does NOT Work

| Method | Works? | Reason |
|---|---|---|
| RFC_READ_TABLE | No | Cluster table — returns errors |
| Direct JDBC | No | Cluster table — incorrect data |
| Direct ODP ABAP_CDS on BSEG | No | BSEG is not a CDS-view source |

Source: `raw/notes/SAP_NOTES_REFERENCE.md`, [SAP Note 382318](https://support.sap.com/notes/382318)

## S/4HANA Migration Note

In S/4HANA:
- BKPF still exists (document header) as a transparent table
- BSEG still physically exists but is **secondary** — data written to ACDOCA primarily
- For compatibility, ECC reports reading BSEG still work (BSEG is populated), but the line count in ACDOCA is the authoritative record
- Extract from ACDOCA, not BSEG, in S/4HANA environments

[SME_KNOWLEDGE]

## Key Fields

| Field | Description |
|---|---|
| BUKRS | Company Code |
| GJAHR | Fiscal Year |
| BELNR | Document Number |
| BUZEI | Line Item Number |
| KOART | Account Type (D/K/S/A/M) |
| HKONT | G/L Account Number |
| DMBTR | Amount in Local Currency |
| WRBTR | Amount in Document Currency |
| MWSKZ | Tax Code |
| ZUONR | Assignment |
| SGTXT | Item Text |
| PRCTR | Profit Center (new GL) |
| KOSTL | Cost Center |

[NEEDS_SAP_CITATION for complete field list]

## Note 3255746 Compliance

- `0FI_GL_50` via RFC-based ODP → **restricted**
- `0FI_GL_50` via OData → **compliant**
- SLT direct replication of BSEG → **compliant** (but cluster table — test carefully)

Source: `raw/notes/SAP_NOTES_REFERENCE.md`, [[note_3255746]]

## Common Gotchas

- **Cluster table error:** The #1 support ticket for new SAP developers. RFC_READ_TABLE on BSEG silently returns wrong data or errors. Always use the extractor. Source: `raw/notes/SAP_NOTES_REFERENCE.md`
- **0FI_GL_4 vs 0FI_GL_50:** Many legacy implementations use 0FI_GL_4. For new projects, use 0FI_GL_50 which covers the new G/L (FI-GL) line items properly. [SME_KNOWLEDGE]
- **Header join:** BKPF + BSEG must be joined to get the complete document. `0FI_GL_50` does this join internally. If you use SLT, you replicate both tables and join in the target. [SME_KNOWLEDGE]
- **Document splitting:** If New GL document splitting is active, one business transaction creates multiple BSEG entries (split accounting lines). Extract `0FI_GL_50` which handles this correctly. [SME_KNOWLEDGE]

## Related Concepts

- [[BKPF]] — document header partner table
- [[ACDOCA]] — S/4HANA replacement; extract this instead on S/4
- [[ODP]] — extraction framework; Note 3255746 applies to RFC path
- [[SLT]] — only viable path for raw cluster table access

## Raw Sources

- `raw/notes/SAP_NOTES_REFERENCE.md`

## Changelog

- 2026-04-22: Created from SAP_NOTES_REFERENCE.md
