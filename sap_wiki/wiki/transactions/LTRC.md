---
topic: LTRC
type: transaction
module: SLT
verified_date: 2026-04-22
primary_sap_source: "[NEEDS_SAP_CITATION]"
related: [SLT, LTRS, ODQMON]
---

# LTRC — SLT Replication Cockpit

## Summary

LTRC (Landscape Transformation Replication Cockpit) is the primary transaction for monitoring and managing SAP SLT (Landscape Transformation Replication Server) replication. It provides a real-time view of all configured replication jobs, their current status, record counts, error states, and throughput metrics.

LTRC is the first place to check when SLT replication is lagging, stuck, or producing errors. The companion transaction LTRS (Landscape Transformation Replication Settings) is used for configuration, not monitoring.

[NEEDS_SAP_CITATION]

## Accessing LTRC

Run transaction code `LTRC` on the **SLT server** system (not the source system). If SLT is embedded on the source system, run LTRC there.

Authorization object required: [NEEDS_SAP_CITATION]

## Main Screen — Replication Cockpit

LTRC opens to an overview of all configured **Mass Transfer IDs** (replication configurations). Each row represents one source-to-target replication setup.

### Key Columns

| Column | Meaning |
|---|---|
| Mass Transfer ID | The SLT configuration identifier |
| Source System | Source SAP system RFC destination |
| Target System | Target database/HANA connection |
| Status | Running, Stopped, Error, Paused |
| Tables | Number of tables configured for replication |
| Load Progress | For initial load: % complete |

[NEEDS_SAP_CITATION for exact column names]

## Navigating to Table-Level Detail

From the main LTRC screen:
1. Select a Mass Transfer ID
2. Click "Replication Objects" or "Display Tables"
3. See individual table status:

| Column | Meaning |
|---|---|
| Table Name | The SAP database table being replicated |
| Status | Initial Load / Replication / Error / Stopped |
| Lag | Records in logging table not yet replicated |
| Last Updated | Timestamp of last replicated record |
| Error Count | Number of errors in current run |

[NEEDS_SAP_CITATION]

## Lag Indicators — What Is Normal

**Initial Load phase:**
- Lag shows total records minus records processed
- Large lag (millions of records) is normal for large tables (ACDOCA, BSEG)
- Monitor throughput rate — typical SLT throughput: 1M–5M rows/hour on modest hardware [SME_KNOWLEDGE]

**Replication (delta) phase:**
- Lag should stay near 0 during normal operations
- Lag spike expected during batch posting events (payroll, month-end close)
- Lag that doesn't recover after 30 minutes → investigate

[SME_KNOWLEDGE]

## Diagnosing Stuck Replication

### Symptom: Lag grows indefinitely

**Step 1:** Check the SAP source system is available and not in a posting wave (SM50 on source — are many work processes occupied with batch jobs?).

**Step 2:** Check the SLT logging table on the source. Logging tables are named `/1LT/<table_name>`. If the logging table is huge, SLT is capturing but not draining.

**Step 3:** Check the target system connection. If target (HANA or other DB) is unreachable or slow, SLT queues the backlog.

**Step 4:** In LTRC, check the "Administration" tab → "Job Log" for error messages.

[SME_KNOWLEDGE]

### Symptom: Error state on a table

1. Select the table in LTRC
2. Open "Error Log" or "Application Log" tab
3. Common errors:
   - **Logging table overflow:** The `/1LT/<table>` logging table exceeded its size limit — SLT pauses replication for that table. Resolution: increase logging table size limit in LTRS, or reduce the batch posting volume.
   - **Authorization error:** SLT RFC user lacks authorization on source or target
   - **Duplicate key on target:** A row exists on the target that SLT is trying to insert. Usually means target was pre-populated with data from another source.
   - **Table structure mismatch:** Source and target table structures differ — transport issue

[SME_KNOWLEDGE]

### Symptom: "Stopped" status

SLT shows Stopped when:
- An admin manually stopped replication
- An unrecoverable error occurred

To restart: select the table → "Resume Replication". If the lag has built up during the stop period, SLT will drain the backlog before reaching real-time.

[SME_KNOWLEDGE]

## Starting Initial Load

From LTRC:
1. Select Mass Transfer ID
2. "Add Tables to Replication" (first time only)
3. Enter table name(s)
4. Select "Replication Type": Initial Load + Replication
5. Confirm — SLT begins initial load immediately

**Warning:** Initial load of ACDOCA or BSEG on a large system can take 24–72 hours. Plan the window carefully. [SME_KNOWLEDGE]

[NEEDS_SAP_CITATION for exact menu steps]

## LTRS — Configuration Transaction

While LTRC is for monitoring, `LTRS` (Landscape Transformation Replication Settings) is for configuration:
- Configuring source/target connections
- Setting logging table size limits
- Controlling parallel jobs
- Configuring filter conditions (e.g., MANDT = 100)

[NEEDS_SAP_CITATION]

## Performance Tuning

Key settings that affect SLT throughput (configured in LTRS or LTRC administration):

| Setting | Impact |
|---|---|
| Parallel jobs | More jobs = higher throughput but more source DB load |
| Chunk size | Records per commit; larger chunks = higher throughput, less commit overhead |
| Logging table size limit | Prevents runaway logging table growth |

[NEEDS_SAP_CITATION for recommended values]
[SME_KNOWLEDGE] Start with default settings. Only tune if throughput is insufficient or source system impact is too high.

## Related Concepts

- [[SLT]] — the technology LTRC monitors
- [[ODQMON]] — equivalent monitoring transaction for ODP

## Raw Sources

- `raw/notes/SAP_NOTES_REFERENCE.md`
- `raw/pdfs_md/` — pending Docling conversion of SLT PDFs

## Changelog

- 2026-04-22: Created from SAP_NOTES_REFERENCE.md; enrichment from pdfs_md/ pending
