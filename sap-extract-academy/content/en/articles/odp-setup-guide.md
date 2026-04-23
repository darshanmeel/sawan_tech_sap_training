---
title: "ODP (Operational Data Provisioning) — Complete Setup Guide"
slug: odp-setup-guide
publishDate: 2026-04-23
readingTimeMinutes: 20
author: "SAP Extract Guide"
summary: "Setup and configure ODP for batch and incremental data extraction. CDS views, DataSources, OData services, and delta mechanism."
relatedWalkthroughs:
  - slug: acdoca
  - slug: bkpf
  - slug: lfa1
  - slug: mara
  - slug: vbak
seoTitle: "ODP Setup Guide — Batch Data Extraction Framework"
seoDescription: "Configure ODP (Operational Data Provisioning) for SAP data extraction. CDS views, DataSources, delta queues, ODQMON monitoring."
updatedAt: 2026-04-23
---

## What is ODP?

Operational Data Provisioning (ODP) is SAP's standard extraction framework. It exposes SAP data via:
- CDS Views (modern, recommended)
- DataSources (standard SAP extractors)
- BW objects

ODP handles full loads and incremental deltas through change data capture.

**Key characteristics:**
- **Latency:** 15–60 minutes (batch, on-schedule)
- **License requirement:** Runtime OK (no special license)
- **Target destinations:** Any external system (S3, Snowflake, Databricks, Fivetran, ADF, etc.)
- **Method:** CDS view or DataSource via OData/RFC + delta queues

---

## Prerequisites & Requirements

### SAP System
- SAP source system (S/4HANA 2020 or later recommended)
- ODP providers configured (DataSources, CDS Views, BW objects)

### Infrastructure
- Target subscription system or application
- Network connectivity for OData or RFC

### User & Permissions
- User roles: ODP configuration and extraction privileges
- S_ODP_READ authorization object

---

## Part 1: Setup & Enablement Check

### Step 1: Identify ODP Provider Type

**Option A: For CDS Views (Recommended)**

CDS View Definition with annotations:

```
@Analytics.dataExtraction.enabled: true
define view ZMY_VBAK_VIEW as
select from vbak {
  key vbak.vbeln,
  key vbak.posnr,
  vbak.kunnr,
  vbak.erdat,
  ...
}
```

**Option B: For Standard DataSources**

Example: `2LIS_11_VAHDR` (Sales Document Header extractor for VBAK)
- Pre-built extractor for VBAK
- Covers most standard fields
- Recommended for common tables

### Step 2: Enable ODP for CDS Views

If using CDS view, add annotations:

```
For Full & Delta Extraction:
@Analytics.dataExtraction.enabled: true
@Analytics.dataExtraction.delta.changeDataCapture: true
@Analytics.dataExtraction.delta.changeDataCapture.automatic: true
```

### Step 3: Expose as OData Service

Transaction: **/IWFND/MAINT_SERVICE**

Steps:
1. Create or register OData service
2. Bind service to CDS view or DataSource
3. Set service as "Active"
4. Test service connectivity
5. Document service endpoint URL

### Step 4: Configure DataSource (If Using Standard Extractors)

Transaction: **RSA6** (DataSource monitor)

Steps:
1. Search for DataSource name (e.g., `2LIS_11_VAHDR`)
2. Check if ODP-enabled (Green tick = enabled)
3. If not enabled:
   - Transaction: SE38
   - Run Program: `RODPS_OS_EXPOSE`
   - Select DataSource to release
   - Confirm completion

### Step 5: Verify ODP Enablement

**Check CDS View Annotations:**
- Transaction: SE80
- View: CDS view definition
- Verify: `@Analytics.dataExtraction` annotations present

**Check DataSource ODP Status:**
- Transaction: RSA6
- Search: Table/DataSource name
- Look for: Green tick icon = ODP-enabled

**Test Extraction:**
- Transaction: SE38
- Program: `RODPS_REPL_TEST`
- Select: DataSource/CDS view
- Execute: Test extraction
- Verify: Data extraction successful

**Check OData Service Registration:**
- Transaction: /IWFND/MAINT_SERVICE
- Search: Service name
- Verify: Service is "Active"
- Test: Service connectivity

---

## Part 2: Configure Table Replication (VBAK Example)

### Step 1: Select ODP Provider

**Option 1: Use Standard VBAK Extractor**
```
DataSource: 2LIS_11_VAHDR (Sales Document Header)
Provider Type: Standard SAP DataSource
Status: ODP-enabled (verify in RSA6)
```

**Option 2: Use Custom CDS View**
```
Provider Type: ABAP CDS View
View Name: Z_VBAK_EXTRACTION
Annotations: @Analytics.dataExtraction.enabled: true
```

### Step 2: Configure ODP Subscriber Connection

**In SAP Source System:**
```
- Expose OData service (Transaction: /IWFND/MAINT_SERVICE)
- Service Endpoint: http[s]://SAP_Host:Port/sap/opu/odata/sap/2LIS_11_VAHDR_CDS
```

**In Target System (AppFlow/ADF):**
```
- Create connection to OData service
- Provide SAP Gateway credentials
- Test connection
- Select "ODP" as data source type
```

### Step 3: Configure Full Load Settings

Steps:
1. Create mapping from ODP provider to target system
2. Select Trigger Type: "On Demand" (for full load)
3. Configure field mapping:
   - VBELN → Order Number
   - KUNNR → Customer Number
   - ERDAT → Document Date
   - (Map all required VBAK fields)
4. Set initial execution to "Full Load"

### Step 4: Configure Delta Load Settings

Steps:
1. After full load completes, configure delta trigger
2. Select Trigger Type: "On Schedule"
3. Set Schedule Frequency:
   - Recommended: Hourly or Every 15 minutes
   - Minimum interval: 15 minutes
4. Enable: "Subscribe to Delta Queue" option
5. Configure delta token handling (automatic in most platforms)

### Step 5: Start Replication

Execution:
1. Run full load extraction (On Demand)
2. Monitor extraction in source system
3. Verify data arrival in target system
4. Activate delta subscriptions
5. Schedule delta job frequency

---

## ODP Automatic Processes

### Phase 1: Full Load (On Demand)

**Triggered Process:**
1. ODP Provider reads all VBAK records from source
2. Packages data for transmission via OData
3. Sends full dataset to target system
4. Target creates table structure automatically
5. Target loads all records in batches
6. Confirms successful load

**Data Flow:**
```
VBAK Table → ODP Provider → OData Service → Target System
```

### Phase 2: Delta Replication (On Schedule)

**Triggered Process:**
1. Operational Delta Queue (ODQ) captures VBAK changes
2. Changes stored with delta tokens
3. Consumer applications request deltas at scheduled intervals
4. ODQ provides delta data packages
5. Target system receives and applies changes

**Delta Identifier Fields:**
```
- ODQ_CHANGEMODE:
  * "C" = New image (INSERT/UPDATE)
  * "D" = Delete marker
  * "U" = Update

- ODQ_ENTITYCNTR: Unique change counter
- Delta Token: Tracks last processed change
```

### Phase 3: Data Validation

**Target System Receives:**
```
- VBELN: Sales document number
- POSNR: Line item number
- KUNNR: Customer number
- ERDAT: Creation date
- NETWR: Net value
- WAERK: Currency
- (All mapped VBAK fields)

Plus Change Metadata:
- Extraction timestamp
- Change type
- Delta token for next retrieval
```

---

## ODP Monitoring

### Monitor Transaction: ODQMON

**Features:**

1. **Active Subscriber Queues**
   - List of all systems subscribed to ODP
   - Queue status (Active/Inactive)
   - Last update timestamp

2. **Data Volume Tracking**
   - Records extracted per delta
   - Queue size
   - Extraction frequency

3. **Delta Status**
   - Last successful extraction
   - Current delta token
   - Pending changes count

### Alternative Monitoring

**CDS View: I_DataExtractionEnabledView**
- Shows all ODP-enabled CDS views
- Available in S/4HANA 2020+

**Transaction: RSA6**
- Monitor specific DataSource extractions
- View extraction logs
- Check last extraction timestamp

---

## Delta Load — Table Structure Details

### Operational Delta Queue (ODQ) Structure

**When ODP captures changes:**

```
Fields Added to Delta Stream:
  - ODQ_CHANGEMODE (1 char):
    * "C" = New image (INSERT or UPDATE as new image)
    * "D" = Delete marker
  
  - ODQ_ENTITYCNTR (Counter):
    * Unique number for each change
    * Helps sequence delta application
  
  - Original VBAK Fields:
    * All mapped extraction fields
    * VBELN, POSNR, KUNNR, ERDAT, etc.
  
  - Metadata Fields:
    * Extraction timestamp
    * Source system ID
    * Delta token
```

### Delta Processing Pattern

**Initial Extraction (Full Load):**
```
Request: Get all records from ODP provider
Response: All VBAK records + ODQ_ENTITYCNTR=0
Status: Load complete, delta token recorded
```

**Subsequent Delta Extraction (Every 15min/hourly):**
```
Request: Get changes since last delta token
Response: Only records with ODQ_ENTITYCNTR > last_token
Changes Included:
  - New VBAK records (ODQ_CHANGEMODE='C')
  - Modified VBAK records (ODQ_CHANGEMODE='C' with updated values)
  - Deleted VBAK records (ODQ_CHANGEMODE='D' with key fields only)
Status: Delta updates applied, new token saved
```

---

## Troubleshooting

### Issue: DataSource Shows as Not ODP-Enabled

**Solution:**
1. Transaction: SE38
2. Run Program: `RODPS_OS_EXPOSE`
3. Select DataSource to enable for ODP
4. Confirm completion
5. Check RSA6 again for Green tick

### Issue: OData Service Returns 0 Records on First Sync

**Solution:**
1. ODP provider may require init-delta run before returning data
2. Trigger full refresh for initial run in extraction tool
3. After init completes, subsequent incremental syncs will return changes correctly
4. Confirm ODP subscription appears in ODQMON after first run

### Issue: Delta Queue Lag Exceeds 1 Hour

**Solution:**
1. Check ODQMON for subscription status
2. Verify extraction schedule is running
3. Check for errors in extraction logs
4. If queue grows continuously, trigger full re-init

---

## Summary

ODP provides standard, batch-based extraction with flexible scheduling and multi-subscriber support. Key success factors:

1. **Choose provider:** CDS View (modern) or DataSource (standard)
2. **Enable ODP:** Add annotations or use RODPS_OS_EXPOSE
3. **Expose as OData:** Register in /IWFND/MAINT_SERVICE
4. **Configure full load:** On Demand trigger with field mapping
5. **Configure delta:** On Schedule with 15–60 minute frequency
6. **Monitor:** Use ODQMON for subscription health and delta lag
7. **Test:** Verify first delta returns 0 (expected behavior after init)

See the table-specific walkthroughs ([ACDOCA](/walkthrough/acdoca/), [VBAK](/walkthrough/vbak/), etc.) for ODP implementation examples.
