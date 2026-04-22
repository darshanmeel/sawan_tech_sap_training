---
slug: /roadmap/
pageType: roadmap
title: "SAP Extract Academy Roadmap"
summary: "Planned walkthroughs, articles, and features for 2026-2027."
seoTitle: "SAP Extract Academy Roadmap — What's Coming"
seoDescription: "Roadmap for new walkthroughs, advanced patterns, and features planned for SAP Extract Academy in 2026 and 2027."
updatedAt: 2026-04-22
---

## Q2 2026 (April–June)

**Current focus: Foundation complete**

- [x] **5 core tables** with 3 levels each (15 walkthroughs)
  - VBAK (Sales), BKPF (GL), ACDOCA (Journal), MARA (Material), LFA1 (Vendor)
- [x] **32 glossary terms** covering extraction concepts
- [x] **3 cornerstone articles** on ACDOCA, licensing, and patterns

**Next (late May)**

- [ ] **MM module completion**: MARC (material plant), MARD (inventory), MSEG (transactions)
- [ ] **3 new articles**: "How to Tune LTRS Parallelism", "Z-Field Extraction at Scale", "Reconciliation Strategies for Billions of Rows"

## Q3 2026 (July–September)

**Module expansion**

- [ ] **HR module**: PAYR (payroll), PA0001 (employee master), COEP (CO actual posting)
- [ ] **SD module**: VBAP (sales items), LIKP (delivery header), LIPS (delivery items)
- [ ] **Logistics module**: EKPO (PO items), EKKO (PO header), MARA enhancements (production/costing)

**Advanced patterns**

- [ ] **Article: "Real-Time CDC with Kafka"** – Change data capture patterns, idempotency, exactly-once semantics
- [ ] **Article: "Handling SAP Extensions & Z-Fields"** – Discovery, extraction, data quality for custom fields
- [ ] **Walkthrough: "Multi-Table Joins at Scale"** – BKPF + BSEG, VBAK + VBAP + LIPS, ACDOCA with dimensions

## Q4 2026 (October–December)

**Cloud & integration**

- [ ] **OData extraction walkthrough** – REST API patterns, SAP Cloud Platform integration
- [ ] **SAP Analytics Cloud (SAC)** – Live connection patterns, embedded analytics
- [ ] **Azure Synapse integration** – ADF + SLT + Snowflake orchestration

**ECC legacy patterns**

- [ ] **"Extracting from ECC (Pre-S/4HANA)"** – BW extractors, legacy ODP, RFC table reads
- [ ] **"ECC to S/4HANA Migration Strategy"** – Extraction patterns during system migration
- [ ] **"Legacy ABAP Custom Extractors"** – Function modules, Z-reports, support discontinuation

## Q1 2027 (January–March)

**Real-world scenarios**

- [ ] **"Finance Consolidation Extraction"** – Multi-entity GL consolidation, elimination entries, ledger variants
- [ ] **"Supply Chain End-to-End"** – Procurement (EKPO) → Inventory (MARD) → Sales (VBAK) → Billing (VBRK) joins
- [ ] **"Cost Accounting Deep Dive"** – CO tables (COEP, COST), cost center allocations, product costing

**Monitoring & operations**

- [ ] **"Extraction Observability"** – Metrics, dashboards, alerting for ODP lag, SLT throughput, Kafka lag
- [ ] **"Troubleshooting Guide"** – Common errors, root cause analysis, escalation paths
- [ ] **"Disaster Recovery for Extraction"** – Partial replication failures, restart strategies, data consistency

## Planned Features

**Interactive tools**

- [ ] **Partition calculator** – Input table size, row count, partition keys. Output: recommended partition strategy, estimated extraction time
- [ ] **Licensing checker** – Input extraction method (ODP, SLT, Fivetran, custom). Output: license required (Runtime/Full Use)
- [ ] **Extraction template generator** – Choose table, extraction method, target warehouse. Generate code template (Python, ADF, SQL)

**Community**

- [ ] **GitHub discussions** – Ask questions on walkthroughs, share patterns, contribute
- [ ] **Extraction checklist** – Pre-extraction validation: licensing, partitioning, monitoring setup
- [ ] **Case studies** – Real (anonymized) extraction projects: challenges, solutions, lessons learned

**Documentation**

- [ ] **API reference** – RFC functions for extraction (RFC_ODP_READ, RFC_PING, metadata APIs)
- [ ] **FAQ** – "Why does ODP timeout?", "How do I retry failed partitions?", "What's the difference between delta modes?"
- [ ] **Troubleshooting flowchart** – Interactive guide: If X happens, check Y, then try Z

## Longer-term Vision (2027–2028)

**Advanced architectures**

- [ ] **Real-time CDP patterns** – Streaming GL to CDP (Segment, mParticle)
- [ ] **Lakehouse architecture** – Delta Lake, Apache Iceberg, Parquet optimization for SAP data
- [ ] **Data mesh for SAP** – Federated extraction, data contracts, self-serve extraction templates

**Emerging technologies**

- [ ] **Vector embeddings from SAP** – Extract master data, generate embeddings for search/recommendation
- [ ] **dbt + SAP extraction** – dbt models for transformation, testing, documentation on extracted GL data
- [ ] **Generative AI for extraction** – LLM-assisted partition strategy recommendation, error diagnosis

**Training & certification**

- [ ] **Live workshops** – Monthly deep-dives on expert patterns
- [ ] **Certification program** – "SAP Extract Architect" credential
- [ ] **Video walkthroughs** – Screen recordings of each pattern, with narration

## How to Stay Updated

- **Email list**: New walkthroughs every 2 weeks
- **GitHub**: Watch the repository for releases
- **Social**: Follow LinkedIn for articles and announcements

---

## Notes

This roadmap is subject to change based on community feedback and emerging SAP trends. Priorities may shift if:

- **Community requests** – Walkthroughs for new tables (LFBK, LFA1 extensions, EKBE)
- **SAP updates** – New features in S/4HANA that change extraction patterns
- **Licensing changes** – Updates to SLT or ODP licensing that affect recommendations
- **Emerging tools** – New extractors (Weld, Stitch, custom) that need patterns

Got a request? Open an issue on GitHub or email the team.

---

## FAQ: Why No Walkthrough for Table X?

We're prioritizing core tables (GL, sales, materials, vendors) that span most enterprise organizations. Specialized tables (consolidation specific, HR legacy) are on the roadmap for later quarters.

Can't wait? The patterns in existing walkthroughs (partitioning, parallelism, reconciliation) apply to any table. Adapt the ACDOCA or BKPF walkthrough to your table, and you have a starting point.

## FAQ: When Will Feature X Be Ready?

Walkthroughs: every 2 weeks (1-2 per cycle)
Articles: 1-2 per month
Tools: Q3 2026 (interactive calculators)
Certification: Q1 2027

These are target dates, not commitments. Enterprise data extraction is complex; quality takes time.

## FAQ: Can I Contribute?

Yes! Once we launch the GitHub discussions board (Q2 2026), you can:

- Share patterns from your extractions
- Propose new walkthroughs or articles
- Report corrections or clarifications
- Submit code examples

We're building this academy for the data community. Your contributions help everyone.

Thank you for being part of SAP Extract Academy.
