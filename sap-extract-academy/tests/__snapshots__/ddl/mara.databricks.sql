-- Databricks · MARA · Delta Lake
CREATE OR REPLACE TABLE sap_mm.mara (
  mandt     STRING NOT NULL,
  matnr     STRING NOT NULL,
  ersda     DATE,
  ernam     STRING,
  mtart     STRING,
  matkl     STRING,
  brgew     DECIMAL(13, 3),
  gewei     STRING
)
USING DELTA
PARTITIONED BY (matnr)
TBLPROPERTIES ('delta.autoOptimize.optimizeWrite' = 'true');