---
term: BAdI
fullName: Business Add-In
slug: badi
shortDefinition: "A BAdI is SAP's plug-in architecture that allows custom code to hook into standard business logic without modifying source code. Used for post-processing, filtering, or extending transactions and batch jobs."
relatedTerms: [ABAP, Transport Request, SE38, Enhancement Framework]
sapDocUrl: "https://help.sap.com/"
seoTitle: "BAdI: Business Add-In in SAP — Plain Explanation"
seoDescription: "BAdI is SAP's plug-in architecture for custom code hooks into standard business processes without modifying source, used for post-processing and extensions."
updatedAt: 2026-04-22
---

### What is a BAdI?

A Business Add-In (BAdI) is SAP's object-oriented plug-in architecture for injecting custom ABAP logic into standard SAP business processes without modifying standard source code. SAP engineers predefined hundreds of BAdI **definition points** throughout the standard codebase — specific locations in transactions, batch jobs, and application programs where custom behavior can be inserted. An organization then creates a BAdI **implementation**: an ABAP class that implements the BAdI interface and contains the custom logic. SAP calls the implementation automatically at runtime whenever execution reaches the BAdI definition point.

The design goal is clean extensibility without modification. Modifying standard SAP source code directly (so-called **"mod-pool" modifications**) breaks support contracts, creates upgrade risk, and makes system maintenance unpredictable. BAdIs solve this by providing explicit, documented, and upgrade-stable extension points. When SAP releases a support pack or upgrade, it updates the standard code and preserves the BAdI interface, meaning custom implementations continue to work. This is why BAdIs have become the dominant pattern for SAP customization across the last two decades.

### How it works

BAdIs are managed through transaction `SE19` (classic BAdIs) or the **Enhancement Framework** in `SE18` (new-style BAdIs, the current standard). The lifecycle has three parts. First, a BAdI **definition** — created by SAP — declares the interface methods that custom code can implement. For example, the BAdI `MD_ADD_COL_PLANT` in materials management declares a method `ADD_COLUMN` that fires during MRP list display. Second, a BAdI **implementation** — created by the customer — is an ABAP class that implements the interface and contains the custom business logic. Third, at runtime, SAP's standard code calls the BAdI using a standard dispatch mechanism (`GET BADI` / `CALL BADI` in classic syntax, or the newer `cl_badi_manager` approach), and the custom implementation is invoked.

A critical detail: BAdIs can be **single-use** (only one active implementation allowed) or **multi-use** (multiple implementations can coexist and are all called in sequence). In multi-use BAdIs, the order in which implementations are called is not guaranteed unless explicitly configured through a filter or sorting mechanism. This matters for data extraction because if two implementations both modify the same field, the final value depends on call order, which may vary.

BAdIs execute in the same ABAP work process and database transaction as the standard code that called them. This means a BAdI can read and write to the database, call function modules, update internal tables, and raise exceptions — all with the same access and risk profile as standard SAP code.

### Why it matters for data extraction

BAdIs matter for data extraction in two distinct scenarios. The first is **data enrichment at write time**. Many organizations use BAdIs to populate custom fields on standard objects as they are created or changed. For example, a BAdI on the material master (`BADI_MATERIAL_REL_CHECK`) might populate a custom append structure field `ZZMARA_LIFECYCLE_STAGE` based on business rules that aren't exposed in any standard UI. The field is populated correctly in the database, but only because the BAdI fires during the save operation. If you extract `MARA` raw, you get the correct value. But if you're trying to reproduce or validate the logic in your warehouse, you need to understand the BAdI implementation to replicate the calculation.

The second scenario is **discrepancy diagnosis**. Data architects frequently encounter a gap between "what the user sees in SAP" and "what's in the database table." A user opens a purchase order in `ME23N` and sees a calculated field — an approved amount, a risk classification, a compliance flag — that doesn't exist in `EKKO` or `EKPO`. The explanation is almost always a BAdI that computes the field at display time and presents it in the UI without persisting it to a database column. This type of field is fundamentally not extractable from a table scan — you either need to replicate the logic in your warehouse or call a Function Module or BAPI that executes the same BAdI.

### Common pitfalls

The most common pitfall is **assuming database tables are the authoritative source** for all business data. In organizations with heavy BAdI customization, some fields displayed in the SAP UI are computed at runtime by BAdI implementations and never written to the database. Extracting the underlying table will give you the raw database value, which may be blank, a placeholder, or a stale default. Always ask the functional consultant: "Is this field stored in the database, or computed by custom code?"

A related issue is **BAdI implementations that have side effects on timestamps**. Delta extraction typically relies on change timestamps (`AEDAT`, `LAEDA`, `UDATE`) to identify records modified since the last extraction. Some BAdI implementations update records without updating the change timestamp — either intentionally (to avoid triggering downstream events) or accidentally. If your delta extraction is missing records that have clearly been changed in production, inspect the BAdI implementations for the relevant object type to see if any bypass the standard timestamp update mechanism.

Finally, watch for **inactive BAdI implementations**. An implementation exists in the system but may be set to inactive through a feature toggle or filter condition. A BAdI that is active in production but inactive in the development system (or vice versa) creates data inconsistency that is extremely difficult to trace without specifically checking the BAdI activation status in each client.

### In practice

A practical example: you're extracting `KNA1` (customer master general data) and notice that a field `ZZCREDIT_BAND` is populated with values like `A`, `B`, `C` in production but is blank in your development extraction. You check the field in `SE11` — it's in an append structure, correctly defined. You check `SE16N` in production — values are there. You check `SE16N` in development — blank. A Basis developer points you to `SE19` and shows you a BAdI implementation `ZFI_CREDIT_BAND_POPULATE` that fires during customer master save events. The implementation is active in production but was never activated in development because the credit scoring API it calls isn't available there. Now you know: the field is correctly populated in production via BAdI, your extraction is fine, and the development discrepancy is an environment issue — not an extraction bug.
