---
term: QUAN
fullName: Quantity
slug: quan
shortDefinition: "QUAN is a SAP data type for numeric quantity fields (order quantities, inventory balances, weights). Like CURR, QUAN fields must be paired with unit fields (MEINS or UOOM) to be interpretable."
relatedTerms: [MEINS, UOOM, CURR, NUMC, Data Dictionary]
sapDocUrl: "https://help.sap.com/"
seoTitle: "QUAN: Quantity Data Type in SAP — Plain Explanation"
seoDescription: "QUAN is the data type for quantities in SAP (order qty, inventory, weights). Always pair with unit fields (MEINS, UOOM) to make quantities meaningful."
updatedAt: 2026-04-22
---

QUAN (Quantity) is a SAP data type for numeric quantity fields: order quantities in EKPO, sales quantities in VBAK, inventory balances in MARD. A QUAN field stores a number, but that number is meaningless without its unit: 1000 QUAN is 1000 kilograms if the unit is KG, 1000 units if the unit is EA, 1000 liters if the unit is LT.

Like CURR/CUKY pairing, QUAN fields must be paired with unit reference fields (MEINS in MARA/MARC, UOOM in EKPO). If you extract MARD-LABST (inventory quantity) without MARA-MEINS, you have a column of numbers with no context. Supply chain analytics breaks: demand planning can't work if it doesn't know whether quantities are in units or kilograms.

When extracting purchase orders, sales orders, or inventory, always identify the QUAN fields and their unit references in SE11. Fivetran and ODP handle these relationships implicitly; custom extractors must select both QUAN and unit fields. This is a high-priority data quality check: incomplete QUAN extraction (missing units) will cause downstream reconciliation failures and angry business users asking "why don't our order quantities match?"
