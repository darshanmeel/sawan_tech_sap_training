---
topic: CDS_extension_views
type: concept
module: Cross-module
verified_date: 2026-04-22
primary_sap_source: "[NEEDS_SAP_CITATION]"
related: [CDS_views, ACDOCA, VBAK, MARA]
---

# CDS Extension Views — Adding Z-Fields to Released SAP Views

## Summary

CDS Extension Views (also called "extend view" or "view extensions") allow customers to add custom fields (Z-fields) to SAP-released CDS views without modifying the original SAP object. This is the S/4HANA-recommended approach to extensibility for CDS-based data extraction.

When you extend a released CDS view (e.g., `I_JournalEntryItem`) with your Z-fields, those fields automatically appear in the ODP extraction — no additional extractor modification needed. This is fundamentally different from the ECC approach of enhancing LIS communication structures.

[NEEDS_SAP_CITATION]

## How Extension Views Work

An extension view in ABAP CDS uses the `extend view` statement:

```abap
@AbapCatalog.sqlViewAppendName: 'ZCDS_EXT_JEI'
extend view I_JournalEntryItem with ZI_JournalEntryItem_Ext {
    _Header.ZZ_CUSTOM_FIELD1,
    _Header.ZZ_CUSTOM_FIELD2
}
```

Key elements:
- `@AbapCatalog.sqlViewAppendName` — names the underlying SQL view append (required)
- `extend view <base_view>` — must be a released, extensible CDS view
- Fields must come from associations already defined in the base view, or from a new association you define

[NEEDS_SAP_CITATION]

## Extension View vs Append Structure

| Method | System | What It Extends | Appears In ODP |
|---|---|---|---|
| CDS Extension View | S/4HANA | Released CDS view | Yes (automatically) |
| Append Structure | ECC + S/4HANA | DDIC table | Only if extractor is enhanced |
| LIS structure enhancement (LBWE) | ECC | BW extractor | Yes (via LBWE enhancement) |

For S/4HANA CDS-based extraction, the CDS Extension View is the correct approach. Append structures on ACDOCA alone will not make the field appear in `I_JournalEntryItem` extraction without also extending the CDS view.

[NEEDS_SAP_CITATION]

## Prerequisites

For a CDS view to be extensible:
1. The base view must be released for customer use (check release state in ADT or SE80)
2. The view must carry `@C1:USE_IN_CLOUD_DEVELOPMENT` or equivalent release annotation [NEEDS_SAP_CITATION]
3. The custom field must first exist — either via an Append Structure on the underlying DDIC table, or via the Custom Fields and Logic app in S/4HANA Cloud/Key User Extensibility

[NEEDS_SAP_CITATION]

## Key User Extensibility (S/4HANA Cloud)

In S/4HANA Cloud, you cannot create ABAP CDS extension views directly. Instead:

1. Use the **Custom Fields and Logic** Fiori app to add fields
2. The system automatically generates the extension view and append structure
3. Fields appear in ODP extraction without manual CDS coding

[SME_KNOWLEDGE] For on-prem S/4HANA, you write the extension view manually in ADT/SE80. For cloud, Key User Extensibility handles it.

[NEEDS_SAP_CITATION]

## Example: Adding Z-Field to ACDOCA Extraction

Scenario: You want to extract a custom field `ZZPROFIT_CENTER_EXT` from ACDOCA via `I_JournalEntryItem`.

Steps:
1. Add `ZZPROFIT_CENTER_EXT` to ACDOCA via Append Structure `CI_ACDOCA` (or use DDIC append)
2. Populate the field via a BAdI or user exit in the posting logic
3. Create a CDS extension view that adds the field to `I_JournalEntryItem`:
   ```abap
   extend view I_JournalEntryItem with ZI_JEI_Custom {
       JournalEntry.ZZPROFIT_CENTER_EXT
   }
   ```
4. Activate the extension view
5. The field now appears in ODP ABAP_CDS extraction of `I_JournalEntryItem`

[NEEDS_SAP_CITATION for exact syntax and BAdI name]
[SME_KNOWLEDGE] The field will only appear in new extraction runs after the extension is active. Historical data must be backfilled separately.

Source: `raw/notes/SAP_NOTES_REFERENCE.md`

## Related Concepts

- [[CDS_views]] — the base views that extension views extend
- [[ACDOCA]] — primary use case for CDS extension view
- [[VBAK]] — secondary use case via I_SalesDocument extension

## Raw Sources

- `raw/notes/SAP_NOTES_REFERENCE.md`
- `raw/pdfs_md/` — pending Docling conversion of extensibility PDF (AdminGuideS4HANAImpl_HELP_EN.md)

## Changelog

- 2026-04-22: Created from SAP_NOTES_REFERENCE.md; enrichment from pdfs_md/ pending
