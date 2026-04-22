# ECC_ADDENDUM.md — Adding ECC 6.0 to Launch

Original plan deferred ECC to Phase 2. Based on scope review, adding ECC to Phase 1 costs only 1-2 weeks because the extractor and destination logic reuses ~60% of the S/4HANA build.

This file defines exactly what changes.

---

## Why ECC Makes Sense in Phase 1

- **Shared extraction mechanisms:** ODP works identically on ECC (context SAPI instead of ABAP_CDS)
- **Same destinations:** ADLS, S3, Snowflake, Kafka, Databricks — no target-side changes
- **Shared extractors:** ADF, Python, Fivetran work with both sources
- **SEO multiplier:** ECC keywords (BSEG, MATDOC, classic BW extractors) add a whole new content cluster
- **Larger addressable market immediately:** 40% of SAP installed base still runs ECC

The only genuine differences are:
- ECC has no CDS views — use classic BW extractors (`2LIS_*`, `0FI_*`) exposed via ODP
- Different transactions on SAP side (`RSA5`, `RSA6`, `RSA7` instead of `ODQMON` for some tasks)
- Z-fields come via CMOD user exits, not CDS Extension Views

---

## Revised Launch Scope

### Sources (both at launch)

- S/4HANA on-premise
- ECC 6.0

### Tables (expanded to 8 at launch)

**Shared tables (same name, some fields differ):**
- VBAK (both systems)
- LFA1 (both)
- MARA (both)
- BKPF (both)

**S/4HANA-only:**
- ACDOCA (Universal Journal — doesn't exist in ECC; replaced by separate tables in ECC)

**ECC-only:**
- BSEG (replaced by ACDOCA in S/4HANA, but still a massive ECC reality)
- MATDOC (material document — exists in both but different in ECC)
- EKKO (purchasing document header — same in both, but walkthrough differs because extractor differs)

### Walkthroughs (24 total at launch instead of 15)

| Table | Source | Levels | Count |
|---|---|---|---|
| VBAK | S/4HANA | B, I, E | 3 |
| VBAK | ECC | B, I, E | 3 |
| LFA1 | S/4HANA | B, I, E | 3 |
| LFA1 | ECC | B, I, E | 3 |
| MARA | S/4HANA | B, I, E | 3 |
| MARA | ECC | B, I, E | 3 |
| BKPF | S/4HANA | B, I, E | 3 |
| BKPF | ECC | B, I, E | 3 |
| ACDOCA | S/4HANA | I, E (no beginner) | 2 |
| BSEG | ECC | I, E | 2 |
| MATDOC | ECC | I, E | 2 |
| EKKO | ECC | B, I, E | 3 |

Wait — that's too many. Let me scope down to what's achievable:

### Realistic Launch Scope

**S/4HANA walkthroughs: 13** (five tables × 3 levels, minus ACDOCA beginner)

**ECC walkthroughs: 10** — only the most differentiated scenarios, not full 5×3 matrix
- VBAK ECC Intermediate (shows the extractor difference clearly)
- LFA1 ECC Beginner (easiest ECC entry point)
- MARA ECC Intermediate (Z-field via CMOD)
- BSEG ECC Expert (heavyweight ECC finance)
- MATDOC ECC Intermediate

Five ECC walkthroughs at launch, not 15. Rest come in Phase 2.

**Total at launch: 18 walkthroughs** (was 15, now 18 — doable in 1-2 extra weeks)

---

## Structural Changes

### Frontmatter schema — add `source` field

Update `DATA_SCHEMA.md` Collection 1 (tables) and Collection 2 (walkthroughs) to include:

```yaml
source: s4hana        # s4hana | ecc
```

Adjust file paths:

| Before | After |
|---|---|
| `content/en/tables/vbak.md` | `content/en/tables/s4hana/vbak.md` and `content/en/tables/ecc/vbak.md` (separate because metadata differs) |
| `content/en/walkthroughs/beginner/vbak.md` | `content/en/walkthroughs/s4hana/beginner/vbak.md` and `content/en/walkthroughs/ecc/intermediate/vbak.md` |

URLs adjust too:

| Before | After |
|---|---|
| `/tables/vbak/` | `/tables/s4hana/vbak/` and `/tables/ecc/vbak/` |
| `/walkthrough/beginner/vbak/` | `/walkthrough/s4hana/beginner/vbak/` and `/walkthrough/ecc/intermediate/vbak/` |

A "source picker" card on `/tables/` lets the user choose S/4HANA or ECC upfront.

### Glossary additions

Add ECC-specific terms (approximately 10 more):
- BW Extractor
- RSA5
- RSA6
- RSA7
- CMOD (Customer Enhancement Projects)
- BSEG
- MATDOC (vs documented separately if different from S/4HANA)
- LIS (Logistics Information System)
- V3 Update
- SMOFSUBTOT

Total glossary at launch: ~42 terms (was 32).

### Articles — add one ECC article

Add a fourth cornerstone article:

**`content/en/articles/ecc-to-cloud-extraction.md`** — "Extracting SAP ECC to the Cloud: What's Different from S/4HANA"

- 2000-2500 words
- Covers classic BW extractors, ODP SAPI context, Z-field via CMOD, no CDS views
- Cross-links to ECC walkthroughs

Articles at launch: 4 (was 3).

---

## Work Estimate for ECC Addition

| Task | Effort |
|---|---|
| Add `source` field to schema | 30 min |
| Add `source` handling to `build.js` | 1 h |
| Adjust URL structure and templates | 1-2 h |
| Write ECC versions of 4 shared tables (VBAK, LFA1, MARA, BKPF) | 2 h (mostly copy-edit from S/4HANA versions) |
| Write 2 new ECC-only tables (BSEG, MATDOC) | 2 h |
| Write 5 ECC walkthroughs | 10-15 h |
| Add 10 ECC glossary terms | 3 h |
| Write ECC vs S/4HANA article | 4 h |
| Source picker UI on tables index | 1 h |

**Total: ~25-30 hours extra** on top of the 55-80 already planned.

This fits in a 1-2 week extension of the 12-week plan.

---

## New URL Structure for SEO

Each source gets its own URL tree, which multiplies keyword coverage:

- `/tables/s4hana/vbak/` — ranks for "extract VBAK S/4HANA"
- `/tables/ecc/vbak/` — ranks for "extract VBAK ECC"
- `/walkthrough/s4hana/beginner/vbak/` — beginner S/4HANA path
- `/walkthrough/ecc/intermediate/vbak/` — ECC path

Google treats these as separate pages with separate ranking opportunities. Adding ECC nearly doubles the indexed URL count at launch, with significantly less than 2× effort.

---

## Landing Page Updates

The landing page hero and value props change slightly to reflect dual sources:

- Headline options:
  - "Learn SAP data extraction the right way — S/4HANA and ECC."
  - "From SAP to your cloud. S/4HANA and ECC covered."
  
- Subheading: "Free, step-by-step walkthroughs for VBAK, LFA1, MARA, BKPF, ACDOCA (S/4HANA) and BSEG, MATDOC (ECC). Every step cited to SAP's official documentation."

### Roadmap Page Change

Roadmap now reflects: Phase 1 is S/4HANA + ECC (current). Phase 2 is S/4HANA Cloud. Remaining phases unchanged.

---

## Issue Updates

The following issues need minor updates:

- **ISSUE-005 (Seed Tables)** — now seeds 8 table files (5 S/4HANA + 3 ECC-exclusive)
- **ISSUE-006 (Walkthroughs)** — now 18 walkthroughs (13 S/4HANA + 5 ECC)
- **ISSUE-007 (Glossary)** — now ~42 terms
- **ISSUE-008 (Articles)** — now 4 cornerstone articles

A new issue is added:

- **ISSUE-012 (Source Picker UI)** — small UI enhancement letting users pick S/4HANA or ECC when entering the tables index

---

## SEO Keyword Additions for ECC

Add these primary keywords to `SEO_STRATEGY.md`:

- `extract BSEG to Snowflake`
- `SAP ECC data extraction`
- `classic BW extractors`
- `2LIS extractors`
- `RSA7 delta queue`
- `ECC to cloud migration`
- `CMOD SAP Z-field extractor`

And long-tail LLM-citable queries:

- `how do I extract BSEG from ECC`
- `difference between ODP on ECC vs S/4HANA`
- `can I use SLT on ECC`
- `what is 2LIS_11_VAHDR`

---

## Content Rule: Source-Specific Language

When writing ECC content, remember:

- ECC uses `RSA6` / `RSA7` for delta; S/4HANA uses `ODQMON` (though ODQMON works for both on modern systems)
- ECC does NOT have CDS views — never suggest them for ECC
- Z-fields in ECC are typically via Append Structure + CMOD/BAdI user exits; in S/4HANA via Append Structure + CDS Extension View
- ECC licensing terms differ slightly from S/4HANA — flag Runtime License applicability per source

Cross-reference: link ECC walkthroughs to their S/4HANA equivalents and vice versa. The "For the S/4HANA version, see..." cross-link is an SEO internal-linking boost as well as genuinely useful to learners migrating from ECC to S/4HANA.
