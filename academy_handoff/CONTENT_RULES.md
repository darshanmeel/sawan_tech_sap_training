# CONTENT_RULES.md — Rules for All Written Content

Every word on the Academy site follows these rules. No exceptions.

---

## The Citation Rule (Most Important)

### Every technical claim about SAP must cite an SAP Help Portal page.

A "technical claim about SAP" includes:
- Transaction codes (ODQMON, LTRC, SE11, etc.)
- Table or field names
- SAP concepts (CDS view, ODP, SLT, Append Structure, delta queue)
- Step-by-step instructions in SAP systems
- License constraints
- Error messages or short dumps
- Version-specific behaviors

### Citation Format

Inline markdown links in prose:

```markdown
[Operational Data Provisioning (ODP)](https://help.sap.com/docs/...) 
enables delta queue management for extraction scenarios.
```

For walkthrough steps that reference a transaction:

```markdown
**Do this in SAP:** Open transaction [ODQMON](https://help.sap.com/docs/...) 
and navigate to "Subscription monitor."
```

For "Verify" blocks:

```markdown
> **Verify:** In [SE16N](https://help.sap.com/...), query table RSDDSTATDELTA 
> and confirm a row exists with your subscription ID.
```

### When You Cannot Find a Citation

Do **one** of these:

1. **Remove the claim** — if not essential
2. **Mark `[NEEDS_SAP_CITATION]`** inline and flag in the issue's Open Questions
3. **Link to a broader SAP page** — if it discusses the topic even if not exactly the claim

Never invent a URL. Never cite non-SAP sources.

### Accepted SAP Sources (in priority order)

1. `help.sap.com` — any page
2. `community.sap.com` — **only pages tagged as official SAP documentation**, not community blogs
3. `launchpad.support.sap.com` — SAP Notes (login-gated; link anyway)
4. `learning.sap.com` — public Learning Hub
5. `discovery-center.cloud.sap`
6. `api.sap.com`

### Never Accepted

- Stack Overflow, Stack Exchange
- Medium, Dev.to, Hashnode, Substack
- Reddit, Hacker News
- YouTube (including SAP's official channel — link the equivalent doc instead)
- LinkedIn posts or articles
- Personal blogs (even by SAP employees)
- Vendor docs (Microsoft, AWS, Snowflake) unless the page is specifically about their integration with SAP, and then cite both
- Other AI tool outputs
- Your own training data

---

## Paraphrasing Rule

### Never copy-paste SAP documentation verbatim.

SAP documentation is copyrighted. You may read, understand, and paraphrase. You may not reproduce paragraphs, bullet lists, or sentences verbatim.

### Paraphrasing Process

1. Read the SAP source
2. Close the tab
3. Write the explanation in your own words at the appropriate audience level
4. Link back to the source

### Short Phrases OK

Very short technical phrases (2-3 words) that have no natural paraphrase are acceptable — proper nouns like "Operational Data Provisioning", "Core Data Services", "Append Structure".

---

## Audience-Level Rules

### Beginner
- Assume no prior SAP exposure
- Define every acronym on first use
- Short sentences
- No "simply" or "just"
- More screenshot placeholders
- More, smaller steps (8-12 per walkthrough)

### Intermediate
- Assume basic SAP navigation familiarity
- Assume one Beginner walkthrough completed or equivalent
- Introduce delta, basic Z-fields, simple troubleshooting
- Step count: 12-18

### Expert
- 2+ years SAP data engineering assumed
- No hand-holding on basics
- Cover edge cases, license nuances, performance tuning, transport discipline
- Step count: 18-28

---

## Structural Rules for Walkthroughs

Every walkthrough has the exact frontmatter from `DATA_SCHEMA.md` Collection 2.

Sections in order:
1. Scenario description (2-3 paragraphs in markdown body)
2. What you need before starting (prerequisites checklist)
3. License check
4. Steps (in frontmatter `steps` array)
5. Troubleshooting (frontmatter `troubleshooting` array)
6. What you've built (markdown body after steps)
7. Next steps

---

## Voice and Tone

### Do

- Second person ("you'll open transaction X")
- Active voice
- Short sentences (15-20 words target)
- Concrete examples
- Acknowledge real difficulty
- Explain *why*, not just *how*

### Don't

- "Simply," "just," "easy," "basic" (these gaslight learners)
- "We" as if you're sitting with the learner (use "you")
- Exclamation marks for emphasis
- Emoji in body content
- Marketing fluff ("powerful," "seamless," "cutting-edge")
- Anthropomorphize SAP
- Hedge cited facts ("probably," "may" when SAP docs are clear)

---

## Glossary Rules

Every term:
- 1-3 sentence paraphrased definition
- Link to SAP's own definition (if one exists)
- Cross-links to related terms
- Main definition ≤ 2 sentences; longer content in extended description

---

## Code Block Rules

Use fenced blocks with language identifiers:

````markdown
```abap
@AbapCatalog.sqlViewName: 'ZV_ACDOCA_EXT'
define view ZACDOCA_EXT as select from acdoca { ... }
```
````

Supported: `abap` (use `sql` fallback if Prism lacks ABAP), `sql`, `python`, `json`, `yaml`, `bash`, `javascript`, `typescript`

Every code block has a preceding sentence explaining what it does. Placeholder values marked as `<YOUR_RFC_DESTINATION>`.

---

## Trademark Disclaimer

Required on the footer of every page:

> SAP, S/4HANA, and related terms are trademarks of SAP SE. This site is an independent educational resource and is not affiliated with, endorsed by, or sponsored by SAP SE. All references to SAP documentation link to the original source on sap.com.

---

## Review Checklist Before Committing

- [ ] Every SAP transaction/table/concept has an SAP Help link on first mention
- [ ] No text is copy-pasted from SAP docs
- [ ] Audience level matches frontmatter declaration
- [ ] No banned words ("simply," "just," "easy," "basic")
- [ ] Code blocks have language identifiers and explanations
- [ ] Trademark disclaimer in layout
- [ ] No `[NEEDS_SAP_CITATION]` remaining (or flagged in Open Questions)
- [ ] Glossary terms used are in the glossary folder
- [ ] Filename is kebab-case
