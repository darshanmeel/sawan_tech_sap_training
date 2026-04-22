# MULTI_CHAT_SPLIT.md — Dividing the Work Across Parallel Sessions

The project has grown large. Running everything in one chat loses context. Here's how to split the work so you can run multiple chats simultaneously or serially without losing coherence.

---

## The Seven Workstreams

Each workstream has a clear scope, its own starting prompt, and specific outputs. Open a separate chat per workstream when you're ready to work on it.

---

## Chat 1 — Academy Build & Deployment

**Scope:** Building the Stage 1 static HTML Academy, executing the handoff package, deploying to GitHub Pages.

**Uses:** Current handoff package + `sap_wiki/` for citations

**Tool:** Claude Code (in your local terminal)

**Starting prompt:**

```
I'm building SAP Extract Academy from the handoff package in 
academy_handoff/. Private repo on GitHub, deploying static HTML 
to GitHub Pages at [your-github-username].github.io/sap-extract-academy or a custom domain via GitHub Pages DNS settings.

Read all files in academy_handoff/ including subdirectories. 
Start with README.md, AGENTS.md, PROJECT_SPEC.md, SEO_STRATEGY.md. 
Then follow the issues in order.

IMPORTANT: When writing any content, read the relevant articles in 
sap_wiki/wiki/ first. Every SAP citation must come from the wiki — 
never invent URLs.

Begin with ISSUE-001. Commit per AGENTS.md conventions.
```

**Outputs:** Live Academy site, 18 walkthroughs, 42 glossary terms, 4 articles

**Estimated duration:** 6-8 weeks part-time

---

## Chat 2 — SAP Wiki Build

**Scope:** Processing SAP PDFs, compiling the private Karpathy-style wiki, maintaining it as new content flows in.

**Uses:** `SAP_WIKI_GUIDE.md` from the handoff

**Tool:** Claude Code (for compilation) + Docling CLI (for PDF conversion)

**Starting prompt:**

```
I'm building a Karpathy-style private SAP knowledge wiki in the 
sap_wiki/ directory. Read SAP_WIKI_GUIDE.md first for the full 
schema and workflow.

I've downloaded SAP Help Portal PDFs and placed them in 
sap_wiki/raw/pdfs/. I've converted them to markdown with Docling 
into sap_wiki/raw/pdfs_md/.

Your task:
1. Read sap_wiki/CLAUDE.md for wiki maintenance rules
2. Read all markdown files in sap_wiki/raw/pdfs_md/
3. Compile wiki articles into sap_wiki/wiki/ following the schema
4. Build sap_wiki/wiki/index.md with cross-references
5. Append to sap_wiki/changelog.md

Start with the ACDOCA + ODP + CDS + SLT topics. Those are highest 
priority for Academy content.
```

**Outputs:** Structured `sap_wiki/wiki/` with 60-100 articles

**Estimated duration:** Initial compilation 2-3 days. Ongoing: 30 min/week.

---

## Chat 3 — SAP Practice System Setup

**Scope:** Docker SAP trial installation, CAL configuration, screenshot automation setup.

**Uses:** `SAP_PRACTICE_SYSTEM.md`

**Tool:** Claude (web chat — this is setup/advisory work, not code)

**Starting prompt:**

```
I'm setting up a SAP practice environment for my Academy project. 
Read SAP_PRACTICE_SYSTEM.md for the full plan.

My current state: [describe — e.g. "Docker Desktop installed, 
haven't pulled the SAP image yet, no CAL account yet"]

Guide me through:
1. Docker ABAP trial setup (validation step by step)
2. CAL account creation and first S/4HANA appliance deployment
3. Screenshot toolchain setup (Snagit or ShareX, Playwright for 
   Fiori)
4. Capture workflow for the first walkthrough (VBAK Beginner)

Check in after each step before moving to the next.
```

**Outputs:** Working Docker SAP trial, CAL instance ready to spin up, screenshot tool configured

**Estimated duration:** 1-2 days for setup, then ongoing as you need screenshots

---

## Chat 4 — Studio Product Architecture (Stage 2)

**Scope:** Designing the paid code generator — vector DB, embeddings, backend API, auth, billing, frontend.

**Uses:** `academy_handoff/PROJECT_SPEC.md` Studio section, plus `SAP_WIKI_GUIDE.md` (Studio's retrieval layer)

**Tool:** Claude (web chat for architecture) + Claude Code (for implementation later)

**Starting prompt:**

```
I'm designing Stage 2 of my SAP Extract platform: a paid code 
generator product called Studio.

Context:
- Stage 1 Academy is the free funnel (static HTML training site)
- Studio is the paid product (€49-599/month tiers per the business plan)
- Users describe an extraction scenario (table, source, target, 
  license), Studio generates Python/ADF/SLT code + runbook + 
  slide deck
- Backend retrieves from sap_wiki/wiki/ using vector search to 
  ground the code generation

Help me architect:
1. Backend stack (FastAPI or Node, Qdrant or pgvector, auth, 
   Stripe billing)
2. Vector embedding pipeline (Google text-embedding-004, indexing 
   cadence, metadata schema)
3. Code generation approach (Claude Sonnet prompts, output 
   templates, artifact packaging)
4. Frontend (React app, shadcn/ui, the conflict resolver UX)
5. Deployment topology (Hetzner VPS? Vercel Functions? AWS Lambda?)
6. Pricing page and Stripe integration

I'm strong with Snowflake, Databricks, Synapse, dbt. Less 
experienced with FastAPI, auth, billing. Guide me with that 
skill asymmetry in mind.
```

**Outputs:** Architecture doc, tech stack decision, rough implementation plan

**Estimated duration:** 1-2 weeks of design + 8-12 weeks of build (Stage 2, not now)

---

## Chat 5 — Token-Metered Chatbot (Deferred, Build After Studio)

**Scope:** Embedded Q&A chatbot for both Academy and Studio, grounded in wiki + Academy content. Token-metered free tier (10,000 tokens OR 5 questions/day per IP). Unlimited for paid Studio users.

**Priority:** **Deferred.** Build this AFTER Academy is live AND Studio MVP is working. Focus on training content and Studio first.

**Uses:** `sap_wiki/wiki/` + Academy content + reuses Studio's embedding infrastructure

**Tool:** Claude Code for implementation

**Starting prompt (save for when you're ready):**

```
I want to add a SAP Q&A chatbot to both my Academy site and 
Studio product.

Free tier (Academy users):
- 10,000 tokens per session OR 5 questions per day per IP, 
  whichever hits first
- Grounded ONLY in sap_wiki/wiki/ + published Academy content
- Refuses off-topic questions
- Upgrade CTA when limit hit

Paid tier (Studio subscribers):
- Unlimited (fair-use 1000/day soft cap)
- Uses Claude Sonnet instead of Haiku for depth
- Accepts user context (error logs, CDS source)
- Chat history persists per account

Architecture:
- Google text-embedding-004 for embedding
- Qdrant (reuse Studio's instance) for storage
- Claude Haiku for free tier, Sonnet for paid
- FastAPI backend (shared with Studio)
- React widget embedded in Academy templates (bottom-right)
- Rate limiting via Redis keyed by IP (free) or user ID (paid)

Start with the embedding pipeline (wiki → Qdrant via nightly cron),
then the query API with token counting, then the widget.
```

**Outputs:** Working chatbot on both properties, token metering, upgrade funnel

**Estimated duration:** 2-3 weeks part-time AFTER Studio is live (not before)

---

## Chat 6 — Umbrella Brand & Broader Site

**Scope:** Your root brand site covering consulting + multiple products (SAP + Databricks + Snowflake + Synapse + dbt content areas)

**Tool:** Claude (web chat for strategy) + Claude Code (for build)

**Starting prompt:**

```
I'm an expert in SAP data extraction (Academy/Studio products), 
plus Databricks, Snowflake, Synapse, SQL, dbt. I want to build a 
personal brand umbrella site at [mybrand].com with subdomain 
architecture:

- [mybrand].com — my personal brand, consulting offering, case studies
- academy.[mybrand].com — SAP Extract Academy (free, in build now)
- studio.[mybrand].com — SAP Extract Studio (paid, Stage 2)
- lakehouse.[mybrand].com — Databricks content (optional, later)
- warehouse.[mybrand].com — Snowflake content (optional, later)

Help me plan:
1. Content strategy for the root brand site (positioning, audience, 
   top-funnel content)
2. SEO strategy across subdomains (how they reinforce each other)
3. Technical architecture (probably Astro or similar static site 
   with shared design system across subdomains)
4. Brand design — logo approach, cross-subdomain design coherence
5. Phase order — what to build first after Academy is live

I'm in Hesse, Germany. LinkedIn + DSAG are my primary channels. 
Target audience is data engineering leaders + SAP-running enterprises.
```

**Outputs:** Brand strategy doc, subdomain architecture plan, content calendar for root site

**Estimated duration:** Planning session (1 week), build in parallel with Studio (Months 3-6)

---

## Chat 7 — LinkedIn Execution & DSAG

**Scope:** Running the LinkedIn outreach campaigns, DSAG relationship building, content calendar execution.

**Uses:** `LINKEDIN_OUTREACH.md` from the handoff

**Tool:** Claude (web chat for message crafting) — no code needed

**Starting prompt:**

```
I'm executing the LinkedIn outreach plan from LINKEDIN_OUTREACH.md. 
I'm in Hesse, Germany. DSAG is my priority channel.

Current state: [describe — e.g. "LinkedIn profile updated, first 
10 connection requests sent last week, 3 accepted, 0 replies yet"]

Help me with:
1. Personalizing the first-message template for today's 
   connection-accepted folks (I'll paste their profiles)
2. Drafting my weekly LinkedIn content (Teaching/Observation/
   Community posts)
3. Replying to cold responses (I'll paste what they wrote)
4. Preparing my DSAG talk proposal in German

Keep it direct and specific. No marketing fluff. My voice is 
experienced practitioner, not salesperson.
```

**Outputs:** Sent messages, published posts, booked calls, DSAG acceptance

**Estimated duration:** Ongoing (30-60 min/day)

---

## How to Use These in Practice

### Option A: Serial (Recommended if Solo)

Run one workstream at a time. You have limited attention; focus matters more than parallelism.

Suggested order:
1. Chat 3 (SAP practice system on GCP) — background task, 1-2 days
2. Chat 2 (SAP wiki) — 2-3 days to initial compilation
3. Chat 1 (Academy build) — 6-8 weeks, dominant effort
4. Chat 7 (LinkedIn) — starts Week 3 of Chat 1, runs continuously
5. Chat 6 (Umbrella brand) — 1-2 weeks planning, can run in parallel
6. Chat 4 (Studio) — after Academy has traction
7. Chat 5 (Chatbot) — AFTER Studio MVP is working, reuses Studio infra

### Option B: Parallel (If You Can Batch-Switch)

Some workstreams don't block each other:

- Chat 2 (wiki) happens before Chat 1 needs it, but once started, both can run
- Chat 3 (practice system) is pure infrastructure, runs alongside anything
- Chat 7 (LinkedIn) is daily batching, can overlap with anything

Don't try to run Chat 1, 2, 4, 5, 6 all simultaneously — you'll lose coherence and drop context across them.

### Option C: Hire or Partner

If you find that Chat 1 (Academy build) is blocking everything, this is the most delegatable workstream. A contractor Claude Code user can execute it from the handoff package. You stay focused on wiki (Chat 2), SME review, and LinkedIn (Chat 7) — the three things only you can do.

---

## Keeping Chats Coherent

Each chat has its own context. To prevent drift:

**At the start of each session in any chat:**

```
Read [list of relevant handoff files]. Confirm you understand 
the current state of [workstream].

Current status: [paste 3-5 bullet summary of where you left off last session]

Today's goal: [one sentence]

Start now.
```

**At the end of each session, ask the chat to summarize:**

```
Summarize what we accomplished this session in 5 bullets. 
Write it as the "current status" I'll paste into the next session.
```

This creates a handoff note you pass to future-you. Each chat stays self-contained.

---

## When a Chat Gets Too Long

Anthropic's chat limits vary but all have practical limits. When a chat is getting sluggish or you're running out of context:

1. Ask the chat for a comprehensive summary of everything accomplished
2. Copy the summary
3. Start a fresh chat in the same workstream
4. Paste the summary as the "current status" and continue

No data loss. Clean slate with context preserved.

---

## What NOT to Split

These things should stay in one chat:
- Building a single walkthrough (all steps related, don't split across chats)
- Debugging a specific code issue (context is everything)
- Writing a single article (flow matters)

These can be split freely:
- Different walkthroughs (each self-contained)
- Infrastructure setup vs content authoring (different concerns)
- Strategy vs execution (different modes of thinking)

---

## Recommended Next Action

Open Chat 3 first. SAP practice system setup is background work that's blocking nothing else. Once Docker is running, switch to Chat 2 (wiki build). By the time the wiki has 20-30 articles, Chat 1 (Academy build) has the raw material it needs to produce high-quality content without invention.

That sequence — practice system → wiki → Academy → LinkedIn — gets you to a live site in ~8-10 weeks with minimal rework.
