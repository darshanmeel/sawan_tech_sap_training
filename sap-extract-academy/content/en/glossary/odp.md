---
term: ODP
fullName: Operational Data Provisioning
slug: odp
shortDefinition: "ODP is SAP's extraction framework for exposing table and view data for real-time extraction. ODP handles authorization, supports full-load and delta, and integrates with CDS views. The modern alternative to legacy BW extractors."
relatedTerms: [Operational Data Provisioning, Delta, Released CDS View, ODQMON, Extractor]
sapDocUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/operational-data-provisioning.html"
seoTitle: "ODP: Operational Data Provisioning in SAP — Plain Explanation"
seoDescription: "ODP is SAP's extraction framework for real-time table data. Supports full-load, delta, authorization, and CDS integration. The modern extraction standard."
updatedAt: 2026-04-22
---

Operational Data Provisioning (ODP) is SAP's modern extraction framework, replacing legacy BW extractors. ODP exposes every SAP table and published CDS view for extraction. You can extract via ODP using Python/pyrfc, Azure Data Factory, Informatica, or any tool that speaks RFC. ODP handles the complex work: authorization enforcement (you see only rows your user is allowed to see), field selection, filtering, and delta queue management.

ODP has two sides: **(1) the ODP provider** (what SAP exposes from the table) and **(2) the ODP consumer** (your extraction tool). When you use Python/pyrfc to extract VBAK, you're a consumer querying the VBAK ODP provider. ODP supports both full-load (extract all rows) and delta (extract only changes since last run). Delta uses an internal queue (visible in ODQMON) to track what changed, enabling real-time extraction without triggering full table scans.

For beginner extraction, you use ODP with Python or ADF to pull full data to Snowflake. For intermediate extraction, you use ODP delta to capture incremental changes. For expert extraction, you graduate to SLT (which is ODP's big brother, optimized for scale). The walkthrough progression fundamentally teaches you mastery of ODP: how to filter, parallelize, handle delta, and reconcile.
