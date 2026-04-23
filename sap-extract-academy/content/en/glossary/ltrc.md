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

### What is LTRC?

**LTRC** (Landscape Transformation Replication Client) is the SAP GUI transaction code you execute on the **source SAP system** to configure and manage SLT (SAP Landscape Transformation) replication objects. It is the primary control point for defining what data SLT will replicate, how it will partition that data, which fields to include or exclude, and what filter conditions to apply. Think of `LTRC` as the "order form" for SLT replication: before any data moves, you use `LTRC` to tell the SLT framework exactly what you want.

Every SLT replication configuration begins in `LTRC`. You navigate there on the source SAP system, open the configuration for your SLT mass transfer ID, and add the tables or CDS views you want to replicate. Each object you add becomes a **replication object** — a named configuration record that persists in the SLT configuration tables and governs all future replication activity for that source object. The replication object holds settings that you define once and then leave running: table name, partitioning key, filter conditions, field-level exclusions, and the target connection reference.

### How it works

When you add a table to replication in `LTRC`, the SLT framework performs several setup steps automatically. First, it inspects the table's structure in the ABAP Data Dictionary to determine primary key fields, column types, and the presence of delta-relevant fields like `MANDT`. Second, it creates a **logging table** on the source system — a shadow table that database triggers will write to whenever a row in the source table changes. Third, it registers the replication object with the SLT Replication Server (`LTRS`), which will spawn reader processes to perform the initial full load and then switch to trigger-based delta replication.

The most important configuration decision you make in `LTRC` is **partitioning**. For large tables like `ACDOCA` or `BKPF`, replicating the entire table as a single unit forces SLT to use a single reader process — a sequential scan that can take days. By defining a partitioning key in `LTRC` (typically `BUKRS + GJAHR` for financial tables), you instruct SLT to split the full load into independent partitions. Each partition can then be assigned to a separate parallel reader process in `LTRS`. A table with 30 company codes and 5 active fiscal years produces up to 150 partitions, which 8 parallel readers can process in dramatically less time than a sequential approach.

### Why it matters for data extraction

`LTRC` is the configuration authority for SLT replication. Misconfiguration here cascades through the entire pipeline. Setting the wrong partition key — or none at all — turns an 8-hour full load into a 3-day sequential scan. Failing to apply a `MANDT` filter causes all clients' data to replicate, inflating data volumes and corrupting the target. Including deprecated or unused fields wastes bandwidth and storage. Every technical decision you make in `LTRC` has a direct impact on replication performance, data quality, and system load.

Field-level filtering in `LTRC` also matters for sensitive data governance. Some `ACDOCA` fields contain employee-related cost center postings or salary-related allocations that should not leave the SAP system in raw form. `LTRC` lets you exclude specific fields from replication, ensuring they never appear in the extracted data stream regardless of what the Kafka consumer or target warehouse schema expects. This is a cleaner control point than filtering at the consumer — the data simply does not travel over the wire.

### Common pitfalls

**Not setting a partition key on large tables** is the single most impactful configuration mistake in `LTRC`. Without partitioning, `LTRS` assigns the entire table to one reader, and the full load runtime for a billion-row table can be measured in days rather than hours. Always define a partitioning key when adding any table with more than roughly 10 million rows. For financial tables, `BUKRS + GJAHR` is the standard choice. For sales documents, `BUKRS + GJAHR` or `VKORG + GJAHR` may be appropriate.

**Forgetting to add a `MANDT` filter** in multi-client systems causes test or training client data to replicate alongside production data. `LTRC` filter conditions are the correct place to pin the replication to `MANDT = '100'` (or whatever the production client number is). Some SLT versions apply the connected client automatically, but this should always be verified explicitly in the `LTRC` filter condition settings — do not assume it.

**Activating replication for too many tables simultaneously** during initial setup creates a thundering-herd problem. Each new replication object immediately triggers a full load, and all of them compete for the limited parallel reader slots in `LTRS`. Introduce tables incrementally — start with the highest-priority tables, confirm their full loads complete and delta is stable, and then add the next batch.

### In practice

Setting up `ACDOCA` replication via SLT: navigate to `LTRC` on the source system, open the mass transfer ID for your target Kafka cluster, and add `ACDOCA` as a replication object. Set the partitioning key to `BUKRS + GJAHR`. Add a filter condition `MANDT = '100'`. Exclude the field `RASSC` (trading partner) if intercompany data should not be replicated. Save the replication object. Then move to `LTRS` to allocate 6 parallel readers to this mass transfer ID. Finally open `LTCO` to monitor the full-load progress by partition. Within hours, partitions begin completing and delta capture activates automatically for each finished partition — no manual intervention required once `LTRC` is correctly configured.
