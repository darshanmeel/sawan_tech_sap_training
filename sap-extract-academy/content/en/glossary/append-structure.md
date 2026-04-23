---
term: Append Structure
fullName: Append Structure
slug: append-structure
shortDefinition: "An append structure is a SAP table extension mechanism that allows customers to add custom fields (Z-fields) to a standard SAP table without modifying the table directly. Multiple append structures can be stacked on one table."
relatedTerms: [Z-field, SE11, MARA, Data Dictionary]
sapDocUrl: "https://help.sap.com/"
seoTitle: "Append Structure: Extending SAP Tables — Plain Explanation"
seoDescription: "Append structures are SAP's mechanism for adding custom Z-fields to standard tables without direct modification. Multiple structures can stack on one table."
updatedAt: 2026-04-22
---

### What is an Append Structure?

An append structure is SAP's approved mechanism for extending standard database tables with customer-specific fields. When a business needs a field that SAP doesn't deliver — a custom product classification, a regional cost center, a proprietary compliance flag — the correct approach is not to alter the standard table definition directly. That would make the table "customer-modified" and risk being overwritten or broken during SAP upgrades and support pack imports. Instead, a developer creates an **append structure** in transaction `SE11` (ABAP Data Dictionary): a separate structure object that is linked to the target table and whose fields are transparently appended to the physical table at the database level.

From the database's perspective, the fields in an append structure are indistinguishable from standard SAP fields — they occupy columns in the same table, are returned by `SELECT *`, and participate in indexes if so configured. From SAP's perspective, the append structure is a distinct object with its own transport history, meaning it can be upgraded independently of the standard table. Multiple append structures can coexist on a single table, each contributed by a different development team or project.

### How it works

In `SE11`, you open the target table (e.g., `MARA`) and navigate to the **Append Structures** tab. Each append structure listed there is a separate Dictionary object, typically named with a `Z` or `Y` prefix (e.g., `ZMARA_CUSTOM`, `YEXT_MARA_FIELDS`). The structure definition lists its fields with their data types, lengths, and domain references — the same metadata you see for standard fields.

At the database level, the fields from all append structures are physically stored as additional columns in the same table. When ABAP code runs `SELECT * FROM MARA INTO TABLE lt_mara`, the result includes all append structure fields automatically, with no additional JOIN or special syntax required. The fields simply appear after the last standard field in the field catalog. This transparency is what makes append structures so powerful — existing ABAP code that processes `MARA` continues to work, and new code can access both standard and custom fields with identical syntax.

The **field naming convention** for append structures enforces that all custom field names begin with `ZZ` (two Z's) at minimum — for example, `ZZREGION_CODE`, `ZZCUSTOMER_TIER`, `ZZINTEGRATION_KEY`. This convention prevents naming collisions with future SAP standard fields and makes custom fields immediately identifiable in `SE16N` or extraction schemas. When you see a field starting with `ZZ` in a table, you are looking at a customer-added field from an append structure.

### Why it matters for data extraction

Append structures are one of the most frequently missed aspects of SAP data extraction planning, and missing them causes silent data loss. If your extraction tool or query only selects standard fields, you will completely omit all custom business logic that lives in `ZZ` fields. In heavily customized industries — retail, manufacturing, utilities — append structure fields on `MARA`, `VBAK`, `BKPF`, `EKKO`, and `KNA1` often encode the most domain-specific and analytically valuable data in the system.

The practical impact: a retailer might store product hierarchy codes in `ZZMARA_HIER1` and `ZZMARA_HIER2` on `MARA`. Without these fields, category-level reporting in the warehouse is impossible, because SAP's standard `MARA` fields don't encode the retailer's internal hierarchy. A data architect who builds a Snowflake data model using only the SAP standard column list will produce a schema that's technically populated but analytically broken for the business teams who depend on those custom fields.

Modern managed extraction tools like Fivetran discover append structures automatically by introspecting the Data Dictionary metadata at sync time, including all `ZZ` fields in the extracted schema. Legacy hand-rolled extractors — Python scripts using `RFC_READ_TABLE`, hand-written SQL queries against the SAP schema — frequently miss append structure fields because the developer built the field list from documentation rather than live `SE11` inspection.

### Common pitfalls

The most dangerous pitfall is building your extraction field list from SAP documentation, data model diagrams, or schema exports that were created before append structures were added. These sources reflect a point-in-time snapshot and go stale the moment a developer adds a new append structure. Always validate your field list against the live `SE11` definition in the source system immediately before finalizing extraction design.

A second issue is **field type assumptions**. Append structure fields use the same SAP data types as standard fields: `CHAR`, `NUMC`, `DATS`, `TIMS`, `CURR`, `QUAN`, `DEC`, etc. But custom developers sometimes make non-standard choices — a date stored as `CHAR(8)` instead of `DATS`, or an amount stored as `CHAR` to avoid currency pairing requirements. When you extract these fields, the downstream type mapping may be incorrect. Always check the domain and data element of each append structure field in `SE11`, not just its technical type.

Finally, watch for **transport lag**. Append structures are transported from development to quality to production via the standard transport system (`STMS`). A field that exists in development may not yet be in production, or vice versa. If your extraction runs against production but your schema was designed from development, a field that appears in `SE11` in development may not exist in the production table yet. Always verify append structure contents in the production system.

### In practice

Consider extracting `BKPF` (accounting document header) for a financial reporting project. You open `SE11` in production and find `BKPF` has two append structures: `ZZBKPF_COMPLIANCE` (three fields: `ZZAPPROVAL_USER`, `ZZAPPROVAL_DATE`, `ZZRISK_SCORE`) and `ZZBKPF_REGION` (one field: `ZZREGION_CLUSTER`). These four fields don't appear in any SAP standard documentation. They were added during compliance and regional rollout projects over the past five years. Without them, your data warehouse GL table is missing the approval workflow fields that the internal audit team uses for SOX reporting. The lesson: always open `SE11` on the actual production system and review the Append Structures tab before writing the extraction field spec.
