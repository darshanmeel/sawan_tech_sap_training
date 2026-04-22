---
term: Transport Request
fullName: Transport Request / Change Request
slug: transport-request
shortDefinition: "A transport request is SAP's mechanism for moving code, configuration, and customizations across environments (dev → test → prod). Every custom ABAP object or CDS view exists in a transport request to track changes."
relatedTerms: [ABAP, CDS, ADT, Configuration, Transport Layer]
sapDocUrl: "https://help.sap.com/"
seoTitle: "Transport Request: SAP Change Management — Plain Explanation"
seoDescription: "Transport requests move code and configuration across SAP environments. Track customizations and ABAP objects from dev to production."
updatedAt: 2026-04-22
---

A transport request (also called a change request) is SAP's change management mechanism. Every custom ABAP report, CDS view, function module, or table customization is assigned to a transport request. When developers check in code (in ADT or legacy SE38), they assign it to a transport request. That request can then be moved through environments: dev → test → production. This ensures traceability, auditability, and consistency.

For data extraction work, transport requests matter if you're building custom extractors, CDS views, or BAdI implementations. If you write a CDS view to expose Z-fields from MARA for extraction, that view gets a transport request. If you configure SLT objects (LTRC replication definitions), they're stored as transports. Transport requests are immutable audit trails: you can see who changed what, when, and why.

Most extraction engineers don't create transport requests; SAP basis and development teams manage them. But if you're building custom extraction logic that must move through environments (dev ACDOCA extraction → test → prod), you're working within the transport system. Understanding transports is essential for any enterprise SAP environment.
