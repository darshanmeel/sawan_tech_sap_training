# COMPETITIVE_ANALYSIS.md — What's Out There, What Isn't

Based on April 2026 competitive research. Refresh every 90 days.

---

## Executive Finding

**There is no direct competitor.** The SAP training market has thousands of offerings and the data engineering training market has thousands of offerings, but the intersection — "teach data engineers to extract specific SAP tables to cloud platforms" — is an open gap.

That's the opportunity. It's also a signal: if this were easy or obvious, someone would already own it.

---

## Competitor Categories

### Category 1: SAP's Own Training

**SAP Training (training.sap.com)**

- Courses like S4H00 (S/4HANA Overview), BW450 (BW/4HANA Data Acquisition)
- Classroom or virtual live classes, typically 3-5 days
- Price: €2000-€5000 per course
- Audience: SAP-side consultants and architects, NOT cloud-side data engineers
- Coverage of data extraction: present (BW450 covers ODP, SDI, CDS views) but SAP-centric — destination is always another SAP product
- **Gap:** doesn't teach "extract VBAK to Snowflake." The destination isn't in scope.

**openSAP (open.sap.com)**

- Free MOOCs on SAP topics
- "Data Migration to SAP S/4HANA" course — but this is migration INTO SAP, not extraction OUT
- **Gap:** focus is on SAP data modeling and S/4 adoption, not data engineering extraction pipelines

**SAP Learning Hub subscription**

- Access to all SAP-produced content
- Price: starting €2300/year
- **Gap:** content is SAP-produced and SAP-audience-focused. Doesn't address Snowflake, Databricks, ADF specifics.

### Category 2: Udemy / LinkedIn Learning / Coursera

**Typical offerings:**
- "SAP S/4HANA Essential Training" (LinkedIn Learning, Michael Management)
- "The Ultimate SAP S/4HANA Course 2026" (Udemy)
- "SAP S/4HANA FICO General Ledger" (multiple)

**What they cover:**
- Module overviews (SD, MM, FI)
- End-user transactions
- Fiori UX
- Basic configuration
- Certification prep

**What they don't cover:**
- Specific table extraction to cloud
- CDS view annotations for extractors
- ADF / Python / Fivetran + SAP patterns
- License awareness for third-party extraction
- Kafka, Snowflake, Databricks as destinations

**Our positioning vs them:** they teach how SAP works; we teach how to get data out of SAP.

### Category 3: SI-Internal Training

**Deloitte, Accenture, TCS, Infosys internal SAP academies**

- Private to each firm's employees
- Covers SAP + cloud extraction but varies by firm
- Usually not productized

**Our positioning:** we're selling to these SIs as a training replacement/supplement, not competing for their end-users directly. SI white-label is a revenue stream, not a threat.

### Category 4: Cloud Vendor SAP Integration Content

**Microsoft ADF SAP CDC connector docs**
- Technical reference, not training
- Assumes SAP knowledge on the reader's part

**Snowflake SAP Partner Connect docs**
- Architectural overviews
- Connector setup guides
- No walkthroughs on specific tables

**Databricks Lakehouse for SAP**
- Marketing content plus reference architecture
- No hands-on training

**Confluent Kafka SAP connector**
- Connector reference
- No narrative walkthroughs

**Our positioning vs them:** we're the "how to use the connector" layer they lack. We cite their docs, they can cite ours. Natural partnership, not rivalry.

### Category 5: Vendors (Fivetran, Airbyte, Matillion, Theobald)

**Fivetran, Airbyte, Matillion**
- Have SAP connectors
- Sell the connector, not training
- Documentation focused on setup, not SAP understanding

**Theobald (Xtract Universal)**
- SAP extraction middleware
- Commercial product
- Documentation targets their product users, not general SAP extraction

**Our positioning:** vendor-neutral. We teach ODP, SLT, OData as concepts — with code using Python, ADF, and Fivetran — rather than pushing one product.

### Category 6: Blogs and YouTube

**SAP Community Blog (community.sap.com)**
- Variable quality
- Individual articles, not structured learning
- Good for deep dives on single topics, bad for learning paths

**SAP Press books**
- High-quality, expensive
- "SAP HANA 2.0 Administration" covers some extraction topics
- Not interactive, not free, not cloud-oriented

**YouTube SAP channels**
- Free but unstructured
- Mostly vendor or community content
- No clear path from beginner to shipping a pipeline

**Our positioning:** structured learning path, free tier, interactive checklist, SAP-cited. Occupies the gap between free scattered content and expensive SAP Press / Learning Hub.

---

## Matrix: Who Covers What

| Capability | SAP Training | openSAP | Udemy | SI Internal | Cloud Vendors | Vendors | Blogs/YT | **Academy (us)** |
|---|---|---|---|---|---|---|---|---|
| SAP concept explanation | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ |
| Specific tables (VBAK, ACDOCA, etc.) | ⚠️ | ⚠️ | ⚠️ | ✅ | ❌ | ❌ | ⚠️ | ✅ |
| Cloud target (Snowflake, ADLS, etc.) | ❌ | ❌ | ❌ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ |
| Specific extractor tooling (ADF, Python) | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| License awareness | ⚠️ | ❌ | ❌ | ⚠️ | ❌ | ❌ | ⚠️ | ✅ |
| Structured learning path | ✅ | ✅ | ✅ | ✅ | ❌ | ⚠️ | ❌ | ✅ |
| Free tier | ❌ | ✅ | ❌ | internal | ✅ | ❌ | ✅ | ✅ |
| Interactive (checklist, progress) | ❌ | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | ❌ | ✅ |
| Vendor-neutral | ❌ | ❌ | ⚠️ | ⚠️ | ❌ | ❌ | ⚠️ | ✅ |

No competitor scores ✅ on more than 5-6 categories. We target ✅ on all 9.

---

## Positioning Statement

> "The only free, structured, hands-on learning path that teaches data engineers how to extract specific SAP tables to specific cloud platforms. Cited from SAP's official documentation. Vendor-neutral across extractors and destinations."

Each word of that statement defends a flank:
- "Free" — undercuts SAP Training and Udemy
- "Structured" — undercuts blogs and YouTube
- "Hands-on" — undercuts openSAP and SAP Learning Hub
- "Data engineers" — defines the audience competitors ignore
- "Specific tables to specific cloud platforms" — where no one else plays
- "Cited from SAP documentation" — authority marker
- "Vendor-neutral" — trust signal for enterprises

---

## Threats to Watch

### Threat 1: SAP launches an official "SAP Data Engineers' Guide"

Possible but unlikely. SAP's instinct is to push SAP-native tooling (Datasphere). Their training arm moves slowly.

Mitigation: move fast, build audience and backlinks now. By the time SAP reacts, we have the URL authority.

### Threat 2: A cloud vendor builds the equivalent as marketing

Microsoft could publish "Extracting SAP to Fabric: The Complete Guide" free. So could Snowflake or Databricks.

Mitigation: partner before they compete. Offer co-branded content, white-label deals. Integrate into their ecosystems so we become their preferred training partner.

### Threat 3: An SI publicly open-sources their internal training

A TCS or Accenture could release an SAP extraction playbook for marketing purposes.

Mitigation: this is actually good for us — it validates the category. Our moat is the interactive product (Studio) plus SEO authority, not the content itself.

### Threat 4: AI coding tools (Copilot, Cursor, Claude Code) replace the need for training

"Just ask Claude to write the extraction code" will be a buyer objection.

Mitigation: the moat is the *license intelligence* and *conflict resolution* embedded in Studio. Generic AI doesn't know which SAP Runtime License blocks SLT. We do.

### Threat 5: DSAG or another user group partners with a competitor

Unlikely at current scale, but DSAG could officially endorse a Deloitte-backed training resource.

Mitigation: build DSAG relationships early (you're in Hesse — this is your local advantage). Speak at events. Contribute content.

---

## SEO Competitive Landscape

Key keywords and who currently ranks:

| Keyword | Top 3 Result Types | Our Strategy |
|---|---|---|
| "extract SAP to Snowflake" | Snowflake docs, Fivetran, Azure docs | Out-content all three with specific table walkthroughs |
| "CDS view extraction" | SAP Help, SAP Community, random blogs | Rank with beginner-friendly paraphrase + examples |
| "ACDOCA Snowflake" | LinkedIn posts, Fivetran blog, old SAP Community | Rank with the expert walkthrough plus article |
| "what is ODP SAP" | SAP Help, SAP Community, Quora | Rank with glossary page + article context |
| "SAP Runtime License SLT" | SAP Notes (login-gated), consultancy blogs | Rank with the cornerstone article |
| "extract VBAK" | Stack Overflow, outdated SCN posts | Rank with beginner walkthrough |

Most of these keywords have weak, fragmented coverage. A well-structured Academy with 50+ pages cited from SAP docs will outrank the current field within 6 months on most of them.

---

## Refresh Cadence

Re-run competitive analysis:
- **Every 90 days:** are there new entrants?
- **Every 6 months:** are competitor strategies shifting?
- **On announcement:** if a competitor makes a big move, evaluate within a week

Tools:
- Claude Code with prompt: "Run web searches for new SAP data extraction courses, tools, or content launched in the past 90 days. Summarize findings and flag any competitive threats."
- Ahrefs / SEMrush for keyword ranking monitoring
- Google Alerts for "SAP extraction," "SAP data engineering," our brand name

---

## Your Unfair Advantages

1. **SME depth** — you know SAP internals; most competitors don't
2. **Location (Hesse)** — DSAG access, SAP headquarters adjacency
3. **Studio product plan** — free Academy is the funnel for paid Studio; competitors without that model can't justify the content investment
4. **Dual-stage build** — static HTML first means you launch in weeks, not months
5. **Claude Code leverage** — multi-file project handling with SAP URL verification built in, multiplying your SME time

No single competitor has more than 2 of these. Press on them.
