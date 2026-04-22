---
code: VBAK
name: "Sales Document Header"
slug: vbak
module: SD
businessDescription: "Header record for sales documents (orders, quotations, contracts). One row per sales document."
volumeClass: medium
typicalRowCount: "10M-200M"
primaryKey:
  - MANDT
  - VBELN
keyFields:
  - name: MANDT
    description: "Client (always filter to current client, never extract all)"
  - name: VBELN
    description: "Sales Document Number (10-char, zero-padded identifier)"
releasedCdsView: "I_SalesDocument"
cdsViewDocUrl: "https://help.sap.com/"
sapHelpUrl: "https://help.sap.com/"
extractionGotchas:
  - summary: "Sales document type (AUART) drives business logic. Filtering by type during extraction improves performance and ensures correct subset."
    sapNoteOrDocUrl: "https://help.sap.com/"
  - summary: "Large enterprises partition VBAK by sales organization (VKORG) and document type to manage extraction windows. Consider this in your delta strategy."
    sapNoteOrDocUrl: "https://help.sap.com/"
availableLevels:
  - beginner
  - intermediate
  - expert
seoTitle: "Extract VBAK from SAP S/4HANA — Complete Guide"
seoDescription: "VBAK is the sales document header in S/4HANA. Learn to extract orders, quotations, and contracts. Covers released CDS view I_SalesDocument, document types, and partitioning strategies."
updatedAt: 2026-04-22
---

VBAK is the sales document header table in SAP S/4HANA, storing the master data for all sales documents: purchase orders, quotations, contracts, and returns. Each row represents one sales document with 100+ fields covering dates, organizational context, document type, and status.

The table is fundamental to order-to-cash (O2C) analytics. It links to VBAP (line items), VBKD (sales document schedule lines), and other SD tables. Most extraction use cases start with VBAK because it's the entry point for understanding sales volume, velocity, and customer patterns.

<a href="https://help.sap.com/">SAP S/4HANA Sales documents overview</a> provides the complete technical reference. For cloud customers, SAP strongly recommends the released CDS view <code>I_SalesDocument</code>, which enforces authorization and applies post-processing logic automatically. Raw VBAK extraction bypasses these safeguards and should only be used when business rules don't apply.
