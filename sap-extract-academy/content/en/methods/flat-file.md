---
id: flat-file
slug: flat-file
name: "Flat file export"
shortName: "Flat File"
tagline: "Scheduled ABAP jobs writing CSV/Parquet to shared storage. The boring, unkillable option."
whenToUse: "One-shot migrations, infrequent extracts, environments where no connector is trusted, or as a fallback when every other method is blocked."
seoTitle: "SAP Flat File Extraction — When to Use, How to Handle"
seoDescription: "ABAP reports writing flat files for SAP extraction. When to use flat files, scheduling, idempotency, walkthroughs."
matrix:
  standardTables: { mark: ok }
  customZTables:  { mark: ok }
  s4:             { mark: ok }
  ecc:            { mark: ok }
  fivetranNative: { mark: ok, label: "S3" }
  agentRequired:  { mark: bad }
  sapBasisNeeded: { mark: warn }
  customPvTables: { mark: ok }
  volumePerformance: { mark: ok }
  licenseRisk:    { mark: bad }
---

## Setup in SAP

1. Write (or reuse) an ABAP report that reads the target table, formats each
   row, and writes to an application-server directory (`OPEN DATASET ... FOR
   OUTPUT`) or to a cloud share via Cloud Connector.
2. Schedule the report as a background job in `SM37`, typically at a cadence
   matching your downstream SLA (nightly, hourly).
3. Point the sink at the landing directory. The sink treats this like any
   other flat-file ingestion — S3/ADLS + a cataloguer on top.

## How to handle

- **Idempotency** — include the extraction timestamp in the filename and write
  atomically (write-then-rename). Partial files on retry are the most common
  production failure mode.
- **Delta vs full** — the ABAP report itself decides. A full dump is trivial
  to implement; a delta needs a watermark column (`ERDAT`, `AEDAT`,
  `TIMESTAMP`) and bookkeeping on the SAP side, usually a custom Z-table.
- **Compression and typing** — CSV loses type information; Parquet (written
  via a third-party ABAP library or a wrapper job on a Linux host) keeps
  NUMC/DATS/DEC semantics intact. Prefer Parquet for anything downstream of a
  warehouse.

## Tradeoffs

Zero vendor lock-in, no connector agent, runs in the same change-control
lane as every other ABAP job. The price is ownership: you write the report,
you handle delta, you monitor the job, you decide the file format. Best for
situations where that ownership is acceptable — typically one-off migrations
and low-frequency extracts.
