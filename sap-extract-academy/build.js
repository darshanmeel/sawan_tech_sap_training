import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';
import Mustache from 'mustache';

import { generateDdl } from './build/ddl.js';
import { highlightJson } from './build/json-highlight.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, 'content/en');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const OUTPUT_DIR = path.join(__dirname, 'docs');
const STRINGS_PATH = path.join(__dirname, 'strings/en.json');

const BASE_PATH = process.env.BASE_PATH || '/sawan_tech_sap_training';

const strings = JSON.parse(fs.readFileSync(STRINGS_PATH, 'utf-8'));
const baseTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'base.html'), 'utf-8');

// Load Mustache partials from templates/partials/ (*.mustache or *.html)
const PARTIALS_DIR = path.join(TEMPLATES_DIR, 'partials');
const partials = {};
if (fs.existsSync(PARTIALS_DIR)) {
  for (const file of fs.readdirSync(PARTIALS_DIR)) {
    if (file.endsWith('.mustache') || file.endsWith('.html')) {
      const name = path.basename(file, path.extname(file));
      partials[name] = fs.readFileSync(path.join(PARTIALS_DIR, file), 'utf-8');
    }
  }
}

const pageTemplates = {
  landing: fs.readFileSync(path.join(TEMPLATES_DIR, 'landing.html'), 'utf-8'),
  table: fs.readFileSync(path.join(TEMPLATES_DIR, 'table-detail.html'), 'utf-8'),
  walkthrough: fs.readFileSync(path.join(TEMPLATES_DIR, 'walkthrough.html'), 'utf-8'),
  article: fs.readFileSync(path.join(TEMPLATES_DIR, 'article.html'), 'utf-8'),
  glossary: fs.readFileSync(path.join(TEMPLATES_DIR, 'glossary-term.html'), 'utf-8'),
  list: fs.readFileSync(path.join(TEMPLATES_DIR, 'list.html'), 'utf-8'),
  page: fs.readFileSync(path.join(TEMPLATES_DIR, 'page.html'), 'utf-8'),
  guide: fs.readFileSync(path.join(TEMPLATES_DIR, 'guide.html'), 'utf-8'),
  tablesIndex: fs.readFileSync(path.join(TEMPLATES_DIR, 'tables-index.html'), 'utf-8'),
  // Worker B — directory templates
  directoryTable: fs.readFileSync(path.join(TEMPLATES_DIR, 'directory-table.html'), 'utf-8'),
  directoryLanding: fs.readFileSync(path.join(TEMPLATES_DIR, 'directory-index.html'), 'utf-8'),
  directoryRedirect: fs.readFileSync(path.join(TEMPLATES_DIR, 'directory-redirect.html'), 'utf-8')
};

// Lazy-load Worker A's schema validator. Optional — if the file isn't in the
// tree yet, we build anyway but log a warning so the gap is visible.
let validateDirectory = null;
const VALIDATOR_PATH = path.join(__dirname, 'build/validate-directory.js');
if (fs.existsSync(VALIDATOR_PATH)) {
  try {
    const mod = await import(new URL('./build/validate-directory.js', import.meta.url).href);
    validateDirectory = mod.default || mod.validateDirectory || null;
  } catch (err) {
    console.warn(`⚠ Could not load directory validator: ${err.message}`);
  }
} else {
  console.warn('⚠ Directory validator not found (build/validate-directory.js) — skipping schema validation.');
}

const MODULE_LABELS = {
  FI: 'Finance',
  SD: 'Sales',
  MD: 'Master Data',
  MM: 'Materials',
  CO: 'Controlling',
  HR: 'Human Resources'
};

const VOLUME_LABELS = {
  small: 'Small',
  medium: 'Medium',
  heavy: 'Heavy',
  heavyweight: 'Heavyweight',
  large: 'Large'
};

const sitemapEntries = [];
const currentYear = new Date().getFullYear();
const walkthroughsBySlug = {};

function getPageType(filePath) {
  const normalized = filePath.replaceAll('\\', '/');
  const baseName = path.basename(filePath);

  // Directory section — match BEFORE '/tables/' branch so that
  // /directory/tables/* is classified as directoryTable, not table.
  if (normalized.includes('/directory/tables/')) return 'directoryTable';
  if (normalized.endsWith('/directory/index.md')) return 'directoryLanding';

  if (baseName === 'index.md') return 'landing';
  if (baseName === 'about.md') return 'guide';
  if (baseName === 'decide.md') return 'page';
  if (baseName === 'roadmap.md') return 'list';
  if (normalized.includes('/tables/')) return 'table';
  if (normalized.includes('/walkthroughs/')) return 'walkthrough';
  if (normalized.includes('/articles/')) return 'article';
  if (normalized.includes('/glossary/')) return 'glossary';
  throw new Error(`Unknown page type for ${filePath}`);
}

function getOutputPath(inputPath) {
  const relativePath = path.relative(CONTENT_DIR, inputPath);
  const parsed = path.parse(relativePath);

  // Root index.md → docs/index.html
  if (parsed.name === 'index' && (parsed.dir === '' || parsed.dir === '.')) {
    return { outputDir: OUTPUT_DIR, outputPath: path.join(OUTPUT_DIR, 'index.html') };
  }

  let pathSegments = parsed.dir.split(path.sep);

  // Sectional index.md (e.g. content/en/directory/index.md →
  // docs/directory/index.html). Without this, the default branch below would
  // emit docs/directory/index/index.html.
  if (parsed.name === 'index') {
    const outputDir = path.join(OUTPUT_DIR, ...pathSegments);
    return { outputDir, outputPath: path.join(outputDir, 'index.html') };
  }

  if (pathSegments[0] === 'walkthroughs') {
    // Flatten: walkthroughs/intermediate/slug → walkthrough/slug (single walkthrough per table)
    pathSegments = ['walkthrough'];
  }

  const outputDir = path.join(OUTPUT_DIR, ...pathSegments, parsed.name);
  const outputPath = path.join(outputDir, 'index.html');

  return { outputPath, outputDir };
}

function getCanonicalPath(inputPath) {
  const { outputPath } = getOutputPath(inputPath);
  const relativePath = path.relative(OUTPUT_DIR, outputPath);
  const withoutIndex = relativePath.replace('index.html', '');
  return '/' + withoutIndex.replaceAll(path.sep, '/');
}

function buildBreadcrumbs(filePath, data) {
  const pageType = getPageType(filePath);
  const breadcrumbs = [
    { position: 1, name: 'Home', item: 'https://academy.example.com/' }
  ];

  if (pageType === 'table') {
    breadcrumbs.push({ position: 2, name: 'Tables', item: 'https://academy.example.com/tables/' });
    breadcrumbs.push({ position: 3, name: data.code || data.name });
  } else if (pageType === 'walkthrough') {
    breadcrumbs.push({ position: 2, name: 'Walkthroughs', item: 'https://academy.example.com/walkthrough/' });
    breadcrumbs.push({ position: 3, name: data.table, item: `https://academy.example.com/tables/${data.slug}/` });
    breadcrumbs.push({ position: 4, name: data.title });
  } else if (pageType === 'article') {
    breadcrumbs.push({ position: 2, name: 'Articles', item: 'https://academy.example.com/articles/' });
    breadcrumbs.push({ position: 3, name: data.title });
  } else if (pageType === 'glossary') {
    breadcrumbs.push({ position: 2, name: 'Glossary', item: 'https://academy.example.com/glossary/' });
    breadcrumbs.push({ position: 3, name: data.term });
  } else if (pageType === 'roadmap') {
    breadcrumbs.push({ position: 2, name: 'Roadmap' });
  }

  return breadcrumbs;
}

function buildJsonLd(pageType, data, canonicalPath, breadcrumbs) {
  const baseUrl = 'https://academy.example.com';

  if (pageType === 'table') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': data.name,
      'description': data.seoDescription,
      'url': baseUrl + canonicalPath,
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbs.map(b => ({
          '@type': 'ListItem',
          'position': b.position,
          'name': b.name,
          ...( b.item ? { 'item': b.item } : {})
        }))
      }
    });
  } else if (pageType === 'walkthrough') {
    const stepCount = data.steps ? data.steps.length : 0;
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': data.title,
      'description': data.summary || data.seoDescription,
      'totalTime': `PT${data.estimatedMinutes || 30}M`,
      'estimatedCost': { '@type': 'MonetaryAmount', 'currency': 'USD', 'value': '0' },
      'step': (data.steps || []).slice(0, 5).map((step, idx) => ({
        '@type': 'HowToStep',
        'position': idx + 1,
        'name': step.title,
        'text': step.explanation || '',
        'url': baseUrl + canonicalPath + '#step-' + step.id
      })),
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbs.map(b => ({
          '@type': 'ListItem',
          'position': b.position,
          'name': b.name,
          ...( b.item ? { 'item': b.item } : {})
        }))
      }
    });
  } else if (pageType === 'article') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      'headline': data.title,
      'description': data.description || data.seoDescription,
      'author': { '@type': 'Organization', 'name': 'SAP Extract Guide' },
      'publisher': { '@type': 'Organization', 'name': 'SAP Extract Guide' },
      'datePublished': data.publishDate || new Date().toISOString(),
      'dateModified': data.updatedAt || new Date().toISOString(),
      'mainEntityOfPage': baseUrl + canonicalPath,
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbs.map(b => ({
          '@type': 'ListItem',
          'position': b.position,
          'name': b.name,
          ...( b.item ? { 'item': b.item } : {})
        }))
      }
    });
  } else if (pageType === 'glossary') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'DefinedTerm',
      'name': data.fullName || data.term,
      'alternateName': data.term,
      'description': data.shortDefinition,
      'inDefinedTermSet': {
        '@type': 'DefinedTermSet',
        'name': 'SAP Extract Guide Glossary',
        'url': baseUrl + '/glossary/'
      }
    });
  } else if (pageType === 'roadmap') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'SAP Extract Guide Roadmap',
      'description': 'Upcoming phases and content roadmap',
      'url': baseUrl + canonicalPath
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage' });
}

const SHARED_WALKTHROUGH_DIR = path.join(__dirname, 'content/en/walkthroughs/shared');

function loadSharedToolSteps(slug) {
  if (!slug) return [];
  const fp = path.join(SHARED_WALKTHROUGH_DIR, `${slug}.yaml`);
  if (!fs.existsSync(fp)) return [];
  try {
    const { data: sharedData } = matter(fs.readFileSync(fp, 'utf-8'));
    return Array.isArray(sharedData.toolSteps) ? sharedData.toolSteps : [];
  } catch {
    return [];
  }
}

function buildPage(filePath, content) {
  const { data, content: body } = matter(content);
  const renderedBody = marked(body);
  const pageType = getPageType(filePath);
  const { outputPath, outputDir } = getOutputPath(filePath);
  const canonicalPath = getCanonicalPath(filePath);
  const breadcrumbs = buildBreadcrumbs(filePath, data);
  const jsonLd = buildJsonLd(pageType, data, canonicalPath, breadcrumbs);

  // Parse sections for guide pages (split by h2 headers)
  let sections = [];
  if (pageType === 'guide') {
    const h2Regex = /<h2>(.*?)<\/h2>/g;
    const parts = renderedBody.split(h2Regex);
    for (let i = 1; i < parts.length; i += 2) {
      sections.push({
        heading: parts[i],
        content: parts[i + 1] ? parts[i + 1].trim() : ''
      });
    }
  }

  const stepCount = data.steps ? data.steps.length : 0;

  const tableSlug = data.slug || (data.code ? data.code.toLowerCase() : '');

  const primaryKeyList = Array.isArray(data.primaryKey) ? data.primaryKey : [];
  const keyFieldsRaw = Array.isArray(data.keyFields) ? data.keyFields : [];
  const keyFields = keyFieldsRaw.length > 0
    ? keyFieldsRaw.map(f => typeof f === 'string' ? { name: f, description: '' } : f)
    : primaryKeyList.map(name => ({ name, description: '' }));

  const prerequisites = Array.isArray(data.prerequisites) ? data.prerequisites : [];
  const extractionGotchas = Array.isArray(data.extractionGotchas) ? data.extractionGotchas : [];
  const troubleshooting = Array.isArray(data.troubleshooting) ? data.troubleshooting : [];
  const nextSteps = Array.isArray(data.nextSteps) ? data.nextSteps : [];

  // B6: run marked.parseInline on step explanation/whyItMatters so fenced
  // inline code and markdown in prose renders correctly. marked.parseInline is
  // idempotent for strings that are already HTML.
  function renderInline(text) {
    if (typeof text !== 'string' || text.trim() === '') return text;
    return marked.parseInline(text);
  }

  function decorateSteps(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map((step, idx) => {
      const match = typeof step.id === 'string' ? step.id.match(/\d+/) : null;
      const displayNumber = match ? parseInt(match[0], 10) : idx + 1;
      return {
        ...step,
        displayNumber,
        explanation: renderInline(step.explanation),
        whyItMatters: renderInline(step.whyItMatters)
      };
    });
  }

  const stepsOdp = decorateSteps(data.steps);
  const stepsSlt = decorateSteps(data.stepsSlt);
  const stepsRfc = decorateSteps(data.stepsRfc);
  const stepsRef = decorateSteps(data.stepsRef);
  const defaultMethod = data.method || 'odp';
  const stepsWithDisplay = stepsOdp;

  // Tool-side steps: level YAML takes priority; fall back to shared/<slug>.yaml.
  const rawToolStepsFromLevel = Array.isArray(data.toolSteps) ? data.toolSteps : [];
  const rawToolSteps = rawToolStepsFromLevel.length > 0
    ? rawToolStepsFromLevel
    : loadSharedToolSteps(tableSlug);
  const toolSteps = rawToolSteps.map((t, i) => ({
    tool: t.tool || '',
    label: t.label || t.tool,
    active: i === 0,
    steps: (Array.isArray(t.steps) ? t.steps : []).map((s, si) => ({
      ...s,
      displayNumber: si + 1,
      hasCode: !!(s.code && s.code.trim()),
      codeLanguage: s.language || 'python',
      code: s.code ? s.code.trim() : '',
      explanation: renderInline(s.explanation || ''),
      verify: s.verify || ''
    }))
  }));
  const hasToolSteps = toolSteps.length > 0;
  const defaultTool = (toolSteps[0] || {}).tool || 'custom';

  // B4: gate the relatedWalkthroughs section so it only renders when non-empty
  const relatedWalkthroughs = Array.isArray(data.relatedWalkthroughs)
    ? data.relatedWalkthroughs
    : [];

  // Format publishDate as "22 Apr 2026" for article pages
  const formattedPublishDate = data.publishDate
    ? new Date(data.publishDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const mergedData = {
    ...data,
    publishDate: formattedPublishDate || data.publishDate,
    strings,
    body: renderedBody,
    jsonLd,
    canonicalPath,
    currentYear,
    basePath: BASE_PATH,
    buttondownUsername: 'example',
    ogImage: 'default-og.png',
    ogType: pageType === 'article' ? 'article' : 'website',
    stepCount,
    destinations: Array.isArray(data.destinations) ? data.destinations.join(', ') : data.destinations,
    extractors: Array.isArray(data.extractors) ? data.extractors.join(', ') : data.extractors,
    prerequisites,
    extractionGotchas,
    troubleshooting,
    nextSteps,
    steps: stepsWithDisplay,
    stepsOdp,
    stepsSlt,
    stepsRfc,
    stepsRef,
    hasStepsSlt: stepsSlt.length > 0,
    hasStepsRfc: stepsRfc.length > 0,
    hasStepsRef: stepsRef.length > 0,
    defaultMethod,
    toolSteps,
    hasToolSteps,
    defaultTool,
    keyFields,
    hasKeyFields: keyFields.length > 0,
    hasExtractionGotchas: extractionGotchas.length > 0,
    hasPrerequisites: prerequisites.length > 0,
    hasTroubleshooting: troubleshooting.length > 0,
    hasNextSteps: nextSteps.length > 0,
    // B4: relatedWalkthroughs is an array of {slug, level} objects; gate section
    relatedWalkthroughs,
    hasRelatedWalkthroughs: relatedWalkthroughs.length > 0,
    hasRelatedTerms: Array.isArray(data.relatedTerms) && data.relatedTerms.length > 0,
    hasWalkthrough: walkthroughsBySlug[tableSlug] !== undefined,
    sections: sections
  };

  const pageTypeTemplate = pageTemplates[pageType];
  const pageContent = Mustache.render(pageTypeTemplate, mergedData, partials);

  const baseData = {
    ...mergedData,
    content: pageContent
  };

  const html = Mustache.render(baseTemplate, baseData, partials);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf-8');

  sitemapEntries.push({
    url: canonicalPath,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: pageType === 'article' ? 'monthly' : 'weekly',
    priority: pageType === 'article' ? 0.9 : (pageType === 'walkthrough' ? 0.8 : 0.6)
  });

  console.log(`✓ Built ${canonicalPath}`);
}

function walkFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      walkFiles(fullPath);
    } else if (file.name.endsWith('.md')) {
      const normalized = fullPath.replaceAll('\\', '/');
      // Skip non-intermediate walkthroughs — one walkthrough per table, intermediate is canonical.
      if (normalized.includes('/walkthroughs/') &&
          !normalized.includes('/walkthroughs/intermediate/') &&
          !normalized.includes('/walkthroughs/shared/')) {
        continue;
      }
      const content = fs.readFileSync(fullPath, 'utf-8');
      // Collect walkthroughs for reference by table detail pages
      if (normalized.includes('/walkthroughs/intermediate/')) {
        const { data } = matter(content);
        const slug = data.slug || path.parse(file.name).name;
        if (!walkthroughsBySlug[slug]) {
          walkthroughsBySlug[slug] = { slug, table: data.table || slug.toUpperCase(), summary: data.summary || '' };
        }
      }
      // Fan-out: one /directory/tables/<slug>.md produces up to 3 outputs
      // (canonical + /s4/ + /ecc/). Keep the single-output pipeline for
      // everything else.
      if (normalized.includes('/directory/tables/')) {
        buildDirectoryTablePage(fullPath, content);
      } else {
        buildPage(fullPath, content);
      }
    }
  }
}

// ===========================================================================
// Directory (Worker B)
// ===========================================================================
//
// URL namespace: /directory/tables/<slug>/
//
// One source file → up to three HTML outputs:
//   /directory/tables/<slug>/index.html         (canonical — default mode)
//   /directory/tables/<slug>/s4/index.html      (force S/4 — or redirect)
//   /directory/tables/<slug>/ecc/index.html     (force ECC — or redirect)
//
// Which outputs are generated depends on `mode`:
//   mode: both      → all three, canonical = s4 content, s4/ & ecc/ render
//                     their mode-specific content
//   mode: s4-only   → canonical = s4, s4/ = same, ecc/ = redirect page
//   mode: ecc-only  → canonical = ecc, ecc/ = same, s4/ = redirect page

const MODE_LABELS = {
  s4: 'S/4HANA',
  ecc: 'ECC',
  'both': 'S/4HANA & ECC',
  's4-only': 'S/4-only',
  'ecc-only': 'ECC-only'
};

const LICENSE_LABELS = {
  runtime: 'Runtime OK',
  full: 'Full Use required',
  'bw-bridge': 'BW Bridge + Datasphere'
};

const LATENCY_LABELS = {
  batch: 'Batch',
  realtime: 'Real-time'
};

const VOLUME_FILTER_LABELS = {
  any: 'Any',
  small: 'Under 500M rows',
  big: '> 500M rows'
};

// Maps directory method IDs to walkthrough picker method values.
const PICKER_METHOD_MAP = {
  'odp': 'odp',
  'odp-cds': 'odp',
  'slt': 'slt',
  'rfc': 'rfc',
  'cds-direct': 'odp',
  'bw-bridge': 'odp',
  'odata': 'odp',
};

const directorySitemapEntries = [];
const directoryTables = []; // collected for the index page

function formatTypeDisplay(col) {
  const t = (col.type || '').toUpperCase();
  if (!t) return '';
  if (col.length != null && col.decimals != null) {
    return `${t}(${col.length},${col.decimals})`;
  }
  if (col.length != null) {
    return `${t}(${col.length})`;
  }
  return t;
}

function pickModeVariant(data, mode) {
  // For a `mode: both` table, data has parallel `_ecc` fields. For ECC, prefer
  // the _ecc variant; fall back to the S/4 field with a warning.
  if (mode !== 'ecc') return { data, missingFallbacks: [] };

  const missingFallbacks = [];
  const suffix = '_ecc';
  const eccFields = [
    'description_one_liner',
    'columns',
    'columns_total',
    'scope_lock',
    'extract_methods',
    'notes',
    'ingestion_guidance',
    'typical_rows',
    'volume_class',
    'released_cds'
  ];
  const merged = { ...data };
  for (const f of eccFields) {
    const eccKey = f + suffix;
    if (data[eccKey] !== undefined) {
      merged[f] = data[eccKey];
    } else if (data.mode === 'both') {
      // A `both` table missing an _ecc variant → warn but don't fail.
      missingFallbacks.push(f);
    }
  }
  return { data: merged, missingFallbacks };
}

function buildDirectoryTableViewModel(data, bodyHtml, slug, mode, canonicalPath) {
  const name = data.name || slug.toUpperCase();
  const moduleCode = data.module || '';
  const columns = Array.isArray(data.columns) ? data.columns : [];
  const columnsForDisplay = columns.map((c) => ({
    ...c,
    typeDisplay: formatTypeDisplay(c)
  }));

  // Partition keys heuristic: use explicit partition_keys if present; else fall
  // back to the first two key columns — matches the brief's ACDOCA example.
  const partitionKeys = Array.isArray(data.partition_keys) && data.partition_keys.length
    ? data.partition_keys
    : columns.filter((c) => c.key).slice(0, 2).map((c) => c.name);

  // DDL — generated at build time, one pane per dialect. Skip for stub tables.
  const ingestion = data.ingestion_guidance || {};
  const ddlPanes = columns.length === 0 ? [] : [
    { dialect: 'snowflake',  shortId: 'snow', label: 'Snowflake',  active: true },
    { dialect: 'databricks', shortId: 'dbx',  label: 'Databricks', active: false },
    { dialect: 'fabric',     shortId: 'fab',  label: 'Fabric',     active: false }
  ].map((p) => {
    const ddl = generateDdl(p.dialect, name, columns, partitionKeys, { module: moduleCode });
    const prose = ingestion[p.dialect] || '';
    return {
      dialect: p.dialect,
      shortId: p.shortId,
      dialectLabel: p.label,
      active: p.active,
      ddl,
      ingestionHtml: prose ? marked.parse(prose) : '',
      docsUrl: ingestion[`${p.dialect}_docs_url`] || ''
    };
  });

  // Extract methods — stable order; attach filter-dimension labels for chips.
  const rawMethods = Array.isArray(data.extract_methods) ? data.extract_methods : [];
  const methods = rawMethods.map((m, idx) => ({
    id: m.id || `m${idx + 1}`,
    number: String(idx + 1).padStart(2, '0'),
    name: m.name || '',
    flavor: m.flavor || '',
    tagline: m.tagline || '',
    license: m.license || 'runtime',
    latency: m.latency || 'batch',
    volume: m.volume || 'any',
    licenseLabel: LICENSE_LABELS[m.license] || (m.license || 'Runtime OK'),
    latencyLabel: LATENCY_LABELS[m.latency] || (m.latency || 'Batch'),
    volumeLabel: VOLUME_FILTER_LABELS[m.volume] || (m.volume || 'Any'),
    why: m.why || '',
    bodyHtml: m.body_markdown ? marked.parse(m.body_markdown) : '',
    walkthroughSlug: m.walkthrough_slug || '',
    pickerMethod: PICKER_METHOD_MAP[m.id] || 'odp',
    hasLinksSeparator: !!(m.walkthrough_slug && m.license_article_url),
    licenseArticleUrl: m.license_article_url || '',
    licenseArticleLabel: m.license_article_label || 'Licensing article'
  }));

  // Columns JSON view — pre-highlight at build time (zero-dep).
  const jsonPayload = {
    table: name,
    module: moduleCode,
    released_cds: data.released_cds || null,
    source: 'help.sap.com',
    columns: columns.map((c) => ({
      name: c.name,
      type: (c.type || '').toUpperCase(),
      length: c.length != null ? c.length : null,
      key: !!c.key,
      source: c.source || null,
      description: c.description || ''
    }))
  };

  const defaultMethod = methods[0];
  return {
    // identity
    slug,
    name,
    title: data.title || name,
    module: moduleCode,
    moduleRole: data.module_role || data.module_name || '',
    releasedCds: data.released_cds || '',
    typicalRows: data.typical_rows || '',
    volumeClass: data.volume_class || '',
    descriptionOneLiner: data.description_one_liner || '',
    scopeLock: data.scope_lock || '',
    // system availability tags
    systemTags: (() => {
      const modeStr = data.mode || 's4-only';
      if (modeStr.includes('both') || modeStr === 's4-ecc') return ['S/4HANA', 'ECC'];
      if (modeStr.includes('ecc')) return ['ECC'];
      return ['S/4HANA'];
    })(),
    // body (rendered markdown)
    body: bodyHtml,
    // columns
    columns: columnsForDisplay,
    columnsCount: columns.length,
    columnsJsonHtml: highlightJson(jsonPayload),
    // ddl
    ddlPanes,
    // methods
    methods,
    methodsCount: methods.length,
    defaultMethod: !!defaultMethod,
    defaultMethodName: defaultMethod ? `${defaultMethod.name}${defaultMethod.flavor ? ' · ' + defaultMethod.flavor : ''}` : '',
    defaultMethodWhy: defaultMethod ? defaultMethod.why : '',
    // notes
    notes: Array.isArray(data.notes)
      ? data.notes.map((n) => ({
          date: n.date || '',
          headline: n.headline || '',
          bodyHtml: n.body_markdown ? marked.parseInline(n.body_markdown) : '',
          sapNote: n.sap_note || '',
          sapNoteUrl: n.sap_note_url || ''
        }))
      : [],
    // related articles
    relatedArticles: Array.isArray(data.related_articles)
      ? data.related_articles.map((a) => ({ slug: a.slug || '', title: a.title || a.slug || '' }))
      : [],
    hasRelatedArticles: Array.isArray(data.related_articles) && data.related_articles.length > 0,
    // sidenav helpers
    notesCount: Array.isArray(data.notes) ? data.notes.length : 0,
    lastRefreshed: data.last_refreshed || '',
    // SEO / base
    seoTitle: data.seo_title || `${name} — SAP Table Directory`,
    seoDescription: data.seo_description || data.description_one_liner || `${name} reference: columns, DDL, and extraction methods.`,
    canonicalPath
  };
}

function renderDirectoryPageToFile(pageType, viewModel, outputDir, outputPath) {
  const mergedData = {
    ...viewModel,
    strings,
    jsonLd: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': viewModel.name,
      'description': viewModel.seoDescription,
      'url': 'https://academy.example.com' + viewModel.canonicalPath
    }),
    currentYear,
    basePath: BASE_PATH,
    buttondownUsername: 'example',
    ogImage: 'default-og.png',
    ogType: 'website'
  };

  const template = pageTemplates[pageType];
  const pageContent = Mustache.render(template, mergedData, partials);
  const html = Mustache.render(baseTemplate, { ...mergedData, content: pageContent }, partials);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf-8');

  sitemapEntries.push({
    url: viewModel.canonicalPath,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.7
  });
  console.log(`✓ Built ${viewModel.canonicalPath}`);
}

function buildRedirectPage(data, slug, mode, outputDir, outputPath, canonicalPath) {
  // The user landed on a mode that this table doesn't exist in.
  // `mode` is the mode they wanted. Show the equivalents for THAT mode.
  // ACDOCA is mode:s4-only; if the user asks for ECC they see `equivalent_in_ecc`.
  const otherMode = mode === 's4' ? 'ecc' : 's4';
  const equivalentsKey = mode === 's4' ? 'equivalent_in_s4' : 'equivalent_in_ecc';
  const equivalents = Array.isArray(data[equivalentsKey]) ? data[equivalentsKey] : [];

  const name = data.name || slug.toUpperCase();
  const headline = mode === 'ecc'
    ? `${name} doesn't exist in ECC`
    : `${name} was replaced in S/4HANA`;
  const subtitle = mode === 'ecc'
    ? `${name} is an S/4HANA-only table. In ECC, the equivalent data is spread across multiple tables.`
    : `${name} was superseded in S/4HANA. See the replacement tables below.`;

  const vm = {
    slug,
    name,
    currentMode: mode,
    isS4: mode === 's4',
    isEcc: mode === 'ecc',
    modeLabel: MODE_LABELS[mode],
    otherModeLabel: MODE_LABELS[otherMode],
    redirectHeadline: headline,
    redirectSubtitle: subtitle,
    equivalents,
    body: data.redirect_body_html || '',
    canonicalPath,
    seoTitle: `${name} in ${MODE_LABELS[mode]} — SAP Table Directory`,
    seoDescription: subtitle
  };

  renderDirectoryPageToFile('directoryRedirect', vm, outputDir, outputPath);
}

function buildDirectoryTablePage(filePath, content) {
  const { data, content: body } = matter(content);
  const slug = data.slug || path.parse(filePath).name;
  const mode = data.mode || 'both';
  const bodyHtml = marked(body);

  // Schema validation — hard failure if validator is present.
  if (validateDirectory) {
    try {
      validateDirectory(data, { filePath });
    } catch (err) {
      throw new Error(`Directory schema validation failed for ${filePath}: ${err.message}`);
    }
  }

  // Record for the directory index.
  directoryTables.push({ slug, data });

  // Which of the 3 outputs do we emit, and as what kind of page?
  // - canonical (/directory/tables/<slug>/) = default mode content
  // - /s4/ and /ecc/ = force that mode OR redirect if the table doesn't
  //   exist in that mode
  const defaultMode = mode === 'ecc-only' ? 'ecc' : 's4';

  const outputs = [
    { segment: '',     renderMode: defaultMode, isForce: false },
    { segment: 's4',   renderMode: 's4',        isForce: true  },
    { segment: 'ecc',  renderMode: 'ecc',       isForce: true  }
  ];

  for (const out of outputs) {
    const outputDir = out.segment
      ? path.join(OUTPUT_DIR, 'directory', 'tables', slug, out.segment)
      : path.join(OUTPUT_DIR, 'directory', 'tables', slug);
    const outputPath = path.join(outputDir, 'index.html');
    const canonicalPath = out.segment
      ? `/directory/tables/${slug}/${out.segment}/`
      : `/directory/tables/${slug}/`;

    // Does this render variant need to be a redirect?
    const isRedirect =
      (mode === 's4-only' && out.renderMode === 'ecc') ||
      (mode === 'ecc-only' && out.renderMode === 's4');

    if (isRedirect) {
      buildRedirectPage(data, slug, out.renderMode, outputDir, outputPath, canonicalPath);
      continue;
    }

    // Pick the right mode-variant content; warn on missing _ecc.
    const { data: modeData, missingFallbacks } = pickModeVariant(data, out.renderMode);
    if (missingFallbacks.length > 0) {
      console.warn(
        `⚠ Directory table '${slug}' (mode: both) is missing _ecc variants for: ${missingFallbacks.join(', ')} — falling back to S/4 content.`
      );
    }
    const vm = buildDirectoryTableViewModel(modeData, bodyHtml, slug, out.renderMode, canonicalPath);
    renderDirectoryPageToFile('directoryTable', vm, outputDir, outputPath);
  }
}

function generateDirectoryIndex() {
  // Runs after all /directory/tables/*.md files have been processed so
  // `directoryTables` is populated.
  if (directoryTables.length === 0) return;

  const moduleCodes = Array.from(
    new Set(directoryTables.map((t) => t.data.module).filter(Boolean))
  ).sort();
  const moduleChips = moduleCodes.map((code) => ({
    code,
    label: MODULE_LABELS[code] || code
  }));

  const items = directoryTables
    .slice()
    .sort((a, b) => (a.data.name || a.slug).localeCompare(b.data.name || b.slug))
    .map(({ slug, data }) => {
      const mode = data.mode || 'both';
      return {
        slug,
        name: data.name || slug.toUpperCase(),
        title: data.title || '',
        module: data.module || '',
        mode,
        systemTags: (() => {
          const modeStr = mode;
          if (modeStr.includes('both') || modeStr === 's4-ecc') return ['S/4HANA', 'ECC'];
          if (modeStr.includes('ecc')) return ['ECC'];
          return ['S/4HANA'];
        })(),
        descriptionOneLiner: data.description_one_liner || '',
        typicalRows: data.typical_rows || '',
        volumeClass: data.volume_class || '',
        url: `/directory/tables/${slug}/`
      };
    });

  const canonicalPath = '/directory/tables/';
  const mergedData = {
    itemCount: items.length,
    moduleCount: moduleCodes.length,
    items,
    moduleChips,
    strings,
    currentYear,
    basePath: BASE_PATH,
    canonicalPath,
    seoTitle: 'SAP Table Directory',
    seoDescription: 'Reference directory of the SAP tables most commonly extracted in data-engineering projects. Columns, DDL, extraction methods, release notes.',
    jsonLd: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': 'SAP Table Directory',
      'description': 'Reference directory of SAP tables.',
      'url': 'https://academy.example.com' + canonicalPath
    }),
    ogImage: 'default-og.png',
    ogType: 'website',
    buttondownUsername: 'example'
  };

  const template = pageTemplates.directoryLanding;
  const pageContent = Mustache.render(template, mergedData, partials);
  const html = Mustache.render(baseTemplate, { ...mergedData, content: pageContent }, partials);

  const outputDir = path.join(OUTPUT_DIR, 'directory', 'tables');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf-8');
  sitemapEntries.push({
    url: canonicalPath,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.8
  });
  console.log(`✓ Built ${canonicalPath}`);
}

function generateIndexPages() {
  const tables = [];
  const glossary = [];
  const articles = [];

  // Collect tables
  const tablesDir = path.join(CONTENT_DIR, 'tables');
  if (fs.existsSync(tablesDir)) {
    const files = fs.readdirSync(tablesDir);
    for (const file of files) {
      if (file.endsWith('.md') && file !== 'index.md') {
        const content = fs.readFileSync(path.join(tablesDir, file), 'utf-8');
        const { data } = matter(content);
        tables.push({
          slug: data.code ? data.code.toLowerCase() : path.parse(file).name,
          code: data.code,
          name: data.name,
          module: data.module,
          businessDescription: data.businessDescription,
          volumeClass: data.volumeClass,
          sourceSystem: data.sourceSystem || 'S/4HANA'
        });
      }
    }
  }

  // Collect glossary terms
  const glossaryDir = path.join(CONTENT_DIR, 'glossary');
  if (fs.existsSync(glossaryDir)) {
    const files = fs.readdirSync(glossaryDir);
    for (const file of files) {
      if (file.endsWith('.md') && file !== 'index.md') {
        const content = fs.readFileSync(path.join(glossaryDir, file), 'utf-8');
        const { data } = matter(content);
        glossary.push({
          slug: data.slug,
          term: data.term,
          fullName: data.fullName,
          shortDefinition: data.shortDefinition
        });
      }
    }
  }

  // Collect articles
  const articlesDir = path.join(CONTENT_DIR, 'articles');
  if (fs.existsSync(articlesDir)) {
    const files = fs.readdirSync(articlesDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(articlesDir, file), 'utf-8');
        const { data } = matter(content);
        articles.push({
          slug: data.slug,
          title: data.title,
          summary: data.summary,
          publishDate: data.publishDate,
          readingTimeMinutes: data.readingTimeMinutes,
          author: data.author
        });
      }
    }
  }

  // Generate tables index page
  if (tables.length > 0) {
    const moduleCodes = Array.from(new Set(tables.map(t => t.module).filter(Boolean))).sort();
    const moduleChips = moduleCodes.map(code => ({ code, label: MODULE_LABELS[code] || code }));

    const items = tables.map(t => {
      const hasWalkthrough = walkthroughsBySlug[t.slug] !== undefined;
      return {
        code: t.code,
        name: t.name,
        module: t.module,
        source: t.sourceSystem,
        description: t.businessDescription,
        volumeLabel: VOLUME_LABELS[t.volumeClass] || (t.volumeClass
          ? t.volumeClass.charAt(0).toUpperCase() + t.volumeClass.slice(1)
          : 'Unspecified'),
        walkthroughLabel: hasWalkthrough ? 'Available' : 'Planned',
        url: `/tables/${t.slug}/`
      };
    });

    const tablesPage = {
      slug: '/tables/',
      seoTitle: 'SAP Tables — Extract ACDOCA, BKPF, VBAK, MARA, LFA1',
      seoDescription: 'Complete library of SAP tables for extraction. ACDOCA, BKPF, VBAK, MARA, LFA1. Each with beginner, intermediate, expert walkthroughs.',
      items,
      moduleChips,
      itemCount: items.length
    };
    buildIndexPage('tables', tablesPage);
  }

  // Generate glossary index page
  if (glossary.length > 0) {
    const glossaryPage = {
      slug: '/glossary/',
      title: 'SAP Glossary',
      seoTitle: 'SAP Extraction Glossary — 32 Terms Explained',
      seoDescription: 'Complete glossary of SAP extraction concepts: ODP, SLT, Delta, CDS, Z-fields, CUKY, partitioning, parallelism, licensing, and more.',
      items: glossary.map(g => ({
        title: g.term,
        subtitle: g.fullName,
        description: g.shortDefinition,
        url: `/glossary/${g.slug}/`,
        label: 'Detailed Definition'
      }))
    };
    buildIndexPage('glossary', glossaryPage);
  }

  // Generate articles index page
  if (articles.length > 0) {
    const articlesPage = {
      slug: '/articles/',
      title: 'Articles',
      seoTitle: 'SAP Extraction Articles — Deep Dives',
      seoDescription: 'Expert articles on SAP extraction: why ACDOCA breaks systems, licensing traps, complete walkthrough strategies.',
      items: articles.map(a => ({
        title: a.title,
        // B5/X2: format publishDate (gray-matter parses YAML dates as JS Date
        // objects); if already a string, normalise to YYYY-MM-DD
        subtitle: `${a.readingTimeMinutes} min read · ${
          a.publishDate
            ? new Date(a.publishDate).toISOString().slice(0, 10)
            : ''
        }`,
        description: a.summary,
        url: `/articles/${a.slug}/`,
        label: 'Read Article'
      }))
    };
    buildIndexPage('articles', articlesPage);
  }

  // Generate walkthrough index page — one walkthrough per table
  // (walkthroughsBySlug is populated during walkFiles when processing intermediate walkthroughs)
  const walkthroughItems = Object.values(walkthroughsBySlug).map(w => ({
    title: w.table,
    description: w.summary,
    url: `/walkthrough/${w.slug}/`,
    label: 'Start'
  }));
  if (walkthroughItems.length > 0) {
    buildIndexPage('walkthrough', {
      slug: '/walkthrough/',
      title: 'Walkthroughs',
      pageIntro: 'Step-by-step SAP extraction guides for the most commonly extracted tables.',
      seoTitle: 'SAP Extraction Walkthroughs — ODP, SLT, RFC',
      seoDescription: 'Step-by-step extraction walkthroughs for ACDOCA, BKPF, VBAK, MARA, LFA1 and more. ODP, SLT, and RFC patterns covered.',
      items: walkthroughItems
    });
  }
}

function buildIndexPage(category, data) {
  const outputDir = path.join(OUTPUT_DIR, category);
  const outputPath = path.join(outputDir, 'index.html');

  const mergedData = {
    // B5/X1: list.html uses {{pageTitle}}; pass both pageTitle and title so
    // any template that references either key gets the value.
    pageTitle: data.title,
    title: data.title,
    pageIntro: data.pageIntro || '',
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    canonicalPath: data.slug,
    items: data.items,
    moduleChips: data.moduleChips,
    itemCount: data.itemCount,
    strings,
    currentYear,
    basePath: BASE_PATH,
    ogImage: 'default-og.png',
    ogType: 'website'
  };

  const template = category === 'tables' ? pageTemplates.tablesIndex : pageTemplates.list;
  const pageContent = Mustache.render(template, mergedData, partials);
  const baseData = {
    ...mergedData,
    content: pageContent
  };

  const html = Mustache.render(baseTemplate, baseData, partials);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf-8');

  sitemapEntries.push({
    url: data.slug,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.7
  });

  console.log(`✓ Built ${data.slug}`);
}

function generateSitemap() {
  const entries = [
    { url: '/', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: 1.0 },
    ...sitemapEntries
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const entry of entries) {
    xml += '  <url>\n';
    xml += `    <loc>https://academy.example.com${entry.url}</loc>\n`;
    xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>\n';

  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), xml, 'utf-8');
  console.log('✓ Generated sitemap.xml');
}

function build() {
  console.log('Building SAP Extract Guide...\n');

  if (fs.existsSync(CONTENT_DIR)) {
    walkFiles(CONTENT_DIR);
    generateIndexPages();
    generateDirectoryIndex();
  } else {
    console.log('No content directory found. Skipping content build.');
  }

  generateSitemap();

  console.log('\n✓ Build complete');
}

build();
