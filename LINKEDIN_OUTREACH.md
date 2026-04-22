# SAP Extract Academy — LinkedIn Outreach Strategy

This document outlines the LinkedIn promotion strategy for SAP Extract Academy, including post templates, timing, and engagement tactics.

## Target Audience

- **Data engineers** working with SAP
- **Data architects** planning SAP migrations
- **Analytics engineers** building data warehouses
- **SAP basis/ERP administrators**
- **Technical project managers** overseeing data work
- **LinkedIn groups**: SAP, Data Engineering, Analytics, Enterprise Data

## Core Message

"Master SAP data extraction. Professional patterns for ODP, SLT, Kafka, and Snowflake. Three levels (beginner → intermediate → expert) for every table. The curriculum enterprise data teams actually use."

## Posting Schedule

- **Frequency**: 2-3 posts per week
- **Best times**: Tuesday-Thursday, 8-10am or 4-6pm (user's timezone)
- **Content mix**: 
  - 40% Educational (how-tos, tips)
  - 30% Walkthroughs (new content launches)
  - 20% Industry insights (ACDOCA issues, licensing traps)
  - 10% Community engagement (comments, reposts)

## Post Templates

### Template 1: Educational Tip (High Engagement)

```
🔍 ACDOCA Extraction Mistake #1: Forgetting to Partition

Raw SELECT * from ACDOCA crashes SAP. Every. Single. Time.

Why?
- ACDOCA: 5-20 billion rows across all companies/years
- Memory limit per process: ~4-8GB
- Raw select tries to allocate memory for billions of rows
- System throws TSV_TNEW_PAGE_ALLOC_FAILED

The Fix:
- Always partition by BUKRS + GJAHR (company + fiscal year)
- Extract one partition at a time
- Use ODP delta for incremental changes
- Use SLT + LTRS parallelism for enterprise-scale

This is lesson #1 in SAP Extract Academy. 

→ Link to ACDOCA walkthroughs (beginner/intermediate/expert)

Comment: What extraction mistakes have you encountered?

#SAP #DataEngineering #Extraction #ACDOCA
```

### Template 2: Walkthrough Launch (Feature)

```
📚 NEW WALKTHROUGH: Extract ACDOCA at Enterprise Scale

We just published the expert walkthrough for ACDOCA—15 billion rows, real-time streaming to Kafka, SLT with LTRS parallelism.

What you'll learn:
✓ Partitioning strategy (BUKRS+GJAHR)
✓ Parallel reader configuration (4-8 readers)
✓ Real-time delta streams to Kafka
✓ Snowflake upserts with cardinality checks
✓ License requirements (Full Use, not Runtime)
✓ Monitoring ODQMON and SM50
✓ Troubleshooting memory exhaustion

Time: ~120-150 minutes
Difficulty: Expert
Prerequisites: Intermediate ACDOCA walkthrough

→ Start the walkthrough (link)

This is the flagship walkthrough. Mastering ACDOCA extraction means you can extract any SAP table at any scale.

#SAP #SLT #Kafka #DataWarehouse
```

### Template 3: Industry Insight / Problem Post

```
💥 The SAP Runtime License Trap

You choose a Runtime License (40% cheaper than Full Use). You design extraction with SLT. You deploy. Two weeks later, SAP audit: "You're using SLT under a Runtime License. That's a violation. Pay $500k-$2M for an upgrade."

Sound familiar?

It happens quarterly. Companies migrate to S/4HANA, choose Runtime to save costs, then discover SLT (the best extraction tool for large tables) isn't permitted.

The trap: There's no license check in LTRC. SLT executes. Replication completes. Weeks later, audit catches it.

How to avoid it:
1. Involve licensing in architecture planning (not after)
2. Get written approval from SAP licensing (email counts)
3. On Runtime? Use ODP-based extraction (slower, but licensed)
4. Budget for Full Use if you need enterprise-scale, real-time extraction

This costs organizations millions. Plan for it upfront.

We wrote a deep-dive on this. Link below.

→ Read: The SAP Runtime License Trap

#SAP #Licensing #DataArchitecture #CostSavings
```

### Template 4: Case Study / War Story

```
⚠️ The Day ACDOCA Broke Finance

A 10,000-person enterprise. Month-end GL close. A junior data engineer runs extraction without the RYEAR filter:

SELECT * FROM ACDOCA WHERE BUKRS = '1000'

System tries to fetch 10 years × 12 months × 1000 companies of GL data. Billions of rows. Within 5 minutes, memory exhausted.

The extraction locks ACDOCA. Finance staff trying to post GL documents get "table locked" errors. Accounting close stalls. Auditors ask: "Why was GL unavailable?"

Duration: 45 minutes (kill process, clear locks, restart).
Cost: Finance team stuck, audit findings, leadership incident review.
Root cause: Missing WHERE clause on one partition key.

This isn't hypothetical. It happens because:
- Partitioning isn't taught (considered "obvious")
- Tools don't enforce it
- Documentation assumes you know

We built SAP Extract Academy to change this. Every walkthrough hammers the partitioning rule.

→ Learn the right way (link)

#DataEngineering #SAP #Lessons
```

### Template 5: Glossary/Terminology

```
📖 SAP Extraction Glossary: SLT

What is SLT (SAP Landscape Transformation)?

SAP's licensed replication tool for moving large tables to external systems at scale. Real-time push (vs. ODP's request/response).

Key facts:
- Requires Full Use License (not Runtime)
- Handles billions of rows with parallelism (LTRS readers)
- Partitions by key fields (BUKRS+GJAHR for ACDOCA)
- Real-time delta after initial full-load
- Destination: Kafka, databases, data lakes
- Used by enterprises for GL (BKPF, ACDOCA) at scale

Cost of licensing: $500k-$2M/year (enterprise).

Alternative: ODP (no licensing cost, slower, batch/polling).

→ Full SLT explanation (glossary link)

We're building a comprehensive glossary of SAP extraction concepts. 32 terms so far.

#SAP #DataEngineering #Terminology
```

### Template 6: Comparison/Decision Post

```
🤔 ODP vs. SLT: Which Should You Choose?

Extracting ACDOCA? The choice depends on your constraints:

ODP:
- ✓ No licensing cost
- ✓ Simple, supported on Runtime License
- ✓ Fits in existing Python/ADF pipelines
- ✗ Slower at scale (billions of rows)
- ✗ Not real-time (batch/polling)
- ✗ Timeouts on huge partitions

SLT:
- ✓ Real-time (sub-5min lag)
- ✓ Parallelism (4-8 readers)
- ✓ Scales to 10B+ rows
- ✗ Requires Full Use License ($500k-$2M/year)
- ✗ Complex configuration
- ✗ Higher operational overhead

Choose ODP if:
→ You're on Runtime License
→ You can tolerate 2-4 hour extractions
→ You don't need real-time GL

Choose SLT if:
→ You can justify Full Use License cost
→ You need sub-minute GL close
→ You have 5B+ rows

This is a key decision in SAP data architecture. Get it wrong, and you either miss performance targets or blow your budget on licensing.

→ Read our detailed comparison (link)

#SAP #Architecture #Decisions
```

## Engagement Tactics

### 1. Ask questions in posts
- "What extraction mistakes have you encountered?"
- "Are you using SLT or ODP? Why?"
- "What's your biggest SAP data bottleneck?"

### 2. Engage with comments
- Reply to every comment in first 2 hours
- Ask follow-up questions
- Share relevant experiences
- Link to relevant Academy content

### 3. Hashtag strategy
```
Primary: #SAP #DataEngineering #Extraction
Secondary: #SLT #ODP #Kafka #Snowflake #ACDOCA #BKPF
Niche: #SAPreplica #DataArchitecture #ERP #BusinessIntelligence
```

### 4. Content series
- "Common SAP Extraction Mistakes" (weekly)
- "Extract [Table] Series" (ACDOCA, BKPF, VBAK, etc.)
- "Tools Deep Dive" (ODP, SLT, ADF, Fivetran, Python/pyrfc)

### 5. Partner with influencers
- Connect with SAP data engineers, architects
- Repost relevant content
- Comment thoughtfully on industry posts
- Build relationships (no cold sales)

## Success Metrics

Track on LinkedIn:
- **Engagement rate**: Comments + likes + shares / impressions (target: 5-10%)
- **Click-through rate**: Clicks on walkthrough links / post impressions (target: 2-5%)
- **Follower growth**: Monthly increase (target: 100-200/month)
- **Profile views**: Weekly increase from posts
- **Saves/shares**: Higher than comment rate

Tools:
- LinkedIn Analytics dashboard (for company page)
- Use short links (bit.ly) to track clicks
- Ask followers for feedback in comments

## Content Calendar (First 4 Weeks)

**Week 1:**
- Mon: ACDOCA Mistake #1 (Partitioning)
- Wed: ACDOCA Beginner Walkthrough Launch
- Fri: Industry Insight (Runtime License Trap)

**Week 2:**
- Mon: SLT vs. ODP Comparison
- Wed: ACDOCA Intermediate Walkthrough Launch
- Fri: Case Study (The Day ACDOCA Broke Finance)

**Week 3:**
- Mon: ACDOCA Mistake #2 (CUKY/CURR Pairing)
- Wed: ACDOCA Expert Walkthrough Launch
- Fri: Glossary Term (SLT)

**Week 4:**
- Mon: Tools Deep Dive (Python/pyrfc)
- Wed: BKPF Walkthrough Launch
- Fri: Industry Insight (Licensing Audit Horror Story)

## Do's and Don'ts

### Do's:
- Share lessons learned (mistakes included)
- Provide actionable advice (not fluff)
- Engage authentically with comments
- Ask honest questions
- Link to Academy content strategically
- Focus on helping (not selling)
- Build relationships with other data engineers

### Don'ts:
- Link spam (every post can't have a link)
- Oversell (Academy is a free resource)
- Engage only when you want clicks
- Ignore comments
- Post too frequently (quality > quantity)
- Use clickbait or misleading titles
- Sell products unrelated to extraction

## Long-Term Growth

**Months 1-3:** Build awareness
- Post 2-3x per week
- Focus on educational content
- Grow followers to 1,000+
- Get 20-30 clicks/week to Academy

**Months 4-6:** Increase engagement
- Post 3x per week (add mid-week tips)
- Partner with influencers
- Host live Q&A (LinkedIn Live or comment thread)
- Grow followers to 5,000+
- Get 100+ clicks/week to Academy

**Months 6-12:** Establish authority
- Regular column (e.g., "SAP Extraction Series")
- Guest posts on other profiles
- Speak in LinkedIn groups
- 10,000+ followers
- 500+ clicks/week to Academy

## Measurement

At 6 months:
- Followers: 5,000+
- Avg engagement rate: 5-8%
- Academy traffic from LinkedIn: 50-100 visits/week
- Community feedback: Dozens of comments, direct messages

This establishes Academy as the go-to resource for SAP extraction in the LinkedIn data community.

---

**Next steps**: Pick 3 post ideas, draft them, and post over the next week. Track engagement. Refine based on what resonates.
