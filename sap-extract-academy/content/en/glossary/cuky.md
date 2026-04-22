---
term: CUKY
fullName: Currency Key
slug: cuky
shortDefinition: "CUKY is a SAP data type field that stores a currency code (e.g., USD, EUR, JPY). Often paired with amount fields; you must extract both CUKY and its corresponding amount to properly interpret the value."
relatedTerms: [CURR, QUAN, MEINS, Z-field, ACDOCA, Data Dictionary]
sapDocUrl: "https://help.sap.com/"
seoTitle: "CUKY: Currency Key in SAP — Plain Explanation"
seoDescription: "CUKY is a currency key field (USD, EUR, JPY, etc.) in SAP. Always paired with amount fields; extract both CUKY and amount to interpret values correctly."
updatedAt: 2026-04-22
---

CUKY (Currency Key) is a SAP data element that stores a 3-character currency code: USD, EUR, JPY, CHF, etc. CUKY fields are ubiquitous in finance tables (BKPF, ACDOCA) and purchasing (EKPO). The critical rule: **amounts must be paired with CUKY**. If you extract AMOUNT_LOCAL without WAERS (the WAERS field often references CUKY semantics), you have a meaningless number—$1M means nothing without knowing whether it's USD, EUR, or CNY.

In ACDOCA (the Universal Journal), the challenge is that amounts exist in multiple currencies: transaction currency (AMOUNT_TRANS paired with TCURR), local currency (AMOUNT_LOCAL paired with LCURR), and group currency (AMOUNT_GROUP paired with GCURR). Each currency field is paired with a CUKY-like field. If you extract ACDOCA but miss the CUKY fields, your data warehouse GL will be unusable because accountants won't know what currency a posted amount is in.

When extracting, always use SE11 (Data Dictionary) to find which amount fields are paired with which CUKY fields. Many extraction tools (Fivetran, ODP via CDS) handle this automatically, but hand-rolled extractors and legacy Python scripts often miss CUKY pairing, resulting in orphaned amount fields that have no meaning in the warehouse.
