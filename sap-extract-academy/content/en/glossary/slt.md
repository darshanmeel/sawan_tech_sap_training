---
term: SLT
fullName: SAP Landscape Transformation
slug: slt
shortDefinition: "SLT is SAP's licensed tool for high-performance data replication from SAP to external systems (Kafka, databases, data lakes). Enables billions-of-rows extractions with real-time delta, partitioning, and parallel reads."
relatedTerms: [LTRC, LTRS, Real-time Replication, Kafka, Full Use License, ODP]
sapDocUrl: "https://help.sap.com/"
seoTitle: "SLT: SAP Landscape Transformation Replication — Plain Explanation"
seoDescription: "SLT is SAP's licensed tool for high-performance replication to Kafka, databases, data lakes. Handles billions of rows with real-time delta."
updatedAt: 2026-04-22
---

SAP Landscape Transformation (SLT) is SAP's enterprise-grade replication tool for moving large tables to external systems at scale. Unlike ODP (which is request/response), SLT is push-based: SAP actively pushes data changes to Kafka, a database, or data lake in real time. SLT is the standard for enterprise GL extraction: ACDOCA and BKPF at scale use SLT, not ODP.

SLT is **licensed separately** and requires a **Full Use License** (not Runtime License). This is non-negotiable and rigorously audited by SAP. SLT excels at: **(1) partitioning** (split ACDOCA by BUKRS+GJAHR to avoid hot partitions), **(2) parallelism** (LTRS spawns 4-8 readers per partition), **(3) real-time delta** (changes flow to Kafka within seconds), and **(4) scale** (billions of rows in 24-72 hours vs weeks with ODP). The trade-off: cost (licensing) and complexity (configuration, monitoring).

In the academy, you graduate to SLT at the expert level. Beginner uses ODP/Python; intermediate uses ODP delta; expert uses SLT. This progression reflects real-world practice: small tables use ODP for simplicity; ACDOCA/BKPF at scale use SLT for performance and real-time capabilities.
