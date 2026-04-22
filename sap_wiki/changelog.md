# SAP Wiki Changelog

## 2026-04-22 — Initial Setup

**By:** Claude Code (session init)

**Structure created:**
- `sap_wiki/raw/pdfs/` — 8 SAP PDFs pre-loaded
- `sap_wiki/raw/pdfs_md/` — Docling output target
- `sap_wiki/raw/clippings/` — Web clipper target
- `sap_wiki/raw/notes/SAP_NOTES_REFERENCE.md` — 14 key SAP notes, 8 tables
- `sap_wiki/CLAUDE.md` — wiki maintenance rules
- `sap_wiki/wiki/index.md` — master cross-reference

**Articles created (10 seed articles):**

| Article | Source |
|---|---|
| `wiki/licenses/note_3255746.md` | SAP_NOTES_REFERENCE.md |
| `wiki/concepts/ODP.md` | SAP_NOTES_REFERENCE.md + pdfs_md/ |
| `wiki/concepts/SLT.md` | SAP_NOTES_REFERENCE.md + pdfs_md/ |
| `wiki/concepts/CDS_views.md` | SAP_NOTES_REFERENCE.md + pdfs_md/ |
| `wiki/concepts/CDS_extension_views.md` | pdfs_md/ extensibility |
| `wiki/tables/ACDOCA.md` | SAP_NOTES_REFERENCE.md + pdfs_md/ |
| `wiki/tables/VBAK.md` | SAP_NOTES_REFERENCE.md |
| `wiki/tables/BSEG.md` | SAP_NOTES_REFERENCE.md |
| `wiki/transactions/ODQMON.md` | pdfs_md/ ODP files |
| `wiki/transactions/LTRC.md` | pdfs_md/ SLT files |

**PDFs converted with Docling:**
- `SAP_Operational_Data_Provisioning__ODP_.pdf`
- `Installation_Guide_ODP_DMIS_2018_SP03.pdf`
- `ODP Installation Guide.pdf`
- `FSD_OP2023_latest.pdf`
- `OPS_OP2023.pdf`
- `AdminGuideS4HANAImpl_HELP_EN.pdf`
- `SAP BTP, ABAP Environment_Jun 2023.pdf`
- `66673acb-c37c-0010-82c7-eda71af511fa.pdf`

**Next session:** Ingest pdfs_md/ content to enrich articles. Replace [NEEDS_SAP_CITATION] markers with verified URLs from PDF content.
