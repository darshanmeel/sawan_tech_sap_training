---
term: CDS
fullName: Core Data Services
slug: cds
shortDefinition: "CDS is SAP's declarative language for defining data models and views. CDS views are the modern, supported way to expose SAP data; they enforce authorization, apply currency conversion, and avoid raw table queries."
relatedTerms: [ODP, Released CDS View, I_SalesDocument, I_JournalEntryItem, ABAP]
sapDocUrl: "https://help.sap.com/"
seoTitle: "CDS: Core Data Services in SAP — Plain Explanation"
seoDescription: "CDS is SAP's language for defining data views. CDS views enforce authorization and apply transformations, making them the safe, supported way to extract SAP data."
updatedAt: 2026-04-22
---

Core Data Services (CDS) is SAP's declarative language for defining data models, calculations, and views. Think of a CDS view as a sophisticated SQL view that you define in ABAP, layering business logic on top of raw tables. Instead of writing SELECT * FROM ACDOCA (which crashes SAP), you use a released CDS view like I_JournalEntryItem, which enforces authorization, applies currency conversion, and shields you from table structure changes.

CDS is the modern, endorsed way to extract SAP data. SAP publishes released CDS views (prefixed with I_) for every major table: I_SalesDocument for VBAK, I_AccountingDocument for BKPF, I_Product for MARA, I_JournalEntryItem for ACDOCA. These views are maintained by SAP, backward-compatible, and safe to use. Raw table extraction (SELECT * FROM BKPF) is unsupported and dangerous.

For data extraction, CDS views integrate with ODP, so you can extract via ODP using a released CDS view. Many modern extractors (Python/pyrfc, Fivetran, Azure Data Factory) support CDS extraction. The escalation pattern in this academy—beginner: simple tables via CDS, intermediate: complex filtering and delta, expert: streaming replication—is fundamentally about mastering CDS views at scale.
