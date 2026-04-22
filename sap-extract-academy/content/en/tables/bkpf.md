---
code: BKPF
name: "Accounting Document Header"
slug: bkpf
module: FI
businessDescription: "Accounting document header (all G/L, A/P, A/R documents). One row per accounting document, with posting date, document type, company code, fiscal year."
volumeClass: medium
typicalRowCount: "50M-500M"
primaryKey:
  - MANDT
  - BUKRS
  - GJAHR
  - BELNR
keyFields:
  - name: MANDT
    description: "Client (always filter to current client, never extract all)"
  - name: BUKRS
    description: "Company Code (4-char, primary partition key)"
  - name: GJAHR
    description: "Fiscal Year (partition key; most extractions slice by year)"
  - name: BELNR
    description: "Accounting Document Number (10-char, unique within BUKRS+GJAHR)"
releasedCdsView: "I_AccountingDocument"
cdsViewDocUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/accounting-doc-cds.html"
sapHelpUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/accounting-doc.html"
extractionGotchas:
  - summary: "BKPF includes posted and parked documents. Filter BUKRS (company code) and GJAHR (fiscal year) early to reduce volume. Most extractions partition by fiscal year."
    sapNoteOrDocUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/bkpf-partitioning.html"
  - summary: "Line items live in BSEG, not BKPF. BKPF is header only (amounts, posting date, approver). Join to BSEG for account-level details."
    sapNoteOrDocUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/bseg.html"
  - summary: "Accounting documents can be reversed. Check AUGBL (reversal reference) and STORNOMON (reversal flag) to understand reversals vs. new postings."
    sapNoteOrDocUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/reversals.html"
availableLevels:
  - beginner
  - intermediate
  - expert
seoTitle: "Extract BKPF from SAP S/4HANA — Complete Guide"
seoDescription: "BKPF is the accounting document header table in S/4HANA. Learn to extract G/L documents with company code, fiscal year, and reversal handling."
updatedAt: 2026-04-22
---

BKPF is the accounting document header table in the Financial Accounting (FI) module, storing metadata for all posted and parked accounting entries: posting dates, document types, company codes, fiscal years, amounts, and approval status. Each accounting document has one BKPF record (identified by BUKRS, GJAHR, BELNR — company code, fiscal year, document number).

Extracting BKPF is central to financial analytics and audit trails. The table is large (tens to hundreds of millions of documents annually in large enterprises) and requires careful partitioning by fiscal year and company code to avoid extraction timeouts.

<a href="https://help.sap.com/docs/SAP_S4HANA_CLOUD/89a3a7de88e44b18a6bfc1eb74cf8d3c/accounting-doc-overview.html">SAP S/4HANA Accounting Document overview</a> documents the structure. Note that BKPF is header-only (no monetary amounts broken down by account). For account-level details, join to BSEG (line items). Most data warehouse fact tables combine BKPF header context with BSEG line detail.
