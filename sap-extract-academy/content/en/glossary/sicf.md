---
term: SICF
fullName: HTTP/HTTPS Configuration
slug: sicf
shortDefinition: "SICF is the SAP transaction for configuring HTTP handlers, services, and web communication. Used to enable REST APIs, iGate services, or custom web handlers that extraction tools might call."
relatedTerms: [RFC, Integration, REST API, SM59]
sapDocUrl: "https://help.sap.com/"
seoTitle: "SICF: HTTP Configuration in SAP — Plain Explanation"
seoDescription: "SICF configures HTTP/REST services in SAP. Used for APIs and web handlers that extraction tools might call."
updatedAt: 2026-04-22
---

### What is SICF?

`SICF` stands for **SAP Internet Communication Framework** and is the transaction used to manage all HTTP and HTTPS services running inside an SAP system. Where `SM59` governs outbound RFC connections (SAP calling external systems), SICF governs the inbound HTTP layer — the services that allow external systems to call SAP over web protocols. The framework is structured as a hierarchical tree of service nodes, each representing a handler that responds to a specific URL path. Administrators use SICF to activate, deactivate, and configure these services, including setting authentication requirements, SSL/TLS certificates, and logon procedures.

SICF became increasingly relevant as SAP expanded its REST and OData surface area. In older integration patterns, virtually all machine-to-machine communication with SAP happened over RFC. In modern patterns — particularly those involving SAP S/4HANA, SAP BTP, and cloud-native integration layers — HTTP-based protocols are common. SICF is the control plane for this layer, and understanding it is useful context for any engineer working with modern SAP connectivity rather than purely RFC-based extraction.

### How it works

The SICF service tree mirrors a URL hierarchy. A service registered at `/sap/opu/odata/sap/API_SALES_ORDER_SRV` corresponds to the OData endpoint for the Sales Order API, and its node in SICF controls whether that service is active, which authentication method it requires (basic, X.509, SAP logon ticket), and which ABAP handler class processes the request. When an external client sends an HTTP GET or POST to that URL, the SAP **ICM** (Internet Communication Manager) process intercepts it, resolves the URL to the SICF node, and dispatches the request to the registered handler class. The handler executes in a standard dialog work process, produces a response, and the ICM sends it back to the caller.

For OData services specifically, SAP generates SICF nodes automatically when you activate an OData service using transaction `/IWFND/MAINT_SERVICE`. Behind that service node sits the **OData framework** (`IWFND`/`IWBEP`), which translates HTTP GET with `$filter` and `$select` parameters into ABAP SELECT statements. This means OData-based extraction is ultimately reading from the same database tables as RFC-based extraction, but going through a different protocol stack with different performance and filtering characteristics.

### Why it matters for data extraction

For most extraction practitioners using Python/pyrfc, ADF with RFC, or SLT, SICF is background knowledge rather than a daily tool. RFC-based extraction bypasses the HTTP layer entirely — RFC uses a proprietary binary protocol over TCP, not HTTP, and SM59 is its configuration home. However, there are specific scenarios where SICF directly affects extraction work.

The first scenario is **OData-based extraction**. SAP's standard APIs — the `API_JOURNALENTRYITEM_SRV` for journal entries, or `API_SALES_ORDER_SRV` for sales orders — are OData services activated and managed through SICF. If your extraction tool uses these APIs (as some modern SaaS connectors do), the SICF activation state of the service node determines whether the endpoint is reachable at all. A service that has not been activated in SICF returns a 404, regardless of credentials. The second scenario is **custom REST extraction handlers**: some organisations build custom ABAP REST services that expose extraction-friendly payloads (pre-joined, pre-filtered data sets), and these are registered and activated in SICF. If your toolchain calls one of these custom endpoints, SICF is where the endpoint lives.

### Common pitfalls

The most common SICF-related extraction problem is an endpoint returning HTTP 404 or 403 when you are certain the URL is correct. A 404 almost always means the SICF service node is not activated — the node exists in the tree but has been deactivated (shown in SICF with a strikethrough). A basis administrator needs to activate it. A 403 typically means the service is active but the extraction user lacks the appropriate ICF authorisation object (`S_ICF`) in their role. Confusing these two causes — and asking for the wrong fix — wastes significant time in enterprise environments.

Another pitfall specific to OData extraction is mistaking SICF activation for full service readiness. An OData service can be active in SICF but not registered in the OData catalogue (`/IWFND/MAINT_SERVICE`), which means the framework does not know how to route requests to the correct handler. Both activation steps — SICF activation and OData catalogue registration — must be completed. Engineers who inherit partially configured systems often find one step done and the other missing, producing confusing error responses that do not clearly indicate which layer failed.

### In practice

Suppose your team decides to use SAP's standard OData API `I_JournalEntryItem` to extract universal journal data rather than going through RFC. Your Python script sends a GET request to `https://saphost:443/sap/opu/odata/sap/API_JOURNALENTRY_SRV/$metadata` and receives a 404. You log into the SAP system and open `SICF`, navigate to `/sap/opu/odata/sap/API_JOURNALENTRY_SRV`, and find the node exists but is greyed out — deactivated. You ask the basis team to activate it, the 404 resolves, and the metadata document returns correctly. You then test a filtered query and receive data. This entire diagnosis and fix happened in SICF, and without understanding that OData services are governed there, you might have spent hours troubleshooting network firewalls or credential issues instead.
