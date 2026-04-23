-- Microsoft Fabric Warehouse · ACDOCA
-- Note: Fabric Warehouse uses clustered columnstore by default.
CREATE TABLE dbo.ACDOCA (
  MANDT     VARCHAR(3) NOT NULL,
  RBUKRS    VARCHAR(4) NOT NULL,
  RYEAR     SMALLINT NOT NULL,
  POPER     SMALLINT NOT NULL,
  BELNR     VARCHAR(10) NOT NULL,
  WSL       DECIMAL(23, 2)
);
-- Primary key is informational in Fabric Warehouse; enforce at pipeline layer.