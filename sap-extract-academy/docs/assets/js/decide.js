/**
 * decide.js — SAP Extract Academy decision-tree component
 *
 * Exported API:
 *   mount(container)  — mount the tree into any HTMLElement
 *
 * Worker B's walkthrough picker reads the same query-param contract:
 *   ?method=<odp|slt|rfc|ref>&tool=<adf|databricks|fivetran|airbyte|custom>&sink=<adls|s3|gcs|snowflake|bigquery|fabric|other>
 */

/* ------------------------------------------------------------------ */
/* State                                                                */
/* ------------------------------------------------------------------ */
const state = {
  realTime: null,      // 'yes' | 'no'
  fullUse: null,       // 'yes' | 'no'  (only when realTime=yes)
  largeTable: null,    // 'yes' | 'no'  (only when realTime=no)
  partitionKey: null,  // 'yes' | 'no'  (only when largeTable=yes)
  method: null,        // 'odp' | 'slt' | 'rfc' | 'ref'
  tool: null,          // 'adf' | 'databricks' | 'fivetran' | 'airbyte' | 'custom' | 'none'
  sink: null,          // 'adls' | 's3' | 'gcs' | 'snowflake' | 'bigquery' | 'fabric' | 'other'
  table: 'acdoca'      // default table for CTA deep-link
};

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

/**
 * Build a radio-button fieldset card and append it to the grid.
 * Returns the created <fieldset> element.
 */
function buildCard ({ id, legend, options, name, onChoose }) {
  const fs = document.createElement('fieldset');
  fs.className = 'decide-card';
  fs.id = id;
  fs.setAttribute('tabindex', '-1');

  const leg = document.createElement('legend');
  leg.textContent = legend;
  fs.appendChild(leg);

  const group = document.createElement('div');
  group.className = 'decide-options';
  group.setAttribute('role', 'group');

  options.forEach(({ value, label, hint }) => {
    const labelEl = document.createElement('label');
    labelEl.className = 'decide-option';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = name;
    radio.value = value;

    const span = document.createElement('span');
    span.className = 'decide-option-label';
    span.textContent = label;

    labelEl.appendChild(radio);
    labelEl.appendChild(span);

    if (hint) {
      const hintEl = document.createElement('small');
      hintEl.className = 'decide-option-hint';
      hintEl.textContent = hint;
      labelEl.appendChild(hintEl);
    }

    radio.addEventListener('change', () => {
      if (radio.checked) {
        onChoose(value);
      }
    });

    group.appendChild(labelEl);
  });

  fs.appendChild(group);
  return fs;
}

/**
 * Build a recommendation card (not a radio group).
 */
function buildRecommendCard ({ id, method, icon, heading, detail }) {
  const div = document.createElement('div');
  div.className = 'decide-card decide-card--recommend';
  div.id = id;
  div.setAttribute('tabindex', '-1');
  div.setAttribute('role', 'region');
  div.setAttribute('aria-label', heading);

  const h2 = document.createElement('h2');
  h2.className = 'decide-recommend-heading';
  // Use icon + text so colour is not the sole indicator
  h2.innerHTML = `<span class="decide-icon" aria-hidden="true">${icon}</span> ${heading}`;
  div.appendChild(h2);

  if (detail) {
    const p = document.createElement('p');
    p.textContent = detail;
    div.appendChild(p);
  }

  // Show the recommended method badge
  const badge = document.createElement('p');
  badge.className = 'decide-method-badge';
  badge.innerHTML = `<strong>Recommended method:</strong> <code>${method.toUpperCase()}</code>`;
  div.appendChild(badge);

  return div;
}

/**
 * Build an escalation card (no recommendation, requires human decision).
 */
function buildEscalationCard ({ id, heading, detail, linkHref, linkText }) {
  const div = document.createElement('div');
  div.className = 'decide-card decide-card--escalation';
  div.id = id;
  div.setAttribute('tabindex', '-1');
  div.setAttribute('role', 'region');
  div.setAttribute('aria-label', heading);

  const h2 = document.createElement('h2');
  h2.className = 'decide-escalation-heading';
  h2.innerHTML = `<span class="decide-icon" aria-hidden="true">&#9888;</span> ${heading}`;
  div.appendChild(h2);

  if (detail) {
    const p = document.createElement('p');
    p.textContent = detail;
    div.appendChild(p);
  }

  if (linkHref) {
    const a = document.createElement('a');
    a.href = linkHref;
    a.className = 'btn decide-escalation-link';
    a.textContent = linkText || 'Learn more';
    div.appendChild(a);
  }

  return div;
}

/**
 * Announce a message to screen readers via the live region.
 */
function announce (container, message) {
  const live = container.querySelector('#decide-live') ||
    container.ownerDocument.getElementById('decide-live');
  if (live) {
    live.textContent = '';
    // Small delay ensures screen readers pick up the update
    setTimeout(() => { live.textContent = message; }, 50);
  }
}

/**
 * Append a card to the grid and focus its legend / heading.
 */
function appendCard (grid, card, liveRegion) {
  grid.appendChild(card);

  // Focus first focusable element (the fieldset legend via tabindex=-1)
  requestAnimationFrame(() => {
    card.focus();
  });

  // Announce to screen readers
  const legendOrH2 = card.querySelector('legend') || card.querySelector('h2');
  if (legendOrH2 && liveRegion) {
    liveRegion.textContent = '';
    setTimeout(() => {
      liveRegion.textContent = legendOrH2.textContent.trim();
    }, 50);
  }
}

/* ------------------------------------------------------------------ */
/* CTA card                                                             */
/* ------------------------------------------------------------------ */
function buildCtaCard (grid, liveRegion) {
  const card = document.createElement('div');
  card.className = 'decide-card decide-card--cta';
  card.id = 'decide-cta';
  card.setAttribute('tabindex', '-1');

  const h2 = document.createElement('h2');
  h2.textContent = 'Your personalised walkthrough';
  card.appendChild(h2);

  // Table picker
  const tableFieldset = document.createElement('fieldset');
  tableFieldset.className = 'decide-table-picker';
  const tableLeg = document.createElement('legend');
  tableLeg.textContent = 'Which table are you extracting?';
  tableFieldset.appendChild(tableLeg);

  const tableSelect = document.createElement('select');
  tableSelect.id = 'decide-table-select';
  tableSelect.name = 'table';
  tableSelect.setAttribute('aria-label', 'Select target SAP table');

  const tables = [
    { value: 'acdoca', label: 'ACDOCA — Universal Journal' },
    { value: 'bkpf',   label: 'BKPF — Accounting Document Header' },
    { value: 'vbak',   label: 'VBAK — Sales Order Header' },
    { value: 'mara',   label: 'MARA — General Material Data' },
    { value: 'lfa1',   label: 'LFA1 — Vendor Master' }
  ];

  tables.forEach(({ value, label }) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    if (value === state.table) opt.selected = true;
    tableSelect.appendChild(opt);
  });

  tableSelect.addEventListener('change', () => {
    state.table = tableSelect.value;
    updateCtaLink(ctaLink);
  });

  tableFieldset.appendChild(tableSelect);
  card.appendChild(tableFieldset);

  // Summary
  const summary = document.createElement('dl');
  summary.className = 'decide-summary';

  function addSummaryRow (term, def) {
    const dt = document.createElement('dt');
    dt.textContent = term;
    summary.appendChild(dt);
    const dd = document.createElement('dd');
    dd.textContent = def;
    summary.appendChild(dd);
    return dd; // return dd so callers can update later
  }

  const toolLabel  = state.tool  === 'none' ? 'Not decided yet' : (state.tool  || '—');
  const sinkLabel  = state.sink  || '—';

  addSummaryRow('Method',  state.method  ? state.method.toUpperCase()  : '—');
  addSummaryRow('Tool',    toolLabel.toUpperCase ? toolLabel.toUpperCase() : toolLabel);
  addSummaryRow('Sink',    sinkLabel.charAt ? sinkLabel.charAt(0).toUpperCase() + sinkLabel.slice(1) : sinkLabel);

  card.appendChild(summary);

  // CTA link
  const ctaLink = document.createElement('a');
  ctaLink.className = 'btn btn-primary decide-cta-btn';
  ctaLink.textContent = 'Open walkthrough with these settings';
  updateCtaLink(ctaLink);
  card.appendChild(ctaLink);

  appendCard(grid, card, liveRegion);
}

function updateCtaLink (link) {
  const level = 'beginner';
  const table = state.table || 'acdoca';
  const params = new URLSearchParams();

  if (state.method && state.method !== 'none') params.set('method', state.method);
  const toolVal = state.tool === 'none' ? null : state.tool;
  if (toolVal) params.set('tool', toolVal);
  if (state.sink)   params.set('sink',   state.sink);

  const basePath = (typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/sawan_tech_sap_training'))
    ? '/sawan_tech_sap_training'
    : '';

  link.href = `${basePath}/walkthrough/${level}/${table}/?${params.toString()}`;
}

/* ------------------------------------------------------------------ */
/* Q5 — sink                                                            */
/* ------------------------------------------------------------------ */
function showQ5 (grid, liveRegion) {
  const card = buildCard({
    id: 'decide-q5',
    legend: 'Q5. What target (sink) is already approved?',
    name: 'sink',
    options: [
      { value: 'adls',      label: 'Azure Data Lake Storage (ADLS)' },
      { value: 's3',        label: 'Amazon S3' },
      { value: 'gcs',       label: 'Google Cloud Storage (GCS)' },
      { value: 'snowflake', label: 'Snowflake' },
      { value: 'bigquery',  label: 'BigQuery' },
      { value: 'fabric',    label: 'Microsoft Fabric' },
      { value: 'other',     label: 'Other / not decided yet' }
    ],
    onChoose (value) {
      state.sink = value;
      buildCtaCard(grid, liveRegion);
    }
  });
  appendCard(grid, card, liveRegion);
}

/* ------------------------------------------------------------------ */
/* Q4 — tool                                                            */
/* ------------------------------------------------------------------ */
function showQ4 (grid, liveRegion) {
  const card = buildCard({
    id: 'decide-q4',
    legend: 'Q4. What extraction tool is already approved?',
    name: 'tool',
    options: [
      { value: 'adf',         label: 'Azure Data Factory (ADF)' },
      { value: 'databricks',  label: 'Databricks' },
      { value: 'fivetran',    label: 'Fivetran' },
      { value: 'airbyte',     label: 'Airbyte' },
      { value: 'custom',      label: 'Custom / homegrown connector' },
      { value: 'none',        label: 'Nothing approved yet' }
    ],
    onChoose (value) {
      state.tool = value;
      showQ5(grid, liveRegion);
    }
  });
  appendCard(grid, card, liveRegion);
}

/* ------------------------------------------------------------------ */
/* Recommendation helpers                                               */
/* ------------------------------------------------------------------ */
function recommendSlt (grid, liveRegion) {
  state.method = 'slt';
  const card = buildRecommendCard({
    id: 'decide-recommend',
    method: 'slt',
    icon: '&#10003;',
    heading: 'Recommendation: SLT (SAP Landscape Transformation)',
    detail: 'SLT supports sub-second replication using database triggers. With a Full Use licence you can stream changes directly into your target system in real time.'
  });
  appendCard(grid, card, liveRegion);
  announce(liveRegion, 'Recommendation: SLT. Proceeding to tool selection.');
  showQ4(grid, liveRegion);
}

function recommendOdpParallel (grid, liveRegion) {
  state.method = 'odp';
  const card = buildRecommendCard({
    id: 'decide-recommend',
    method: 'odp',
    icon: '&#10003;',
    heading: 'Recommendation: ODP with parallel extraction',
    detail: 'The table is large and has a natural partition key. Use ODP with parallel delta queues — split by RYEAR, GJAHR, or BUKRS to stay within memory limits.'
  });
  appendCard(grid, card, liveRegion);
  announce(liveRegion, 'Recommendation: ODP parallel. Proceeding to tool selection.');
  showQ4(grid, liveRegion);
}

function recommendOdpSingle (grid, liveRegion) {
  state.method = 'odp';
  const card = buildRecommendCard({
    id: 'decide-recommend',
    method: 'odp',
    icon: '&#10003;',
    heading: 'Recommendation: ODP single-thread',
    detail: 'The table is below 500M rows and batch loading is fine. A standard ODP full/delta load will handle this without complex partitioning.'
  });
  appendCard(grid, card, liveRegion);
  announce(liveRegion, 'Recommendation: ODP single-thread. Proceeding to tool selection.');
  showQ4(grid, liveRegion);
}

function escalateLicensing (grid, liveRegion) {
  state.method = 'ref';
  const card = buildEscalationCard({
    id: 'decide-escalate-license',
    heading: 'Licensing must be resolved first',
    detail: 'SLT requires a Full Use SAP licence for each user accessing replicated data. Without it, an SLT deployment creates an audit risk. Resolve licensing before choosing an extraction method.',
    linkHref: '/articles/runtime-vs-full-use/',
    linkText: 'Understand Full Use vs Runtime licensing'
  });
  appendCard(grid, card, liveRegion);
  announce(liveRegion, 'Escalation: licensing must be resolved. See linked article.');
}

function escalatePartition (grid, liveRegion) {
  state.method = 'odp';
  const card = buildEscalationCard({
    id: 'decide-escalate-partition',
    heading: 'Partition design needed',
    detail: 'The table is over 500M rows but lacks an obvious partition key. Extracting without partitioning will exhaust SAP dialog process memory (TSV_TNEW_PAGE_ALLOC_FAILED). Engage your SAP Basis team to identify a suitable splitting dimension before proceeding.',
    linkHref: null,
    linkText: null
  });
  appendCard(grid, card, liveRegion);
  announce(liveRegion, 'Escalation: partition design is required before extraction.');
  // Still allow tool/sink selection so the user can pre-fill the walkthrough
  showQ4(grid, liveRegion);
}

/* ------------------------------------------------------------------ */
/* Q3 — partition key (realTime=no, largeTable=yes)                     */
/* ------------------------------------------------------------------ */
function showQ3 (grid, liveRegion) {
  const card = buildCard({
    id: 'decide-q3',
    legend: 'Q3. Does the table have a natural partition key (RYEAR, GJAHR, BUKRS, or similar)?',
    name: 'partitionKey',
    options: [
      { value: 'yes', label: 'Yes — there is a fiscal year, company code, or similar column' },
      { value: 'no',  label: 'No — no obvious split column' }
    ],
    onChoose (value) {
      state.partitionKey = value;
      if (value === 'yes') {
        recommendOdpParallel(grid, liveRegion);
      } else {
        escalatePartition(grid, liveRegion);
      }
    }
  });
  appendCard(grid, card, liveRegion);
}

/* ------------------------------------------------------------------ */
/* Q2b — table size (realTime=no)                                       */
/* ------------------------------------------------------------------ */
function showQ2b (grid, liveRegion) {
  const card = buildCard({
    id: 'decide-q2b',
    legend: 'Q2. Is the table larger than 500 million rows?',
    name: 'largeTable',
    options: [
      { value: 'yes', label: 'Yes — over 500M rows', hint: 'Common for ACDOCA in large enterprises' },
      { value: 'no',  label: 'No — under 500M rows' }
    ],
    onChoose (value) {
      state.largeTable = value;
      if (value === 'yes') {
        showQ3(grid, liveRegion);
      } else {
        recommendOdpSingle(grid, liveRegion);
      }
    }
  });
  appendCard(grid, card, liveRegion);
}

/* ------------------------------------------------------------------ */
/* Q2a — Full Use licence (realTime=yes)                                */
/* ------------------------------------------------------------------ */
function showQ2a (grid, liveRegion) {
  const card = buildCard({
    id: 'decide-q2a',
    legend: 'Q2. Do you have an SAP Full Use licence for the users of this data?',
    name: 'fullUse',
    options: [
      { value: 'yes', label: 'Yes — Full Use licence confirmed' },
      { value: 'no',  label: 'No — Runtime or unknown', hint: 'If unsure, treat as No' }
    ],
    onChoose (value) {
      state.fullUse = value;
      if (value === 'yes') {
        recommendSlt(grid, liveRegion);
      } else {
        escalateLicensing(grid, liveRegion);
      }
    }
  });
  appendCard(grid, card, liveRegion);
}

/* ------------------------------------------------------------------ */
/* Q1 — real-time need                                                  */
/* ------------------------------------------------------------------ */
function showQ1 (grid, liveRegion) {
  const card = buildCard({
    id: 'decide-q1',
    legend: 'Q1. Do you need real-time data (less than 5 minutes lag)?',
    name: 'realTime',
    options: [
      { value: 'yes', label: 'Yes — near real-time or streaming', hint: 'e.g. live dashboards, operational reporting' },
      { value: 'no',  label: 'No — batch is fine', hint: 'e.g. daily warehouse loads, monthly closes' }
    ],
    onChoose (value) {
      state.realTime = value;
      if (value === 'yes') {
        showQ2a(grid, liveRegion);
      } else {
        showQ2b(grid, liveRegion);
      }
    }
  });
  appendCard(grid, card, liveRegion);
}

/* ------------------------------------------------------------------ */
/* Mount                                                                */
/* ------------------------------------------------------------------ */

/**
 * mount(container)
 *
 * Mount the decision tree into the given HTMLElement.
 * Works for both the /decide/ full page and the inline "Not sure?" panel
 * on walkthrough pages (Worker B's side panel).
 *
 * @param {HTMLElement} container
 */
export function mount (container) {
  // Reset state for re-mounts
  Object.assign(state, {
    realTime: null, fullUse: null, largeTable: null, partitionKey: null,
    method: null, tool: null, sink: null, table: 'acdoca'
  });

  container.innerHTML = '';
  container.classList.add('decide-root');

  // Live region for screen-reader announcements
  const liveRegion = document.createElement('div');
  liveRegion.id = 'decide-live';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'false');
  liveRegion.className = 'sr-only';
  container.appendChild(liveRegion);

  const grid = document.createElement('div');
  grid.className = 'decide-grid';
  container.appendChild(grid);

  showQ1(grid, liveRegion);
}

/* ------------------------------------------------------------------ */
/* Auto-mount on the /decide/ page                                      */
/* ------------------------------------------------------------------ */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Full-page mount
    const pageMount = document.getElementById('decide-mount');
    if (pageMount) {
      // On the decide page, the live region and grid already exist in the HTML.
      // Wire them up directly instead of replacing innerHTML.
      const liveRegion = document.getElementById('decide-live');
      const grid = document.getElementById('decide-grid');
      if (liveRegion && grid) {
        showQ1(grid, liveRegion);
      }
    }

    // Inline panel mount (Worker B's "Not sure?" side panel)
    const inlineMounts = document.querySelectorAll('.decide-inline');
    inlineMounts.forEach(el => mount(el));
  });
}
