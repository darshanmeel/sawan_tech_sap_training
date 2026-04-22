---
topic: ACDOCA
type: table
module: FI
verified_date: 2026-04-22
primary_sap_source: "[NEEDS_SAP_CITATION]"
related: [BKPF, BSEG, I_JournalEntryItem, ODP, CDS_extension_views, note_3255746]
---

# ACDOCA — Universal Journal (S/4HANA)

## Summary

ACDOCA is the central finance table in SAP S/4HANA, known as the Universal Journal. It consolidates what was previously split across BSEG (FI line items), COEP (CO postings), FAGLFLEXA (New GL), and other module-specific tables into a single wide table. Every financial posting in S/4HANA writes a line to ACDOCA.

ACDOCA exists only in S/4HANA. ECC systems use BSEG + BKPF. For ECC environments, see [[BSEG]].

[NEEDS_SAP_CITATION for introduction release]

## Key Technical Facts

- **Table type:** Transparent table (FI)
- **Introduced in:** S/4HANA 1511 [NEEDS_SAP_CITATION]
- **Typical row count:** 500M–5B+ rows at large enterprises [SME_KNOWLEDGE]
- **Primary key:** RCLNT, RLDNR, RBUKRS, GJAHR, BELNR, DOCLN [NEEDS_SAP_CITATION]
- **Primary CDS view:** `I_JournalEntryItem`
- **ODP extractor:** `0FI_ACDOCA_10` (SAPI context)
- **Delta capability:** Yes — via both ODP contexts

## Why ACDOCA Is Large

Every debit/credit in every module (FI, CO, MM, SD) writes to ACDOCA. In large enterprises this means:

- Year-end close: millions of reclassification entries
- Daily operations: inventory movements, AP/AR postings, payroll, intercompany
- S/4HANA also writes CO internal orders and cost center postings here (no separate COEP)

[SME_KNOWLEDGE] A 10,000-employee company typically has 50M–200M rows. A global enterprise with 100,000+ employees will often have 1B+.

## Extraction Paths

### Path 1: ODP via Extractor — `0FI_ACDOCA_10` (Recommended for on-prem)

- **ODP context:** `SAPI`
- **Delta method:** AIE
- **License status:** Compliant if extracted via OData; restricted via RFC per [SAP Note 3255746](https://support.sap.com/notes/3255746)
- **Setup required:** None (extractor is pre-delivered)

[SME_KNOWLEDGE] `0FI_ACDOCA_10` is the safer on-prem extraction path. It is the extractor SAP delivers specifically for ACDOCA and has broad release support.

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

### Path 2: ODP via CDS View — `I_JournalEntryItem`

- **ODP context:** `ABAP_CDS`
- **Annotation:** `@Analytics.dataCategory: #FACT` [NEEDS_SAP_CITATION]
- **Delta method:** CDC (requires annotation `@Analytics.dataExtraction.delta.changeDataCapture.automatic: true`) [SAP Note 2884410](https://support.sap.com/notes/2884410)
- **License status:** Compliant if extracted via OData; restricted via RFC per Note 3255746
- **Best for:** S/4HANA Cloud; on-prem support varies by SPS level

[SME_KNOWLEDGE] Confirm `I_JournalEntryItem` release status in your specific system using transaction SE80 or ADT View Browser. `I_GLAccountLineItemRawData` (IFIGLACCTLIR) was not confirmed fully released on-prem as of 2022.

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

### Path 3: SLT Direct Table Replication

- **License:** SLT license required (separate from SAP ERP)
- **Delta method:** Trigger-based CDC (sub-second latency)
- **License status:** Not affected by Note 3255746
- **Best for:** Real-time requirements; cases where ODP is restricted

See: [[SLT]]

### Path 4: Direct JDBC / RFC_READ_TABLE

- **Status:** Not recommended for production ([SAP Note 382318](https://support.sap.com/notes/382318))
- RFC_READ_TABLE has 512-byte row limit and is unstable across releases
- ACDOCA is wide — row limit will cause truncation

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

## Partitioning Strategy

ACDOCA is too large to extract without partitioning. Standard partition keys:

| Partition Key | Why |
|---|---|
| `GJAHR` (Fiscal Year) | Natural boundary; load year by year |
| `RBUKRS` (Company Code) | Useful for multi-company orgs; parallel loads |
| `RLDNR` (Ledger) | Most systems have 2–5 ledgers |

[NEEDS_SAP_CITATION] — [SAP Note 2659080](https://support.sap.com/notes/2659080) is referenced in community sources as the partitioning guidance note for ACDOCA initial loads.

[SME_KNOWLEDGE] Start with GJAHR partitioning — one extraction job per year. For current year, run daily delta. For historical years, run once with full extraction then disable.

## Key Fields

| Field | Description |
|---|---|
| RCLNT | Client |
| RLDNR | Ledger |
| RBUKRS | Company Code |
| GJAHR | Fiscal Year |
| BELNR | Accounting Document Number |
| DOCLN | Document Line Number |
| BUDAT | Posting Date |
| BLDAT | Document Date |
| KOART | Account Type (D=Customer, K=Vendor, S=GL) |
| KTOSL | Transaction Key |
| DMBTR | Amount in Local Currency |
| PRCTR | Profit Center |
| KOSTL | Cost Center |
| AUFNR | Internal Order |
| VBELN | SD Document (reference) |

[NEEDS_SAP_CITATION for complete field list]

## Currency Fields

ACDOCA stores amounts in multiple currencies in the same row:
- Local currency (DMBTR / HWAER)
- Group currency (KMBTR / KWAER)
- Transaction currency (WRBTR / WAERS)

CDS views handle currency semantics via `@Semantics.amount.currencyCode` annotations. Direct table reads require manual currency handling.

[NEEDS_SAP_CITATION]

## Note 3255746 Compliance

Every walkthrough covering ACDOCA extraction via ODP must mention [SAP Note 3255746](https://support.sap.com/notes/3255746):

- `0FI_ACDOCA_10` via RFC-based ODP → **restricted**
- `0FI_ACDOCA_10` via OData → **compliant**
- `I_JournalEntryItem` via RFC-based ODP → **restricted**
- `I_JournalEntryItem` via OData → **compliant**
- SLT direct replication → **compliant**

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

## Common Gotchas

- **No BSEG in S/4HANA for primary posting:** BSEG still exists in S/4HANA as a compatibility view but ACDOCA is the source of truth. Do not join BSEG to ACDOCA — use ACDOCA alone. [SME_KNOWLEDGE]
- **CO data included:** Cost center, profit center, and internal order postings are in ACDOCA (unlike ECC where CO data was in COEP). Filter on `KOART` if you only want FI items.
- **0-record first delta (CDS path):** After init, the first CDC delta returns 0 records. Normal behavior. ([SAP Note 2884410](https://support.sap.com/notes/2884410))
- **MANDT (client) filter:** ODP adds client filter automatically. SLT does not — add WHERE RCLNT = <client> to SLT filter. [SME_KNOWLEDGE]

## Related Concepts

- [[ODP]] — extraction framework; Note 3255746 applies to RFC path
- [[CDS_views]] — I_JournalEntryItem is the primary CDS view for ACDOCA
- [[CDS_extension_views]] — how to add Z-fields to ACDOCA extraction
- [[BSEG]] — the ECC equivalent (different structure, cluster table)
- [[SLT]] — compliant real-time alternative
- [[note_3255746]] — compliance note affecting ODP RFC path

## Raw Sources

- `raw/notes/SAP_NOTES_REFERENCE.md`
- `raw/pdfs_md/FSD_OP2023_latest.md` (pending Docling conversion — Finance data model)

## Changelog

- 2026-04-22: Created from SAP_NOTES_REFERENCE.md; enrichment from pdfs_md/ pending
