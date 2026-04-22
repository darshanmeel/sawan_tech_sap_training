---
term: CURR
fullName: Currency Amount
slug: curr
shortDefinition: "CURR is a SAP data type for numeric fields representing monetary amounts. A CURR field must be paired with a CUKY (currency key) field to be interpretable; extracting one without the other creates orphaned data."
relatedTerms: [CUKY, QUAN, MEINS, NUMC, Data Dictionary]
sapDocUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/data-element-curr.html"
seoTitle: "CURR: Currency Amount in SAP — Plain Explanation"
seoDescription: "CURR is the data type for monetary amounts in SAP. Always pair with CUKY (currency key); extract both or your data warehouse amounts are meaningless."
updatedAt: 2026-04-22
---

CURR (Currency Amount) is SAP's data type for monetary fields. Examples: BKPF-DMBTR (amount in document currency), ACDOCA-AMOUNT_LOCAL (posting amount in local currency), EKPO-NETWR (net value of purchase order line). The CURR type enforces decimal precision and formatting, but the field itself is just a number—$100.00 is stored as 100.00 in the database.

The extraction challenge: a CURR field is meaningless without its companion CUKY field. If you extract BKPF-DMBTR without BKPF-WAERS (the currency key), your data warehouse has a column of numbers with no context. Accountants can't close the books; auditors can't reconcile. Many extraction failures stem from missing CUKY/CURR pairing.

When planning extraction, SE11 (Data Dictionary) shows which CURR fields reference which CUKY reference fields. The relationship is defined at the data element level (DMBTR references WAERS). Fivetran and ODP preserve these relationships automatically, but custom extractors and Python scripts must explicitly select both the CURR and CUKY fields to avoid data loss.
