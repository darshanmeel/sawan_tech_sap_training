---
slug: coep
name: COEP
title: "COEP — CO Object Line Items (Periodic)"
mode: ecc-only
module: CO
module_name: Controlling
stub: true
description_one_liner: >
  CO object line-item table in ECC — primary costs by CO object (cost center,
  order, WBS). Consolidated into ACDOCA in S/4HANA.
equivalent_in_s4:
  - slug: acdoca
    role: "Universal Journal (CO integration)"
_source:
  - "https://help.sap.com/docs/SAP_ERP/0c14fb2ee0f445d292f81a2a77e91bf4/0705d65223141842e10000000a44176d.html"
---

COEP is the CO object line-item table in SAP ECC. It stores primary cost
postings against controlling objects (cost centers, internal orders, WBS
elements) with the attribution that CO reporting depends on.

In SAP S/4HANA, COEP's role is absorbed into ACDOCA (the Universal Journal),
which carries the same CO attribution on every posting alongside the FI
dimensions. Extraction pipelines targeting S/4 should read ACDOCA or
`I_JournalEntryItem` and reference COEP only when the pipeline covers ECC
source systems.

This is a stub page: its purpose is to resolve the cross-mode redirect from
ACDOCA's ECC equivalents list. Full curation (columns, extract methods,
notes, ingestion) is out of scope for directory v1.
