---
term: RFC
fullName: Remote Function Call
slug: rfc
shortDefinition: "RFC is SAP's protocol for remote procedure calls between systems. Python/pyrfc libraries use RFC to call extraction functions (RFC_ODP_READ, RFC_READ_TABLE) without logging into SAP GUI directly."
relatedTerms: [pyrfc, Python, SM59, Connection, Integration]
sapDocUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/rfc.html"
seoTitle: "RFC: Remote Function Call in SAP — Plain Explanation"
seoDescription: "RFC is SAP's RPC protocol for calling functions remotely. Used by Python/pyrfc and other tools to extract data without SAP GUI."
updatedAt: 2026-04-22
---

RFC (Remote Function Call) is SAP's protocol for calling functions remotely on an SAP system from external applications. When you write Python code using the pyrfc library to extract ACDOCA, you're making RFC calls to SAP: calling RFC_ODP_READ to fetch data, RFC_PING to verify connection, RFC_GET_METADATA to fetch field information. RFC is SAP's integration highway: almost every modern integration tool (ADF, Informatica, Python, Fivetran) uses RFC under the hood.

RFC requires a destination configured in SAP (SM59 transaction) that specifies the external system's IP, port, client, credentials. When you extract via Python/pyrfc, Python connects to SAP on the RFC port (default 3300-3399 depending on instance number), authenticates with user credentials, and calls functions as if it were a trusted application.

For data extraction, understanding RFC is important for two reasons: **(1) troubleshooting connection issues** (SM59 shows RFC errors), and **(2) recognizing that RFC has limits**: each RFC call has timeout and memory limits, so very large extractions must batch (extract 1 million rows per RFC call, loop to fetch 10 million total). The beginner walkthrough teaches you to work within these limits; expert walkthroughs show how SLT bypasses them through parallelism.
