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

### What is a Transport Request?

A **transport request** (formally a **change request** in SAP terminology) is SAP's version-controlled change management mechanism. Every modification to a SAP system — whether it is a new ABAP program, a CDS view, a function module, a customizing entry, or a configuration setting — is assigned to a numbered transport request. That request records what changed, who changed it, when, and in which system. When the change is ready to move forward, the request is **released** and then **imported** into the next environment in the transport route. This three-environment pattern (development → quality assurance → production) is the standard change pipeline in virtually every enterprise SAP installation.

Transport requests exist because SAP systems are not islands. In a typical landscape, developers and configurers work in the development client, changes are tested in a quality or staging system, and only validated changes reach production. Without a formal mechanism to move changes consistently and traceably, SAP environments drift out of sync — code that exists in development is forgotten in production, or a configuration change in production is overwritten by an untested change from development. Transport requests prevent this by making every change explicit, numbered, and auditable.

### How it works

Transport requests are managed through the **Transport Management System** (`STMS` transaction). Every SAP system is assigned to a **transport layer** and a **transport route** in STMS. When a developer creates a new ABAP object in `ADT` (ABAP Development Tools in Eclipse) or in legacy transaction `SE38`, SAP automatically prompts for a transport request to assign the object to. If no open request exists, one is created. The request accumulates objects — you might have one request containing a CDS view, a custom function module, and a related data element, all developed together as part of one feature.

The request exists in two states: **modifiable** (open, still being worked on) and **released** (locked, ready for transport). Once released, the request cannot be modified. Its contents are exported as a data file (a `.cofiles`/`.data` pair stored in the transport directory) and imported into the target system by the basis team or automatically by a CI/CD pipeline. The import process replays the changes in the target system exactly as they were in the source. If the target system already has a conflicting version of the same object, SAP raises a conflict warning during import that must be resolved manually.

### Why it matters for data extraction

Data extraction work that involves any custom development lives entirely within the transport system. A CDS view built to expose Z-fields from `MARA` for extraction must be created in development, transported to quality for testing, and transported to production before it can be used by a production pipeline. If a data engineer builds and tests a view in development and the production pipeline references it, the pipeline will fail in production until the transport is imported. This is one of the most common causes of "it works in dev but not in prod" problems in SAP extraction projects.

Custom ABAP function modules built for extraction also travel via transports. If your pipeline calls a custom function module `Z_RFC_EXTRACT_MATDOC` (a Z-prefixed RFC-enabled function module that returns material documents with custom filtering), that module must be transported to production before the RFC call can succeed. The transport number associated with that function module is also your audit trail — it tells you who wrote it, when it was approved for production, and what version is currently deployed.

SLT replication objects defined in `LTRC` are configuration entries stored in database tables that can also be included in transport requests, though the practice varies. Some teams manage SLT configuration manually per environment; others transport it. If you are setting up SLT and the configuration differs between environments (different Kafka endpoints, different parallelism settings), transporting is not always desirable. Understanding that option exists — and knowing to ask the basis team about the transport strategy for SLT objects — is part of being a competent extraction engineer.

### Common pitfalls

The most common transport-related extraction failure is deploying code to quality or production without its dependencies. A CDS view may depend on a data element, which depends on a domain. If the developer transports the view but not the underlying domain and data element (because they already existed in development from a previous project), the import into quality fails with a "missing dependency" error. Always use the **Where-Used** list and dependency analysis tools in `ADT` to identify all objects that need to be in the transport before releasing it.

Another pitfall is the **modifiable client versus locked client** confusion. In SAP, each system instance has multiple clients, and by default only certain clients allow customizing changes. A developer who accidentally creates a CDS view in the wrong client (one where changes are not recorded in transport requests) will find that the object exists locally but cannot be transported anywhere. SAP enforces this through client settings (`SCC4` transaction) that define whether a client is a customizing client, a test client, or a production client. Always confirm you are working in the correct client before starting any development that needs to be transported.

### In practice

A data engineering team is building a CDS view `Z_MARA_EXTRACTION` in the SAP development system to expose `MARA` fields including several Z-fields from an append structure. The developer creates the view in ADT, assigns it to transport request `DEVK900123`, and adds the associated data elements and a supporting domain to the same request. After unit testing in development, the request is released. The basis team imports it into the quality system, where integration testing runs. Two weeks later, after sign-off, the request is imported into production. The production pipeline — which references `Z_MARA_EXTRACTION` via ODP — now works correctly. Six months later, an audit query asks: "Who created this view and when was it approved for production?" The transport request `DEVK900123` provides the complete answer: developer name, release date, and the import timestamp for every environment.
