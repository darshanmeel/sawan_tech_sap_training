---
title: "Runtime vs Full Use SAP License: The Extraction Architect's Guide"
slug: runtime-vs-full-use
publishDate: 2026-04-22
readingTimeMinutes: 10
author: "SAP Extract Academy"
summary: "SAP Runtime licenses forbid SLT replication. Many organizations discover this during or after implementation and face expensive license upgrades or architecture redesigns. Understand the license boundary, what it means for extraction design, and how to avoid the trap."
relatedWalkthroughs:
  - slug: acdoca
    level: expert
  - slug: vbak
    level: expert
  - slug: bkpf
    level: expert
seoTitle: "Runtime vs Full Use SAP License — Extraction Architecture Guide"
seoDescription: "SAP Runtime License forbids SLT replication. Full Use License required. Learn what each license permits for data extraction, how to validate, and how to avoid costly surprises."
updatedAt: 2026-04-22
---

You have designed your extraction architecture. ACDOCA to your data warehouse via SLT — parallel readers, real-time delta, billions of rows streaming continuously. The architecture is sound and your Basis team is ready to configure LTRC.

Two days before go-live, your licensing manager calls: "We're on a Runtime License. SLT is not permitted."

Your entire extraction strategy may be invalid. This article explains why, what the license boundary means for extraction design, and how to avoid this situation.

## The Two License Types That Matter for Extraction

SAP licenses for S/4HANA come in several tiers. Two matter most for data extraction architecture:

**Full Use License** — The premium tier. Covers all extraction methods: ODP (both OData and RFC paths), SLT replication, OData APIs, standard BW extractors, direct table access, custom ABAP extractors, and certified third-party connector tools. If you have a Full Use license, all extraction methods described in this Academy are available to you.

**Runtime License** — The value tier. Designed for organizations that want to reduce licensing costs after migrating to S/4HANA. Runtime covers standard transaction execution and ODP extraction via published CDS views through the OData API. It does **not** cover: SLT replication, classic BW extraction (InfoProviders, OpenHub), custom ABAP extraction programs, and some advanced analytics tools.

The cost difference between Runtime and Full Use is typically 30–40% of total SAP licensing cost. For large enterprises, that is a substantial saving — and the reason many organizations choose Runtime without fully understanding the extraction restrictions.

[NEEDS_SAP_CITATION — SAP does not publish a definitive public comparison of Runtime vs Full Use capabilities; this is based on licensing documentation and observed enforcement patterns]

## What Runtime Explicitly Restricts for Extraction

Under a Runtime License, the following extraction methods are not permitted:

- **SLT (SAP Landscape Transformation Replication Server):** Any use of SLT — LTRC configuration, LTRS subscriptions, replication objects — is prohibited. This includes SLT pushing to Kafka, databases, data lakes, or any other target.
- **Direct RFC extraction without ODP:** Custom ABAP programs or function modules that read tables directly via RFC for extraction purposes are not permitted.
- **Classic BW extraction paths:** InfoProviders, OpenHub destinations, and BW DataSource-based extraction are not included in Runtime.
- **Some third-party connectors:** Third-party tools that use ODP via RFC (rather than OData) may violate Note 3255746 regardless of license type. On Runtime, there is no path for RFC-based extraction to be compliant.

**What Runtime does permit:**
- ODP via the OData API, when accessing published CDS views (I_JournalEntryItem, I_SalesDocument, etc.)
- OData API access to released CDS views directly (without ODP subscription model)
- Standard transaction access by business users

## Why Organizations Fall Into the Trap

SAP does not enforce license boundaries technically. LTRC will configure and run under a Runtime License — the system does not check. You can run SLT for weeks or months on a Runtime License without any error. Enforcement happens through audits, not system blocks.

This creates four conditions for the trap:

**Condition 1 — Sales and licensing are different teams.** The SAP sales team that sold you a Runtime License may not have flagged extraction architecture restrictions. The licensing team that enforces compliance is separate. The gap between what was promised and what is permitted goes unresolved until an audit.

**Condition 2 — Architecture is designed before license validation.** Extraction architecture is designed by data engineers or architects who may not know the license tier. When licensing review happens late — or not at all — the architecture reaches go-live with an unlicensed component.

**Condition 3 — Legacy mindset.** Organizations migrating from ECC to S/4HANA have used SLT (or its predecessor, Landscape Transformation) for years. They assume SLT carries over as a standard capability. In S/4HANA, it is a separately licensed Full Use feature.

**Condition 4 — Gray-area interpretation.** The boundary between "ODP with published CDS views via OData" (permitted on Runtime) and "ODP via RFC or custom ABAP wrappers" (not permitted) is not always clear. Legal and licensing teams interpret this differently.

## SAP Note 3255746 — An Additional Constraint

[SAP Note 3255746](https://support.sap.com/notes/3255746) (February 2024) adds a constraint that applies regardless of license type: use of ODP via RFC function modules by third-party tools is no longer permitted. This affects Azure Data Factory's SAP CDC connector, Qlik Replicate, Fivetran's ODP connector, Informatica ODP, and others that call ODP internally via RFC.

The compliant alternatives are ODP via OData, or SLT replication. On a Runtime License, SLT is not available — so the only compliant path for third-party tools is ODP via OData. [NEEDS_SAP_CITATION — confirm current enforcement scope of Note 3255746]

## How to Avoid the Trap

**Step 1: Validate your license before designing extraction architecture.** Before any extraction design work, schedule a meeting with your SAP licensing manager. Share the extraction strategy (which tables, which extraction methods). Ask explicitly: "Does our license permit SLT?" and "Does our license permit our tool's ODP connector?"

**Step 2: Get confirmation in writing.** An email from SAP licensing confirming that your architecture is compliant is a meaningful protection in an audit. Verbal confirmations from sales or account teams are not sufficient.

**Step 3: Know the boundary for Runtime.** If you are on Runtime:
- ODP via OData API with published CDS views — permitted
- SLT replication — not permitted
- Third-party tools using ODP via OData — permitted; confirm with vendor
- Third-party tools using ODP via RFC — not permitted per Note 3255746

**Step 4: Budget Full Use upgrade costs if SLT is required.** If your extraction requirements genuinely need SLT (multi-billion-row tables, sub-minute real-time delta), and your current license is Runtime, budget for a Full Use upgrade from the start.

**Step 5: Design within ODP constraints if staying on Runtime.** ODP via OData handles most extraction scenarios at volumes up to approximately 500M rows per partition. Beyond that, sub-partitioning by posting period or month reduces partition sizes. ODP is not real-time (poll latency is typically 5–15 minutes at best); if sub-minute latency is a hard requirement, you need SLT and Full Use.

## The Hidden Audit Risk

SAP audits licensing compliance. The audit process involves reviewing your system configuration — including whether SLT replication objects are configured in LTRC, whether custom ABAP extraction programs exist, and what table access patterns are in the system logs.

**From the field (composite of multiple engagements, anonymized):**

An organization migrated to S/4HANA on a Runtime License, negotiated at 35% below Full Use cost. The data architecture team, unaware of the license restriction, designed an ACDOCA extraction pipeline using SLT. The pipeline ran in production for several months before a routine license review identified the violation. The choices were: upgrade to Full Use (retroactive to go-live), decommission SLT and redesign the pipeline (3–6 months of rework), or accept an audit finding. The organization upgraded to Full Use. The licensing savings from choosing Runtime evaporated, plus the redesign cost had already been incurred. This pattern appears consistently across SAP customers. The mistake is always the same: extraction architecture designed before license validation.

## Decision Framework

| Requirement | Runtime OK? | Action if Runtime |
|---|---|---|
| ODP via OData API | Yes | Confirm tool uses OData, not RFC |
| SLT replication | No | Upgrade to Full Use or redesign to ODP |
| Custom ABAP extraction | No | Redesign to ODP or upgrade |
| RFC-based ODP connector | No (Note 3255746) | Switch tool to OData mode |
| Sub-minute delta latency | No (ODP is poll-based) | Need SLT — Full Use required |

## Conclusion

Treat SAP license type as a hard architectural constraint. Validate it in week one of any extraction project. If your extraction requirements need SLT, the Full Use license cost is a known and plannable investment. If your requirements can be met by ODP via OData on a Runtime License, that is a legitimate and cost-effective path.

The cost of discovering a license violation after go-live is always greater than the cost of planning for it upfront.
