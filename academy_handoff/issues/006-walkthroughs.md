# ISSUE-006: Write 15 Walkthroughs

**Phase:** Content
**Estimated Effort:** 20-30 hours across all 15 (prioritize VBAK Beginner as the reference)
**Depends on:** ISSUE-005
**Skill files:** `SKILLS/sap-content-authoring.md`, `CONTENT_RULES.md`, `SKILLS/seo-implementation.md`, `DATA_SCHEMA.md`

---

## Goal

Write 15 walkthroughs (5 tables × 3 levels). The reference walkthrough is provided in `content_samples/vbak-beginner.md` — use it as the structural template.

---

## Priority Order

Write in this order so the demo video content (ACDOCA Expert) is ready when needed:

1. **VBAK Beginner** — match the reference sample exactly in structure
2. **LFA1 Beginner** — simplest content, build momentum
3. **MARA Beginner** — introduces Z-field concepts
4. **VBAK Intermediate** — builds on Beginner
5. **BKPF Beginner** — finance introduction
6. **ACDOCA Expert** — demo centerpiece, most effort
7. Remaining 9 walkthroughs to fill the matrix

---

## Each Walkthrough File

Location: `content/en/walkthroughs/[level]/[table].md`

Example: `content/en/walkthroughs/expert/acdoca.md`

Frontmatter matches `DATA_SCHEMA.md` Collection 2. Required: table, level, slug, title, summary, estimatedMinutes, prerequisites, licenseRelevance, destinations, extractors, steps, troubleshooting, nextSteps, seoTitle, seoDescription, updatedAt.

Markdown body: scenario intro (2-3 paragraphs) before the steps, "What you've built" summary after.

---

## Step Count by Level

- **Beginner:** 8-12 steps
- **Intermediate:** 12-18 steps
- **Expert:** 18-28 steps

---

## Per-Walkthrough Scenarios

### VBAK Walkthroughs

- **Beginner:** Full load via ADF SAP CDC connector → ADLS Parquet. No Z-fields. See sample.
- **Intermediate:** Full + delta via Python/pyrfc on ODP → Snowflake. One Z-field (ZZ_REGION).
- **Expert:** SLT push → Kafka with log compaction. Multiple Z-fields. Partitioning by VKORG.

### LFA1 Walkthroughs

- **Beginner:** Full load only. ADF → ADLS. Weekly refresh.
- **Intermediate:** Add delta via ODP. Full + hourly delta. Introduce CDS extension view for a Z-field.
- **Expert:** Handle vendor master as part of a multi-table extraction (LFA1 + LFB1 + LFBK). Snowflake destination.

### MARA Walkthroughs

- **Beginner:** Full load, no Z-fields. Focus on handling numeric vs character fields (MEINS, MATKL).
- **Intermediate:** Add Z-fields (ZZ_BRAND CHAR20, ZZ_SUSTAINABILITY CHAR1). CDS Extension View. Python extractor.
- **Expert:** Massively extended MARA (20+ Z-fields typical). Fivetran Application Layer extractor. Include MARC, MVKE as related tables.

### BKPF Walkthroughs

- **Beginner:** Full load only for a limited date range (one fiscal year). ADF → ADLS.
- **Intermediate:** Full + delta. Introduce GJAHR/BUKRS partitioning. Python → Snowflake.
- **Expert:** BKPF + BSEG joined. Handle the size disparity (BSEG much larger). SLT with LTRS parallel reads.

### ACDOCA Walkthroughs

- **Beginner:** Not offered (ACDOCA is not a beginner table). Optional: a "Why not try ACDOCA first?" page explaining this.
- **Intermediate:** Partial extraction — one company code, current fiscal year. Python via ODP with I_JournalEntryItem CDS view. Snowflake target.
- **Expert:** Full enterprise extraction. SLT push → Kafka with log compaction. Z-fields with CUKY pairing. LTRS parallel reads by BUKRS + GJAHR. License awareness callout. This is the demo centerpiece.

If ACDOCA Beginner is not offered, adjust `availableLevels` in `content/en/tables/acdoca.md` accordingly.

---

## Working Pattern

For each walkthrough:

1. Start from the reference sample structure
2. Write the scenario intro (business context, what you'll achieve)
3. List prerequisites
4. Write license check
5. Write the steps array — this is the bulk of the work
6. For each step: explanation, "Do this in SAP" (with SAP Help link), optional code block, Verify box, optional Why It Matters
7. Troubleshooting section (3-5 common problems)
8. "What you've built" summary
9. Next steps (2-3 links)
10. Complete frontmatter including SEO fields

---

## Acceptance Criteria

For each walkthrough:

- [ ] File exists at correct path
- [ ] Frontmatter validates against schema
- [ ] Step count matches level target (8-12/12-18/18-28)
- [ ] Every SAP term has an inline SAP Help link on first mention
- [ ] Every step has a Verify block
- [ ] Troubleshooting has 3-5 items with SAP Note citations where possible
- [ ] SEO title and description set
- [ ] No banned words from `SKILLS/content-writing.md`
- [ ] No `[NEEDS_SAP_CITATION]` remaining (or flagged in Open Questions)

---

## Open Questions

---

## Completion Notes
