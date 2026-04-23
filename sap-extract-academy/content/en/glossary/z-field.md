---
term: Z-field
fullName: Custom Field (Z-prefix)
slug: z-field
shortDefinition: "Z-fields are custom fields added by customers to SAP tables via append structures. Named Z* or Y* by convention, they represent enterprise-specific logic not provided by standard SAP. Must be explicitly extracted or data warehouse is incomplete."
relatedTerms: [Append Structure, SE11, Custom Development, Data Dictionary, MARA]
sapDocUrl: "https://help.sap.com/"
seoTitle: "Z-field: Custom Field in SAP — Plain Explanation"
seoDescription: "Z-fields are custom fields (Z* or Y* prefix) added by customers to SAP tables. Critical to extract or data warehouse misses domain logic."
updatedAt: 2026-04-22
---

### What is a Z-field?

A **Z-field** is a custom field added to a standard SAP table by the customer organisation, named with a `Z` prefix by SAP naming convention (or `Y` prefix for partner/reseller additions). SAP reserves the namespace `Z*` and `Y*` exclusively for customer developments, ensuring custom fields never collide with fields SAP might introduce in future releases. Z-fields are created by ABAP developers or configuration teams when the standard SAP data model does not capture a business concept that the organisation needs. They represent the accumulated business logic, regulatory requirements, and operational specifics of your enterprise — the delta between what SAP provides out of the box and what your organisation actually needs to manage its operations.

Every meaningfully customized SAP system has Z-fields. A pharmaceutical company may have added `Z_BATCH_ORIGIN_COUNTRY` and `Z_SERIALIZATION_FLAG` to `MARA`. A financial services firm may have added `Z_REGULATORY_CLASSIFICATION` and `Z_REPORTING_SEGMENT` to `BKPF`. A logistics company may have added `Z_FREIGHT_ZONE`, `Z_CARRIER_CONTRACT`, and `Z_HAZMAT_CLASS` to `LIKP`. These fields do not appear in any SAP standard documentation because they were created by that specific organisation for its specific needs. They are entirely invisible unless you explicitly look for them.

### How it works

Z-fields are added to standard SAP tables using **append structures** — a mechanism in the ABAP Data Dictionary (managed through `SE11`) that allows non-destructive extension of standard tables. An append structure is a separate Dictionary object that references the target table and defines additional fields. When the Dictionary activates the append structure, those fields are transparently added to the end of the target table's field list without modifying the standard table object itself. This means SAP upgrades do not overwrite Z-fields — the append structure is a customer object that survives upgrades because it is separate from the standard table definition.

The append structure and its Z-fields are visible in `SE11` when you display the target table. If you look at the field list of `MARA`, you will see the standard fields, and then — at the bottom of the list, grouped under the append structure name — you will see the Z-fields. The append structure itself has a name (typically starting with `Z` or `Y`, such as `ZMARA_EXTENSION`) and contains the field definitions: field name, data type, length, decimal places, and a short description. All the same field type rules that apply to standard fields apply to Z-fields — a `CURR`/`CUKY` pairing is still required for currency amounts, a `QUAN`/`MEINS` pairing for quantities.

### Why it matters for data extraction

Z-fields are the single most common source of **incomplete extractions**. A data warehouse can be technically correct — every standard SAP field extracted cleanly, all types preserved, all joins correct — and still be analytically wrong because Z-fields were missed. If your organization's financial reporting relies on `Z_COST_OBJECT_TYPE` in `BKPF` to distinguish between capital expenditure and operational expenditure postings, and that field is absent from the warehouse, every CAPEX vs OPEX report produced from the warehouse is incorrect. The extraction succeeded in a technical sense, but it failed in a business sense.

The challenge with Z-fields is discovery. Standard SAP documentation, SAP Help, and every book ever written about SAP data models describe only the standard fields. Z-fields are organisation-specific and documented (if at all) in internal wikis, ABAP development notes, and the institutional knowledge of the SAP development team. The practical approach to Z-field discovery is: open `SE11` for every target table, scroll to the append structures, enumerate all Z-fields, and for each one ask a business analyst or SAP developer "what does this field contain and does the data warehouse need it?" This conversation is a required step in any professional extraction project, and skipping it is the root cause of the most painful post-go-live data quality issues.

### Common pitfalls

The most damaging pitfall is assuming that because an extraction tool works against standard tables, it automatically captures Z-fields. This is not always true. Tools that use table-specific ODP extractors (like the `2LIS_*` logistics extractors or `0FI_*` financial extractors) extract only the fields included in those extractors' definitions — which typically do not include customer Z-fields unless explicitly extended using BAdIs. Tools that use generic ODP via CDS views capture only what the CDS view selects — and if the view was written for standard fields only, Z-fields are excluded. Only tools that extract directly from the table (via RFC_READ_TABLE, generic table replication in SLT, or Fivetran-style full-table extraction) automatically pick up Z-fields as part of the physical table structure. Always verify with a test extraction and compare the column list against the SE11 field list including append structures.

Another pitfall is type handling for Z-fields. Because Z-fields were created by custom development teams rather than SAP, their type discipline is sometimes inconsistent. A Z-field that should logically be a `CURR` amount might have been created as `DEC` (decimal) without a proper `CUKY` reference, meaning the currency pairing does not exist. A date field might have been created as `CHAR(8)` rather than `DATS`, requiring explicit format conversion. These decisions are locked in at the time the append structure was created and may date back decades. Always inspect Z-field types in SE11 individually — do not assume they follow the same patterns as standard fields.

### In practice

A consumer goods company is extracting material master data from `MARA` to build a product catalog in their data lake. The data engineer opens `SE11` for `MARA` and finds 12 Z-fields in an append structure `ZMARA_CUST`: `Z_PRODUCT_FAMILY`, `Z_BRAND_CODE`, `Z_SUSTAINABILITY_RATING`, `Z_HAZMAT_UN_CODE`, `Z_SHELF_LIFE_DAYS`, `Z_ORIGIN_REGION`, `Z_REORDER_CLASS`, `Z_PROMO_ELIGIBLE_FLAG`, `Z_WEB_CATEGORY_CODE`, `Z_RETAIL_PRICE_LIST`, `Z_ORGANIC_CERTIFIED`, and `Z_PACKAGING_TYPE`. A conversation with the product data team reveals that `Z_WEB_CATEGORY_CODE` drives e-commerce categorisation, `Z_ORGANIC_CERTIFIED` is required for regulatory compliance reporting in the EU market, and `Z_HAZMAT_UN_CODE` is mandatory for transportation compliance. All twelve fields are added to the extraction field list. The data engineer also discovers that `Z_RETAIL_PRICE_LIST` is typed as `CHAR(12)` rather than a proper price type, and flags it for explicit format documentation in the warehouse schema. Without the SE11 inspection step, all twelve fields — including the compliance-critical ones — would have been silently omitted from the warehouse.
