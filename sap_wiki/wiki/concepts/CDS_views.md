---
topic: CDS_views
type: concept
module: Cross-module
verified_date: 2026-04-22
primary_sap_source: "[NEEDS_SAP_CITATION]"
related: [ODP, ACDOCA, CDS_extension_views, note_3255746]
---

# CDS Views — ABAP Core Data Services

## Summary

ABAP CDS (Core Data Services) views are SQL-like view definitions that live in the ABAP repository (not the database layer). They define logical data models on top of SAP database tables, handling join logic, field mappings, currency conversions, and access control in a single artifact.

For data extraction, CDS views are important because SAP annotates certain released CDS views with `@Analytics` annotations, making them ODP-consumable data sources. This is the recommended extraction path for S/4HANA — you extract from the CDS view rather than from raw tables directly.

[NEEDS_SAP_CITATION]

## CDS Views vs Database Views vs ABAP Views

| Type | Where Defined | Key Feature |
|---|---|---|
| ABAP CDS View | ABAP repository (DDL source) | Supports annotations, associations, access control |
| Database view | DDIC (SE11) | Simple SQL view, no annotations |
| ABAP view | DDIC (SE11) | Legacy, limited to one table join |

For extraction purposes, only ABAP CDS views with the correct annotations are usable via the `ABAP_CDS` ODP context.

[NEEDS_SAP_CITATION]

## Key Annotations for Extraction

### @Analytics.dataExtraction.enabled

Marks a CDS view as available for extraction via ODP.

```abap
@Analytics.dataExtraction.enabled: true
```

Without this annotation, the view will not appear in the ODP source browser.

[NEEDS_SAP_CITATION]

### @Analytics.dataExtraction.delta.changeDataCapture.automatic

Enables delta extraction (CDC mode). With this annotation:
- Full extraction loads all records
- Delta extraction captures only changes since the last run

```abap
@Analytics.dataExtraction.delta.changeDataCapture.automatic: true
```

Full vs delta behavior documented in: [SAP Note 2884410](https://support.sap.com/notes/2884410)

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

### @Analytics.dataCategory: #FACT

Marks the view as a fact/transactional data source (as opposed to a master data view). FACT views are typically delta-enabled.

[NEEDS_SAP_CITATION]

## Delta Behavior — Critical Gotcha

After an initial full extraction (init-delta), the **first delta run returns 0 records**. This is expected behavior:

- The init-delta records the starting point for change capture
- Changes that occurred during the init load are captured by the CDC mechanism
- The next delta after the 0-record run will contain actual changes

This trips up many engineers who assume the 0-record delta means something is broken.

Source: [SAP Note 2884410](https://support.sap.com/notes/2884410), `raw/notes/SAP_NOTES_REFERENCE.md`

## Finding Released CDS Views

Not all CDS views are released for external consumption. To find released views:

### In SE80 (ABAP Workbench)
- Navigate to Repository Browser
- Filter by object type: CDS Entity
- Check `@Analytics.dataExtraction.enabled: true` in source

### In ADT (ABAP Development Tools / Eclipse)
- Use the CDS view browser
- Search for annotation `dataExtraction`

### In the ODP Source Browser
- Open the extraction configuration in your ETL tool
- Browse the `ABAP_CDS` context — only annotated views appear

[NEEDS_SAP_CITATION for SE80/ADT navigation steps]

## Key Released CDS Views for Common Tables

| CDS View | Underlying Table | Module | Delta |
|---|---|---|---|
| `I_JournalEntryItem` | ACDOCA | FI | Yes |
| `I_GLAccountLineItemRawData` | ACDOCA | FI | [NEEDS_SAP_CITATION] |
| `I_SalesDocument` | VBAK/VBAP | SD | [NEEDS_SAP_CITATION] |
| `I_PurchaseOrderItem` | EKPO | MM | [NEEDS_SAP_CITATION] |

[SME_KNOWLEDGE] `I_GLAccountLineItemRawData` (IFIGLACCTLIR) was not confirmed as fully released for on-prem systems as of 2022. Verify in your specific system. `I_JournalEntryItem` is the safer on-prem path.

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

## Note 3255746 and CDS Views

CDS views extracted via **OData** are compliant with Note 3255746. CDS views extracted via ODP **RFC** are not. The distinction is the transport mechanism, not the view itself:

- Tool calls ODP RFC → restricted by Note 3255746 (even for CDS views)
- Tool calls OData service on CDS view → compliant

Source: `raw/notes/SAP_NOTES_REFERENCE.md`, [[note_3255746]]

## Related Concepts

- [[ODP]] — the extraction framework that uses ABAP_CDS context
- [[CDS_extension_views]] — how to add Z-fields to released CDS views
- [[ACDOCA]] — primary use case for I_JournalEntryItem CDS view

## Raw Sources

- `raw/notes/SAP_NOTES_REFERENCE.md`
- `raw/pdfs_md/` — pending Docling conversion of extensibility/CDS PDFs

## Changelog

- 2026-04-22: Created from SAP_NOTES_REFERENCE.md; enrichment from pdfs_md/ pending
