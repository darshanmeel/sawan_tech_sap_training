---
title: "OData Services Integration — Complete Setup Guide"
slug: odata-integration-guide
publishDate: 2026-04-23
readingTimeMinutes: 18
author: "SAP Extract Guide"
summary: "Expose SAP data via OData services. Gateway configuration, CDS binding, consumer setup, and REST-based data extraction."
seoTitle: "OData Integration Guide — REST-Based SAP Data Access"
seoDescription: "Setup OData services for SAP data extraction. SAP Gateway, OData consumers, HTTP authentication, delta extraction via REST."
updatedAt: 2026-04-23
---

## What is OData?

OData Services expose SAP data via HTTP/HTTPS REST endpoints. OData providers:
- CDS Views
- Standard DataSources
- BW queries

Target systems access via standard HTTP clients (AppFlow, ADF, Postman, curl, etc.).

**Key characteristics:**
- **Latency:** 15+ minutes (batch, on-schedule, HTTP overhead)
- **License requirement:** Runtime OK (no special license)
- **Target destinations:** Any system with HTTP/REST support
- **Method:** OData service endpoint with Basic Auth + pagination

---

## Prerequisites & Requirements

### SAP Infrastructure
- SAP Gateway system (NetWeaver or SAP Fiori)
- OData provider services exposed (CDS Views or DataSources)
- SAP Web Dispatcher or firewall access to Gateway port

### Client Infrastructure
- Client applications with HTTP/HTTPS support
- Network connectivity to SAP Gateway

### User & Permissions
- Web service user credentials (Gateway authentication)
- Table access for OData provider

---

## Part 1: Setup & Enablement Check

### Step 1: Expose ODP Provider as OData Service

Transaction: **/IWFND/MAINT_SERVICE**

Steps:
1. Access SAP Gateway
2. Search/Create service for your provider
3. Service Type: OData (V2 or V4)
4. Select Provider:
   - CDS View (e.g., Z_VBAK_EXTRACT)
   - Standard DataSource (2LIS_11_VAHDR)
   - BW query
5. Activate Service
6. Set Access Level: Public (if external access needed)

### Step 2: Register OData Service Metadata

Actions:
1. Service alias: `/sap/opu/odata/sap/2LIS_11_VAHDR_CDS`
2. Document service endpoint
3. Generate technical documentation
4. Create user documentation

### Step 3: Create Gateway User

Transaction: **SU01** (User Maintenance)

User Setup:
```
  - User type: System/Communication
  - Role: SAP_GATEWAY_USER
  - Assign: Table access for VBAK
  - Set password: Secure credentials
  - Enable: Service activation
```

### Step 4: Test OData Service

Steps:
1. Service URL: `http[s]://host:port/sap/opu/odata/sap/SERVICE_NAME`
2. Append: `/$metadata` (view service definition)
3. Append: `/ZMY_VBAK_SET` (view VBAK data sample)
4. Authenticate: Use Gateway user credentials
5. Verify: Returns XML/JSON data successfully

### Step 5: Verify OData Service is Enabled

**Check Service Registration:**
- Transaction: /IWFND/MAINT_SERVICE
- Search: Service name
- Verify: Status = "Active"

**Check Service Metadata:**
- URL: Service endpoint + `/$metadata`
- Verify: Returns valid XML schema
- Check: All VBAK fields included

**Test Service Access:**
- Use Tool: Postman or curl
- URL: Service endpoint/Entity
- Method: GET
- Auth: Gateway user credentials
- Expected: HTTP 200 with data

**Check Gateway User:**
- Transaction: SU01
- User: Gateway service user
- Verify: Active, password set, roles assigned

---

## Part 2: Configure Table Replication (VBAK Example)

### Step 1: Configure OData Consumer

In External System (e.g., Amazon AppFlow):

```
  1. Create new data source
  2. Type: SAP OData Service
  3. URL: https://[SAP_HOST]:port/sap/opu/odata/sap/2LIS_11_VAHDR_CDS
  4. Authentication:
     - Type: Basic Auth
     - Username: Gateway user
     - Password: User password
  5. Test connection
```

### Step 2: Configure Full Load Extraction

Extraction Settings:
```
  1. Entity: ZMY_VBAK_SET (VBAK data)
  2. Load Mode: Full Extract
  3. Fields to Extract:
     - VBELN (Sales Document Number)
     - POSNR (Item Number)
     - KUNNR (Customer Number)
     - ERDAT (Creation Date)
     - NETWR (Net Value)
     - WAERK (Currency)
     - (All required VBAK fields)
  4. Filter (optional): $filter=ERDAT ge '20260101'
  5. Pagination: $top=100000, $skip=0 (repeat for all records)
```

### Step 3: Configure Delta Load Extraction

Delta Settings:
```
  1. After initial full load completes
  2. Delta Detection: ODP change tokens
  3. Schedule: Every 15 minutes (minimum)
  4. Delta Query:
     - Include timestamp filter
     - Request only modified records
     - Use change data capture fields
  5. Target Merge: Upsert (update if exists, insert if new)
```

### Step 4: Start OData Extraction

Steps:
1. Trigger full load extraction
2. Monitor progress (typically 5–30 minutes for VBAK)
3. Verify all records received
4. Activate delta extraction schedule
5. Confirm delta data flowing

---

## OData Automatic Processes

### Phase 1: OData Full Load

**HTTP Request Pattern:**
```
GET /sap/opu/odata/sap/2LIS_11_VAHDR_CDS/ZMY_VBAK_SET
Headers:
  - Authorization: Basic [base64_credentials]
  - Accept: application/json
```

**SAP Response:**
```
  1. Returns first 10,000 records (default page size)
  2. Includes pagination token: __next or $skiptoken
  3. Consumer repeats request with token until completion
```

**Process:**
```
Page 1: Records 1–10,000
Page 2: Records 10,001–20,000 (using token)
Page N: Records until all extracted

Status: Initial load complete, delta token recorded
```

### Phase 2: OData Delta Load

**HTTP Request Pattern (Periodic - Every 15min):**
```
GET /sap/opu/odata/sap/2LIS_11_VAHDR_CDS/ZMY_VBAK_SET?$filter=LastModified gt 'timestamp'
```

**SAP Response:**
```
  1. Returns only records modified since timestamp
  2. Includes operation metadata:
     - ODQ_CHANGEMODE: 'C' (change) or 'D' (delete)
     - Last modified timestamp
     - Record version ID
```

**Process:**
```
  1. Consumer requests changes since last extraction
  2. SAP returns delta records with metadata
  3. Consumer applies changes:
     - Mode 'C': INSERT or UPDATE
     - Mode 'D': DELETE
  4. Consumer updates last extraction timestamp
  5. Wait 15 minutes, repeat
```

**Data Fields in Delta Response:**
```
  - All VBAK fields
  - ODQ_CHANGEMODE: Operation type
  - ODQ_ENTITYCNTR: Sequence number
  - Modification timestamp
```

---

## OData Response Structure

### Full Load Response Example

```json
{
  "d": {
    "results": [
      {
        "__metadata": {
          "uri": "http://host/...",
          "type": "I_SalesDocument"
        },
        "VBELN": "0000100001",
        "POSNR": "00010",
        "KUNNR": "100001",
        "ERDAT": "/Date(1704067200000)/",
        "NETWR": "1000.00",
        "WAERK": "USD",
        "ODQ_CHANGEMODE": "C",
        "ODQ_ENTITYCNTR": "12345"
      }
    ],
    "__next": "/sap/.../ZMY_VBAK_SET?$skiptoken=..."
  }
}
```

### Delta Processing Fields

**Standard OData Delta Fields:**

```
1. ODQ_CHANGEMODE (Operation indicator)
   - "C": Change (INSERT or UPDATE)
   - "D": Delete marker
   - "U": Update marker (alternative)

2. ODQ_ENTITYCNTR (Sequence counter)
   - Unique number per change
   - Helps order delta application
   - Prevents duplicate processing

3. Original VBAK Fields
   - All extracted fields present
   - For deletes: Only key fields + mode

4. Metadata
   - Modified timestamp
   - Record version ID (if available)
   - Source system indicator
```

---

## OData Monitoring

### Monitor Location: SAP Gateway

**Transaction: /IWFND/MAINT_SERVICE**
```
  1. Service status
  2. Service access logs
  3. Lookup failure/error counts
```

**Transaction: /IWFND/MONITOR_LOG**
```
  1. OData call logs
  2. Performance metrics
  3. Error details
```

### External System Monitoring

```
  1. Extraction job logs
  2. Data row counts
  3. Delta processing status
  4. Error rate monitoring
```

---

## Troubleshooting

### Issue: OData Service Returns HTTP 401 (Unauthorized)

**Solution:**
1. Verify Gateway user credentials
2. Check user is active in SU01
3. Confirm SAP_GATEWAY_USER role assigned
4. Verify table access authorization (S_TABU_DIS)
5. Test connection in /IWFND/MAINT_SERVICE

### Issue: OData Service Pagination Slow (High Latency)

**Solution:**
1. Increase $top parameter (current: 100,000)
2. Reduce filter complexity ($filter clause)
3. Ensure CDS view is optimized (check execution plan in RSA1)
4. Check SAP Gateway server CPU/memory
5. Run extraction during off-peak hours

### Issue: OData Service Returns "Service Not Found" (HTTP 404)

**Solution:**
1. Verify service URL syntax
2. Check service is activated in /IWFND/MAINT_SERVICE
3. Verify Gateway user has service access
4. Check SAP Gateway logs
5. Confirm service alias matches

---

## Summary

OData provides HTTP-based, REST-friendly data access with standard pagination and delta mechanisms. Key considerations:

1. **Expose OData service:** /IWFND/MAINT_SERVICE with CDS View or DataSource
2. **Create Gateway user:** SU01 with SAP_GATEWAY_USER role
3. **Test service:** Verify metadata and sample data access
4. **Configure consumer:** Full load with pagination, delta with timestamp
5. **Monitor:** Check service logs, verify HTTP status codes
6. **Performance:** HTTP overhead makes OData slower than native methods

OData is ideal for firewall-friendly, HTTP-based integrations with external systems.
