# ISSUE-007: Glossary (32 terms)

**Phase:** Content
**Estimated Effort:** 6-8 hours
**Depends on:** ISSUE-001
**Skill files:** `SKILLS/sap-content-authoring.md`, `CONTENT_RULES.md`, `SKILLS/seo-implementation.md`

---

## Goal

Create a glossary entry for each of the 32 launch terms listed in `PROJECT_SPEC.md`. Each term gets its own file and URL for SEO (each page ranks for "what is X" queries).

---

## Terms to Create

ABAP, ADT, Append Structure, BAdI, BW, CDS, CUKY, CURR, DATS, Delta, Dialog Work Process, Extractor, LTRC, LTRS, MANDT, MEINS, NUMC, ODP, ODQMON, OpenHub, QUAN, RFC, S/4HANA, SAP Help Portal, SE11, SE16N, SICF, SLT, SM59, Transport Request, TSV_TNEW_PAGE_ALLOC_FAILED, VBELN, Z-field

---

## File Pattern

`content/en/glossary/[slug].md` where slug is the lowercase hyphenated term name.

Examples:
- `content/en/glossary/odp.md` (term: ODP)
- `content/en/glossary/append-structure.md` (term: Append Structure)
- `content/en/glossary/cds-view.md` (term: CDS — but full name in fullName field)

---

## Per-Term Structure

Frontmatter matches `DATA_SCHEMA.md` Collection 3.

```yaml
---
term: ODP
fullName: "Operational Data Provisioning"
slug: odp
shortDefinition: "[1-3 sentences paraphrased from SAP docs]"
relatedTerms:
  - odqmon
  - cds-view
  - delta
sapDocUrl: "[canonical SAP Help URL]"
seoTitle: "ODP: Operational Data Provisioning in SAP — Plain Explanation"
seoDescription: "[150-160 chars, directly answers 'what is ODP in SAP']"
---

Extended markdown body (2-4 paragraphs) covering:
1. What it is in more detail
2. When/why you'd encounter it
3. Related concepts and how they fit together
```

---

## SEO Strategy per Term

Each glossary entry is designed to rank for:
- `what is [TERM] in SAP`
- `[TERM] meaning`
- `[TERM] explained`
- `SAP [TERM]`

Title format: `[TERM]: [Full Name] in SAP — Plain Explanation`

Description pattern: Start with direct answer, then one technical detail.

Example:
- Title: "ODP: Operational Data Provisioning in SAP — Plain Explanation"
- Description: "What is ODP in SAP? Operational Data Provisioning is SAP's framework for exposing data to external consumers with full and delta extraction support."

---

## Related Terms

Each entry lists 2-4 related terms. Cross-linking creates a dense internal graph that boosts SEO and helps learners navigate.

Suggested relationships:
- ODP → ODQMON, CDS View, Delta, Extractor
- SLT → LTRC, LTRS, Delta, RFC
- CDS View → ODP, @Analytics.dataExtract (might need to be added), Append Structure
- Z-field → Append Structure, CDS View, CUKY, MEINS
- CUKY → CURR, Z-field
- MEINS → QUAN, Material Master
- TSV_TNEW_PAGE_ALLOC_FAILED → Dialog Work Process, Performance (might need adding)

---

## Acceptance Criteria

- [ ] All 32 files exist
- [ ] Each validates against schema
- [ ] Every `sapDocUrl` links to a real SAP Help Portal page (or `[NEEDS_SAP_CITATION]` flagged)
- [ ] Every `relatedTerms` entry points to a term that exists in the glossary
- [ ] SEO titles and descriptions follow the pattern
- [ ] No banned words
- [ ] Short definitions are 1-3 sentences, paraphrased (not copy-pasted from SAP)

---

## Open Questions

---

## Completion Notes
