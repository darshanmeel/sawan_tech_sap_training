-- Microsoft Fabric Warehouse · MARA
-- Note: Fabric Warehouse uses clustered columnstore by default.
CREATE TABLE dbo.MARA (
  MANDT     VARCHAR(3) NOT NULL,
  MATNR     VARCHAR(40) NOT NULL,
  ERSDA     DATE,
  ERNAM     VARCHAR(12),
  MTART     VARCHAR(4),
  MATKL     VARCHAR(9),
  BRGEW     DECIMAL(13, 3),
  GEWEI     VARCHAR(3)
);
-- Primary key is informational in Fabric Warehouse; enforce at pipeline layer.