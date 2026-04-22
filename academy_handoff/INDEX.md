# Handoff Package Index — v3 (ECC-Inclusive)

---

## Total Effort Estimate

**Build + content: 80-110 hours** (8-10 weeks part-time, or 3-4 weeks full-time)

**LinkedIn outreach + content marketing: ongoing** (30-60 min/day after launch)

### Breakdown

| Category | Hours | Notes |
|---|---|---|
| Project setup, templates, build script | 10-15 | ISSUE-001 to 004 |
| Content — 8 tables | 5-6 | ISSUE-005 |
| Content — 18 walkthroughs | 25-35 | ISSUE-006; biggest block, SME work |
| Content — 42 glossary terms | 7-9 | ISSUE-007 |
| Content — 4 cornerstone articles | 10-16 | ISSUE-008 |
| Landing, about, roadmap, index pages | 7-10 | ISSUE-009, 010 |
| Deploy, sitemap, verify | 3-4 | ISSUE-011 |
| ECC source picker | 3-5 | ISSUE-012 |
| LinkedIn outreach setup | 6-8 | ISSUE-013 |
| **Total initial build** | **76-108 hours** | |

With Claude Code handling drafts + web-based SAP URL verification, expect 30-35% time savings on content. Net: **55-75 effective hours**.

- Sole SME + coder: 10-12 weeks part-time realistic
- With freelance engineer for setup: 6-8 weeks
- Full-time sprint: 3-4 weeks

---

## Root-Level Documents (read in order)

| File | Purpose |
|---|---|
| `README.md` | Entry point, strategy, success criteria |
| `AGENTS.md` | AI coding agent rules |
| `PROJECT_SPEC.md` | Product specification |
| `SEO_STRATEGY.md` | Google + LLM citation playbook |
| `CONTENT_RULES.md` | SAP citation discipline |
| `DATA_SCHEMA.md` | Frontmatter schemas |
| `MIGRATION_PATH.md` | Stage 1 → Stage 2 plan |
| `TOOLING_GUIDE.md` | Claude Code workflow |
| `COMPETITIVE_ANALYSIS.md` | Market landscape |
| `DESIGN_GUIDE.md` | Colors (SAP-adjacent), typography |
| `ECC_ADDENDUM.md` | ECC added to Phase 1 |
| `LINKEDIN_OUTREACH.md` | Outreach plan + templates + DSAG |
| `SAP_WIKI_GUIDE.md` | Karpathy-style private knowledge wiki |
| `SAP_PRACTICE_SYSTEM.md` | Docker + CAL + screenshot workflow |
| `MULTI_CHAT_SPLIT.md` | How to split work across parallel chats |

---

## Skill Files (`SKILLS/`)

| File | When |
|---|---|
| `stage1-static-html.md` | Any Stage 1 HTML/template work |
| `seo-implementation.md` | Every user-facing page |
| `sap-content-authoring.md` | Any SAP content |
| `content-writing.md` | Non-SAP prose |
| `accessibility.md` | Every user-facing component |
| `deployment.md` | GitHub Pages, Buttondown, Plausible |
| `migration-readiness.md` | Every structural decision |
| `sap-developer-studio.md` | Walkthroughs mentioning ADT/Eclipse |

---

## Issues (`issues/`) — Work in Numerical Order

| # | Title | Effort | Notes |
|---|---|---|---|
| 001 | Project Structure Setup | 30 min | Claude Code |
| 002 | Base Template & Main CSS | 3-4 h | Claude Code |
| 003 | Build Script | 2-3 h | Claude Code |
| 004 | Page-Type Templates | 4-5 h | Claude Code |
| 005 | Seed Tables Content (8) | 5-6 h | Claude Code + your SME review |
| 006 | 18 Walkthroughs | 25-35 h | Claude Code + your SME review (biggest block) |
| 007 | Glossary (42 terms) | 7-9 h | Claude Code + web-based URL verification |
| 008 | 4 Cornerstone Articles | 10-16 h | Claude Code + your SME review |
| 009 | Landing, About, Roadmap | 4-6 h | Claude Code |
| 010 | Index Pages + Client JS | 3-4 h | Claude Code |
| 011 | Deploy & Verify | 2-3 h | Claude Code |
| 012 | ECC Source Picker (NEW) | 3-5 h | Claude Code |
| 013 | LinkedIn Outreach (NEW) | 6-8 h | Manual + CRM (you) |

---

## Content Samples (`content_samples/`)

| File | Purpose |
|---|---|
| `vbak-beginner.md` | Reference walkthrough — template for all 18 |

---

## Templates (`templates/`)

| File | Purpose |
|---|---|
| `base.html` | Shared shell |
| `walkthrough.html` | Complex walkthrough template |

---

## Quick Start

```bash
unzip sap-extract-academy-handoff-v3.zip
cd academy_handoff/

# Read essential docs
cat README.md TOOLING_GUIDE.md AGENTS.md PROJECT_SPEC.md

# Open Claude Code in target repo
mkdir ~/code/sap-extract-academy
cd ~/code/sap-extract-academy
claude

# Instruction to Claude Code:
# "Read all files in /path/to/academy_handoff/ including subdirectories.
#  Follow AGENTS.md and work through issues/001 onwards in order."
```

---

## Definition of Done for MVP 1.0

- [ ] All 13 issues complete
- [ ] Live on GitHub Pages
- [ ] Both S/4HANA and ECC source paths live
- [ ] 18 walkthroughs, 8 table pages, 42 glossary entries, 4 articles
- [ ] Every page Lighthouse 95+ across all four categories
- [ ] All SAP claims cite SAP Help Portal
- [ ] Sitemap submitted to Google Search Console and Bing
- [ ] Email capture functional
- [ ] LinkedIn campaigns active
- [ ] DSAG talk proposal submitted for next event
- [ ] CRM tracking pipeline

---

## Maintenance Cadence Post-Launch

- **Weekly:** 1 LinkedIn post, outreach metrics review
- **Bi-weekly:** add glossary term or refine a walkthrough
- **Monthly:** competitive analysis refresh, 1 new article
- **Quarterly:** re-verify all SAP Help URLs (they drift), refresh screenshots

Plan Phase 2 (S/4HANA Cloud) when organic hits 500+ monthly visits or first paid Studio customer signs.
