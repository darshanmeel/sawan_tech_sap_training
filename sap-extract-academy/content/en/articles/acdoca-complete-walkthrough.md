---
title: "ACDOCA Extraction: Three Patterns from Beginner to Enterprise"
slug: acdoca-complete-walkthrough
publishDate: 2026-04-22
readingTimeMinutes: 8
author: "SAP Extract Guide"
summary: "A guide to extracting ACDOCA (the Universal Journal) at three levels of scale and complexity. The decision points are SAP-side: how big is your partition, do you need real-time delta, and does your license cover your chosen method."
relatedWalkthroughs:
  - slug: acdoca
    level: beginner
  - slug: acdoca
    level: intermediate
  - slug: acdoca
    level: expert
seoTitle: "ACDOCA Extraction: Three Patterns Beginner to Enterprise"
seoDescription: "Choosing an ACDOCA extraction pattern. Three approaches: ODP single-partition, ODP multi-partition, and SLT real-time. Decision driven by volume, latency, and license."
updatedAt: 2026-04-22
---

ACDOCA — the Universal Journal — is the single most challenging table in SAP S/4HANA for data extraction. Every GL posting, every controlling entry, every cost allocation lives here. For a large enterprise, ACDOCA contains billions of rows. For a data engineer, it is the test that separates careful practice from expensive incidents.

This article describes three extraction patterns at increasing scale. The decision between them is mostly an SAP-side decision: how large is your partition, do you need real-time delta, and does your license cover your chosen approach.

**License trap:** Before reading further, confirm your SAP license type. SLT replication (Pattern 3) requires a Full Use license. ODP-based extraction (Patterns 1 and 2) is permitted under Runtime licenses when using the OData API. See [Runtime vs Full Use →](/articles/runtime-vs-full-use/) for the full explanation.

## The Core Rule: Always Partition

Regardless of which pattern you choose, you must partition ACDOCA by company code (RBUKRS) and fiscal year (RYEAR) before running any extraction. A raw, unfiltered read of ACDOCA exhausts SAP application server work process memory within minutes on any production system — resulting in a `TSV_TNEW_PAGE_ALLOC_FAILED` short dump and, in worse cases, locking ACDOCA rows and preventing finance users from posting during the window.

Use [SE16N](https://help.sap.com/) to count rows for your intended partition before running any extraction. Write down the count. This is your reconciliation target.

## Always Use the Released CDS View

Never extract raw ACDOCA. SAP ships [I_JournalEntryItem](https://help.sap.com/) as the released CDS view for the Universal Journal. This view:

- Enforces authorization (you see only GL entries your user role is permitted to see)
- Applies currency conversion (currency fields are pre-converted to your local/group currency)
- Exposes the data through [ODP](/glossary/odp/) — SAP's standard extraction framework
- Includes database hints that prevent the memory exhaustion a raw SELECT * causes

Confirm it is present and annotated in [SE80](https://help.sap.com/) before proceeding: look for `@Analytics.dataExtract: true` in the view header.

## Pattern 1: ODP Single Partition (Beginner)

**When to use:** One company code, one fiscal year. SE16N shows under 100M rows for your partition. You need a one-time historical load or an initial extract for a single reporting entity.

**What you do in SAP:**
1. Confirm I_JournalEntryItem exists with the extraction annotation in SE80.
2. Count rows for your partition in SE16N (RBUKRS='1000' AND RYEAR=2024).
3. Create a System-type extraction user in [SU01](https://help.sap.com/) with S_RFC and S_ODP_READ (ODPSOURCE=ABAP_CDS) authorization.
4. After the extraction runs, check [ODQMON](https://help.sap.com/) to confirm the subscription is registered and active.
5. After the extraction completes, reconcile: SE16N count must match your target row count.

**What your tool does:** Your extraction tool (ADF, Databricks, Fivetran, Airbyte, or custom) connects via ODP OData, registers a subscription, and fetches rows in batches. The SAP-side configuration above is what you control; the tool pipeline configuration is in your vendor's documentation.

**Constraints:** Below 100M rows this pattern is fast. Above 100M rows, ODP single-partition extraction may time out or exhaust memory on the SAP side. Move to Pattern 2.

## Pattern 2: ODP Multi-Partition (Intermediate)

**When to use:** Multiple company codes, multiple fiscal years. SE16N shows 100M–500M rows per partition. You need 2–5 years of data across several entities.

**What you do in SAP:**
1. Use SE16N to count rows for each (RBUKRS, RYEAR) combination you plan to extract. Record each count separately.
2. For each partition, verify that the count is under 500M rows. If any single partition exceeds this, sub-partition further by posting period (POPER).
3. Monitor [SM50](https://help.sap.com/) during extraction. Multiple simultaneous ODP connections each consume a work process. Keep total utilization below 80% to avoid impacting finance users.
4. Monitor ODQMON for multiple active subscriptions — one per partition if your tool creates separate subscribers, or one shared subscriber if it uses a single subscription with filter parameters.
5. After extraction, reconcile each partition individually against SE16N.

**Key note on Note 3255746:** If your tool uses ODP via RFC internally (most ADF, Qlik, Fivetran ODP connectors do), review your contract compliance against [SAP Note 3255746](https://support.sap.com/notes/3255746) (Feb 2024). RFC-based ODP is no longer permitted for third-party tools. The compliant path is ODP via OData. [NEEDS_SAP_CITATION — confirm current Note 3255746 scope]

## Pattern 3: SLT Real-Time (Expert)

**When to use:** Billions of rows. Real-time delta required (GL postings visible in target within minutes). Full Use license in place.

**What you do in SAP (summary — see [Expert walkthrough](/walkthrough/expert/acdoca/) for full detail):**

1. Verify Full Use license in [SLICENSE](https://help.sap.com/). Get written confirmation from SAP licensing.
2. Work with Basis to create an SLT replication object in [LTCO](https://help.sap.com/) for ACDOCA with partition key RBUKRS+RYEAR.
3. Configure 4–8 parallel readers in [LTRS](https://help.sap.com/). More readers = faster full load, more SAP resource consumption. Coordinate with Basis.
4. Monitor SM50 throughout the 48–72 hour full load. Finance operations must not be impacted.
5. After full load, LTCO switches to DELTA automatically. Monitor LTRS for lag. Reconcile with SE16N.

**What your infrastructure team does:** Provisions the target (Kafka topic, ADLS container, S3 bucket, Snowflake table, or equivalent) and configures SLT to push to that target via the configured SM59 RFC destination. Your tool team or Basis team owns the target configuration.

**From the field (composite of multiple engagements, anonymized):**

A financial services customer designed a real-time ACDOCA pipeline using SLT before confirming their license. Three months post-go-live, an audit identified SLT running in LTRC under a Runtime License — a Full Use-only feature. Retroactive licensing costs were significant, and the architecture had to be either redesigned or upgraded. The mistake was designing the extraction architecture before license validation. This pattern appears consistently across enterprises.

## Comparison

| | Pattern 1 | Pattern 2 | Pattern 3 |
|---|---|---|---|
| **Volume** | < 100M rows / partition | 100M–500M rows / partition | Billions of rows |
| **Latency** | One-time or scheduled | Scheduled batch | Real-time delta |
| **SAP transactions** | SE80, SE16N, SU01, PFCG, ODQMON | + SM50, multi-subscription ODQMON | + SLICENSE, LTCO, LTRS, SM50 |
| **License** | Runtime OK | Runtime OK | Full Use required |
| **Complexity** | Low | Medium | High |

## Key Takeaways

1. Partition always (RBUKRS + RYEAR minimum). Never extract without a partition key.
2. Use I_JournalEntryItem, not raw ACDOCA.
3. Reconcile with SE16N after every extraction.
4. Check your license before choosing a pattern. SLT is Full Use only.
5. Monitor ODQMON (ODP patterns) and LTRS (SLT patterns) for queue health.

The three patterns are a progression. Start with Pattern 1 for the simplest scenario. Upgrade to Pattern 2 when volume requires it. Add Pattern 3 only when real-time delta is a hard requirement and the license is confirmed.
