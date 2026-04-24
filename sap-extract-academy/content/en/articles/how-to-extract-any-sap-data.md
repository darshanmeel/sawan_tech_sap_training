---
title: "How to Extract Any SAP Data — The Complete Guide"
slug: how-to-extract-any-sap-data
publishDate: 2026-04-23
readingTimeMinutes: 12
author: "SAP Extract Guide"
summary: "Master SAP data extraction with ACDOCA (GL) and VBAK (Sales Orders) examples. Learn which method to use, how to avoid licensing traps, and build your first extraction pipeline."
relatedWalkthroughs:
  - slug: acdoca
    level: beginner
  - slug: acdoca
    level: intermediate
  - slug: acdoca
    level: expert
  - slug: vbak
    level: beginner
  - slug: vbak
    level: intermediate
  - slug: vbak
    level: expert
seoTitle: "How to Extract Any SAP Data — Complete Guide with Examples"
seoDescription: "Master SAP data extraction: ACDOCA (GL) via ODP, VBAK (Sales) via SLT. Databricks + S3 examples. No licensing surprises. Step-by-step guide for data engineers."
updatedAt: 2026-04-23
---

## What This Guide Teaches

You're about to extract SAP data to your cloud warehouse. Here's what you need to know:

**What we cover:**
- How to extract SAP data to any target system (S3, Snowflake, Databricks, etc.)
- Three proven extraction methods: ODP (batch), SLT (real-time), RFC (legacy)
- Patterns from beginner (one-time extract) to enterprise (billions of rows, sub-minute latency)
- Tool-agnostic guidance that works with ADF, Python, Fivetran, and custom pipelines
- Licensing constraints and how to avoid $100k+ in retroactive costs

**What we don't cover:**
- Post-extraction data modeling or transformations (that's your responsibility)
- Custom connectors or non-standard extraction methods
- SAP Analytics Cloud or embedded analytics
- ECC-only tables (we focus on S/4HANA, with ECC addendums when critical)

The key insight: **80% of extraction decisions are made in the first hour.** Choose your method, understand licensing, then execute.

---

## How to Choose Your Extraction Method

Three methods exist. Here's when to use each:

| Method | Best For | Latency | License | Tools |
|---|---|---|---|---|
| **ODP** | Batch extractions, any volume with partitioning, scheduled loads | Hours | Runtime OK | Fivetran, ADF, Databricks, Python/pyrfc |
| **SLT** | Real-time delta, sub-5-minute latency, continuous streaming | Minutes | Full Use required | Kafka, Snowflake, Databricks, cloud storage (S3, ADLS) |
| **RFC** | Legacy systems, rare new projects | Minutes | Runtime OK | Custom code only |

**Decision framework:**
1. Do you need real-time (< 5 minutes)? → **Use SLT** (but verify Full Use license first)
2. Do you need batch updates? → **Use ODP** (simpler, no special license)
3. Do you need custom integration? → **Use RFC** (rarely recommended, complex)

---

## Example 1: ACDOCA Extraction via ODP (Batch GL Data)

**Scenario:** You're a financial analyst at a Fortune 500 company. You need to extract 2 years of GL postings (ACDOCA) to Databricks for reporting. You have 500M rows per fiscal year.

### Why ACDOCA?

ACDOCA is the Universal Journal in SAP S/4HANA. It contains:
- Every GL posting (debit/credit entry)
- Cost allocations and controlling entries
- Currency conversions
- Audit trail for finance

**The challenge:** ACDOCA is massive. On a large enterprise system, it's 5–20 billion rows. A raw, unfiltered extraction will:
- Exhaust SAP application server memory within minutes
- Lock GL posting for finance users (bad: blocks month-end close)
- Fail silently with a TSLIB short dump

**The solution:** Always partition ACDOCA. Always.

### The ODP Approach

**Why ODP?**
- Operational Data Provisioning is SAP's standard extraction framework
- Requires only Runtime license (no special licensing cost)
- Scales to 500M+ rows per partition with proper strategy
- Works with 6+ different tools (ADF, Fivetran, Databricks, Python, etc.)

**How ODP works:**
1. SAP exposes ACDOCA via a released CDS view: `I_JournalEntryItem`
2. You register an extraction subscription (via ODP)
3. Your tool connects and reads in batches
4. Delta queues capture changes for incremental loads

### Step-by-Step: Extract 2024 ACDOCA to Databricks + S3

<div class="article-walkthrough" id="acdoca-databricks-s3">

<div style="background:var(--color-bg-3);border:1px solid var(--color-rule);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-4);display:flex;gap:var(--space-5);flex-wrap:wrap;">
  <div><span style="font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:var(--color-ink-soft);">Method</span><br><strong>ODP</strong></div>
  <div><span style="font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:var(--color-ink-soft);">Tool</span><br><strong>Databricks</strong></div>
  <div><span style="font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:var(--color-ink-soft);">Sink</span><br><strong>S3</strong></div>
  <div style="margin-left:auto;"><a href="/sawan_tech_sap_training/walkthrough/acdoca/?method=odp&amp;tool=databricks&amp;sink=s3" style="font-size:13px;">Open full walkthrough →</a></div>
</div>

<nav class="wt-tab-bar" role="tablist" aria-label="Walkthrough sections" style="margin-bottom:0;">
  <button class="wt-tab" role="tab" aria-selected="true" data-aw-tab="sap" aria-controls="aw-panel-sap" type="button">SAP Side</button>
  <button class="wt-tab" role="tab" aria-selected="false" data-aw-tab="tool" aria-controls="aw-panel-tool" type="button">Tool</button>
  <button class="wt-tab" role="tab" aria-selected="false" data-aw-tab="sink" aria-controls="aw-panel-sink" type="button">Sink</button>
</nav>

<div id="aw-panel-sap" role="tabpanel" style="background:var(--color-bg-2);border:1px solid var(--color-rule);border-top:none;border-radius:0 0 var(--radius-md) var(--radius-md);padding:var(--space-5);">

<h4 style="margin-top:0;font-family:var(--font-display);font-size:22px;font-weight:600;">SAP <em style="color:var(--color-accent-2);font-style:italic;">side</em></h4>
<p style="color:var(--color-ink-soft);font-size:14px;">Steps to complete in your SAP system before extraction starts.</p>

<ol style="padding-left:0;list-style:none;display:flex;flex-direction:column;gap:var(--space-4);">

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 1</span>
<strong style="font-size:16px;">Verify CDS view in SE80</strong>
</div>
<p style="color:var(--color-ink-soft);font-size:14px;margin:0 0 var(--space-3);">Confirm the released CDS view <code>I_JournalEntryItem</code> is available and annotated for extraction.</p>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code>Transaction: SE80
Search:      I_JournalEntryItem
Check:       @Analytics.dataExtract: true</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> Annotation present. If missing, upgrade CDS views.</p>
</li>

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 2</span>
<strong style="font-size:16px;">Count rows in SE16N — reconciliation target</strong>
</div>
<p style="color:var(--color-ink-soft);font-size:14px;margin:0 0 var(--space-3);">Record the row count for your partition filter. This is your reconciliation target.</p>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code>Transaction: SE16N
Table:       ACDOCA
Filter:      BUKRS = '1000' AND GJAHR = 2024
Example:     ~45M rows</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> Count > 0 and &lt; 500M. If higher, sub-partition further.</p>
</li>

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 3</span>
<strong style="font-size:16px;">Create extraction user in SU01</strong>
</div>
<p style="color:var(--color-ink-soft);font-size:14px;margin:0 0 var(--space-3);">Create a dedicated system-type user for ODP access.</p>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code>Transaction: SU01
User:        EXTRACT_USER (system-type)
Roles:
  - S_RFC
  - S_ODP_READ (ODPSOURCE=ABAP_CDS)</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> PFCG shows S_ODP_READ assigned.</p>
</li>

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 4</span>
<strong style="font-size:16px;">Confirm ODP subscription in ODQMON</strong>
</div>
<p style="color:var(--color-ink-soft);font-size:14px;margin:0 0 var(--space-3);">After first extraction attempt, verify the ODP subscription is active.</p>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code>Transaction: ODQMON
Queue:       I_JournalEntryItem
Subscriber:  DATABRICKS_EXTRACT
Status:      Active</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> Subscription visible with non-zero row count.</p>
</li>

</ol>

</div>

<div id="aw-panel-tool" role="tabpanel" hidden style="background:var(--color-bg-2);border:1px solid var(--color-rule);border-top:none;border-radius:0 0 var(--radius-md) var(--radius-md);padding:var(--space-5);">

<h4 style="margin-top:0;font-family:var(--font-display);font-size:22px;font-weight:600;">Tool <em style="color:var(--color-accent-2);font-style:italic;">configuration</em></h4>
<p style="color:var(--color-ink-soft);font-size:14px;">Databricks Spark pipeline to read ACDOCA via the SAP ODP connector.</p>

<ol style="padding-left:0;list-style:none;display:flex;flex-direction:column;gap:var(--space-4);">

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 1</span>
<strong style="font-size:16px;">Create Databricks cluster with SAP connector</strong>
</div>
<p style="color:var(--color-ink-soft);font-size:14px;margin:0 0 var(--space-3);">Provision a cluster and install the SAP ODP client library.</p>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code>Runtime:    DBR 13.3 LTS (Python 3.10)
Node type:  i3.xlarge (4 workers recommended)
Library:    pip install sap-odp-client pyrfc</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> Cluster running; library shows "Installed" in Libraries tab.</p>
</li>

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 2</span>
<strong style="font-size:16px;">Store SAP credentials in Databricks secret scope</strong>
</div>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code>databricks secrets create-scope --scope sap-prod
databricks secrets put --scope sap-prod --key host
databricks secrets put --scope sap-prod --key user
databricks secrets put --scope sap-prod --key password</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> <code>dbutils.secrets.list("sap-prod")</code> returns all 3 keys.</p>
</li>

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 3</span>
<strong style="font-size:16px;">Extract 2024 ACDOCA via ODP subscription</strong>
</div>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code class="language-python">from sap_odp_client import ODP
odp = ODP(
    host=dbutils.secrets.get("sap-prod", "host"),
    client="100",
    user=dbutils.secrets.get("sap-prod", "user"),
    password=dbutils.secrets.get("sap-prod", "password"),
)
subscription = odp.subscribe(
    source="I_JournalEntryItem",
    filter={"RBUKRS": "1000", "RYEAR": 2024},
)
output = "s3://company-datalake/raw/acdoca/2024/"
rows = 0
for batch in subscription.fetch(batch_size=100_000):
    spark.createDataFrame(batch) \
        .write.mode("append").parquet(f"{output}part={rows}")
    rows += len(batch)
print(f"Extracted {rows} rows")</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> Row count matches SE16N target from SAP Side step 2.</p>
</li>

</ol>

</div>

<div id="aw-panel-sink" role="tabpanel" hidden style="background:var(--color-bg-2);border:1px solid var(--color-rule);border-top:none;border-radius:0 0 var(--radius-md) var(--radius-md);padding:var(--space-5);">

<h4 style="margin-top:0;font-family:var(--font-display);font-size:22px;font-weight:600;">Sink <em style="color:var(--color-accent-2);font-style:italic;">setup</em></h4>
<p style="color:var(--color-ink-soft);font-size:14px;">S3 landing zone configuration with Glue catalog registration.</p>

<ol style="padding-left:0;list-style:none;display:flex;flex-direction:column;gap:var(--space-4);">

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 1</span>
<strong style="font-size:16px;">Create S3 bucket with partition layout</strong>
</div>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code>aws s3 mb s3://company-datalake --region us-east-1
# Hive-style partitioning for Glue/Athena
s3://company-datalake/raw/acdoca/rbukrs=1000/ryear=2024/</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> <code>aws s3 ls s3://company-datalake/raw/acdoca/</code> returns the partition folders.</p>
</li>

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 2</span>
<strong style="font-size:16px;">Grant Databricks instance profile S3 access</strong>
</div>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code>{
  "Effect": "Allow",
  "Action": ["s3:PutObject", "s3:GetObject", "s3:ListBucket"],
  "Resource": [
    "arn:aws:s3:::company-datalake",
    "arn:aws:s3:::company-datalake/raw/acdoca/*"
  ]
}</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> <code>dbutils.fs.ls("s3://company-datalake/raw/")</code> succeeds from a Databricks notebook.</p>
</li>

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 3</span>
<strong style="font-size:16px;">Register Glue table &amp; reconcile row count</strong>
</div>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code class="language-python">spark.sql("""
CREATE TABLE IF NOT EXISTS sap_landing.raw.acdoca (
  RBUKRS STRING, RYEAR INT, BELNR STRING, DOCLN STRING,
  HSL DECIMAL(23,2), RACCT STRING, /* ... */
)
USING PARQUET
PARTITIONED BY (rbukrs, ryear)
LOCATION 's3://company-datalake/raw/acdoca/'
""")
spark.sql("MSCK REPAIR TABLE sap_landing.raw.acdoca")
count = spark.sql("""
  SELECT COUNT(*) FROM sap_landing.raw.acdoca
  WHERE rbukrs='1000' AND ryear=2024
""").collect()[0][0]
print(f"S3 rows: {count}  (must match SE16N)")</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> <code>count</code> matches SE16N reconciliation target within 0.1%.</p>
</li>

</ol>

</div>

</div>

<script>
(function(){
  var root=document.getElementById('acdoca-databricks-s3');
  if(!root)return;
  var tabs=root.querySelectorAll('.wt-tab[data-aw-tab]');
  tabs.forEach(function(tab){
    tab.addEventListener('click',function(){
      var target=tab.getAttribute('data-aw-tab');
      tabs.forEach(function(t){t.setAttribute('aria-selected',t===tab?'true':'false');});
      root.querySelectorAll('[id^="aw-panel-"]').forEach(function(p){
        if(p.id==='aw-panel-'+target){p.removeAttribute('hidden');}else{p.setAttribute('hidden','');}
      });
    });
  });
})();
</script>

#### Performance

- **100M rows:** ~4 hours (7M rows/min with 8 parallel partitions)
- **500M rows:** ~12 hours (scales linearly with partition strategy)

### Alternative Tools

Don't have Databricks? No problem. Same logic, different tools:

- **Azure Data Factory:** Use ODP connector + Azure Data Lake Storage
- **Fivetran:** Preconfigured SAP ODP source, maps to Snowflake/Redshift/BigQuery
- **Python (on-prem):** Use pyrfc library, write CSVs to S3

### What Comes Next

Now that you've extracted ACDOCA:
1. **Deep dive:** See the full [ACDOCA walkthrough](/walkthrough/beginner/acdoca/) for single-partition loads
2. **Scale up:** Read [ACDOCA intermediate](/walkthrough/intermediate/acdoca/) for multi-partition parallel extraction
3. **Go real-time:** Check [ACDOCA expert](/walkthrough/expert/acdoca/) for SLT real-time streaming
4. **Avoid mistakes:** Read [Runtime vs. Full Use licensing](/articles/sap-runtime-license-trap/)

---

## Example 2: VBAK Extraction via SLT (Real-Time Sales Orders)

**Scenario:** You're a supply chain analyst. Sales orders (VBAK) change constantly. You need real-time visibility into order-to-cash metrics in your analytics platform. Updates must land within 5 minutes.

### Why VBAK?

VBAK is the Sales Order header table in SAP. It contains:
- Every sales order (customer, sales org, document date)
- Order value and status (open, partially delivered, closed)
- Shipping/payment terms

Sales orders drive revenue analytics, order aging reports, and customer dashboards. For real-time insights, VBAK must be streamed continuously.

**The challenge:** Batch extractions (once/day) are too slow. You need delta queues that capture every order change within minutes.

**The solution:** SLT (SAP Landscape Transformation) with real-time replication.

### The SLT Approach

**Why SLT?**
- Real-time delta replication with sub-5-minute latency
- Automatic full-load + continuous delta (no manual scripting)
- Streams to Kafka, Snowflake, S3, or cloud storage
- Requires Full Use license (this is the hard constraint)

**How SLT works:**
1. You define a replication object in SAP (LTCO transaction)
2. SLT performs a full-load of VBAK
3. SLT monitors the database log for changes
4. Every change (insert/update/delete) flows to your target in real-time
5. Your tool (Kafka, Snowflake) captures the stream

### Step-by-Step: Stream VBAK to Databricks + S3 with Sub-5-Minute Lag

The walkthrough below uses the **Kafka → Databricks → S3** path. Before you
commit, skim the sink alternatives — same SLT source, different downstream:

- **Direct to Kafka** (this walkthrough) — flexible CDC, deduplication, multi-consumer.
- **Direct to S3 / ADLS** — serverless, cost-optimised, eventual consistency.
- **Direct to Snowflake** — one-step ingestion via the Snowflake Kafka connector.
- **Direct to Event Hubs / Pub/Sub** — cloud-native managed streaming.

Guidance: complex CDC → Kafka. Cost-sensitive → direct to S3. Already running
Kafka for other pipelines → stay in Kafka.

<div class="article-walkthrough" id="vbak-databricks-s3">

<div style="background:var(--color-bg-3);border:1px solid var(--color-rule);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-4);display:flex;gap:var(--space-5);flex-wrap:wrap;">
  <div><span style="font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:var(--color-ink-soft);">Method</span><br><strong>SLT</strong></div>
  <div><span style="font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:var(--color-ink-soft);">Tool</span><br><strong>Databricks</strong></div>
  <div><span style="font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:var(--color-ink-soft);">Sink</span><br><strong>Kafka + S3</strong></div>
  <div style="margin-left:auto;"><a href="/sawan_tech_sap_training/methods/slt/" style="font-size:13px;">Open SLT method page →</a></div>
</div>

<nav class="wt-tab-bar" role="tablist" aria-label="Walkthrough sections" style="margin-bottom:0;">
  <button class="wt-tab" role="tab" aria-selected="true" data-aw-tab="sap" aria-controls="aw-panel-sap-vbak" type="button">SAP Side</button>
  <button class="wt-tab" role="tab" aria-selected="false" data-aw-tab="tool" aria-controls="aw-panel-tool-vbak" type="button">Tool</button>
  <button class="wt-tab" role="tab" aria-selected="false" data-aw-tab="sink" aria-controls="aw-panel-sink-vbak" type="button">Sink</button>
</nav>

<div id="aw-panel-sap-vbak" role="tabpanel" style="background:var(--color-bg-2);border:1px solid var(--color-rule);border-top:none;border-radius:0 0 var(--radius-md) var(--radius-md);padding:var(--space-5);">

<h4 style="margin-top:0;font-family:var(--font-display);font-size:22px;font-weight:600;">SAP <em style="color:var(--color-accent-2);font-style:italic;">side</em></h4>
<p style="color:var(--color-ink-soft);font-size:14px;">Steps to complete in SAP before replication starts. Step 1 is a hard blocker — don't skip it.</p>

<ol style="padding-left:0;list-style:none;display:flex;flex-direction:column;gap:var(--space-4);">

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 1</span>
<strong style="font-size:16px;">Pre-flight: confirm Full Use license in SLICENSE</strong>
</div>
<p style="color:var(--color-ink-soft);font-size:14px;margin:0 0 var(--space-3);">SLT reads below the SAP application layer. Runtime licenses typically don't cover this. If your system is Runtime-only, stop and use ODP instead.</p>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code>Transaction: SLICENSE
Check:       License type == "Full Use"
If Runtime:  STOP. Switch to ODP (see Example 1).
If Full Use: Request written confirmation from SAP licensing.</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> Written license confirmation on file before any config work.</p>
</li>

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 2</span>
<strong style="font-size:16px;">Record baseline row count in SE16N — reconciliation target</strong>
</div>
<p style="color:var(--color-ink-soft);font-size:14px;margin:0 0 var(--space-3);">Capture VBAK count for the sales orgs you're replicating. Init-load reconciliation compares against this number.</p>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code>Transaction: SE16N
Table:       VBAK
Filter:      VKORG IN ('1000','2000')
Example:     ~50M rows</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> Count recorded. You'll reconcile against this after init-load.</p>
</li>

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 3</span>
<strong style="font-size:16px;">Configure replication in LTRC / LTRS</strong>
</div>
<p style="color:var(--color-ink-soft);font-size:14px;margin:0 0 var(--space-3);">Create the replication configuration and add VBAK. Partition by sales org × distribution channel so parallel readers don't overlap.</p>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code>Transaction: LTRC
Create:      Configuration SAP2KAFKA (source = source system, target = RFC dest to Kafka)
Parallel:    4–8 readers (coordinate with Basis — keep SM50 dialog usage under 80%)
Transaction: LTRS
Table:       VBAK (add under "Table Settings")
Partitioning: VKORG + VTWEG
Rule set:    Default (no transformation yet)</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> VBAK appears in LTRC table list with status "In Progress → Delta".</p>
</li>

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 4</span>
<strong style="font-size:16px;">Confirm delta queue active in ODQMON</strong>
</div>
<p style="color:var(--color-ink-soft);font-size:14px;margin:0 0 var(--space-3);">After init-load completes, the replication should enter continuous delta mode. Lag is measured here.</p>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code>Transaction: ODQMON
Queue:       VBAK (under SLT subscriber)
Status:      DELTA (not INIT, not ERROR)
Lag:         &lt; 5 minutes between DB change and queue entry</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> DELTA status + sub-5-minute lag observed for at least 30 min.</p>
</li>

</ol>

</div>

<div id="aw-panel-tool-vbak" role="tabpanel" hidden style="background:var(--color-bg-2);border:1px solid var(--color-rule);border-top:none;border-radius:0 0 var(--radius-md) var(--radius-md);padding:var(--space-5);">

<h4 style="margin-top:0;font-family:var(--font-display);font-size:22px;font-weight:600;">Tool <em style="color:var(--color-accent-2);font-style:italic;">configuration</em></h4>
<p style="color:var(--color-ink-soft);font-size:14px;">Databricks Structured Streaming reads the SLT Kafka topic and lands Bronze + Silver to S3.</p>

<ol style="padding-left:0;list-style:none;display:flex;flex-direction:column;gap:var(--space-4);">

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 1</span>
<strong style="font-size:16px;">Create a streaming-capable Databricks cluster</strong>
</div>
<p style="color:var(--color-ink-soft);font-size:14px;margin:0 0 var(--space-3);">Streaming needs a long-running cluster (not a job cluster). Use a DBR version that bundles the Kafka source.</p>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code>Runtime:    DBR 14.3 LTS (Scala 2.12, Spark 3.5)
Mode:       Single-user (or shared, depending on governance)
Node type:  i3.xlarge (2–4 workers; scale with Kafka partitions)
Libraries:  bundled — spark-sql-kafka-0-10, org.apache.kafka:kafka-clients</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> <code>spark.read.format("kafka")</code> returns without ClassNotFoundException.</p>
</li>

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 2</span>
<strong style="font-size:16px;">Store Kafka + S3 credentials in a secret scope</strong>
</div>
<p style="color:var(--color-ink-soft);font-size:14px;margin:0 0 var(--space-3);">Never hard-code broker URLs or SASL secrets in notebooks.</p>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code>databricks secrets create-scope --scope sap-prod
databricks secrets put --scope sap-prod --key kafka-bootstrap
databricks secrets put --scope sap-prod --key kafka-sasl-user
databricks secrets put --scope sap-prod --key kafka-sasl-pass</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> <code>dbutils.secrets.list("sap-prod")</code> returns all 3 keys.</p>
</li>

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 3</span>
<strong style="font-size:16px;">Structured Streaming: Bronze (raw CDC) → Silver (latest per key)</strong>
</div>
<p style="color:var(--color-ink-soft);font-size:14px;margin:0 0 var(--space-3);">One streaming query writes the raw CDC events; a second projects the current state per sales order (latest by timestamp).</p>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code class="language-python">from pyspark.sql.functions import from_json, col
from pyspark.sql.types import StructType, StructField, StringType, LongType
schema = StructType([
    StructField("op", StringType()),
    StructField("table", StringType()),
    StructField("key", StringType()),
    StructField("data", StringType()),
    StructField("timestamp", LongType()),
])
kafka_df = (spark.readStream.format("kafka")
    .option("kafka.bootstrap.servers", dbutils.secrets.get("sap-prod", "kafka-bootstrap"))
    .option("subscribe", "sap-vbak-cdc")
    .option("startingOffsets", "earliest")
    .load())
parsed = (kafka_df
    .select(from_json(col("value").cast("string"), schema).alias("v"))
    .select("v.*"))
# Bronze — raw CDC, partitioned by ingest date
(parsed.writeStream.format("parquet")
    .option("path", "s3://company-datalake/bronze/vbak-cdc/")
    .option("checkpointLocation", "s3://company-datalake/checkpoints/bronze-vbak/")
    .partitionBy("timestamp")
    .start())
# Silver — latest state per VBELN. Append-only; downstream reads with ROW_NUMBER.
(parsed.writeStream.format("parquet")
    .option("path", "s3://company-datalake/silver/vbak-current/")
    .option("checkpointLocation", "s3://company-datalake/checkpoints/silver-vbak/")
    .outputMode("append")
    .start())
spark.streams.awaitAnyTermination()</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> Streaming UI shows both queries active; Bronze row count grows monotonically.</p>
</li>

</ol>

</div>

<div id="aw-panel-sink-vbak" role="tabpanel" hidden style="background:var(--color-bg-2);border:1px solid var(--color-rule);border-top:none;border-radius:0 0 var(--radius-md) var(--radius-md);padding:var(--space-5);">

<h4 style="margin-top:0;font-family:var(--font-display);font-size:22px;font-weight:600;">Sink <em style="color:var(--color-accent-2);font-style:italic;">setup</em></h4>
<p style="color:var(--color-ink-soft);font-size:14px;">Kafka topic that SLT writes into, S3 layout that Databricks writes into, and the reconciliation that closes the loop.</p>

<ol style="padding-left:0;list-style:none;display:flex;flex-direction:column;gap:var(--space-4);">

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 1</span>
<strong style="font-size:16px;">Create the Kafka topic SLT writes into</strong>
</div>
<p style="color:var(--color-ink-soft);font-size:14px;margin:0 0 var(--space-3);">One partition per SLT reader. 7-day retention covers late subscribers and replay windows.</p>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code>kafka-topics.sh --create \
  --topic sap-vbak-cdc \
  --partitions 8 \
  --replication-factor 3 \
  --config retention.ms=604800000 \
  --bootstrap-server $KAFKA_BOOTSTRAP
# Then in SAP: SM59 → create RFC destination pointing at the Kafka producer
# endpoint, and set it as the SLT RFC destination in LTRC.</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> <code>kafka-console-consumer --topic sap-vbak-cdc</code> sees JSON CDC events within minutes of activating the SLT config.</p>
</li>

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 2</span>
<strong style="font-size:16px;">Lay out S3 prefixes and grant Databricks access</strong>
</div>
<p style="color:var(--color-ink-soft);font-size:14px;margin:0 0 var(--space-3);">Separate Bronze/Silver/Gold and keep checkpoints outside the data prefixes — they are sacred to Structured Streaming and must never be deleted during operations.</p>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code>s3://company-datalake/
├── bronze/vbak-cdc/        # raw CDC events
├── silver/vbak-current/    # latest state per VBELN
├── gold/vbak-business/     # modelled (joins with KNA1 etc.)
└── checkpoints/            # Structured Streaming state — DO NOT DELETE
# IAM policy attached to the Databricks instance profile:
{
  "Effect": "Allow",
  "Action": ["s3:PutObject", "s3:GetObject", "s3:ListBucket", "s3:DeleteObject"],
  "Resource": [
    "arn:aws:s3:::company-datalake",
    "arn:aws:s3:::company-datalake/*"
  ]
}</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> <code>dbutils.fs.ls("s3://company-datalake/")</code> from a notebook lists all four prefixes.</p>
</li>

<li style="background:var(--color-bg-3);border-radius:var(--radius-md);padding:var(--space-5);border:1px solid var(--color-rule);">
<div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-accent-2);font-weight:600;">Step 3</span>
<strong style="font-size:16px;">Reconcile: SE16N target vs. Silver row count + lag check</strong>
</div>
<p style="color:var(--color-ink-soft);font-size:14px;margin:0 0 var(--space-3);">Init-load reconciliation closes the loop. After init, spot-check delta lag during the steady state.</p>
<pre style="margin:0 0 var(--space-3);font-size:12px;"><code class="language-python">from pyspark.sql.functions import col, max as _max, current_timestamp, unix_timestamp
silver = spark.read.parquet("s3://company-datalake/silver/vbak-current/")
# distinct VBELN count should match SE16N ± 0.1%
distinct_orders = silver.select("key").distinct().count()
print(f"Silver distinct VBELN: {distinct_orders:,}  (SE16N target ~50,000,000)")
# Delta lag: time between latest CDC event and now
latest_ts = silver.agg(_max("timestamp").alias("t")).collect()[0]["t"]
lag_seconds = spark.sql(f"SELECT unix_timestamp(current_timestamp()) - {latest_ts}").collect()[0][0]
print(f"Delta lag: {lag_seconds}s  (must be &lt; 300s)")</code></pre>
<p style="font-size:13px;color:var(--color-accent);margin:0;background:var(--color-accent-soft);padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);"><strong>Verify:</strong> Silver distinct-VBELN count matches SE16N within 0.1%, and lag stays under 300 s across a 30-minute window.</p>
</li>

</ol>

</div>

</div>

<script>
(function(){
  var root=document.getElementById('vbak-databricks-s3');
  if(!root)return;
  var tabs=root.querySelectorAll('.wt-tab[data-aw-tab]');
  tabs.forEach(function(tab){
    tab.addEventListener('click',function(){
      var target=tab.getAttribute('data-aw-tab');
      tabs.forEach(function(t){t.setAttribute('aria-selected',t===tab?'true':'false');});
      root.querySelectorAll('[id^="aw-panel-"][id$="-vbak"]').forEach(function(p){
        if(p.id==='aw-panel-'+target+'-vbak'){p.removeAttribute('hidden');}else{p.setAttribute('hidden','');}
      });
    });
  });
})();
</script>

#### Performance

- **Full load:** 2–4 hours for ~50M orders across 4–8 SLT partitions.
- **Delta lag:** under 5 minutes end-to-end (SLT → Kafka ~1 min, Kafka → Databricks ~1–2 min).

### Alternative Tools

Don't want Kafka + Databricks? Other paths:

- **Snowflake:** SLT → Snowflake Kafka connector directly (no Kafka needed)
- **Azure ADLS:** SLT → Event Hubs → Azure Synapse Analytics
- **Google Cloud:** SLT → Pub/Sub → BigQuery
- **Custom Kafka consumers:** Write Go/Python/Rust apps to consume Kafka and push to your warehouse

### What Comes Next

Now that you're streaming VBAK:
1. **Deep dive:** See the full [VBAK walkthrough](/walkthrough/beginner/vbak/) for one-time loads
2. **Real-time:** Check [VBAK expert](/walkthrough/expert/vbak/) for SLT streaming details
3. **Avoid licensing trap:** Read [Full Use vs. Runtime licensing](/articles/sap-runtime-license-trap/)
4. **Monitor health:** Read [reconciliation and data quality for streaming](/articles/streaming-reconciliation/)

---

## Licensing & Common Pitfalls: How to Avoid $100k+ Mistakes

### Licensing Trap #1: Designing Before Confirming License

**What happens:**
- You design an extraction architecture using SLT (real-time replication)
- 3 months after go-live, audit discovers your license is Runtime, not Full Use
- SAP licensing team demands retroactive licensing costs: $50k–$200k
- You must redesign the entire architecture or pay

**How to avoid:**
1. **Before day 1 of design:** Check SLICENSE transaction in your SAP system
2. **Get it in writing:** Request written confirmation from SAP licensing team
3. **If Runtime license:** Use ODP instead of SLT (no special license required)
4. **If Full Use:** Document it for audit trail

### Licensing Trap #2: ACDOCA Without Partitioning

**What happens:**
- You extract ACDOCA without filtering by BUKRS + GJAHR
- SAP application server tries to load 5 billion rows into memory
- Application server crashes with TSLIB short dump
- Finance users can't post GL entries for 2 hours
- Your CIO gets a call

**How to avoid:**
1. **Always filter ACDOCA** by at least BUKRS (company code) and GJAHR (fiscal year)
2. **Count before extracting** in SE16N
3. **Reconcile after extracting:** SE16N count must match your target count

### Licensing Trap #3: Raw ACDOCA Extract (Authorization Issues)

**What happens:**
- You extract raw ACDOCA table (not via CDS view)
- Authorization restrictions aren't enforced
- You extract GL entries for restricted profit centers
- Audit finds sensitive financial data in your cloud warehouse
- Compliance incident

**How to avoid:**
1. **Always use released CDS views** (e.g., `I_JournalEntryItem` for ACDOCA)
2. CDS views enforce SAP authorization
3. CDS views apply currency conversion automatically
4. CDS views are SAP's standard for analytics extraction

### Licensing Trap #4: No Reconciliation

**What happens:**
- You extract 500M rows of ACDOCA
- An hour later, you discover you only got 499M rows
- Silent data quality issue—no error was thrown
- Finance reports are wrong, and you don't know for how long

**How to avoid:**
1. **After every extract:** Count rows in your target
2. **Compare to SAP:** Run SE16N count query with same filters
3. **If mismatch > 0.1%:** Investigate before declaring success
4. **Automate it:** Build a reconciliation check into every pipeline

---

## Summary: Three Methods, Three Decisions

| Scenario | Method | Example | License | Tools |
|---|---|---|---|---|
| Extract GL data (ACDOCA), batch, scheduled | ODP | 500M rows/year → S3 monthly | Runtime OK | Databricks, ADF, Fivetran |
| Stream sales orders (VBAK) in real-time | SLT | Every order change → Kafka → analytics | Full Use required | Kafka, Snowflake, Databricks |
| Legacy system, custom integration | RFC | Rare, not recommended | Runtime OK | Custom code only |

**Your next step:**
1. **Pick your table:** ACDOCA (GL), VBAK (Sales), or another
2. **Pick your method:** ODP (batch) or SLT (real-time)
3. **Pick your destination:** S3, Snowflake, Databricks, or cloud storage
4. **Validate licensing:** Check SLICENSE before you design
5. **Start with a walkthrough:** Use the full [beginner walkthrough](/walkthrough/) for step-by-step guidance

---

## Get Notified of New Walkthroughs

We publish new extraction patterns every 2 weeks. Stay updated with intermediate and expert patterns for ACDOCA, BKPF, MARA, and more.

**[Sign up for notifications →]() **

---
