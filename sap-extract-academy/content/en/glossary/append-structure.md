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

An append structure is how SAP allows customers to add custom fields to standard tables. Instead of modifying the table directly (which breaks support and updates), you define an append structure in SE11 (Data Dictionary) that "appends" your Z-fields to the table. The fields then appear at the end of the table record, and when you query the table, they're automatically included.

Append structures are critical for extraction because many enterprises have added custom fields to MARA, VBAK, BKPF, and other key tables. If you extract a table that has append structures, you must extract those Z-fields too, or your data warehouse will be missing domain-specific logic (e.g., a custom cost center, warehouse region, or customer segment field). The challenge: identifying which append structures exist, understanding their field types (CHAR, NUMC, DATS, etc.), and ensuring the extraction tool discovers them automatically (Fivetran does; some hand-rolled extractors don't).

In SE11, you navigate to the table, go to "Append Structures" section, and see all appended Z-fields. When you count MARA columns or BKPF cardinality in the field planning phase, don't forget to count append structure fields—they can outnumber standard fields in heavily customized systems.
