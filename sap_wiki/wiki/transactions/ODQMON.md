---
topic: ODQMON
type: transaction
module: ODP
verified_date: 2026-04-22
primary_sap_source: "[NEEDS_SAP_CITATION]"
related: [ODP, LTRC]
---

# ODQMON — ODP Queue Monitor

## Summary

ODQMON is the SAP transaction for monitoring and managing Operational Data Provisioning (ODP) subscriptions and delta queues. Every time an external tool subscribes to an ODP data source, a subscription entry appears in ODQMON. This is the first place to check when an ODP extraction is stuck, failing, or producing unexpected results.

[NEEDS_SAP_CITATION]

## Accessing ODQMON

Run transaction code `ODQMON` in any SAP system (ECC, S/4HANA) where ODP is configured.

No special authorization beyond basic SAP logon is needed to view ODQMON, but modifying or deleting subscriptions requires specific authorization objects [NEEDS_SAP_CITATION].

## Main Screen Layout

The ODQMON main screen shows:

| Column | Meaning |
|---|---|
| Queue Name | The ODP data source name (e.g., `0FI_ACDOCA_10`) |
| Subscriber Name | The consuming system or tool identifier |
| Context | SAPI, ABAP_CDS, or SLT~<ID> |
| Status | Active, Inactive, Error |
| Last Run | Timestamp of last successful extraction |
| Records Pending | Count of queued delta records not yet consumed |

[NEEDS_SAP_CITATION for exact field names]

## Key Operations

### View All Subscriptions

Select "All Queues" filter → F8 to execute. Shows every ODP subscriber on the system.

### Check a Stuck Queue

A queue is stuck when:
- "Records Pending" count grows over time without decreasing
- Status shows "Error" or "Locked"
- The ETL tool reports timeout or connection errors

Steps:
1. Select the queue entry
2. Click "Display Queue" (or navigate to queue details)
3. Check error messages in the log tab
4. If locked: check if another extraction job is running; wait for it to complete
5. If error: read the error text — common causes are authorization failures, connection issues, or locked SAP application server

[NEEDS_SAP_CITATION] [SME_KNOWLEDGE]

### Reset a Stuck Subscription

If a subscription is in an unrecoverable error state:

1. Identify the subscription (subscriber name + queue name)
2. In ODQMON, select the subscription
3. Use "Reset Subscription" option — this resets the delta pointer to the current position
4. **Warning:** Reset means the next extraction will be a full load, not a delta. Confirm with the consumer before resetting.

[SME_KNOWLEDGE] Resetting is a last resort. Try canceling the running request first.

### Delete a Subscription

Use "Delete Subscription" in ODQMON to remove a subscriber. Do this when:
- A tool has been decommissioned and its subscription is orphaned
- You need to force a clean re-initialization

After deletion, the next extraction from the consumer will create a new subscription and run as a full load.

[NEEDS_SAP_CITATION]

## Diagnosing Delta Issues

### Symptom: 0 records on first delta after init

**Cause:** This is **normal behavior** for CDC-based CDS view extractions. After the init load, SAP records the start point for change capture. The first delta finds no changes since the init point.

**Action:** Run a second delta. If that also returns 0 records and you know data has changed, check the CDC configuration and verify the `@Analytics.dataExtraction.delta.changeDataCapture.automatic: true` annotation is active on the CDS view.

Source: [SAP Note 2884410](https://support.sap.com/notes/2884410), `raw/notes/SAP_NOTES_REFERENCE.md`

### Symptom: Queue grows without consumer reading it

**Cause:** The ETL job is not running, or the consumer has disconnected.

**Action:** Check if the ETL scheduler is running. If the queue is large, the next run will take longer than usual to process the backlog.

[SME_KNOWLEDGE]

### Symptom: Extraction fails with authorization error

**Cause:** The RFC user or OData service user lacks required authorizations.

**Required authorization objects (typical):**
- `S_RFC` — for RFC-based access
- `S_ODP_READ` — for ODP read access [NEEDS_SAP_CITATION]
- `S_TABU_DIS` — for table browser access

[NEEDS_SAP_CITATION for complete authorization list]

## ODQMON vs SM50 / SM66

ODQMON shows the **logical state** of ODP subscriptions and queues. For the **physical process** level:

- `SM50` — work process overview (is an ODP extraction consuming a dialog or background work process?)
- `SM66` — global work process overview across application servers
- `SM37` — background job monitor (if ODP extraction runs as a scheduled background job)

[SME_KNOWLEDGE]

## Related Concepts

- [[ODP]] — the framework ODQMON monitors
- [[LTRC]] — equivalent monitoring transaction for SLT replication

## Raw Sources

- `raw/notes/SAP_NOTES_REFERENCE.md`
- `raw/pdfs_md/SAP_Operational_Data_Provisioning__ODP_.md` (pending Docling conversion)

## Changelog

- 2026-04-22: Created from SAP_NOTES_REFERENCE.md; enrichment from pdfs_md/ pending
