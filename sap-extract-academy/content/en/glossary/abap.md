---
term: ABAP
fullName: Advanced Business Application Programming
slug: abap
shortDefinition: "ABAP is SAP's proprietary programming language used to develop custom applications, reports, interfaces, and enhancements within the SAP ecosystem. It runs on the SAP application server and accesses SAP databases directly."
relatedTerms: [ADT, RFC, SE38, Transport Request, BAdI]
sapDocUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/abap.html"
seoTitle: "ABAP: Advanced Business Application Programming in SAP — Plain Explanation"
seoDescription: "ABAP is SAP's proprietary language for custom development. Used for reports, interfaces, enhancements, and business logic within SAP systems."
updatedAt: 2026-04-22
---

ABAP (Advanced Business Application Programming) is SAP's proprietary language for developing custom applications and extensions. Every SAP report, interface, workflow rule, and business logic not provided out-of-the-box is written in ABAP. The language runs on the SAP application server and has direct access to the SAP database, making it uniquely powerful for enterprise integrations.

ABAP comes in two flavors: **ABAP reporting** (used for ad-hoc queries and batch jobs) and **ABAP Objects** (modern object-oriented ABAP, used for cloud development and modern frameworks). Classic ABAP uses procedural syntax with statements like PERFORM, LOOP, and SELECT; ABAP Objects uses classes and inheritance. Most legacy SAP systems use classic ABAP, while S/4HANA initiatives increasingly adopt Objects.

For data extraction, ABAP appears everywhere: in custom extractor logic, FM (Function Module) implementations, Z-reports, and RFC interfaces. Understanding ABAP basics helps you write extraction queries, debug why a table isn't exposed via ODP, or understand why a third-party connector is failing on your custom field.
