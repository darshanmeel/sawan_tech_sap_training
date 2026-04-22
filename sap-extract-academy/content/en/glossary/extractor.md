---
term: Extractor
fullName: Data Extractor
slug: extractor
shortDefinition: "An extractor is a reusable SAP component that exposes table data for extraction via ODP or custom querying. Generic extractors exist for all tables; they support filtering, field selection, and delta tracking."
relatedTerms: [ODP, Operational Data Provisioning, Generic Extractor, ABAP, CDS]
sapDocUrl: "https://help.sap.com/"
seoTitle: "Extractor: SAP Data Extractor Component — Plain Explanation"
seoDescription: "Extractors expose SAP table data for extraction. Generic extractors exist for all tables; they support filtering, field selection, and delta tracking."
updatedAt: 2026-04-22
---

An extractor is a reusable SAP component that provides structured access to a table for extraction. Every table in SAP has a generic extractor that you can query via ODP. Extractors handle the complex work: authorization enforcement, field selection, filtering, delta queue management, and concurrency. You don't extract directly from tables; you extract via the extractor.

SAP provides two types of extractors: **(1) generic extractors** (available for all tables, basic functionality) and **(2) specialized extractors** (published by SAP for key tables like ACDOCA via I_JournalEntryItem, offering advanced features like currency conversion and ledger selection). When you use ODP to extract VBAK, you're using the VBAK extractor. When you use a released CDS view like I_SalesDocument, you're using an SAP-published extractor.

For data extraction work, understanding that extractors handle authorization and filtering is key. If you have data access problems (seeing fewer rows than expected), the extractor's authorization logic may be filtering based on your user role. If your delta is slower than expected, the extractor may be rebuilding its queue. ODQMON and ODP monitoring tools let you see which extractors are active, how much data they've moved, and why they might be stuck.
