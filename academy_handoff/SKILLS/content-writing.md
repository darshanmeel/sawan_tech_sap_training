# SKILL: Content Writing (Non-SAP Prose)

Use this skill for landing page, about page, roadmap page, and any prose that isn't a SAP walkthrough. For SAP-specific content, use `sap-content-authoring.md`.

---

## Voice

Write like an experienced data engineer talking to another experienced data engineer. Direct, technical where needed, free of marketing fluff.

---

## Banned Words

- Powerful, Seamless, Cutting-edge, World-class, Revolutionary, Game-changing
- Empower (unless followed by concrete outcome)
- Leverage (use "use")
- Synergy
- Simply, just, easy, basic (these gaslight the reader)

If a sentence works without the word, remove the word. If it doesn't, rewrite the sentence.

---

## Style Rules

- Sentences: 15-20 words average
- Paragraphs: 2-4 sentences
- Active voice
- Second person ("you")
- Contractions in body copy; full forms in headings and legal text
- No emojis in prose
- Specific over general — real numbers, real tables, real outcomes

---

## Landing Page Copy

### Hero (pick strongest)

- "Learn SAP S/4HANA data extraction the right way."
- "Your SAP extraction runbook. Written from SAP's documentation."
- "Stop reading SAP tables wrong. Start reading them right."

### Subheadline

"Free, step-by-step walkthroughs for VBAK, LFA1, MARA, BKPF, and ACDOCA. Every instruction cited to SAP's official documentation."

### Primary CTA

"Pick a table"

### Secondary CTA

"Read the ACDOCA deep dive"

### Value Prop Columns

**SAP-documented**

"Every step links to the SAP Help Portal. If a claim isn't in SAP's docs, it's not on this site. You get the source material, not someone's blog post."

**Level-appropriate**

"Beginner, intermediate, expert. Each level assumes what the last level taught. You won't be over your head or under-challenged."

**Take it with you**

"Check off steps as you go. Download a PDF of your completed checklist. Use it as a runbook for your actual project."

### ACDOCA Featured

"ACDOCA is the financial backbone of S/4HANA. Billions of rows, tangled license rules, and at least three ways to break your SAP system if you read it wrong. This walkthrough covers the approach SAP actually recommends — CDS views, partitioning, and delta through ODP."

CTA: "Start the ACDOCA walkthrough"

### Roadmap Teaser

"This launch covers S/4HANA on-premise. Next up:

- ECC 6.0 — Month 4-5
- S/4HANA Cloud — Month 6-7
- BW and BW/4HANA — Month 8-9
- SAP Datasphere — Month 10-12

Get notified when each ships."

---

## About Page

400-600 words. Four sections:

**What this is** — one paragraph on what the Academy does and who it's for.

**Why it exists** — one paragraph. Data engineers know their cloud platform and treat SAP as a black box. SAP consultants know SAP and treat cloud as a black box. The Academy is the bridge — grounded in SAP's own documentation, taught in the language data engineers think in.

**Who's behind it** — placeholder for human. Template:

> This project is built by [name], a data engineer with [X] years bridging SAP and cloud platforms. It grew from the frustration of explaining the same CDS view concepts to every new team on every new project.

**How it's funded** — "The Academy is free. It's funded by the Studio product — our paid code generator for the same SAP extraction scenarios. If the Academy helps you, Studio might help your team."

**Contact** — email + LinkedIn handle.

---

## Roadmap Page

One section per phase:

**Phase 1 — Launch (Now)** — S/4HANA on-premise. Five tables: VBAK, LFA1, MARA, BKPF, ACDOCA. Two extractors: ADF and Python. Two destinations: ADLS and Snowflake. Three levels per table.

**Phase 2 — ECC 6.0 (Month 4-5)** — 40% of SAP installed base still runs classic. Adding BW Extractors via ODP, SLT for ECC, tables like BSEG and MATDOC. Second because extractor/destination logic reuses ~60%.

**Phase 3 — S/4HANA Cloud (Month 6-7)** — Different license model, different extraction surface. OData and Key User Extensibility become primary paths.

**Phase 4 — BW 7.x + BW/4HANA (Month 8-9)** — For customers with existing BW investments. Covers DSO/ADSO, OpenHub, direct HANA extraction where license permits.

**Phase 5 — SAP Datasphere (Month 10-12)** — Both source (replication flows) and target. Closes the full loop.

Each section ends with "Get notified when [phase name] ships" → email capture tagged with the phase.

---

## Article Intros

Open with a concrete scenario, the reader's problem, what the article teaches.

### Good opening

"Your team wants the Universal Journal in Snowflake by end of quarter. You fire off a SELECT * FROM ACDOCA and the SAP dialog processes crash. The Basis team asks what you did. You're not sure. This article explains what went wrong, why, and what to do instead."

### Bad opening

"The Universal Journal, introduced in SAP S/4HANA, is a powerful unified table that consolidates financial data across modules. In today's data-driven enterprise..."

---

## Headings

- Title case for page titles (`How ACDOCA Works at Scale`)
- Sentence case for section headings (`Step 3: Configure the delta queue`)
- No punctuation at heading end
- Concrete verb-first when describing actions

---

## Buttons and CTAs

- Action verbs, not nouns: "Start walkthrough" not "Walkthrough"
- Max 3 words for primary CTAs, 4 for secondary

---

## Microcopy

- Form placeholders: "you@example.com" (not "Enter your email")
- Empty states: specific ("No walkthroughs completed yet. Pick one above to start.")
- Loading: specific ("Loading ACDOCA walkthrough...")
- Errors: actionable ("Email looks invalid. Check format and try again.")

---

## Final Pass

- [ ] Read it aloud — rewrite anywhere you stumble
- [ ] Check for banned words
- [ ] Verify 15-20 word average sentence length
- [ ] Defend every concrete claim ("45 minutes" — is that actually expected?)
- [ ] Trim anything that could be cut without loss
