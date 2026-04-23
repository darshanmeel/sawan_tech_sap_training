# SAP Extract Academy

A free, professional-grade learning platform for SAP data extraction. Master how to extract GL posting data, sales orders, and master data from SAP S/4HANA and ECC into any cloud warehouse.

**Live site:** [https://darshanmeel.github.io/sawan_tech_sap_training/](https://darshanmeel.github.io/sawan_tech_sap_training/)

---

## What This Website Does

SAP Extract Academy teaches **data engineers, architects, and analysts** how to:

1. **Extract SAP data to cloud** using ODP (batch), SLT (real-time), or RFC (custom)
2. **Handle massive tables** like ACDOCA (Universal Journal) — billions of rows, complex partitioning
3. **Avoid licensing traps** — $100k+ in retroactive audit costs if you choose the wrong method
4. **Stream real-time data** from SAP to Kafka, Snowflake, Databricks, or S3 directly
5. **Use professional patterns** tested at enterprise scale — not tutorials, production architectures

---

## How to Extract Your First Table

### Option 1: ACDOCA (GL Posting Data) via ODP

**For:** Batch extractions, historical GL data, scheduled loads  
**Why:** No special license required (Runtime license OK), scales to 500M+ rows per partition  
**Time:** 4–12 hours for 500M rows

**Path:**
1. Visit the [Core Extraction Guide](/articles/how-to-extract-any-sap-data/)
2. Follow the **ACDOCA via ODP** example
3. Use Databricks + S3 (or ADF, Fivetran, Python) as shown
4. Partition by company code (BUKRS) + fiscal year (GJAHR)

**Tools supported:**
- Azure Data Factory (ODP connector)
- Fivetran (preconfigured SAP source)
- Databricks (spark-sap connector)
- Python (pyrfc library)
- Airbyte (open-source ODP)

**Destination options:** S3, Azure Data Lake, Google Cloud Storage, Snowflake

### Option 2: VBAK (Sales Orders) via SLT

**For:** Real-time data, sub-5-minute latency, continuous streaming  
**Why:** Full-load + delta in one setup, automatic change capture  
**License:** ⚠️ Full Use license required (NOT Runtime)  
**Time:** 2–4 hours full load, <5 minutes delta lag

**Path:**
1. Visit the [Core Extraction Guide](/articles/how-to-extract-any-sap-data/)
2. Follow the **VBAK via SLT** example
3. Choose your destination:

   **Direct SAP-to-Cloud Streaming** (Full Use license only):
   - SAP writes directly to Kafka topic → no intermediate infrastructure needed
   - SAP writes directly to S3/ADLS → serverless, pay-per-use
   - SAP writes directly to Snowflake → one-step ingestion
   
   **Traditional Kafka Path** (more control):
   - SAP → Kafka topic → Databricks/Spark → S3 or Snowflake
   - Allows transformation and deduplication in flight
   - Easier to implement CDC (change data capture) patterns

**Key Note:** With SLT + Full Use license, SAP's Landscape Transformation can push real-time changes **directly to your cloud infrastructure** (Kafka, S3, ADLS, Snowflake) without additional tools or servers.

**Tools supported:**
- Kafka (recommended for CDC and complex logic)
- Snowflake connector (direct SLT ingestion)
- Azure Event Hubs → Databricks
- Google Pub/Sub → BigQuery
- S3 / ADLS (for eventual consistency use cases)

---

## Tables & Walkthroughs

| Table | Module | Beginner | Intermediate | Expert |
|-------|--------|----------|--------------|--------|
| **ACDOCA** | FI (Finance) | ODP single partition | ODP multi-partition | SLT real-time |
| **VBAK** | SD (Sales) | One-time extract | Scheduled batch | Real-time SLT |
| **BKPF** | FI (Finance) | Basic accounting docs | Parallel extraction | - |
| **MARA** | MM (Materials) | Material master basics | Change data capture | - |
| **LFA1** | MM (Materials) | Vendor data | - | - |

Each walkthrough includes:
- ✅ Step-by-step SAP configuration (SE80, SE16N, SU01, LTCO, SLICENSE)
- ✅ Data tool setup (Databricks, ADF, Snowflake, etc.)
- ✅ Reconciliation checks (row count validation)
- ✅ Troubleshooting guide (common failures and fixes)
- ✅ Performance expectations (4 hours for 500M rows ODP, <5 min lag for SLT)

---

## Key Learning Areas

### Extraction Methods

- **ODP** — Operational Data Provisioning
  - Standard SAP framework for batch extraction
  - Works with 6+ tools (ADF, Fivetran, Databricks, Python, Airbyte)
  - Runtime license OK
  - Scales: 100M–500M rows per partition

- **SLT** — SAP Landscape Transformation  
  - Real-time replication with full-load + continuous delta
  - Writes directly to Kafka, Snowflake, cloud storage
  - Requires Full Use license
  - Latency: <5 minutes

- **RFC** — Remote Function Call
  - Legacy, rarely used for new projects
  - Custom integration only
  - Not recommended

### Licensing & Compliance

- Runtime vs. Full Use — which methods each license permits
- Audit risk — what triggers SAP licensing audits
- How to validate your license before designing architecture
- Cost impact — licensing mistakes = $100k+ retroactive bills

### Performance & Scale

- Partitioning strategies for billion-row tables
- Parallel extraction with work process management
- Memory exhaustion prevention (TSLIB errors)
- Lock contention and finance user impact

### Real-World Context

- Finance user blocking (month-end close impact)
- Authorization and data security (CDS views vs. raw tables)
- Data quality validation (reconciliation patterns)
- Cloud cost optimization (partitioning, compression, incremental loads)

---

## Getting Started

### For First-Time Users

1. **Read the [Core Extraction Guide](/articles/how-to-extract-any-sap-data/)**
   - Understand which method fits your use case
   - See ACDOCA and VBAK examples end-to-end
   - Learn licensing constraints

2. **Pick your table** — ACDOCA (GL) or VBAK (Sales Orders)

3. **Pick your method** — ODP (batch) or SLT (real-time)

4. **Follow the walkthrough** — Beginner level to start

5. **Validate your license** — Check SLICENSE transaction before designing

### For Experienced Data Engineers

- Jump to [Intermediate walkthroughs](/walkthrough/) for parallel extraction patterns
- Read [Expert guides](/walkthrough/) for SLT streaming and CDC
- Use the [Table Directory](/directory/) for column definitions, DDL, and extraction methods

### For Architects

- Review licensing implications in [Runtime vs. Full Use article](/articles/sap-runtime-license-trap/)
- Check [Roadmap](/roadmap/) for upcoming advanced patterns
- Explore [Glossary](/glossary/) for 30+ SAP extraction terms

---

## Site Structure

```
Extract Academy/
├── Core Guide              → How to extract any SAP data (start here)
├── Walkthroughs            → Step-by-step guides (beginner → expert)
├── Articles                → Deep-dives on licensing, patterns, pitfalls
├── Table Directory         → Column reference, DDL, extraction methods
├── Glossary                → 30+ SAP extraction terms explained
└── About                   → Project background and credits
```

---

## Repository Structure

| Directory | Purpose |
|-----------|---------|
| [`sap-extract-academy/`](./sap-extract-academy/) | Live site: source code, content, build system |
| [`sap-extract-academy/content/`](./sap-extract-academy/content/en/) | Markdown content for articles, walkthroughs, tables |
| [`sap-extract-academy/templates/`](./sap-extract-academy/templates/) | HTML templates (Mustache) for pages |
| [`sap-extract-academy/docs/`](./sap-extract-academy/docs/) | Generated static HTML (build output) |
| [`sap-extract-academy/build/`](./sap-extract-academy/build/) | Build system: DDL generator, directory validator |

---

## Build & Deployment

```bash
cd sap-extract-academy
npm install
npm run build      # Generate static HTML from markdown
npm run test       # Run test suite (DDL snapshots, schema validation)
npm start          # Local dev server
```

Site auto-deploys to GitHub Pages on every push to `main`.

---

## What You'll Master

By the end, you'll understand:

✅ When to use ODP vs. SLT vs. RFC  
✅ How to extract 1B+ row tables without memory exhaustion  
✅ Licensing traps that cost $100k+ in audit bills  
✅ Real-time streaming from SAP to Kafka/Snowflake/S3  
✅ Reconciliation patterns to validate extraction completeness  
✅ Tool selection: ADF, Fivetran, Databricks, Python, SLT  
✅ Destination choice: S3, Snowflake, BigQuery, Redshift, ADLS  

---

## Questions?

- **[Start with the Core Guide](/articles/how-to-extract-any-sap-data/)** for overview
- **[Browse Walkthroughs](/walkthrough/)** for hands-on guidance
- **[Check Glossary](/glossary/)** for terminology
- **[Read Articles](/articles/)** for deep-dives and pitfalls

**Get notified when we publish new extraction patterns (every 2 weeks):** Subscribe on the homepage.

---

© SAP Extract Academy — Independent educational resource, not affiliated with SAP SE.
