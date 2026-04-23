-- Databricks · ACDOCA · Delta Lake
CREATE OR REPLACE TABLE sap_fi.acdoca (
  mandt     STRING NOT NULL,
  rbukrs    STRING NOT NULL,
  ryear     INT NOT NULL,
  poper     INT NOT NULL,
  belnr     STRING NOT NULL,
  wsl       DECIMAL(23, 2)
)
USING DELTA
PARTITIONED BY (ryear, rbukrs)
TBLPROPERTIES ('delta.autoOptimize.optimizeWrite' = 'true');