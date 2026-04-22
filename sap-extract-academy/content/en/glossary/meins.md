---
term: MEINS
fullName: Material Unit of Measure
slug: meins
shortDefinition: "MEINS is a field in MARA (material master) that specifies the base unit of measure for a material: EA (each), KG (kilogram), LT (liter), CM (centimeter), etc. Must be paired with quantity fields when extracting."
relatedTerms: [QUAN, MARA, Material Master, Unit of Measure, Data Dictionary]
sapDocUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/0f69a8fb28ac48d89de2381c2f02a1e9/data-element-meins.html"
seoTitle: "MEINS: Material Unit of Measure in SAP — Plain Explanation"
seoDescription: "MEINS specifies the base unit of measure for materials in MARA (EA, KG, L, CM, etc.). Always pair with quantity fields in extraction."
updatedAt: 2026-04-22
---

MEINS (Maßeinheit, German for "unit of measure") is the base unit of measure for a material in MARA. Steel is stored in KG, paint in LT (liters), hardware in EA (each). When you extract material master data, MEINS tells you the unit of the inventory balance, purchase orders, and sales orders for that material. Without MEINS, quantities are meaningless: 1000 units is 1000 kilograms if MEINS=KG, or 1000 liters if MEINS=LT.

Like CUKY/CURR, MEINS is a reference field that pairs with quantity fields. If you extract MARA-MARA and MARC-LGORT (warehouse storage location quantity), you must also extract MARA-MEINS to know the unit. Many extraction failures in supply chain or manufacturing systems stem from missing MEINS: quantities load to the warehouse without unit context, making demand planning and inventory reconciliation impossible.

When extracting material master or purchase order data, always check SE11 to identify quantity fields (typically named *MENGE or *QTY) and their unit reference fields. MEINS is standard for MARA; purchase orders have MEINS paired with MENGE in EKPO. Fivetran and ODP handle these relationships automatically; custom extractors must select them explicitly.
