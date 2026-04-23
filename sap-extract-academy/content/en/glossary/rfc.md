---
term: RFC
fullName: Remote Function Call
slug: rfc
shortDefinition: "RFC is SAP's protocol for remote procedure calls between systems. Python/pyrfc libraries use RFC to call extraction functions (RFC_ODP_READ, RFC_READ_TABLE) without logging into SAP GUI directly."
relatedTerms: [pyrfc, Python, SM59, Connection, Integration]
sapDocUrl: "https://help.sap.com/"
seoTitle: "RFC: Remote Function Call in SAP — Plain Explanation"
seoDescription: "RFC is SAP's RPC protocol for calling functions remotely. Used by Python/pyrfc and other tools to extract data without SAP GUI."
updatedAt: 2026-04-22
---

### What is RFC?

**RFC (Remote Function Call)** is SAP's proprietary remote procedure call protocol, enabling external applications to invoke ABAP function modules running on an SAP application server as if they were local function calls. RFC is to SAP what gRPC is to modern microservices: a typed, session-based, connection-oriented protocol that handles serialisation, authentication, and session management for remote invocations. Every extraction tool that communicates with SAP programmatically — `pyrfc` in Python, the SAP JCo library in Java, the SAP .NET Connector, Azure Data Factory's SAP ODP connector, Informatica's SAP adapter, and Fivetran's SAP extractor — speaks RFC at the transport layer.

RFC is not a single protocol variant. SAP defines several sub-types: **synchronous RFC (sRFC)** for standard request-response calls; **asynchronous RFC (aRFC)** for fire-and-forget invocations that do not block the caller; **transactional RFC (tRFC)** for exactly-once delivery with a transaction ID; and **background RFC (bgRFC)** for queued background execution. For data extraction, sRFC is used almost exclusively — you call a function like `RFC_ODP_READ` and wait for the result. Understanding which RFC type applies helps when reading `SM58` (tRFC/aRFC monitoring) versus `SM59` (RFC destination management).

### How it works

An RFC connection is established between the external application and the SAP system through an **RFC destination**, configured in SAP using transaction `SM59`. The destination specifies the target host (IP or hostname), the SAP instance number (which determines the RFC port: `33XX` where `XX` is the two-digit instance number), the SAP client (a three-digit code like `100`), and the logon credentials. When your Python script calls `pyrfc.Connection(ashost='sap-prod.corp.com', sysnr='00', client='100', user='RFC_USER', passwd='...')`, it uses these parameters to open a TCP connection to port `3300`, performs the RFC handshake, and authenticates via SAP's own credential system.

Once the connection is established, calling a function module is straightforward. A call to `RFC_ODP_READ` passes input parameters (provider name, read mode, filter conditions, requested fields, and a max-rows page size) and receives an output table structure containing the data rows plus metadata. RFC handles the serialisation of ABAP data types (CHAR, NUMC, CURR, DATS, etc.) into a flat byte stream and deserialises on the other side. The SAP NetWeaver RFC library (`libsapnwrfc`) that `pyrfc` wraps is a shared C library distributed by SAP, which means `pyrfc` installation requires the SAP NW RFC SDK to be installed separately — a common stumbling block for new developers.

RFC connections are **stateful and session-based**. Each connection occupies one SAP work process for its duration, which is a finite and expensive resource (most SAP systems have 20-100 dialog work processes). Long-running RFC extractions therefore compete with interactive users for work processes. For this reason, `RFC_ODP_READ` is designed to be called in a paged loop: each call fetches one page (e.g., 100,000 rows), releases the work process between pages, and uses a cursor token to continue from where the previous page ended.

### Why it matters for data extraction

RFC is the technical foundation of the entire beginner-to-intermediate extraction journey in this academy. When you write a Python script that extracts `BKPF` or `VBAK`, you are making RFC calls. When ADF's SAP ODP connector connects to your S/4HANA system, it does so over RFC. Understanding RFC means understanding why extractions have the behaviour they do: why there are timeouts (`icm/server_port_0` timeout settings affect long RFC sessions), why large table extractions must be batched, why your `SM59` destination must be configured with the correct credentials and host, and why connection pool sizing matters for throughput.

RFC also defines the **trust and authorization boundary** between external tools and SAP. An RFC user configured in `SU01` has SAP authorisation objects assigned to it. The ODP extraction respects those authorizations: if the RFC user does not have `S_TABU_DIS` for the table group containing `BKPF`, the RFC call will return an authorisation error rather than data. This is fundamentally safer than direct database access but requires explicit setup. A correctly configured RFC user for extraction should have the minimum authorizations needed for the specific providers it reads, following the principle of least privilege.

### Common pitfalls

The most common RFC extraction failure is the **timeout**. SAP RFC connections have a maximum session lifetime configured at the network layer (load balancer, SAP ICM, or the RFC library's own keepalive settings). For large tables, a single RFC call that runs for more than the configured timeout (often 10-30 minutes in production) will be terminated with a `SYSTEM_FAILURE` or `RFC_NO_AUTHORITY` error. The solution is smaller page sizes and faster iteration: aim for RFC calls that complete in under 5 minutes each, then loop. Monitor the elapsed time per page call and reduce page size dynamically if you approach the timeout threshold.

A second pitfall is **connection leak**. Python scripts that catch exceptions but do not explicitly close the `pyrfc.Connection` object leave RFC sessions open on the SAP side, consuming work processes until SAP's session garbage collector reclaims them (which can take 10-60 minutes). Always use `pyrfc.Connection` as a context manager (`with pyrfc.Connection(...) as conn:`) or wrap calls in `try/finally` blocks that call `conn.close()`. In production pipelines, implement a connection pool with bounded size to cap the number of simultaneous RFC sessions your extraction creates.

### In practice

A minimal Python extraction using `pyrfc` to pull one page of `BKPF` data looks like this: open a connection with `pyrfc.Connection(...)`, call `conn.call('RFC_ODP_READ', SUBSCRIBER_NAME='BKPF_PIPELINE', PROVIDER_NAME='BKPF', READ_MODE='F', FIELDS=[{'FIELDNAME': 'BUKRS'}, {'FIELDNAME': 'BELNR'}, {'FIELDNAME': 'GJAHR'}], MAX_ROWS=100000)`, then iterate over the `DATA` key in the result. Repeat with an advancing cursor until the `END_OF_DATA` flag is returned. For each iteration, write the batch to Parquet before calling the next page — so a crash mid-extraction preserves already-extracted data and the pipeline can resume from a checkpoint rather than restarting from scratch. Configure your RFC destination in `SM59` first and test the connection using the "Connection Test" button before writing a single line of Python.
