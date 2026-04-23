---
title: "SLT (SAP Landscape Transformation) — Complete Setup Guide"
slug: slt-setup-guide
publishDate: 2026-04-23
readingTimeMinutes: 25
author: "SAP Extract Guide"
summary: "Setup and configure SLT for real-time data replication. Full initial load + delta replication with sub-5-minute latency. Prerequisites, configuration, and monitoring."
relatedWalkthroughs:
  - slug: slt-setup
seoTitle: "SLT Setup Guide — Real-Time SAP Data Replication"
seoDescription: "Configure SAP Landscape Transformation (SLT) for real-time replication. LTRC, LTCO, LTRS transactions. Full load + delta with database triggers."
updatedAt: 2026-04-23
---

## What is SLT?

SAP Landscape Transformation (SLT) provides real-time data replication with sub-5-minute latency. It reads SAP tables directly, performs a full initial load, then captures changes via database triggers and replicates deltas in real-time.

**Key characteristics:**
- **Latency:** < 5 minutes (real-time)
- **License requirement:** Full Use (critical constraint)
- **Target destinations:** SAP HANA, ODP, cloud platforms, custom databases
- **Method:** Direct table read + database triggers + parallel jobs

---

## Prerequisites & Requirements

### Infrastructure
- SAP source system with DMIS (Data Migration Server) add-on installed
- SAP LT Replication Server (target system for SLT engine)
- Sufficient background and dialog work processes on both systems
- Network connectivity between source and SLT systems

### User & Permissions
- User role: **SAP_IUUC_REPL_ADMIN** (or equivalent)
- RFC user with appropriate table access authorizations
- Basis team access to configure parallel jobs and monitor work processes

### Licensing
- **Full Use license required** — this is non-negotiable
- Runtime licenses cannot use SLT
- Verify in transaction SLICENSE before designing

---

## Part 1: Setup & Enablement Check

### Step 1: Create RFC Connection (SLT to Source System)

Transaction: **SM59**

```
Action: Create RFC connection from SLT Replication Server to SAP source
Configuration:
  - Connection Type: 3 (ABAP to ABAP)
  - Target host: Source SAP system hostname
  - System number: Source SAP system number (e.g., 00)
  - Client: Source system client (e.g., 100)
  - User: Communication user with appropriate roles
  - Password: Secure password
  - Language: EN
```

**Verify:**
1. Select connection and click "Connection Test"
2. Click "Remote Logon Test"
3. Expect message: "Connection OK"

### Step 2: Open SLT Cockpit

Transaction: **LTRC** (Main SLT configuration interface)

This is where all SLT configurations are managed.

### Step 3: Create Configuration

Steps in LTRC:
1. Click "Create Configuration" or "New Configuration"
2. Specify Configuration Name (e.g., "VBAK_Production_Replication")
3. Specify Description
4. Select RFC Connection to source system (created in Step 1)
5. Specify Target System:
   - DB Connection (SAP HANA)
   - ODP / SAP Data Intelligence
   - Cloud platform connection
6. Define Transfer Settings:
   - Initial Load Mode: Performance Optimized
   - Data Transfer Jobs: 4–8 (adjust based on system capacity)
   - Initial Load Jobs: 4–8
   - Replication Mode: Real Time
7. Save (generates Mass Transfer ID)

### Step 4: Verify SLT Enablement

**Check BAdI Implementation:**
- Transaction: LTRC → Expert Functions tab
- Verify active ODP scenario implementations

**Verify Source System Connection:**
- Transaction: SM59
- Test the RFC connection
- Confirm connection status is active

**Check User Permissions:**
- Verify user has **SAP_IUUC_REPL_ADMIN** role
- Confirm necessary authorizations

**Verify Target System Availability:**
- Test target database/ODP connection
- Ensure sufficient storage space

---

## Part 2: Configure Table Replication (VBAK Example)

### Step 1: Navigate to Table Selection

Transaction: **LTRC**

1. Open existing configuration
2. Tab: "Table Overview" or "Data Provisioning"

### Step 2: Select Table

```
Actions:
  1. Click "Data Provisioning" button
  2. Enter Table Name: VBAK (Sales Document Header)
  3. Click "Add" or "Continue"
```

### Step 3: Configure Load Strategy

**Initial Load Settings:**
```
- Reading Type: 1 (Range Calculation)
- Parallel Read Jobs: 4–8 (coordinate with Basis)
- Package Size: 50,000 records (default)
- Commit Frequency: Every 100,000 records
```

**Delta Load Settings:**
```
- Replication Mode: Real Time
- Delta Retrieval Frequency: 5,000 records per batch
- Enable Logging Table: YES
```

### Step 4: Start Replication

```
Steps:
  1. Select "Start Replication (Including Initial Load)"
  2. Confirm the action
  3. Monitor begins in LTRC Data Transfer Monitor
```

---

## SLT Automatic Backend Processes

Once replication starts, SLT automatically:

### 1. Create Target Table Structure
- Generates VBAK table in destination
- Applies all field definitions
- Creates indexes and constraints

### 2. Create Logging Table in Source
```
Table Name Format: VBAK#0 (source system identifier)
Stores:
  - Key field values of changed rows
  - Change sequence
  - Operation type (INSERT/UPDATE/DELETE)
```

### 3. Create Database Triggers on VBAK
```
Triggers Created:
  - INSERT Trigger: Captures new sales documents
  - UPDATE Trigger: Captures modifications
  - DELETE Trigger: Captures deletions (if applicable)
  
Trigger Location: Source ABAP system
Trigger Type: Direct database triggers
```

### 4. Execute Full Initial Load
```
Process:
  1. Reads all existing VBAK records
  2. Transfers to target system
  3. Default batch: 50,000 records
  4. Validates data integrity
  5. Status in Monitor: "Replication (Initial Load)"
```

### 5. Begin Delta Replication
```
Process:
  1. Monitors logging table for changes
  2. Processes changes from logging table
  3. Retrieves 5,000 records per batch (default)
  4. Transfers deltas in real-time
  5. Status in Monitor: "Replication"
```

---

## SLT Monitoring

### Monitor Transaction: LTRC

**Data Transfer Monitor Tab:**
- Current status: "Replication" or "Initial Load"
- Records transferred
- Current processing record count
- Estimated time remaining

**Load Statistics Tab:**
- Total records transferred
- Time elapsed
- Records per second
- Performance metrics

### Alternative Monitor: LTRO

Transaction: **LTRO** (Global landscape monitoring)

Health checks:
- Master Job Check
- Connection Check
- Table Status Check
- Latency Check (delta lag)

### Work Process Monitoring: SM50

During replication, monitor work process utilization:
- Keep utilization < 80% to avoid impacting user transactions
- If saturation occurs, reduce parallel jobs

---

## Delta Load — Table Structure Details

### Logging Table Structure

```
Table Name: VBAK#0 (example)

Standard Columns:
  - SID: System identifier
  - TID: Trigger identifier (INSERT/UPDATE/DELETE)
  - TMSTMP: Timestamp of change
  - VBELN: Sales document number (key field)
  - POSNR: Item number (key field) if applicable
  - OPERAND: Type of operation

Change Type Values:
  - I: INSERT (new record)
  - U: UPDATE (modified record)
  - D: DELETE (deleted record)
```

### Delta Processing Flow

```
Phase 1: Initial Load
  VBAK Source → Read all records → Transfer to Target
  Status: "Initial Load" (in LTRC monitor)

Phase 2: Delta Replication
  VBAK Changes → Logging Table → SLT Reader → Target
  Batch Size: 5,000 records (default)
  Frequency: Real-time (on-trigger)
  Status: "Replication" (in LTRC monitor)

Phase 3: Monitoring
  SLT calculates delta lag
  Logs transferred records
  Reports completion status
```

---

## Troubleshooting

### Issue: SM50 Shows Work Process Saturation During Extraction

**Solution:**
1. Reduce number of parallel extraction connections
2. Limit to 3–4 concurrent partitions maximum
3. Queue remaining partitions to run sequentially after first batch completes
4. Run extractions outside peak transaction hours

### Issue: One Partition Fails While Others Succeed

**Solution:**
1. Table may have unusual volume for a specific partition
2. Re-run failed partition with smaller sub-partition
3. Add additional filter (e.g., BLART for document types)
4. Check ODQMON for specific subscription error message

### Issue: Delta Lag Exceeds 5 Minutes

**Solution:**
1. Increase parallel readers in LTRS
2. Reduce batch size in LTRC (current: 5,000)
3. Check logging table size in SE12 (may have grown too large)
4. Verify network connectivity between source and target

---

## Summary

SLT provides real-time replication with automatic full load + delta processing. Key success factors:

1. **Verify Full Use license before designing**
2. **Configure parallel readers based on system capacity** (avoid > 80% work process utilization)
3. **Monitor delta lag continuously** (should stay < 5 minutes)
4. **Test with subset of data first** before full production deployment
5. **Reconcile row counts after initial load** to verify data integrity

See the [SLT Setup Walkthrough](/walkthrough/slt-setup/) for step-by-step implementation.
