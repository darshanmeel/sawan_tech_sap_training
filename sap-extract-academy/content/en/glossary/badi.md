---
term: BAdI
fullName: Business Add-In
slug: badi
shortDefinition: "A BAdI is SAP's plug-in architecture that allows custom code to hook into standard business logic without modifying source code. Used for post-processing, filtering, or extending transactions and batch jobs."
relatedTerms: [ABAP, Transport Request, SE38, Enhancement Framework]
sapDocUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/badi.html"
seoTitle: "BAdI: Business Add-In in SAP — Plain Explanation"
seoDescription: "BAdI is SAP's plug-in architecture for custom code hooks into standard business processes without modifying source, used for post-processing and extensions."
updatedAt: 2026-04-22
---

A Business Add-In (BAdI) is a hook in SAP code that allows you to inject custom ABAP logic without touching the standard source. Every major SAP transaction and process has predefined BAdI points where you can write custom implementations. For example, a BAdI might fire after a purchase order is saved, giving you a chance to validate, enrich, or post the order to an external system.

BAdIs are relevant to data extraction in two ways: **(1)** custom extraction logic often uses BAdIs to capture data events (e.g., a BAdI that triggers when ACDOCA is posted, allowing you to enrich the posting), and **(2)** you may need to understand BAdI implementations to know what post-processing happens to master data before it reaches the database. If MARA records are enriched by a BAdI, your extraction may miss that enrichment if you don't understand the flow.

Most organizations use BAdIs for business rule enforcement (workflow routing, validation, compliance checks). For data architects, BAdIs are less critical than understanding table structures and ODP, but they explain discrepancies between "what I see in SE16N" and "what should be there by logic."
