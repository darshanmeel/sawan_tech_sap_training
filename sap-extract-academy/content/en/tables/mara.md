---
code: MARA
name: "Material Master (General)"
slug: mara
module: MD
businessDescription: "Material master data (general section). One row per material, containing material type, category, unit of measure, and core logistics attributes."
volumeClass: medium
typicalRowCount: "100K-10M"
primaryKey:
  - MANDT
  - MATNR
releasedCdsView: "I_Product"
cdsViewDocUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/product-cds.html"
sapHelpUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/material-master.html"
extractionGotchas:
  - summary: "MARA stores general data only. Plant-specific data lives in MARC, sales organization data in MVKE. For complete material context, join all three tables."
    sapNoteOrDocUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/material-tables.html"
  - summary: "Z-fields (custom fields) are common in MARA because companies extend material master with industry-specific attributes (e.g., color, size, hazmat flags). Check your system's APPEND structures."
    sapNoteOrDocUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/zfields.html"
availableLevels:
  - beginner
  - intermediate
  - expert
seoTitle: "Extract MARA Material Master from SAP S/4HANA — Guide"
seoDescription: "MARA is the material master general data table in S/4HANA. Learn to extract product masters, material types, units of measure, and custom fields."
updatedAt: 2026-04-22
---

MARA is the material master table in the Materials Management (MM) module, storing company-wide product/material information: names, material types, categories, units of measure, and classification attributes. Each material has one MARA record (identified by MATNR, the material number) containing general data applicable across all plants and sales organizations.

Material master extraction is essential for product dimension tables in data warehouses. The table is moderately sized (typically 100K to 10M materials depending on enterprise size) and often extended with custom fields (Z-fields) for industry-specific attributes like colors, sizes, or regulatory flags.

<a href="https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/material-master-overview.html">SAP S/4HANA Material Master overview</a> documents the complete schema. Like vendor master, material data is distributed: MARA (general), MARC (plant level), and MVKE (sales organization level). Your extraction strategy depends on the analytics use case — product hierarchy questions often start with MARA; supply chain questions require MARC.
