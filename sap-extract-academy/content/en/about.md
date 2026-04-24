---
slug: /about/
pageType: about
title: "About SAP Extract Guide"
summary: "What this guide is, who it's for, and what it deliberately isn't."
seoTitle: "About SAP Extract Guide — Field Guide to SAP Data Extraction"
seoDescription: "SAP Extract Guide is a practical field guide to extracting data from S/4HANA and ECC. Patterns, licensing reality, and operational detail, not marketing."
updatedAt: 2026-04-24
---

## What this guide is

SAP Extract Guide is a practical field guide to extracting data out of SAP S/4HANA and ECC into cloud platforms. It is written for the person who has a real table, a real volume, a real deadline, and a real finance team that will be unhappy if the pipeline misbehaves during close.

It is organised around five tables (ACDOCA, BKPF, VBAK, MARA, LFA1) and three extraction methods (ODP, SLT, RFC). Every walkthrough covers the SAP-side reality first, tool configuration second, and operational concerns (licensing, reconciliation, failure modes) third. The goal is to get you to a pipeline you can trust, not to sell you a course.

## Who this is for

- **Data engineers** building pipelines against SAP for the first time or the tenth time.
- **Data architects** making design decisions that will be hard to undo — which extraction method, which license tier, where to land the data.
- **SAP Basis and BTP teams** who own the source system and need to know what an extraction job is actually doing to their application servers.
- **Analytics engineers and program managers** who need to scope SAP extraction work without becoming SAP experts themselves.

If you have SAP access, some Python or SQL, and a concrete table you need to move, you are in the right place.

## What you'll find here

**Pattern-first walkthroughs.** One end-to-end walkthrough per table. Each covers the small-batch, partitioned-batch, and real-time-streaming trajectories in a single document so you can see the trade-offs directly without hopping between pages.

**Licensing treated as architecture.** Runtime vs. Full Use, SAP Note 3255746, third-party connector restrictions, audit detection, and recovery paths. Licensing is the single biggest cause of SAP extraction projects going sideways, and it gets proportional weight here.

**Operational detail.** Memory exhaustion (`TSV_TNEW_PAGE_ALLOC_FAILED`), lock contention on dialog users, LTRS reader tuning, ODQMON queue depth, Kafka lag during bulk loads, reconciliation queries, and the specific transactions you will actually run (LTRC, LTRS, ODQMON, SE11, SE16N, SM50, SM59, SLICENSE).

**A focused glossary.** 32 terms covering SAP transactions, extraction concepts, field types, and runtime concepts. One concept per page, short, linkable from walkthroughs without dragging readers into a tangent.

## What's not here

- **Vendor-specific tutorials.** We don't teach "use Fivetran, it's easy." We teach extraction principles that apply across tools.
- **SAP transaction deep dives.** We show you how to use SE11, LTRC, and ODQMON, but we're not replacing SAP documentation.
- **Cloud data warehouse specifics.** We teach loading patterns, but not Snowflake SQL optimization or BigQuery partitioning strategies.

For those, we link to the relevant documentation.

## How to use this guide

**Start with your problem.** If you need to extract ACDOCA, go to the ACDOCA walkthrough. If you need to understand the licensing before designing, read the two licensing articles first.

**Read the Core Extraction Guide.** The article "How to Extract Any SAP Data" walks through the decision framework end to end, with two worked examples (ACDOCA via ODP and VBAK via SLT). It is the best single entry point if you are new.

**Adapt patterns to your stack.** Walkthroughs show specific tools for concreteness, but the underlying patterns are tool-agnostic. If the walkthrough uses Python and you use ADF, the orchestration changes; the extraction shape does not.

**Use the glossary for terminology, not depth.** The glossary decodes terms in 150 words. For depth, read the linked walkthroughs and articles.

## AI-generated content notice

This site and its content are AI-generated and have not been fully verified or proof-checked. While the underlying patterns are drawn from established SAP field experience, individual details — field names, transaction codes, licensing nuances, version-specific behaviour — may be incomplete or inaccurate. Always cross-reference against official SAP documentation and validate in your own environment before relying on anything here in production.

## Our commitments

**Accuracy.** Patterns are grounded in production experience, not demos. Licensing guidance cites SAP Notes where applicable. Code examples are tested before publication.

**Clarity.** SAP documentation is dense and version-specific on purpose; this guide is plain-language on purpose. Jargon gets a glossary entry; everything else is explained in context.

**Honesty about trade-offs.** SLT is powerful but expensive. ODP is cheaper but slower. RFC is flexible but dangerous. Every method section says what it costs as well as what it does.

**Currency.** S/4HANA ships regularly; extraction patterns drift. Content carries an `updatedAt` date, and we revise when the underlying SAP behaviour changes materially.

## What's next

The five core tables are complete. On the near-term list: deeper BTP licensing coverage, expanded glossary (target ~50 terms), Qlik Replicate and Informatica setup notes, and OData V4 batch patterns. Further out: CO (Controlling) tables, S/4HANA Cloud (public edition) specifics, and HR / SuccessFactors extraction.

The published [roadmap](/roadmap/) has the current list.

## Contact and contributions

This guide is built for the data community and improves when you contribute to it. If you spot an error, have a correction, or want to suggest a missing topic:

- **GitHub:** [darshanmeel/sawan_tech_sap_training](https://github.com/darshanmeel/sawan_tech_sap_training) — open an issue or a pull request.
- **LinkedIn:** Follow for new walkthroughs and pattern updates.
- **Email:** `team@sapextractguide.com` (coming soon).

Corrections on licensing content are especially welcome — SAP rules shift, and this content needs to stay current. Cite SAP Notes by number where possible.

---

Welcome to the guide. Let's build SAP extractions that behave.
