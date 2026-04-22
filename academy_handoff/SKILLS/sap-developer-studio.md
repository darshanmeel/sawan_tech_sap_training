# SKILL: SAP Developer Studio (Eclipse + ADT)

Use this skill when screenshots or references to SAP's development tooling are needed in walkthrough content.

---

## What SAP Developer Studio Means Here

Interpretation: **Eclipse with ABAP Development Tools (ADT)**. This is the standard IDE for SAP CDS view development and what learners will see in walkthroughs that touch CDS.

Alternatively, **SAP Business Application Studio (BAS)** — SAP's cloud IDE for CAP/SAPUI5 development — but that's for application development, not extraction, so less relevant here.

---

## When It Appears in Walkthroughs

In any walkthrough where the user needs to:

- Inspect a released CDS view (e.g. `I_JournalEntryItem` for ACDOCA)
- Create a CDS Extension View for Z-fields
- Activate a CDS view
- View the Data Preview of a CDS view
- Check `@Analytics.dataExtract: true` annotations

These all happen in ADT within Eclipse.

---

## Setup Step for Learners

Intermediate and Expert walkthroughs need a prerequisite like:

> **Prerequisite: ABAP Development Tools installed in Eclipse.**
> Download Eclipse from eclipse.org. Install "ABAP Development Tools for SAP NetWeaver" via the Eclipse Help → Install New Software menu, using the update site URL from the SAP Help Portal. Configure a system connection pointing to your S/4HANA or ECC system.

Cite: [Installing ABAP Development Tools for SAP NetWeaver](https://tools.hana.ondemand.com/) — but verify the URL is current; ADT download pages move.

---

## Screenshot References in Content

For walkthrough steps that require Eclipse/ADT:

- Describe the UI verbally (agent writing content)
- Placeholder for screenshot: `[SCREENSHOT: ADT Data Preview of I_JournalEntryItem showing sample rows]`
- Human SME captures actual screenshots post-launch (MVP can ship without screenshots)

---

## CDS Extension View Authoring (Expert-Only)

The pattern for Z-field extensions:

```abap
@AbapCatalog.sqlViewAppendName: 'ZE_ACDOCA_EXT'
@AbapCatalog.compiler.compareFilter: true
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Z-field extension for I_JournalEntryItem'
@Metadata.ignorePropagatedAnnotations: true

extend view I_JournalEntryItem with ZACDOCA_EXT
  association [0..1] to ZZ_COSTCENTER_GROUP_T as _CCGroup
    on $projection.ZZ_COSTCENTER_GROUP = _CCGroup.cc_group_id
{
  zz_costcenter_group as ZzCostCenterGroup,
  zz_profit_adj       as ZzProfitAdj,
  zz_profit_adj_curr  as ZzProfitAdjCurrency,
  _CCGroup
}
```

Extension views use `@AbapCatalog.sqlViewAppendName` and `extend view ... with`. The extension has a different package and different transport, so it survives SAP upgrades.

Cite: [CDS Extend View](https://help.sap.com/docs/...) — verify current URL.

---

## Transaction-Code Alternatives (For Customers Without ADT)

Some SAP customers haven't standardized on ADT. Their developers still use classic SAP GUI. For them, the alternative is:

- **SE80** — Object Navigator, can edit CDS source but less ergonomic than ADT
- **SE11** — Data Dictionary for Append Structures
- **SE38** — ABAP Editor for legacy code

Walkthroughs should mention ADT as the preferred tool but acknowledge SE80 as an alternative. Cite both.

---

## Testing Content Authoring

When drafting walkthroughs that mention ADT:

1. Verify the ADT download URL is current
2. Verify the CDS annotation names (`@Analytics.dataExtract`, etc.) against SAP's current ABAP documentation
3. For CDS Extension View syntax, test against a real S/4HANA system if possible — syntax has evolved across releases

If you (the agent) cannot verify ADT-specific details, mark `[NEEDS_SAP_CITATION]` and flag for SME review.
