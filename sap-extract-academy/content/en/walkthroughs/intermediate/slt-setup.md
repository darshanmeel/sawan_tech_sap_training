---
table: SLT
slug: slt-setup
title: "SAP Landscape Transformation (SLT) Setup & Configuration"
summary: "Infrastructure guide for setting up SLT from scratch. Covers RFC connection creation, SLT Replication Server enablement, mass transfer configuration, and initial load verification. Foundation for all SLT-based table replication."
estimatedMinutes: 120
prerequisites:
  - "SAP Basis team access (Super User or DDIC authority)"
  - "Network connectivity between source SAP ERP, SLT system, and target database/Kafka"
  - "Source SAP system: S/4HANA 2020+ or ECC with DMIS add-on"
  - "RFC users with SAP_IUUC_REPL_ADMIN authorization"
licenseRelevance: "SLT requires Full Use license on source SAP system. License trap: Runtime vs Full Use →"
destinations:
  - "SAP HANA"
  - "Kafka"
  - "SQL Server"
  - "PostgreSQL"
  - "Cloud (S3, BigQuery via SAP Data Intelligence)"
extractors:
  - SLT
method: slt
seoTitle: "SAP Landscape Transformation (SLT) Setup & Configuration — Basis Guide"
seoDescription: "Infrastructure guide for SLT setup. RFC connections, mass transfer configuration, replication server enablement, parallel readers tuning."
steps:
  - id: step-01
    title: "Verify Full Use license on source SAP system"
    explanation: "SLT reads tables directly, bypassing application-layer authorization checks. SAP policy restricts this to Full Use licenses. Contact your SAP Account Executive to confirm Full Use is active on the ERP system where you plan to extract tables. Runtime-only systems cannot use SLT."
    sapTransaction:
      code: SLICENSE
      menuPath: "System → Status → License check"
      helpUrl: "https://help.sap.com/"
    verify: "License display shows 'Full Use' for your SAP system. Document the license agreement number for audit compliance."
    whyItMatters: "Running SLT without Full Use license creates legal risk. SAP conducts license audits and charges penalty fees for unlicensed SLT usage."

  - id: step-02
    title: "Create RFC connection from SLT Replication Server to source ERP"
    explanation: "SLT runs on a dedicated SAP system (SLT Replication Server). It connects to the source ERP via RFC. In the SLT system, open SM59 and create a new ABAP-to-ABAP RFC connection to the source ERP. Use a dedicated communication user (not a dialog user) with restricted permissions."
    sapTransaction:
      code: SM59
      menuPath: "RFC Destinations → ABAP Connections → Create → Connection Type 3"
      helpUrl: "https://help.sap.com/"
    codeBlock:
      language: text
      content: |
        Connection Name:       PROD_ERP (e.g., "PROD_ERP_SLT")
        Connection Type:       3 (ABAP to ABAP)
        Description:           SLT extraction connection to production ERP
        Target Host:           erp-prod.company.com
        System Number:         00
        Client:                100
        Logon User:            SLT_RFC_USER (dedicated communication user)
        Password:              (secure password)
        Language:              EN
        Gateway Host:          (same as target host)
        Gateway Service:       sapgw00
        Query Timeout:         600 seconds
      caption: "Example RFC connection parameters for SLT-to-ERP communication"
    verify: "RFC connection created. Test the connection: SM59 → Select connection → Connection Test → 'OK'. Remote Logon Test also succeeds."

  - id: step-03
    title: "Create SLT communication user with minimal required authorizations"
    explanation: "The RFC user must have S_RFC, S_TABU_DIS (for table access), and SAP_IUUC_REPL_ADMIN authorizations. Do NOT use SUPER or DDIC. Create a restricted communication user (System type) with only the minimum required roles."
    sapTransaction:
      code: SU01
      menuPath: "User Maintenance → Create User → System Type"
      helpUrl: "https://help.sap.com/"
    codeBlock:
      language: text
      content: |
        Username:              SLT_RFC_USER
        User Type:             System (communication user)
        Name:                  SLT Replication Service Account
        Password:              (auto-generated, use passwordless auth if available)
        
        Assigned Roles:
        1. SAP_IUUC_REPL_ADMIN (core SLT administration)
        2. SAP_USER (basic system access)
        
        Authorization Objects (if custom role):
        - S_RFC: *
        - S_TABU_DIS: Table name: *, Access: 03 (Display)
        - S_DEVELOP: Program: *, Authority: 01
      caption: "SLT RFC user configuration with minimal authorizations"
    verify: "User SLT_RFC_USER created. Login test in SM59 with RFC connection succeeds. No SUPER or DDIC role assigned."

  - id: step-04
    title: "Verify DMIS add-on installed on source ERP"
    explanation: "SLT requires the DMIS (Data Migration Server) add-on on the source ERP. This add-on provides the extraction libraries that SLT calls. Check the installed component list in SPAM/SAINT or contact your Basis team to confirm DMIS is installed and active."
    sapTransaction:
      code: SPAM
      menuPath: "Support Packages → Installed Components → Search: DMIS"
      helpUrl: "https://help.sap.com/"
    verify: "DMIS component appears in the installed component list with a current support package version. If missing, your Basis team must install DMIS before SLT can function."

  - id: step-05
    title: "Access SLT Replication Server and open LTRC transaction"
    explanation: "Navigate to the SLT system (not the ERP). Open transaction LTRC (SLT Cockpit). This is the central configuration interface for all SLT replication jobs. If LTRC is not available, your user lacks SAP_IUUC_REPL_ADMIN authorization or the SLT add-in is not installed on this system."
    sapTransaction:
      code: LTRC
      menuPath: "SLT Cockpit"
      helpUrl: "https://help.sap.com/"
    verify: "LTRC opens without authorization error. You see the Mass Transfer overview screen."
    whyItMatters: "LTRC is where all SLT configuration and monitoring happens. If it fails to open, SLT infrastructure is not ready and no replication is possible."

  - id: step-06
    title: "Create Mass Transfer in LTRC for your first replication"
    explanation: "In LTRC, create a new Mass Transfer. A mass transfer is a logical grouping of one or more tables that replicate together. Provide a descriptive name (e.g., 'FINANCE_ACCT_EXTRACT'), select the RFC connection to your source ERP, and specify the target system (HANA database, Kafka topic, cloud storage, etc.)."
    sapTransaction:
      code: LTRC
      menuPath: "LTRC → New → Mass Transfer → Fill: Name, Source RFC Connection, Target System"
      helpUrl: "https://help.sap.com/"
    codeBlock:
      language: text
      content: |
        Mass Transfer Name:    FINANCE_ACCT_EXTRACT
        Description:           Finance accounting data replication to data warehouse
        Source System:         PROD_ERP_SLT (RFC connection from step 02)
        Source Client:         100
        Target System Type:    SAP HANA Database (or Kafka / Cloud Storage)
        Target DB Connection:  HANA_DW (pre-configured HANA connection)
        Transfer Mode:         Delta (real-time) or Batch (scheduled)
        Initial Load Mode:     Performance Optimized (parallel bulk load)
      caption: "Mass Transfer configuration example"
    verify: "Mass Transfer created with a unique MT ID (e.g., MT0001). Status shows 'Initial' — ready for table configuration."

  - id: step-07
    title: "Configure Data Transfer Jobs (parallel readers)"
    explanation: "SLT reads source tables in parallel using background jobs. Configure the number of parallel Data Transfer Jobs in your mass transfer settings. Start with 4 jobs. Each job can process one partition independently. Monitor source system load (SM50) to ensure background jobs don't exceed 70% utilization."
    sapTransaction:
      code: LTRC
      menuPath: "Mass Transfer → Advanced Settings → Data Transfer Jobs: 4"
      helpUrl: "https://help.sap.com/"
    codeBlock:
      language: text
      content: |
        Data Transfer Jobs:        4 (parallel readers)
        Initial Load Jobs:         4 (parallel loaders for full load)
        Batch Size (records):      50,000 (package size per RFC call)
        Retry Count:               3
        RFC Timeout (seconds):     600
        Commit Frequency:          Every 100,000 records
      caption: "SLT parallel job configuration for balanced load"
    verify: "Mass Transfer settings updated. SM50 on source ERP can accommodate 4 dialog processes without exceeding 70% utilization during extraction."

  - id: step-08
    title: "Enable delta replication (real-time triggers)"
    explanation: "SLT creates database triggers on source tables to capture changes. When INSERT/UPDATE/DELETE occurs, the trigger logs the change to a logging table (e.g., VBAK#0 for VBAK). Enable delta replication in your mass transfer settings so SLT automatically applies these triggers when the initial load starts."
    sapTransaction:
      code: LTRC
      menuPath: "Mass Transfer → Replication Settings → Enable: Trigger-Based Delta"
      helpUrl: "https://help.sap.com/"
    verify: "Delta replication setting shows 'Enabled'. Replication mode configured as 'Real Time' or 'Scheduled' (depending on your latency needs)."
    whyItMatters: "Without delta triggers, every replication is a full load — consuming system resources repeatedly. Triggers enable efficient change-data-capture, reducing load to only changed records."

  - id: step-09
    title: "Test RFC connection and mass transfer activation"
    explanation: "Before running your first real replication, test the mass transfer configuration. In LTRC, select your mass transfer and click 'Test Connection' or 'Activate' with a small test table. SLT will attempt to read a sample of rows from the source and write them to the target. If the test fails, review the error log (LTRC → Logs) and fix connection or authorization issues."
    sapTransaction:
      code: LTRC
      menuPath: "Mass Transfer → Test Connection"
      helpUrl: "https://help.sap.com/"
    verify: "Test execution completes with 'Success' status. A small set of test records appears in the target system."

  - id: step-10
    title: "Monitor mass transfer execution in LTCO"
    explanation: "After activation, use transaction LTCO (Replication Monitor) to track progress. LTCO shows: current status (Initial Load / Replication / Error), records transferred, transfer rate (rows per second), per-partition status, and any failed partitions. For large tables, the initial load may take hours or days — monitor LTCO periodically to ensure steady progress."
    sapTransaction:
      code: LTCO
      menuPath: "Replication Monitor → Mass Transfer Overview"
      helpUrl: "https://help.sap.com/"
    verify: "LTCO displays your mass transfer with status 'Running' or 'In Progress'. Transfer rate shows consistent throughput. No partitions in ERROR state."

  - id: step-11
    title: "Verify database triggers were created on source system"
    explanation: "After initial load completes, SLT creates database triggers on each replicated table. Verify they exist by checking the source ERP. Open SE11 (Data Dictionary), display your replicated table (e.g., VBAK), and navigate to the Triggers tab. You should see INSERT, UPDATE, and DELETE triggers created by SLT."
    sapTransaction:
      code: SE11
      menuPath: "Data Dictionary → Database Tables → VBAK (example) → Display → Triggers Tab"
      helpUrl: "https://help.sap.com/"
    verify: "Triggers appear in the Triggers list: INSERT trigger, UPDATE trigger, DELETE trigger. Each trigger name includes SLT/LTRAN identifier."

  - id: step-12
    title: "Set up monitoring and alerting for SLT replication lag"
    explanation: "SLT delta replication should keep the lag (time between a change in the source and its appearance in the target) below a few minutes for most tables. Configure monitoring: in LTCO, set up a custom report or use the Replication Dashboard to track pending changes in the logging tables. Set alerts if lag exceeds acceptable thresholds (e.g., 15 minutes)."
    sapTransaction:
      code: LTCO
      menuPath: "Replication Dashboard → Configure Alerts → Lag Threshold"
      helpUrl: "https://help.sap.com/"
    verify: "Monitoring dashboard shows current replication lag. Lag alert is configured and will notify Basis/DBA if lag exceeds threshold."

troubleshooting:
  - problem: "RFC connection test fails with 'Connection refused'"
    solution: "Verify the target host is reachable. Check firewall rules between SLT system and source ERP. Confirm gateway service (sapgw00) is running on the source. Test connectivity: ping erp-prod.company.com, and verify gateway port 3300 is open."

  - problem: "LTRC shows 'Authorization Error' when opening mass transfer"
    solution: "Your user lacks SAP_IUUC_REPL_ADMIN role. Contact your Basis team to assign the role to your user. Alternatively, the SLT add-in may not be installed on this system."

  - problem: "Initial load runs very slowly (< 1K rows/second)"
    solution: "Check SM50 on the source ERP. If background jobs are waiting, increase available background work processes. If network is saturated, reduce parallel jobs (from 4 to 2). Check database statistics on source — poor index design can slow table scans."
    sapNoteUrl: "https://support.sap.com/notes/1975899"

  - problem: "Triggers not created after initial load"
    solution: "Delta replication may be disabled in mass transfer settings. Open LTRC → Mass Transfer → check 'Enable Trigger-Based Delta' is checked. Also verify the source system's database supports triggers (most do, but custom databases may not)."

nextSteps:
  - label: "Extract ACDOCA via SLT — Expert guide"
    url: "/walkthrough/acdoca/"
  - label: "Replication methods comparison — SLT vs ODP vs RFC"
    url: "/articles/sap-data-replication-methods/"
  - label: "License trap: Runtime vs Full Use"
    url: "/articles/runtime-vs-full-use/"
updatedAt: 2026-04-23
---

## Scenario

Your company needs to set up SAP Landscape Transformation (SLT) as the foundation for extracting large transactional tables like ACDOCA, BKPF, and VBAK to your data warehouse. Before you can extract any specific table, the SLT infrastructure must be configured: RFC connection to the source ERP, replication server enablement, and mass transfer setup. This walkthrough covers the one-time setup required.

Estimated time: 2 hours (including tests and monitoring).

---

## What you have confirmed

You have verified your system has a Full Use license, created a dedicated SLT RFC user with restricted permissions, configured an RFC connection from SLT system to source ERP, created a mass transfer with parallel job settings, and tested basic replication. The SLT infrastructure is now ready to replicate tables. All subsequent table-specific walkthroughs (ACDOCA, BKPF, VBAK, etc.) build on this foundation: you select the table, add partitioning keys, and start the replication.

---

## Key Concepts

**Mass Transfer**: A logical grouping of one or more tables that replicate together. Each mass transfer has its own configuration, job settings, and target system.

**Parallel Jobs**: SLT reads multiple table partitions simultaneously using background jobs. More jobs = faster initial load, but higher source system load.

**Delta Replication**: After the initial load, SLT creates database triggers that capture INSERT/UPDATE/DELETE changes and replicate them to the target in near real-time.

**Logging Tables**: SLT stores change records in logging tables (e.g., VBAK#0 for VBAK) before transferring them to the target. These tables can grow large if delta is not consumed regularly.

**Partition Keys**: For very large tables (e.g., ACDOCA), SLT can partition the initial load by selected key fields (RBUKRS + GJAHR for ACDOCA). Each partition is processed independently.
