-- Microsoft Fabric Warehouse · BKPF
-- Note: Fabric Warehouse uses clustered columnstore by default.
CREATE TABLE dbo.BKPF (
  MANDT     VARCHAR(3) NOT NULL,
  BUKRS     VARCHAR(4) NOT NULL,
  BELNR     VARCHAR(10) NOT NULL,
  GJAHR     VARCHAR(4) NOT NULL,
  BLART     VARCHAR(2),
  BLDAT     DATE,
  WAERS     VARCHAR(5)
);
-- Primary key is informational in Fabric Warehouse; enforce at pipeline layer.