---
term: DATS
fullName: Date (8-digit format)
slug: dats
shortDefinition: "DATS is SAP's date data type stored as YYYYMMDD (8 digits). Example: 20260422 for April 22, 2026. SAP handles DATS-to-local-date conversion automatically, but extractors must preserve the format."
relatedTerms: [TIMS, Data Dictionary, SE11, Date Conversion]
sapDocUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/data-element-dats.html"
seoTitle: "DATS: SAP 8-Digit Date Format — Plain Explanation"
seoDescription: "DATS is SAP's date type, stored as YYYYMMDD (8 digits, e.g., 20260422). Extractors must preserve format or dates become unreadable."
updatedAt: 2026-04-22
---

DATS (Date) is SAP's internal date format: an 8-digit number representing YYYYMMDD. April 22, 2026 is stored as 20260422. Fiscal year dates, document dates, and validity dates all use DATS. When you query SE16N and see a date like "2026-04-22", SAP GUI is automatically converting DATS 20260422 to your local date format; the database stores only the 8 digits.

For extraction, DATS fields are straightforward if handled correctly. Most extractors (Fivetran, ODP, Python/pyrfc with proper RFC metadata) automatically recognize DATS and convert to ISO 8601 (2026-04-22) or timestamp format for the target system (Snowflake, BigQuery, etc.). However, hand-rolled extractors that treat DATS as raw integers will fail: a date field becomes 20260422 in your warehouse instead of 2026-04-22, and date arithmetic breaks.

When extracting date-heavy tables (ACDOCA has POPER for fiscal period, BKPF has BUDAT for posting date), ensure your extraction tool understands DATS. Snowflake and Postgres expect ISO 8601; if you load 20260422 as a string, date functions fail. ODP and Fivetran handle this conversion implicitly; custom Python scripts need to parse DATS and convert explicitly.
