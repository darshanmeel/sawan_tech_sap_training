/**
 * Lightweight schema validator for directory table frontmatter.
 *
 * Separate from build.js so Worker B can import it when they wire the
 * `directoryTable` pageType. No runtime deps — callers pass in already-parsed
 * gray-matter `data`.
 *
 * Contract (see `docs/directory-brief.md` §"Content model" and
 * `DIRECTORY_NOTES.md` §5):
 *   - Required fields: slug, name, title, mode, module
 *   - mode ∈ {both, s4-only, ecc-only}
 *   - columns[] with columns_total (when table has column data)
 *   - extract_methods[] drawn from canonical set
 *   - scope_lock (single string/prose)
 *   - notes[] with date/headline
 *   - ingestion_guidance {snowflake, databricks, fabric, *_docs_url} when mode != ecc-only-stub
 *   - For `mode: both`: every primary content field has a `_ecc` sibling
 *     (warn, non-fatal if missing)
 *   - Primary-key column must be declared with `key: true` on at least one column
 *
 * The validator returns `{ errors: string[], warnings: string[] }`. Callers
 * (build.js, tests) decide whether to fail the build on errors.
 */

const VALID_MODES = new Set(['both', 's4-only', 'ecc-only']);

const VALID_EXTRACT_METHOD_IDS = new Set([
  'odp-cds',
  'slt',
  'cds-direct',
  'rfc',
  'bw-bridge',
  'bw-extractor'
]);

const VALID_LICENSE = new Set(['runtime', 'full', 'bw-bridge']);
const VALID_LATENCY = new Set(['batch', 'realtime']);
const VALID_VOLUME = new Set(['any', 'small', 'large']);

// Fields with an `_ecc` parallel for mode: both tables.
const ECC_PARALLEL_FIELDS = [
  'description_one_liner',
  'scope_lock',
  'columns',
  'columns_total',
  'extract_methods',
  'notes',
  'ingestion_guidance'
];

// Required top-level fields for every non-stub directory table page.
const REQUIRED_TOP_LEVEL = [
  'slug',
  'name',
  'title',
  'mode',
  'module'
];

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isArray(v) {
  return Array.isArray(v);
}

function isObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function validateColumn(col, ctx, errors) {
  if (!isObject(col)) {
    errors.push(`${ctx}: column entry is not an object`);
    return;
  }
  if (!isNonEmptyString(col.name)) {
    errors.push(`${ctx}: column is missing "name"`);
  }
  if (!isNonEmptyString(col.type)) {
    errors.push(`${ctx}: column "${col.name || '(unnamed)'}" is missing "type"`);
  }
  // length, key, source, description are nice-to-have but required for
  // consistency with the brief. Missing `description` is a hard error because
  // the directory exists to explain fields.
  if (!isNonEmptyString(col.description)) {
    errors.push(`${ctx}: column "${col.name || '(unnamed)'}" is missing "description"`);
  }
}

function validateExtractMethod(m, ctx, errors) {
  if (!isObject(m)) {
    errors.push(`${ctx}: extract_method entry is not an object`);
    return;
  }
  if (!isNonEmptyString(m.id) || !VALID_EXTRACT_METHOD_IDS.has(m.id)) {
    errors.push(
      `${ctx}: extract_method.id "${m.id}" is not in the canonical set ` +
      `[${[...VALID_EXTRACT_METHOD_IDS].join(', ')}]`
    );
  }
  if (!isNonEmptyString(m.name)) {
    errors.push(`${ctx}: extract_method "${m.id || '(no id)'}" is missing "name"`);
  }
  if (!isNonEmptyString(m.tagline)) {
    errors.push(`${ctx}: extract_method "${m.id || '(no id)'}" is missing "tagline"`);
  }
  if (m.license !== undefined && !VALID_LICENSE.has(m.license)) {
    errors.push(
      `${ctx}: extract_method "${m.id}" has invalid license "${m.license}" ` +
      `(expected one of ${[...VALID_LICENSE].join(', ')})`
    );
  }
  if (m.latency !== undefined && !VALID_LATENCY.has(m.latency)) {
    errors.push(
      `${ctx}: extract_method "${m.id}" has invalid latency "${m.latency}"`
    );
  }
  if (m.volume !== undefined && !VALID_VOLUME.has(m.volume)) {
    errors.push(
      `${ctx}: extract_method "${m.id}" has invalid volume "${m.volume}"`
    );
  }
  if (!isNonEmptyString(m.body_markdown)) {
    errors.push(`${ctx}: extract_method "${m.id}" is missing body_markdown`);
  }
}

function validateNote(n, ctx, errors) {
  if (!isObject(n)) {
    errors.push(`${ctx}: note entry is not an object`);
    return;
  }
  if (!isNonEmptyString(n.date)) {
    errors.push(`${ctx}: note is missing "date"`);
  } else if (!/^\d{4}-\d{2}$/.test(n.date)) {
    errors.push(`${ctx}: note.date "${n.date}" must be YYYY-MM`);
  }
  if (!isNonEmptyString(n.headline)) {
    errors.push(`${ctx}: note is missing "headline"`);
  }
  if (!isNonEmptyString(n.body_markdown)) {
    errors.push(`${ctx}: note is missing "body_markdown"`);
  }
}

function validateIngestion(g, ctx, errors) {
  if (!isObject(g)) {
    errors.push(`${ctx}: ingestion_guidance is not an object`);
    return;
  }
  for (const dialect of ['snowflake', 'databricks', 'fabric']) {
    if (!isNonEmptyString(g[dialect])) {
      errors.push(`${ctx}: ingestion_guidance.${dialect} is missing or empty`);
    }
    const urlKey = `${dialect}_docs_url`;
    if (!isNonEmptyString(g[urlKey])) {
      errors.push(`${ctx}: ingestion_guidance.${urlKey} is missing`);
    }
  }
}

/**
 * Validate a single directory-table frontmatter `data` object.
 * @param {object} data  — gray-matter parsed frontmatter
 * @param {string} filePath — source path, used only for error labels
 * @returns {{errors: string[], warnings: string[]}}
 */
export default function validateDirectoryTable(data, filePath = '<unknown>') {
  const errors = [];
  const warnings = [];
  const ctx = filePath;

  if (!isObject(data)) {
    return { errors: [`${ctx}: frontmatter is empty or not an object`], warnings };
  }

  // --- Required top-level fields --------------------------------------------
  for (const field of REQUIRED_TOP_LEVEL) {
    if (!isNonEmptyString(data[field])) {
      errors.push(`${ctx}: required field "${field}" is missing`);
    }
  }

  // --- mode enum ------------------------------------------------------------
  if (isNonEmptyString(data.mode) && !VALID_MODES.has(data.mode)) {
    errors.push(
      `${ctx}: mode "${data.mode}" must be one of [${[...VALID_MODES].join(', ')}]`
    );
  }

  // --- ECC stubs are minimal: only require slug/name/title/mode/module ------
  // The brief allows stubs (COEP, GLT0) for cross-mode redirects. A stub is
  // any `mode: ecc-only` file that lacks `columns` — we detect that and skip
  // deep validation.
  const isEccStub = data.mode === 'ecc-only' && !isArray(data.columns);
  if (isEccStub) {
    // Stubs still need a `stub: true` marker so intent is explicit.
    if (data.stub !== true) {
      warnings.push(
        `${ctx}: mode=ecc-only table has no columns — if this is an intentional ` +
        `stub, add "stub: true" to the frontmatter`
      );
    }
    return { errors, warnings };
  }

  // --- columns / columns_total ---------------------------------------------
  if (!isArray(data.columns)) {
    errors.push(`${ctx}: "columns" must be an array`);
  } else {
    if (data.columns.length === 0) {
      errors.push(`${ctx}: "columns" is empty — seed at least the primary key`);
    }
    const hasKey = data.columns.some(c => isObject(c) && c.key === true);
    if (!hasKey) {
      errors.push(`${ctx}: at least one column must have key: true`);
    }
    data.columns.forEach((c, i) => {
      validateColumn(c, `${ctx}: columns[${i}]`, errors);
    });
  }

  if (typeof data.columns_total !== 'number' || data.columns_total < 1) {
    errors.push(`${ctx}: "columns_total" must be a positive integer`);
  } else if (
    isArray(data.columns) &&
    data.columns.length > data.columns_total
  ) {
    errors.push(
      `${ctx}: columns_total (${data.columns_total}) < columns.length ` +
      `(${data.columns.length}) — that can't be right`
    );
  }

  // --- scope_lock -----------------------------------------------------------
  if (!isNonEmptyString(data.scope_lock)) {
    errors.push(`${ctx}: "scope_lock" (one-sentence rule) is required`);
  }

  // --- description_one_liner ------------------------------------------------
  if (!isNonEmptyString(data.description_one_liner)) {
    errors.push(`${ctx}: "description_one_liner" is required`);
  }

  // --- extract_methods ------------------------------------------------------
  if (!isArray(data.extract_methods)) {
    errors.push(`${ctx}: "extract_methods" must be an array`);
  } else {
    if (data.extract_methods.length < 3 || data.extract_methods.length > 5) {
      errors.push(
        `${ctx}: expected 3–5 extract_methods, got ${data.extract_methods.length}`
      );
    }
    data.extract_methods.forEach((m, i) => {
      validateExtractMethod(m, `${ctx}: extract_methods[${i}]`, errors);
    });
    // No duplicate method ids.
    const ids = data.extract_methods.map(m => m && m.id).filter(Boolean);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupes.length > 0) {
      errors.push(`${ctx}: duplicate extract_method ids: ${[...new Set(dupes)].join(', ')}`);
    }
  }

  // --- notes ----------------------------------------------------------------
  if (!isArray(data.notes)) {
    errors.push(`${ctx}: "notes" must be an array (even if length 1)`);
  } else {
    if (data.notes.length === 0) {
      errors.push(`${ctx}: "notes" is empty — curate at least one`);
    }
    data.notes.forEach((n, i) => {
      validateNote(n, `${ctx}: notes[${i}]`, errors);
    });
    if (data.notes.length < 2) {
      // Non-fatal; brief allows seeding with 1 and logging in DIRECTORY_NOTES.
      warnings.push(
        `${ctx}: only ${data.notes.length} note(s); brief calls for 2–5. ` +
        `Log this table in DIRECTORY_NOTES.md §11.`
      );
    }
  }

  // --- ingestion_guidance ---------------------------------------------------
  if (data.ingestion_guidance === undefined) {
    errors.push(`${ctx}: "ingestion_guidance" is required`);
  } else {
    validateIngestion(data.ingestion_guidance, `${ctx}: ingestion_guidance`, errors);
  }

  // --- mode: both → _ecc parallels (warn, non-fatal) ------------------------
  if (data.mode === 'both') {
    for (const field of ECC_PARALLEL_FIELDS) {
      const eccKey = `${field}_ecc`;
      if (data[eccKey] === undefined) {
        warnings.push(
          `⚠ Missing _ecc variant for ${field} on ${data.slug || filePath}`
        );
      }
    }
  }

  // --- equivalent_in_ecc / equivalent_in_s4 ---------------------------------
  // s4-only tables should declare their ECC equivalents so the redirect page
  // can render. ecc-only tables should declare their S/4 equivalents.
  if (data.mode === 's4-only') {
    if (!isArray(data.equivalent_in_ecc) || data.equivalent_in_ecc.length === 0) {
      errors.push(
        `${ctx}: mode=s4-only tables must declare equivalent_in_ecc[] so the ` +
        `ECC redirect page resolves`
      );
    }
  }
  if (data.mode === 'ecc-only' && !isEccStub) {
    if (!isArray(data.equivalent_in_s4) || data.equivalent_in_s4.length === 0) {
      errors.push(
        `${ctx}: mode=ecc-only tables must declare equivalent_in_s4[]`
      );
    }
  }

  return { errors, warnings };
}

// Named exports for tests that want to introspect the enums.
export {
  VALID_MODES,
  VALID_EXTRACT_METHOD_IDS,
  VALID_LICENSE,
  VALID_LATENCY,
  VALID_VOLUME,
  ECC_PARALLEL_FIELDS,
  REQUIRED_TOP_LEVEL
};
