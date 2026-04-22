# ISSUE-005: Seed Content for 5 Tables

**Phase:** Content
**Estimated Effort:** 3-4 hours (authoring + SAP doc fact-checking)
**Depends on:** ISSUE-001
**Skill files:** `SKILLS/sap-content-authoring.md`, `CONTENT_RULES.md`, `SKILLS/seo-implementation.md`, `DATA_SCHEMA.md`

---

## Goal

Write the 5 table metadata files. Not walkthroughs — just the per-table overview content.

---

## Files to Create

1. `content/en/tables/vbak.md`
2. `content/en/tables/lfa1.md`
3. `content/en/tables/mara.md`
4. `content/en/tables/bkpf.md`
5. `content/en/tables/acdoca.md`

---

## Schema

Match `DATA_SCHEMA.md` Collection 1 exactly. Required fields: code, name, slug, module, businessDescription, volumeClass, typicalRowCount, primaryKey, sapHelpUrl, availableLevels, seoTitle, seoDescription, updatedAt.

Optional but strongly recommended: releasedCdsView, cdsViewDocUrl, extractionGotchas (2-3 items each).

---

## Per-Table Guidance

### VBAK
- Module: SD
- Sales document header — orders, quotations, contracts
- Volume: medium (10M-200M typical)
- Released CDS: search for `I_SalesDocument` on help.sap.com
- Key fields to mention: VBELN (document number), AUART (document type), VKORG (sales org), ERDAT (created date)

### LFA1
- Module: MD
- Vendor master (general data)
- Volume: small
- Simplest beginner table
- Key fields: LIFNR, NAME1, LAND1, ORT01

### MARA
- Module: MD
- Material master (general data)
- Volume: medium
- Good introduction to Z-field scenarios
- Key fields: MATNR, MTART, MATKL, MEINS

### BKPF
- Module: FI
- Accounting document header
- Volume: medium to heavyweight
- Introduces fiscal year and company code partitioning
- Key fields: BELNR, BUKRS, GJAHR, BUDAT, BLART

### ACDOCA
- Module: FI
- Universal Journal
- Volume: heavyweight (often billions of rows)
- Demo centerpiece — most detailed extractionGotchas
- Released CDS: `I_JournalEntryItem` (verify on help.sap.com)
- Key fields: BELNR, BUKRS, GJAHR, DOCLN, RYEAR, POPER

---

## SEO per Page

For each table, set `seoTitle` and `seoDescription`. See `SKILLS/seo-implementation.md` patterns:

- `seoTitle`: "Extract [CODE] from SAP S/4HANA — Complete Guide"
- `seoDescription`: describe what the table is + key technical facts + what extraction approaches are covered, 150-160 chars

---

## Content Rules (from CONTENT_RULES.md)

- Every SAP transaction, table name, or concept cites an SAP Help Portal URL
- No copy-paste from SAP docs — paraphrase
- Mark unresolved citations `[NEEDS_SAP_CITATION]` inline and flag in Open Questions

---

## Acceptance Criteria

- [ ] All 5 files exist with complete frontmatter
- [ ] Markdown body is 2-3 paragraphs for each, describing the table in business terms
- [ ] Every SAP-specific claim has an inline SAP Help link
- [ ] SEO fields pass the checklist (titles 50-60 chars, descriptions 150-160 chars)
- [ ] `updatedAt` set to today
- [ ] No content copy-pasted from SAP docs
- [ ] Files validate against the schema (run `build.js` to confirm)

---

## Open Questions

---

## Completion Notes
