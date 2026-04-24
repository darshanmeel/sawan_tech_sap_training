---
id: bw-openhub
slug: bw-openhub
name: "BW Open Hub"
shortName: "BW Open Hub"
tagline: "BW-mediated extraction via Open Hub destinations. Safe license posture if BW is already in the landscape."
whenToUse: "Organizations that already run BW and want to push extraction through the BW data model rather than adding a second extraction channel."
seoTitle: "SAP BW Open Hub Extraction — When to Use, How to Handle"
seoDescription: "Extracting SAP data via BW Open Hub destinations. License implications, DTP flows, landing on S3/ADLS."
matrix:
  standardTables: { mark: ok }
  customZTables:  { mark: bad }
  s4:             { mark: ok }
  ecc:            { mark: ok, label: "if exists" }
  fivetranNative: { mark: ok, label: "S3" }
  agentRequired:  { mark: bad }
  sapBasisNeeded: { mark: ok }
  customPvTables: { mark: bad }
  volumePerformance: { mark: ok }
  licenseRisk:    { mark: bad }
---

## Setup in SAP

1. Define an Open Hub Destination (`RSBOH_DEST`) in BW targeting your sink —
   flat file to a file server, a DB table, or an S3/ADLS mount via Cloud
   Connector.
2. Build a Data Transfer Process (DTP) from the BW object (InfoProvider,
   ADSO, CompositeProvider) to the Open Hub destination.
3. Schedule the DTP via Process Chain. Downstream pipelines consume from the
   sink — they don't talk to SAP at all.

## How to handle

- **BW is the bottleneck** — Open Hub extracts whatever BW has already
  modeled. If the data you need isn't in BW, you have to model it first.
  That's a BW project, not an extraction task.
- **Deltas** — Open Hub destinations support delta-enabled DTPs. The delta is
  a BW-internal concept; request status lives in `RSA7`-adjacent
  infrastructure. Monitor process chain failures in `RSPC`.
- **License** — Open Hub is license-neutral for read: if the data is in BW,
  BW's existing license covers extraction to your sink. This is the main
  reason to pick Open Hub over ODP on legacy ECC+BW landscapes.

## Tradeoffs

Clean license story when BW is already in place. The downside is you extract
through a modeled layer, so custom Z-tables, late-arriving dimensions, and
anything not already in a BW InfoProvider are out of reach without
upstream BW work.
