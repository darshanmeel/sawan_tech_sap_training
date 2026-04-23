-- Databricks · BKPF · Delta Lake
CREATE OR REPLACE TABLE sap_fi.bkpf (
  mandt     STRING NOT NULL,
  bukrs     STRING NOT NULL,
  belnr     STRING NOT NULL,
  gjahr     INT NOT NULL,
  blart     STRING,
  bldat     DATE,
  waers     STRING
)
USING DELTA
PARTITIONED BY (gjahr, bukrs)
TBLPROPERTIES ('delta.autoOptimize.optimizeWrite' = 'true');