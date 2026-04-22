---
term: BW
fullName: SAP Business Warehouse
slug: bw
shortDefinition: "SAP BW is SAP's legacy business intelligence and data warehousing solution. Now superseded by S/4HANA Embedded Analytics and cloud solutions (SAP Analytics Cloud), but still used for enterprise reporting in many organizations."
relatedTerms: [S/4HANA, ODP, Operational Data Provisioning, SAP Analytics Cloud]
sapDocUrl: "https://help.sap.com/docs/SAP_BUSINESSWAREHOUSE/0f69a8fb28ac48d89de2381c2f02a1e9/bw.html"
seoTitle: "BW: SAP Business Warehouse in SAP — Plain Explanation"
seoDescription: "SAP BW is the legacy business intelligence platform. Now superseded by S/4HANA Analytics and cloud solutions, but still widely used for enterprise reporting."
updatedAt: 2026-04-22
---

SAP BW (Business Warehouse) is SAP's legacy BI and data warehousing platform, in use since the 1990s. For decades, BW was *the* place to do reporting and analytics on SAP ERP data. You extracted data from ERP (BKPF, VBAK, etc.) into BW, modeled it, and then ran reports and queries. Many large enterprises still run BW and have years of investment in BW data marts, reports, and user training.

BW is gradually being replaced by S/4HANA embedded analytics (using CDS views and SAP Analytics Cloud) and modern cloud BI platforms (Tableau, Looker, Snowflake). However, BW extractions still appear in many data architectures: you may need to understand BW's extraction mechanisms (ODP from BW, InfoProvider cubes) to migrate legacy pipelines to modern warehouses like Snowflake.

For data extraction, the key BW concept is the **InfoProvider** (a virtual or physical data store in BW), which exposes ODP for extraction. If you're migrating a BW data mart to Snowflake, you'll extract BW InfoProviders via ODP, then load into Snowflake, and rebuild the data model there.
