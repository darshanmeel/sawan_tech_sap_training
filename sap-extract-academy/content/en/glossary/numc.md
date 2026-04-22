---
term: NUMC
fullName: Numeric Character String
slug: numc
shortDefinition: "NUMC is a SAP data type for numeric strings with leading zeros preserved (e.g., '00001234'). Common for codes and IDs that must display leading zeros but are treated as numbers in SAP."
relatedTerms: [CHAR, Data Dictionary, SE11, Field Type]
sapDocUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/data-element-numc.html"
seoTitle: "NUMC: Numeric Character Type in SAP — Plain Explanation"
seoDescription: "NUMC is a numeric character field that preserves leading zeros (00001234). Used for codes and IDs that need to display leading zeros."
updatedAt: 2026-04-22
---

NUMC is a SAP data type for numeric strings with leading zeros preserved. Examples: document numbers (stored as NUMC(10) to preserve leading zeros), cost center codes, purchase group codes. Unlike pure integer types, NUMC fields retain leading zeros: a cost center '00001234' stays '00001234', not 1234. This is critical for display and matching in the warehouse.

For extraction, NUMC fields must be handled carefully. If you extract a NUMC field and treat it as an integer, you lose leading zeros. In Snowflake or Postgres, if you store 00001234 as an integer, it becomes 1234, and joins on cost center fail. Most modern extractors (Fivetran, ODP) correctly recognize NUMC and load as string/varchar to preserve leading zeros. Hand-rolled Python scripts often fail here by converting NUMC to int, losing the zeros.

SE11 (Data Dictionary) shows each field's type (CHAR, NUMC, INT, CURR, DATS, etc.). When planning extraction, scan for NUMC fields and ensure your target system preserves them as strings. This is a common source of subtle data quality bugs: the extraction succeeds, but cost center or vendor ID matching fails in the warehouse because leading zeros are lost.
