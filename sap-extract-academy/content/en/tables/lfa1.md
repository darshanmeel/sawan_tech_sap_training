---
code: LFA1
name: "Vendor Master (General)"
slug: lfa1
module: MD
businessDescription: "Vendor master data (general section). One row per vendor, containing company name, address, contact, and core purchasing details."
volumeClass: small
typicalRowCount: "10K-500K"
primaryKey:
  - MANDT
  - LIFNR
keyFields:
  - name: MANDT
    description: "Client (always filter to current client, never extract all)"
  - name: LIFNR
    description: "Vendor Number (10-char, zero-padded vendor identifier)"
releasedCdsView: "I_Supplier"
cdsViewDocUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/supplier-cds.html"
sapHelpUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/vendor-master.html"
extractionGotchas:
  - summary: "LFA1 is the general section of vendor master. Purchasing (LFM1) and company code (LFB1) data are in separate tables. Join all three for complete vendor context."
    sapNoteOrDocUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/vendor-tables.html"
availableLevels:
  - beginner
  - intermediate
  - expert
seoTitle: "Extract LFA1 Vendor Master from SAP S/4HANA — Guide"
seoDescription: "LFA1 is the vendor master general data table in S/4HANA. Learn to extract supplier names, addresses, and master data. Understand table relationships and deleted records."
updatedAt: 2026-04-22
---

LFA1 is the vendor master data table in the Materials Management (MM) module, storing company-wide vendor information: names, addresses, countries, contact details, and tax registration numbers. Each vendor has one LFA1 record (identified by LIFNR, the vendor number) containing general data used across purchasing, accounts payable, and procurement analytics.

The table is straightforward for extraction because its volume is typically small (tens of thousands of vendors even in large enterprises) and deletion is rare. It's an ideal first data extraction for beginners learning SAP table structures and ODP mechanics.

<a href="https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/vendor-master-overview.html">SAP S/4HANA Vendor Master overview</a> documents the full schema. Note that vendor data is split across three logical sections: LFA1 (general), LFB1 (company code level), and LFM1 (purchasing organization level). For procurement analytics, you'll typically join all three.
