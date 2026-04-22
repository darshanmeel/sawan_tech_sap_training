---
term: SICF
fullName: HTTP/HTTPS Configuration
slug: sicf
shortDefinition: "SICF is the SAP transaction for configuring HTTP handlers, services, and web communication. Used to enable REST APIs, iGate services, or custom web handlers that extraction tools might call."
relatedTerms: [RFC, Integration, REST API, SM59]
sapDocUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/SICF.html"
seoTitle: "SICF: HTTP Configuration in SAP — Plain Explanation"
seoDescription: "SICF configures HTTP/REST services in SAP. Used for APIs and web handlers that extraction tools might call."
updatedAt: 2026-04-22
---

SICF (HTTP Configuration Cockpit) is the transaction for managing HTTP handlers and REST services in SAP. If your extraction tool uses REST APIs to call SAP (instead of RFC), you configure the REST endpoint in SICF. SICF also controls which HTTP services are active, authentication, and SSL/TLS settings.

For data extraction, SICF is less common than RFC (most tools use RFC), but emerging patterns use REST: **(1) modern OData APIs** (SAP exposes some data via OData REST endpoints), and **(2) custom REST services** (your organization publishes extraction functions via REST instead of RFCs). If extraction integration uses REST APIs, SICF is where the configuration lives.

Most practitioners don't interact with SICF directly unless troubleshooting HTTP connectivity or setting up REST endpoints. RFC via SM59 remains the standard. But if you're building custom extraction APIs or integrating with modern REST-based tools, SICF is where you enable and configure them.
