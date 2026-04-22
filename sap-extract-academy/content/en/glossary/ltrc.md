---
term: LTRC
fullName: SLT Landscape Transformation Replication Client
slug: ltrc
shortDefinition: "LTRC is the SAP GUI transaction for SLT configuration on the source SAP system. You define replication objects, partitioning, filters, and field selections in LTRC; it's the control interface for SLT replication."
relatedTerms: [SLT, LTCO, LTRS, Replication Server, LTTR]
sapDocUrl: "https://help.sap.com/"
seoTitle: "LTRC: SLT Configuration Transaction — Plain Explanation"
seoDescription: "LTRC is the SAP GUI transaction for configuring SLT replication on source systems. Define objects, partitioning, and filters here."
updatedAt: 2026-04-22
---

LTRC (Landscape Transformation Replication Client) is the configuration interface for SLT on your source SAP system. When you set up ACDOCA replication via SLT, you navigate to LTRC, define a replication object for ACDOCA, set partitioning (BUKRS+GJAHR), choose full-load or delta mode, and monitor status. LTRC is where you configure *what* to replicate.

Think of LTRC as the "source side" of SLT: you're telling the source SAP "I want to replicate these tables with these settings." The counterpart on the target side is LTRS (the Replication Server, where the data actually goes), and LTCO is the monitoring transaction. In most expert walkthroughs, you'll start in LTRC to define the replication object, then LTRS to enable parallel readers, then LTCO to monitor progress.

LTRC walks you through table selection, field filtering, partitioning strategy (critical for large tables), and filter conditions. For ACDOCA, you partition by BUKRS+GJAHR to avoid hot partitions and enable parallelism. For BKPF, you might partition by BUKRS+GJAHR as well. LTRC is the first stop for any SLT replication setup.
