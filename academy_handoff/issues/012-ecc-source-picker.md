# ISSUE-012: ECC Source Picker UI and URL Adjustments

**Phase:** Foundation (updated for ECC in Phase 1)
**Estimated Effort:** 3-5 hours
**Depends on:** ISSUE-004
**Skill files:** `ECC_ADDENDUM.md`, `SKILLS/stage1-static-html.md`, `SKILLS/seo-implementation.md`, `SKILLS/accessibility.md`

---

## Goal

Adjust the URL structure and templates to support dual sources (S/4HANA and ECC). Add a source picker UI on the tables index.

See `ECC_ADDENDUM.md` for the full rationale and content plan.

---

## Steps

### Part A: URL Structure

Update `build.js` to produce source-scoped URLs:

| Content path | Output path |
|---|---|
| `content/en/tables/s4hana/vbak.md` | `docs/tables/s4hana/vbak/index.html` |
| `content/en/tables/ecc/vbak.md` | `docs/tables/ecc/vbak/index.html` |
| `content/en/walkthroughs/s4hana/expert/acdoca.md` | `docs/walkthrough/s4hana/expert/acdoca/index.html` |
| `content/en/walkthroughs/ecc/intermediate/bseg.md` | `docs/walkthrough/ecc/intermediate/bseg/index.html` |

### Part B: Schema Updates

Add `source` field to tables and walkthroughs collections in `DATA_SCHEMA.md`:

```yaml
source: s4hana    # or ecc
```

Walkthrough IDs become `<source>-<level>-<table>` (e.g. `s4hana-expert-acdoca`, `ecc-intermediate-bseg`) to prevent collisions in localStorage.

### Part C: Source Picker on Tables Index

`docs/tables/index.html` should now show a two-column layout:

- Left column: S/4HANA tables (5 cards: VBAK, LFA1, MARA, BKPF, ACDOCA)
- Right column: ECC tables (5-7 cards: VBAK-ECC, LFA1-ECC, MARA-ECC, BKPF-ECC, BSEG, MATDOC, EKKO)

Or a tab-based layout if space is tight:
- Tab 1: S/4HANA
- Tab 2: ECC

Tab implementation: use `<details>` elements or radio-button hack for no-JS tabs. Accessible.

### Part D: Cross-References on Shared Tables

For tables that exist in both systems (VBAK, LFA1, MARA, BKPF), add a "See also" block on each table detail page:

```html
<aside class="source-cross-reference">
  <p>Also available for:</p>
  <a href="/tables/ecc/vbak/">VBAK on ECC 6.0</a>
</aside>
```

This boosts internal linking and helps users migrating from ECC to S/4HANA compare extraction approaches.

### Part E: Landing Page Update

Update landing page to mention both sources:
- Hero subheading mentions "S/4HANA and ECC"
- Value prop includes roadmap mention
- Featured walkthrough card shows ACDOCA (S/4HANA) OR rotates with BSEG (ECC)

### Part F: Roadmap Page Update

Phase 1 now covers both sources. Phase 2 becomes S/4HANA Cloud. Phases 3, 4, 5 shift accordingly.

---

## Acceptance Criteria

- [ ] URL structure updated in `build.js` to include source segment
- [ ] `source` field added to schemas and all existing content files
- [ ] Tables index has a clear source picker (columns or tabs)
- [ ] Cross-reference "Also see" blocks on shared tables
- [ ] Landing page and roadmap updated
- [ ] Breadcrumbs include source: Home → Tables → S/4HANA → VBAK
- [ ] Sitemap includes all source-scoped URLs
- [ ] Accessibility: source picker is keyboard-navigable, screen reader friendly

---

## Open Questions

---

## Completion Notes
