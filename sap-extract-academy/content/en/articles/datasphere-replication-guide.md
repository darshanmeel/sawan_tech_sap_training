---
title: "SAP Datasphere Replication Flows — Complete Setup Guide"
slug: datasphere-replication-guide
publishDate: 2026-04-23
readingTimeMinutes: 22
author: "SAP Extract Guide"
summary: "Configure SAP Datasphere for real-time and incremental data replication. Cloud Connector, replication flows, Resilient Data Buffer, and delta mechanics."
seoTitle: "Datasphere Replication Guide — Cloud-Native SAP Data Integration"
seoDescription: "Setup SAP Datasphere replication flows from on-premise S/4HANA. Cloud Connector, CDS views, Resilient Data Buffer, CDC integration."
updatedAt: 2026-04-23
---

## What is SAP Datasphere?

SAP Datasphere is a cloud-native analytics platform that replicates data from on-premise SAP systems via Replication Flows. It uses the Resilient Data Buffer (RDB) framework for change data capture.

**Key characteristics:**
- **Latency:** 1–60 minutes (configurable, CDC-based)
- **License requirement:** SAP Datasphere subscription (cloud)
- **Target destinations:** Datasphere native tables, external cloud (HANA Cloud, BigQuery, Snowflake, etc.)
- **Method:** Cloud Connector + RFC + RDB for CDC

---

## Prerequisites & Requirements

### Cloud Infrastructure
- SAP Datasphere subscription (cloud-based)
- Access to Datasphere administrator console

### On-Premise Infrastructure
- SAP Cloud Connector (installed on-premise)
- S/4HANA 2021 or later (source system)

### RFC Resources
- DHAMB_: Data Hub ABAP Module
- DHAPE_: Data Hub ABAP Process Engine
- RFC_FUNCTION_SEARCH: RFC lookup

### User & Permissions
- User with Datasphere admin rights
- RFC user on source S/4HANA system
- Basis team access to configure RFC

---

## Part 1: Setup & Enablement Check

### Step 1: Install and Configure Cloud Connector

SAP Cloud Connector Setup:
```
Location: Download from SAP Launchpad

Installation:
  1. Install on on-premise network DMZ/internal network
  2. Configure Cloud Connector to reach Datasphere
  3. Configure RFC protocol resources

Required Resources:
  - DHAMB_: Data Hub ABAP Module
  - DHAPE_: Data Hub ABAP Process Engine
  - RFC_FUNCTION_SEARCH: RFC lookup

Configuration:
  Cloud Connector Settings:
    - Region: Your Datasphere region
    - Subaccount: Datasphere subaccount
    - Region Host: Datasphere region endpoint
    - Certificate: Client certificate
    - Logon User: Cloud Connector service user
```

### Step 2: Create Connection in SAP Datasphere

Transaction/UI: **SAP Datasphere**

Steps:
```
  1. Navigate: Connections → New Connection
  2. Connection Type: SAP S/4HANA On-Premise (or SAP ABAP)
  3. Connection Details:
     - Name: (e.g., "PROD_S4_Connection")
     - Cloud Connector: Select configured connector
     - System ID: Source SAP system ID
     - System Client: Client to replicate from
     - System Number: Source system number
     - Logon Language: EN
  4. Authentication:
     - User: RFC user account
     - Password: RFC user password
     - Test Connection (should succeed)
  5. Validate: "Replication flows are enabled"
  6. Save connection
```

### Step 3: Verify CDS View Configuration (If Using CDS)

For CDS View-based Replication:

**CDS View Definition (in S/4HANA):**

```
define view ZC_VBAK_EXTRACT
@Analytics.dataExtraction.enabled: true
@Analytics.dataExtraction.delta.changeDataCapture: true
@Analytics.dataExtraction.delta.changeDataCapture.automatic: true
as select from vbak {
  key vbak.vbeln,
  vbak.posnr,
  vbak.kunnr,
  vbak.erdat,
  vbak.netwr,
  ...
}
```

**Annotation Check:**
```
  - @Analytics.dataExtraction.enabled: YES
  - @Analytics.dataExtraction.delta.changeDataCapture: YES
  - @Analytics.dataExtraction.delta.changeDataCapture.automatic: YES
```

### Step 4: Enable Resilient Data Buffer (RDB)

**Configuration in S/4HANA Source System:**

Steps:
```
  1. Transaction: /1DH/SETUP (Data Hub setup)
  2. Initialize Resilient Data Buffer framework
  3. Configure RFC user permissions for RDB
  4. Set buffer table parameters
  5. Schedule observer job: /1DH/OBSERVE_LOGTAB
     - Frequency: Every 30 minutes
     - Purpose: Push changes to RDB buffers
```

### Step 5: Verify Datasphere Replication is Enabled

**Check Cloud Connector Status:**
- Cloud Connector UI: `https://localhost:8443`
- Verify: Connected to Datasphere region
- Check: All RFC resources configured

**Check Datasphere Connection:**
- Datasphere UI: Connections → Your connection
- Test: Test connection button
- Verify: "Connection successful"
- Confirm: "Replication flows enabled" message

**Check CDS View Annotations:**
- S/4HANA: Transaction SE11
- CDS View: Your extraction view
- Verify: All required annotations present

**Check RDB Initialization:**
- Transaction: /1DH/SETUP
- Verify: RDB framework is active
- Check: Observer job scheduled
- Confirm: Buffer tables created

**Validate via Test Extraction:**
- Datasphere: Create test replication flow
- Select: VBAK or test CDS view
- Run: Test extraction
- Verify: Data retrieved successfully

---

## Part 2: Configure Table Replication (VBAK Example)

### Step 1: Create Replication Flow

SAP Datasphere UI:

```
Steps:
  1. Navigate: Data Builder → New Object → Replication Flow
  2. Flow Name: (e.g., "VBAK_Replication_Flow")
  3. Flow Description: Sales Document Header replication
  4. Source Connection: Select S/4HANA connection (configured in Part 1)
```

### Step 2: Select Source Object

**Source Selection:**

Option 1: Direct Table (Recommended)
```
  - Container: CDS_EXTRACTION or SLT_EXTRACTION
  - Object Type: CDS View
  - Object Name: C_SALESDOCUMENTITEMDEX_1
    (SAP standard view for VBAK data)
  OR
  - Object Name: ZC_VBAK_EXTRACT (custom CDS view)
```

Option 2: SLT Table (If using SLT as source)
```
  - Container: SLT_EXTRACTION
  - Object Type: Table
  - Object Name: VBAK (if replicated via SLT)
```

### Step 3: Configure Load Strategy

**Load Configuration:**

Initial Load Settings:
```
  - Load Type: "Initial and Delta"
  - Initial Load Mode: "Full Load"
  - Transfer Size: 100,000 records per batch
  - Parallel Processes: 4
  - Commit Strategy: Every 50,000 records
```

Delta Load Settings:
```
  - Enable: "Incremental Updates" (Initial and Delta)
  - Delta Mode: "Automatic CDC" (Resilient Data Buffer)
  - Delta Frequency: Every 60 minutes (default, adjustable)
  - Handle Deletes: Yes
```

### Step 4: Configure Target Container

Target Selection:

```
Steps:
  1. Target Container: (e.g., "SALES_DATA" or "VBAK_TARGET")
  2. Create New Table: Yes (Datasphere will create target table)
  3. Table Name: VBAK or C_VBAK_REPL
  4. Schema: Auto-mapped from source CDS view
```

Target Capabilities:
```
  - Datasphere native table (in-memory column-store)
  - Supports delta processing automatically
  - Real-time analytics-ready structure
```

### Step 5: Configure Field Mapping

**Field Mapping:**

```
VBAK Source Fields → Target Fields:
  - VBELN → VBELN (Sales Document Number)
  - POSNR → POSNR (Item Number)
  - KUNNR → KUNNR (Customer)
  - ERDAT → ERDAT (Creation Date)
  - EDERZ → EDERZ (Last Change Date)
  - NETWR → NETWR (Net Value)
  - WAERK → WAERK (Currency)
  - (Auto-mapped for all fields in CDS view)
```

System Fields Added Automatically:
```
  - operation_flag: I/U/D (Insert/Update/Delete)
  - recordstamp: Timestamp of change
  - is_deleted: Boolean for soft deletes
```

### Step 6: Deploy and Run Replication Flow

**Deployment:**

```
Steps:
  1. Click "Deploy" to validate flow
  2. Fix any validation errors
  3. Click "Run" to start replication
```

**Execution:**
```
  - Initial Load starts automatically
  - Monitor progress in Execution tab
  - Status: "Running" → "Completed"
```

**Delta Activation:**
```
  - After initial load completes
  - Status: "Monitoring for changes"
  - Delta job runs at configured frequency (60min default)
```

---

## Datasphere Automatic Processes

### Phase 1: Initial Load (Full VBAK Data)

**Triggered Automatically:**

```
Sequence:
  1. Datasphere calls Cloud Connector
  2. Cloud Connector executes RFC to S/4HANA
  3. S/4HANA reads VBAK via CDS view
  4. Parallel read jobs: 4 (configurable)
  5. Batch size: 100,000 records per package
```

**Data Flow:**
```
S/4HANA VBAK → CDS View → RFC → Cloud Connector → 
Datasphere Network → Target Container
```

**Target Table Creation:**
```
  - Datasphere creates target table automatically
  - Column structure: Matches CDS view schema
  - Adds system columns:
    * operation_flag (for delta tracking)
    * recordstamp (change timestamp)
    * is_deleted (deletion indicator)
```

**Data Loading:**
```
  - Batch 1: Records 1–100,000
  - Batch 2: Records 100,001–200,000
  - ... continues until all records loaded
```

Status: "Replication → Initial Load" (visible in monitor)

### Phase 2: Delta Replication (Ongoing Changes)

**Triggered by Resilient Data Buffer (RDB) Framework:**

```
Sequence:
  1. Database Triggers on VBAK capture changes:
     - INSERT: Logged with operation='I'
     - UPDATE: Logged with operation='U'
     - DELETE: Logged with operation='D'

  2. Master Logging Table (in S/4HANA)
     - Stores changed VBAK records
     - Records all I/U/D operations

  3. Observer Job (/1DH/OBSERVE_LOGTAB)
     - Runs every 30 minutes (configurable)
     - Reads master logging table
     - Pushes changes to subscriber buffers (RDB)

  4. Replication Flow Delta Job
     - Runs every 60 minutes (configurable)
     - Calls RDB via RFC
     - Retrieves change records from RDB buffer
     - Groups changes by operation type

  5. Datasphere applies changes:
     - INSERT: Add new row to target table
     - UPDATE: Merge into existing row
     - DELETE: Mark with is_deleted=TRUE or remove row
     - Updates operation_flag and recordstamp
```

**Sequence Maintenance:**
```
  - Observer job ensures order
  - Buffer tracks sequence numbers
  - Delta job applies in sequence order
  - Prevents out-of-order updates
```

---

## Delta Load — Target Table Structure

### RDB (Resilient Data Buffer) Structure

**Changes Captured in Master Logging Table:**

```
For each VBAK change:
  - VBELN: Sales document number
  - POSNR: Item number
  - OPERATION: Type of change
    * I = INSERT (new VBAK record)
    * U = UPDATE (modified VBAK record)
    * D = DELETE (removed VBAK record)
  - TIMESTAMP: When change occurred
  - All other VBAK fields (for INSERT/UPDATE)
  - For DELETE: Only key fields populated

Buffer Table Structure:
  - Observer pushes changes to:
    * Subscriber buffer (for each system subscribed)
    * Indexed by: Sequence number, VBELN, POSNR
    * Contains: Changes pending pickup
```

### Target Table in Datasphere

**VBAK Target Table Columns:**

Original VBAK Columns:
```
  - VBELN, POSNR, KUNNR, ERDAT, EDERZ, NETWR, WAERK, ...
```

System-Added Columns for Delta Processing:
```
  - operation_flag (CHAR 1)
    * 'I' = Insert
    * 'U' = Update
    * 'D' = Delete (soft delete, row remains)

  - recordstamp (TIMESTAMP)
    * Date/time of the change
    * Allows temporal queries

  - is_deleted (BOOLEAN)
    * TRUE = Row marked for deletion
    * FALSE = Row is active
    * Enables soft-delete reporting
```

---

## Datasphere Monitoring

### Monitor in SAP Datasphere

**Replication Flow Details:**

1. **Status Dashboard**
   - Current status: Running/Idle/Error
   - Last successful run: Timestamp
   - Next scheduled run: Timestamp
   - Records processed: Total count

2. **Execution History**
   - All run attempts: Timestamp, duration, row count
   - Error logs: If any failures
   - Performance metrics: Rows per second

3. **Data Integration Monitor**
   - All active replication flows
   - Cumulative load status
   - Delta pipeline status
   - System resource usage

### Monitor in S/4HANA Source System

**Transaction: /1DH/RSDBMON** (RDB Monitor)
```
  - RDB buffer table sizes
  - Number of active subscribers
  - Pending change count
  - Observer job schedule and last run
```

**Transaction: DHCDCMON** (CDC Monitor)
```
  - CDC listener status
  - Active change streams
  - Change rate (records/minute)
  - Any CDC errors
```

### Health Metrics

```
Monitor:
  - Delta lag: <1 hour (should be minimal)
  - Observer job: Should complete within schedule
  - RDB buffer: Should not continuously grow
  - Datasphere flow: Should complete in minutes
```

---

## Troubleshooting

### Issue: Cloud Connector Connection Fails

**Solution:**
1. Verify Cloud Connector is installed and running
2. Check connection to Datasphere region
3. Verify RFC resources (DHAMB_, DHAPE_) configured
4. Check network connectivity between on-premise and cloud
5. Review Cloud Connector logs

### Issue: RDB (Resilient Data Buffer) Framework Not Initialized

**Solution:**
1. Transaction: /1DH/SETUP on source S/4HANA
2. Initialize RDB framework
3. Configure RFC user permissions
4. Schedule observer job: /1DH/OBSERVE_LOGTAB
5. Verify RDB tables created in database

### Issue: Delta Lag Exceeds Expected Frequency

**Solution:**
1. Check observer job execution in /1DH/RSDBMON
2. Verify RDB buffer table is not growing indefinitely
3. Increase delta flow frequency (currently 60 min)
4. Check for errors in Datasphere execution history
5. Monitor RFC resource availability

---

## Summary

SAP Datasphere provides cloud-native, managed replication with automatic full load + delta processing via RDB. Key success factors:

1. **Infrastructure:** Install Cloud Connector on-premise
2. **Connection:** Create Datasphere connection to S/4HANA
3. **CDS Views:** Enable with delta annotations
4. **RDB:** Initialize Resilient Data Buffer framework
5. **Replication Flows:** Configure in Datasphere UI
6. **Monitoring:** Check flow status, RDB health, observer jobs
7. **Testing:** Validate with test extractions before production

Datasphere is ideal for enterprises already using SAP Cloud ecosystem and seeking managed, serverless analytics infrastructure.
