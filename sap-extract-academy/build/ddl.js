// DDL generator — pure function, no side effects. Used at build time by
// directory-table.html rendering. DDL is NOT stored in YAML; it is derived from
// the column schema in each table's frontmatter.
//
// Signature:
//   generateDdl(dialect, tableName, columns, partitionKeys) -> string
//
// dialect: 'snowflake' | 'databricks' | 'fabric'
// tableName: the SAP table name as UPPERCASE, e.g. 'ACDOCA'
// columns: [{ name, type, length, key, ... }]
// partitionKeys: [string]   (column names used for clustering / partitioning)
//
// Unknown ABAP types fall back to VARCHAR/STRING rather than throwing, so that
// the build never fails on a type we haven't mapped yet.

// ---------------------------------------------------------------------------
// Type mapping per dialect.
//
// Source: directory-brief.md §"DDL section" and the reference mockup
// docs/design/directory-final.html (Snowflake/Databricks/Fabric panes).
//
// Each mapper receives (length, decimals) and returns a dialect-specific type
// literal (upper-case keyword + optional precision).
// ---------------------------------------------------------------------------

const FALLBACK_SNOWFLAKE = (len) => `VARCHAR(${len || 255})`;
const FALLBACK_DATABRICKS = () => 'STRING';
const FALLBACK_FABRIC = (len) => `VARCHAR(${len || 255})`;

const SNOWFLAKE_MAP = {
  CHAR: (len) => `VARCHAR(${len || 1})`,
  SSTR: (len) => `VARCHAR(${len || 1})`,
  STRG: () => 'VARCHAR',
  STRING: (len) => (len ? `VARCHAR(${len})` : 'VARCHAR'),
  LCHR: (len) => `VARCHAR(${len || 255})`,
  RAW: (len) => `BINARY(${len || 1})`,
  LRAW: () => 'BINARY',
  CLNT: (len) => `VARCHAR(${len || 3})`,
  CUKY: (len) => `VARCHAR(${len || 5})`,
  UNIT: (len) => `VARCHAR(${len || 3})`,
  LANG: (len) => `VARCHAR(${len || 1})`,
  NUMC: (len) => `VARCHAR(${len || 10})`, // Preserve leading zeros (e.g. BUKRS '0001' ≠ 1)
  INT1: () => 'NUMBER(3)',
  INT2: () => 'NUMBER(5)',
  INT4: () => 'NUMBER(10)',
  INT8: () => 'NUMBER(19)',
  DEC: (len, dec) => `NUMBER(${len || 15}, ${dec || 2})`,
  QUAN: (len, dec) => `NUMBER(${len || 15}, ${dec || 3})`,
  CURR: (len, dec) => `NUMBER(${len || 15}, ${dec || 2})`,
  FLTP: () => 'FLOAT',
  DATS: () => 'DATE',
  TIMS: () => 'TIME',
  TIMN: () => 'TIME',
  TIMESTAMP: () => 'TIMESTAMP_NTZ',
  TZNTSTMPS: () => 'TIMESTAMP_NTZ',
  TZNTSTMPL: () => 'TIMESTAMP_NTZ'
};

const DATABRICKS_MAP = {
  CHAR: () => 'STRING',
  SSTR: () => 'STRING',
  STRG: () => 'STRING',
  STRING: () => 'STRING',
  LCHR: () => 'STRING',
  RAW: () => 'BINARY',
  LRAW: () => 'BINARY',
  CLNT: () => 'STRING',
  CUKY: () => 'STRING',
  UNIT: () => 'STRING',
  LANG: () => 'STRING',
  NUMC: () => 'STRING', // NUMC is a numeric string (e.g. '0001'), must remain STRING to preserve leading zeros
  INT1: () => 'TINYINT',
  INT2: () => 'SMALLINT',
  INT4: () => 'INT',
  INT8: () => 'BIGINT',
  DEC: (len, dec) => `DECIMAL(${len || 15}, ${dec || 2})`,
  QUAN: (len, dec) => `DECIMAL(${len || 15}, ${dec || 3})`,
  CURR: (len, dec) => `DECIMAL(${len || 15}, ${dec || 2})`,
  FLTP: () => 'DOUBLE',
  DATS: () => 'DATE',
  TIMS: () => 'STRING',
  TIMN: () => 'STRING',
  TIMESTAMP: () => 'TIMESTAMP',
  TZNTSTMPS: () => 'TIMESTAMP',
  TZNTSTMPL: () => 'TIMESTAMP'
};

const FALLBACK_BIGQUERY = () => 'STRING';

const BIGQUERY_MAP = {
  CHAR: () => 'STRING',
  SSTR: () => 'STRING',
  STRG: () => 'STRING',
  STRING: () => 'STRING',
  LCHR: () => 'STRING',
  RAW: () => 'BYTES',
  LRAW: () => 'BYTES',
  CLNT: () => 'STRING',
  CUKY: () => 'STRING',
  UNIT: () => 'STRING',
  LANG: () => 'STRING',
  NUMC: () => 'STRING', // Preserve leading zeros (e.g. BUKRS '0001')
  INT1: () => 'INT64',
  INT2: () => 'INT64',
  INT4: () => 'INT64',
  INT8: () => 'INT64',
  DEC: (len, dec) => `NUMERIC(${len || 15}, ${dec || 2})`,
  QUAN: (len, dec) => `NUMERIC(${len || 15}, ${dec || 3})`,
  CURR: (len, dec) => `NUMERIC(${len || 15}, ${dec || 2})`,
  FLTP: () => 'FLOAT64',
  DATS: () => 'DATE',
  TIMS: () => 'TIME',
  TIMN: () => 'TIME',
  TIMESTAMP: () => 'TIMESTAMP',
  TZNTSTMPS: () => 'TIMESTAMP',
  TZNTSTMPL: () => 'TIMESTAMP'
};

const FABRIC_MAP = {
  CHAR: (len) => `VARCHAR(${len || 1})`,
  SSTR: (len) => `VARCHAR(${len || 1})`,
  STRG: () => 'VARCHAR(MAX)',
  STRING: (len) => (len ? `VARCHAR(${len})` : 'VARCHAR(MAX)'),
  LCHR: (len) => `VARCHAR(${len || 255})`,
  RAW: (len) => `VARBINARY(${len || 1})`,
  LRAW: () => 'VARBINARY(MAX)',
  CLNT: (len) => `VARCHAR(${len || 3})`,
  CUKY: (len) => `VARCHAR(${len || 5})`,
  UNIT: (len) => `VARCHAR(${len || 3})`,
  LANG: (len) => `VARCHAR(${len || 1})`,
  NUMC: (len) => `VARCHAR(${len || 10})`, // Preserve leading zeros
  INT1: () => 'SMALLINT',
  INT2: () => 'SMALLINT',
  INT4: () => 'INT',
  INT8: () => 'BIGINT',
  DEC: (len, dec) => `DECIMAL(${len || 15}, ${dec || 2})`,
  QUAN: (len, dec) => `DECIMAL(${len || 15}, ${dec || 3})`,
  CURR: (len, dec) => `DECIMAL(${len || 15}, ${dec || 2})`,
  FLTP: () => 'FLOAT',
  DATS: () => 'DATE',
  TIMS: () => 'TIME',
  TIMN: () => 'TIME',
  TIMESTAMP: () => 'DATETIME2',
  TZNTSTMPS: () => 'DATETIME2',
  TZNTSTMPL: () => 'DATETIME2'
};

const DIALECTS = {
  snowflake: { map: SNOWFLAKE_MAP, fallback: FALLBACK_SNOWFLAKE },
  databricks: { map: DATABRICKS_MAP, fallback: FALLBACK_DATABRICKS },
  fabric: { map: FABRIC_MAP, fallback: FALLBACK_FABRIC },
  bigquery: { map: BIGQUERY_MAP, fallback: FALLBACK_BIGQUERY }
};

function normalizeType(t) {
  if (!t) return '';
  return String(t).trim().toUpperCase();
}

// Reject any identifier (table, column, schema, module) that isn't a plain
// alphanumeric/underscore SQL identifier. This closes the DDL injection hole
// where a malicious YAML `module: "FI'; DROP TABLE USERS; --"` would otherwise
// interpolate straight into the CREATE TABLE statement. SAP identifiers are
// always uppercase ASCII by convention, so this is zero-cost for real content.
const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

function assertIdent(value, label) {
  if (typeof value !== 'string' || !IDENT_RE.test(value)) {
    throw new Error(
      `Invalid SQL identifier in ${label}: ${JSON.stringify(value)}. ` +
      `Must match /^[A-Za-z_][A-Za-z0-9_]*$/.`
    );
  }
  return value;
}

function mapType(dialect, type, length, decimals) {
  const d = DIALECTS[dialect];
  if (!d) throw new Error(`Unknown DDL dialect: ${dialect}`);
  const key = normalizeType(type);
  const fn = d.map[key];
  if (fn) return fn(length, decimals);
  return d.fallback(length);
}

// Pad column name into a fixed-width column for readability in the emitted SQL.
function padRight(s, width) {
  s = String(s);
  if (s.length >= width) return s + ' ';
  return s + ' '.repeat(width - s.length);
}

function keyColumns(columns) {
  return columns.filter((c) => c.key).map((c) => c.name);
}

// ---------------------------------------------------------------------------
// Snowflake — uppercase identifiers, SAP_<MODULE>.<TABLE>, CLUSTER BY
// ---------------------------------------------------------------------------
function generateSnowflake(tableName, columns, partitionKeys, module) {
  const TABLE = String(tableName).toUpperCase();
  const schema = `SAP_${String(module || 'COMMON').toUpperCase()}`;
  const lines = [];
  lines.push(`-- Snowflake · ${TABLE} · generated from column schema`);
  lines.push(`CREATE OR REPLACE TABLE ${schema}.${TABLE} (`);

  const nameWidth = Math.max(8, ...columns.map((c) => c.name.length)) + 2;
  const body = columns.map((col) => {
    const type = mapType('snowflake', col.type, col.length, col.decimals);
    const notNull = col.key ? ' NOT NULL' : '';
    return `  ${padRight(col.name.toUpperCase(), nameWidth)}${type}${notNull}`;
  });
  const keys = keyColumns(columns);
  if (keys.length) {
    body.push(
      `  CONSTRAINT PK_${TABLE} PRIMARY KEY (${keys
        .map((k) => k.toUpperCase())
        .join(', ')})`
    );
  }
  lines.push(body.join(',\n'));
  const cluster = (partitionKeys && partitionKeys.length ? partitionKeys : keys)
    .map((k) => k.toUpperCase())
    .join(', ');
  if (cluster) {
    lines.push(')');
    lines.push(`CLUSTER BY (${cluster});`);
  } else {
    lines.push(');');
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Databricks — lowercase identifiers, sap_<module>.<table>, USING DELTA
// ---------------------------------------------------------------------------
function generateDatabricks(tableName, columns, partitionKeys, module) {
  const table = String(tableName).toLowerCase();
  const schema = `sap_${String(module || 'common').toLowerCase()}`;
  const lines = [];
  lines.push(`-- Databricks · ${tableName.toUpperCase()} · Delta Lake`);
  lines.push(`CREATE OR REPLACE TABLE ${schema}.${table} (`);

  const nameWidth = Math.max(8, ...columns.map((c) => c.name.length)) + 2;
  const body = columns.map((col) => {
    const type = mapType('databricks', col.type, col.length, col.decimals);
    const notNull = col.key ? ' NOT NULL' : '';
    return `  ${padRight(col.name.toLowerCase(), nameWidth)}${type}${notNull}`;
  });
  lines.push(body.join(',\n'));
  lines.push(')');
  lines.push('USING DELTA');
  const parts = (partitionKeys && partitionKeys.length
    ? partitionKeys
    : keyColumns(columns)
  ).map((k) => k.toLowerCase());
  if (parts.length) {
    lines.push(`PARTITIONED BY (${parts.join(', ')})`);
  }
  lines.push(
    "TBLPROPERTIES ('delta.autoOptimize.optimizeWrite' = 'true');"
  );
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Fabric — dbo schema, clustered columnstore (implicit), no partitioning
// ---------------------------------------------------------------------------
function generateFabric(tableName, columns /* , partitionKeys, module */) {
  const TABLE = String(tableName).toUpperCase();
  const lines = [];
  lines.push(`-- Microsoft Fabric Warehouse · ${TABLE}`);
  lines.push('-- Note: Fabric Warehouse uses clustered columnstore by default.');
  lines.push(`CREATE TABLE dbo.${TABLE} (`);

  const nameWidth = Math.max(8, ...columns.map((c) => c.name.length)) + 2;
  const body = columns.map((col) => {
    const type = mapType('fabric', col.type, col.length, col.decimals);
    const notNull = col.key ? ' NOT NULL' : '';
    return `  ${padRight(col.name.toUpperCase(), nameWidth)}${type}${notNull}`;
  });
  lines.push(body.join(',\n'));
  lines.push(');');
  lines.push(
    '-- Primary key is informational in Fabric Warehouse; enforce at pipeline layer.'
  );
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// BigQuery — lowercase identifiers, sap_<module>.<table>, PARTITION BY + CLUSTER BY
// ---------------------------------------------------------------------------
function generateBigQuery(tableName, columns, partitionKeys, module) {
  const table = String(tableName).toLowerCase();
  const schema = `sap_${String(module || 'common').toLowerCase()}`;
  const lines = [];
  lines.push(`-- BigQuery · ${tableName.toUpperCase()}`);
  lines.push(`CREATE TABLE IF NOT EXISTS ${schema}.${table} (`);

  const nameWidth = Math.max(8, ...columns.map((c) => c.name.length)) + 2;
  const body = columns.map((col) => {
    const type = mapType('bigquery', col.type, col.length, col.decimals);
    const notNull = col.key ? ' NOT NULL' : '';
    return `  ${padRight(col.name.toLowerCase(), nameWidth)}${type}${notNull}`;
  });
  lines.push(body.join(',\n'));
  lines.push(')');

  const keys = (partitionKeys && partitionKeys.length
    ? partitionKeys
    : keyColumns(columns)
  ).map((k) => k.toLowerCase());

  // BigQuery: PARTITION BY accepts one column (prefer a date or int), CLUSTER BY up to 4.
  const dateCol = columns.find((c) => ['DATS', 'TIMESTAMP'].includes(normalizeType(c.type)));
  if (dateCol) {
    lines.push(`PARTITION BY ${dateCol.name.toLowerCase()}`);
  } else if (keys.length > 0) {
    lines.push(`-- PARTITION BY requires DATE/TIMESTAMP/INT64 — consider adding extraction_date`);
  }
  if (keys.length > 0) {
    lines.push(`CLUSTER BY ${keys.slice(0, 4).join(', ')};`);
  } else {
    lines.push(';');
  }
  return lines.join('\n');
}

/**
 * Generate paste-ready CREATE TABLE DDL for the given dialect.
 *
 * @param {'snowflake'|'databricks'|'fabric'|'bigquery'} dialect
 * @param {string} tableName            e.g. 'ACDOCA'
 * @param {Array}  columns              each: { name, type, length, decimals?, key? }
 * @param {Array}  partitionKeys        column names for CLUSTER BY / PARTITIONED BY
 * @param {object} [opts]
 * @param {string} [opts.module]        module code, e.g. 'FI' → schema SAP_FI
 * @returns {string}
 */
export function generateDdl(
  dialect,
  tableName,
  columns,
  partitionKeys,
  opts = {}
) {
  if (!tableName) throw new Error('generateDdl: tableName is required');
  if (!Array.isArray(columns) || columns.length === 0) {
    throw new Error(`generateDdl: columns must be a non-empty array (table ${tableName})`);
  }
  // Validate every identifier that will be interpolated into DDL. Fail fast at
  // build time rather than generating broken / injection-prone SQL.
  assertIdent(tableName, 'tableName');
  const module = opts.module;
  if (module) assertIdent(module, 'opts.module');
  for (const c of columns) assertIdent(c.name, `column name (table ${tableName})`);
  const keys = Array.isArray(partitionKeys) ? partitionKeys : [];
  for (const k of keys) assertIdent(k, `partitionKey (table ${tableName})`);
  switch (dialect) {
    case 'snowflake':
      return generateSnowflake(tableName, columns, keys, module);
    case 'databricks':
      return generateDatabricks(tableName, columns, keys, module);
    case 'fabric':
      return generateFabric(tableName, columns, keys, module);
    case 'bigquery':
      return generateBigQuery(tableName, columns, keys, module);
    default:
      throw new Error(`generateDdl: unknown dialect "${dialect}"`);
  }
}

export default generateDdl;
