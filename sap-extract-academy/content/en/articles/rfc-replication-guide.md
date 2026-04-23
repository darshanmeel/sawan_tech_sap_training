---
title: "RFC-Based Replication — Complete Setup Guide"
slug: rfc-replication-guide
publishDate: 2026-04-23
readingTimeMinutes: 18
author: "SAP Extract Guide"
summary: "Configure RFC-based replication for SAP data extraction. Direct table reads via RFC function modules with logging table delta capture."
seoTitle: "RFC Replication Guide — Legacy & Custom Integration"
seoDescription: "Setup RFC-based data replication. SM59 connections, RFC authorizations, logging tables, and delta processing."
updatedAt: 2026-04-23
---

## What is RFC Replication?

RFC (Remote Function Call) based replication reads SAP tables directly via RFC function modules. It supports full loads and incremental deltas through database logging tables and triggers.

**Key characteristics:**
- **Latency:** 1–5 minutes (batch, on-schedule)
- **License requirement:** Runtime OK (no special license)
- **Use case:** Internal SAP-to-SAP connections, legacy systems, SLT infrastructure
- **Method:** RFC function calls + logging table monitoring

**⚠️ Important Policy Note:**
- SAP policy restricts native ODP RFC modules for third-party use
- RFC still required for SLT-based replication
- For third-party applications, use ODP or SLT instead

---

## Prerequisites & Requirements

### SAP System
- SAP source system with RFC modules active
- SAP target system or SLT Replication Server

### Infrastructure
- Network connectivity and firewall rules configured for RFC
- Sufficient dialog and batch work processes

### User & Permissions
- RFC user with appropriate authorizations
- S_DEVELOP, S_TABU_DIS, S_RFC authorization objects

---

## Part 1: Setup & Enablement Check

### Step 1: Create RFC Connection

Transaction: **SM59**

```
Connection Details:
  - Connection Name: (e.g., "PROD_VBAK_RFC")
  - Connection Type: 3 (ABAP to ABAP)
  - Target Host: Source SAP system hostname
  - System Number: Source system number (e.g., 00)
  - Client: Source client (e.g., 100)
  - Logon User: Dedicated RFC user
  - Password: Secure RFC user password
  - Language: EN
  - Query Timeout: 600 seconds
```

### Step 2: Test RFC Connection

Transaction: **SM59**

Actions:
1. Select your new RFC connection
2. Click "Connection Test"
3. Click "Remote Logon Test"
4. Verify: "Connection OK" message
5. Check: User permissions sufficient

### Step 3: Authorize RFC User

Transaction: **SU01** (User maintenance)

SAP Authorization Objects Needed:
```
  - S_DEVELOP: Table access for extraction
  - S_TABU_DIS: Table access (e.g., VBAK full access)
  - RFC1: RFC call permission
  - S_RFC: RFC function module execution
```

Steps:
1. Select RFC user account
2. Assign roles:
   - SAP_USER (basic)
   - Z_RFC_VBAK_ACCESS (custom role for VBAK extraction, if applicable)
3. Save and confirm

### Step 4: Configure RFC for Replication

If using SLT, configure RFC in:

Transaction: **LTRC** (SLT Cockpit)

Steps:
1. Create new configuration
2. Specify RFC Connection (created in Step 1)
3. Configure target destination
4. Enable RFC data transfer option
5. Set RFC timeouts appropriately
6. Save configuration

### Step 5: Verify RFC Enablement

**Check RFC Connection Status:**
- Transaction: SM59
- Select connection
- Click "Connection Test"
- Verify: Green light = Connection OK

**Verify RFC User Authorizations:**
- Transaction: SU01
- User: RFC user
- Check: Required object access
- Verify: S_TABU_DIS for target table

**Check Network Connectivity:**
- Transaction: SM59
- Connection test should pass
- If fails: Check firewall, routing, hostname resolution

**Verify RFC Configuration (If Using SLT):**
- Transaction: LTRC
- Open configuration
- Verify: RFC connection selected
- Test: Configuration activation

---

## Part 2: Configure Table Replication (VBAK Example)

### Step 1: Initiate RFC Data Extraction

**Process Overview:**
```
SLT sends RFC calls to source system
Source system returns VBAK data
RFC stream delivers data to target
```

### Step 2: Configure Full Load Transfer

In SLT Configuration (LTRC):
```
  1. Select VBAK table in Data Provisioning
  2. Set "Initial Load Mode": Performance Optimized
  3. Set RFC Transfer Parameters:
     - Data Transfer Jobs: 4
     - Package Size: 50,000 records
     - RFC Timeout: 600 seconds
     - Retry Count: 3
  4. Select "Start Replication (Including Initial Load)"
```

### Step 3: Configure Delta Load Transfer

**RFC Delta Mechanism:**
```
  1. After initial load completes
  2. SLT monitors logging table via RFC calls
  3. Retrieves delta batches periodically
  4. Sends updates through RFC interface
  5. Frequency: Default every 5,000 records
```

### Step 4: Start Replication

Steps:
1. Transaction: LTRC
2. Select configuration with RFC connection
3. Table: VBAK
4. Click "Start Replication (Including Initial Load)"
5. Monitor in "Data Transfer Monitor" tab

---

## RFC Automatic Processes

### Phase 1: RFC Initial Load

**Sequence:**
```
  1. SLT constructs RFC function calls
  2. Calls SM59 connection to source system
  3. Source system reads VBAK table in parallel
  4. Data packaged in 50,000-record batches
  5. RFC transfer sends each batch to target
  6. Target writes received data to database
  7. Acknowledgment sent back via RFC
  8. Process repeats until all records transferred
```

**Performance:**
- Parallel RFC calls: 4 (default)
- Package size: 50,000 (adjustable)
- Network bandwidth: Critical factor
- Typical speed: 100K–500K records/minute

### Phase 2: RFC Delta Load

**Sequence:**
```
  1. Source system maintains logging table (VBAK#0)
  2. SLT queries logging table via RFC
  3. Retrieves batch of deltas (5,000 records)
  4. Identifies change type (INSERT/UPDATE/DELETE)
  5. Sends delta batch via RFC to target
  6. Target applies changes (INSERT/UPDATE/DELETE)
  7. Process marks records as processed
  8. Repeat every 1–5 minutes (configurable)
```

**Change Detection:**
```
  - Triggers track INSERT/UPDATE/DELETE
  - Logging table stores key fields + operation type
  - RFC queries identify unprocessed changes
  - Batch retrieval prevents network congestion
```

---

## RFC Delta Load — Table Structure Details

### RFC Transfer Protocol for VBAK

**Initial Load RFC Call:**
```
Function: REPL_DATA_READ (internal SLT function)
Parameters:
  - Object Name: VBAK
  - Start Key: (empty for first call)
  - Read Mode: RANGE_CALC (parallel read)
  - Package Size: 50000

Returns:
  - Data rows (VBAK records)
  - End key (position in table)
  - End-of-file indicator
```

**Delta Load RFC Call:**
```
Function: REPL_LOG_READ (reads logging table)
Parameters:
  - Object Name: VBAK
  - Logging Table: VBAK#0
  - Last Processed Record: (sequence number)

Returns:
  - Changed records (key + operation type)
  - Record count
  - New sequence number
```

### Logging Table Referenced by RFC

**Table: VBAK#0** (in source system)

```
Fields Transferred via RFC:
  - VBELN: Sales document number (key)
  - POSNR: Item number (key)
  - OPERATION: Type of change
    * I = INSERT
    * U = UPDATE
    * D = DELETE
  - TMSTMP: Timestamp of change
  - SOURCE_RECORD_ID: Internal SLT record ID
```

**RFC Transfer Pattern:**
```
  1. Query: SELECT from VBAK#0 WHERE processed = 0
  2. RFC sends batch of unprocessed changes
  3. Each change identifies the VBAK record affected
  4. Target system applies the change
  5. SLT marks records as processed (via RFC update)
  6. Next RFC query retrieves remaining changes
```

---

## RFC Monitoring

### Monitor Transaction: LTRC

**Monitoring Elements:**

1. **Data Transfer Monitor**
   - RFC call status (Success/Error)
   - Records transferred per RFC batch
   - RFC timeout occurrences
   - Network error counts

2. **RFC Connection Status**
   - Transaction: SM59
   - View RFC connection state
   - Check last successful call
   - Monitor error logs

3. **Logging Table Status**
   - Transaction: SE12
   - View VBAK#0 table
   - Check row count (unprocessed changes)
   - Monitor table growth

---

## Troubleshooting

### Issue: RFC Connection Test Fails

**Solution:**
1. Verify network connectivity (ping SAP host)
2. Check firewall rules for RFC port (typically 3200 + system number)
3. Verify hostname resolution
4. Confirm user credentials in RFC connection
5. Check SM59 gateway logs for error details

### Issue: RFC Timeout During Full Load

**Solution:**
1. Reduce package size in LTRC (current: 50,000)
2. Reduce parallel RFC jobs (current: 4)
3. Increase RFC timeout in SM59 (current: 600 sec)
4. Check SAP application server CPU/memory utilization
5. Run during off-peak hours

### Issue: Delta Lag Exceeds Expected Time

**Solution:**
1. Check logging table size in SE12 (VBAK#0)
2. Verify RFC delta retrieval frequency setting
3. Check network latency between systems
4. Monitor RFC dialog availability in SM50
5. Increase parallel jobs if available

---

## Summary

RFC-based replication is suitable for SAP-to-SAP connections and SLT infrastructure. Key considerations:

1. **Policy:** SAP restricts native ODP RFC for third-party use
2. **Setup:** Create RFC connection, authorize user, configure in LTRC (if using SLT)
3. **Performance:** Parallel jobs and package size directly impact throughput
4. **Monitoring:** Use LTRC monitor, check RFC status in SM59, monitor logging table in SE12
5. **Delta:** Logging table captures changes; RFC retrieves periodically

For third-party applications, use ODP or SLT instead of raw RFC.
