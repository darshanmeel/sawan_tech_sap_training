-- Databricks · ACDOCA · Delta Lake
CREATE OR REPLACE TABLE sap_fi.acdoca (
  mandt     STRING NOT NULL,
  rbukrs    STRING NOT NULL,
  ryear     STRING NOT NULL,
  poper     STRING NOT NULL,
  belnr     STRING NOT NULL,
  wsl       DECIMAL(23, 2)
)
USING DELTA
PARTITIONED BY (ryear, rbukrs)
TBLPROPERTIES ('delta.autoOptimize.optimizeWrite' = 'true');