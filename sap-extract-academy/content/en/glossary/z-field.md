---
term: Z-field
fullName: Custom Field (Z-prefix)
slug: z-field
shortDefinition: "Z-fields are custom fields added by customers to SAP tables via append structures. Named Z* or Y* by convention, they represent enterprise-specific logic not provided by standard SAP. Must be explicitly extracted or data warehouse is incomplete."
relatedTerms: [Append Structure, SE11, Custom Development, Data Dictionary, MARA]
sapDocUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/custom-fields.html"
seoTitle: "Z-field: Custom Field in SAP — Plain Explanation"
seoDescription: "Z-fields are custom fields (Z* or Y* prefix) added by customers to SAP tables. Critical to extract or data warehouse misses domain logic."
updatedAt: 2026-04-22
---

A Z-field (or Y-field) is a custom field added to an SAP table by the customer, typically via append structures in SE11. The Z prefix is convention for customer-specific development; Y is used by resellers/partners. Z-fields represent business logic not provided by standard SAP: a cost center extension, a customer segment flag, a warehouse region code, a custom approval status. Every heavily customized SAP system has dozens of Z-fields.

Z-fields are critical for extraction because they contain domain-specific data your organization cares about. If MARA has a Z_HAZMAT field (hazmat classification), your data warehouse **must** extract it or you'll lose regulatory compliance data. If BKPF has a Z_CUSTOM_COST_CENTER, that field is essential for financial analytics. Missing Z-fields is a common source of extraction failure: the warehouse loads, but business logic is incomplete.

Discovery is the challenge: SE11 shows append structures and Z-fields, but you must explicitly identify them. Fivetran and modern ODP/CDS automatically discover and extract Z-fields. Legacy or hand-rolled extractors often miss them. When planning extraction, always run SE11 analysis on your target tables to enumerate Z-fields and ensure your extraction tool will capture them.
