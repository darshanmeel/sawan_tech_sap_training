---
slug: glt0
name: GLT0
title: "GLT0 — General Ledger Totals (ECC)"
mode: ecc-only
module: FI
module_name: Finance
stub: true
description_one_liner: >
  Classic general-ledger totals table in ECC — aggregated balances by account,
  company code, and fiscal period. Replaced by ACDOCA in S/4HANA.
equivalent_in_s4:
  - slug: acdoca
    role: "Universal Journal (line-item source; aggregate on the fly)"
_source:
  - "https://help.sap.com/docs/SAP_ERP/b0a950afb37a4afc9f70b44cb75ee4fa/f3e844538235ff4fe10000000a44176d.html"
---

GLT0 is the classic general-ledger totals table in SAP ECC. It stores
pre-aggregated balances by G/L account, company code, fiscal year, and
period — the table that classic balance-sheet and trial-balance reports
read from.

In SAP S/4HANA, GLT0 no longer exists as a persistent table. The Universal
Journal (ACDOCA) carries every posting at line-item granularity, and
aggregations (trial balance, balance sheet totals) are computed on the fly
from ACDOCA via the released finance CDS views.

This is a stub page: its purpose is to resolve the cross-mode redirect from
ACDOCA's ECC equivalents list. Full curation (columns, extract methods,
notes, ingestion) is out of scope for directory v1.
