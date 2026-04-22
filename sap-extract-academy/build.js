import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';
import Mustache from 'mustache';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, 'content/en');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const OUTPUT_DIR = path.join(__dirname, 'docs');
const STRINGS_PATH = path.join(__dirname, 'strings/en.json');

const strings = JSON.parse(fs.readFileSync(STRINGS_PATH, 'utf-8'));
const baseTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'base.html'), 'utf-8');

const pageTemplates = {
  table: fs.readFileSync(path.join(TEMPLATES_DIR, 'table-detail.html'), 'utf-8'),
  walkthrough: fs.readFileSync(path.join(TEMPLATES_DIR, 'walkthrough.html'), 'utf-8'),
  article: fs.readFileSync(path.join(TEMPLATES_DIR, 'article.html'), 'utf-8'),
  glossary: fs.readFileSync(path.join(TEMPLATES_DIR, 'glossary-term.html'), 'utf-8'),
  roadmap: fs.readFileSync(path.join(TEMPLATES_DIR, 'list.html'), 'utf-8')
};

const sitemapEntries = [];
const currentYear = new Date().getFullYear();

function getPageType(filePath) {
  const normalized = filePath.replaceAll('\\', '/');
  if (normalized.includes('/tables/')) return 'table';
  if (normalized.includes('/walkthroughs/')) return 'walkthrough';
  if (normalized.includes('/articles/')) return 'article';
  if (normalized.includes('/glossary/')) return 'glossary';
  if (normalized.includes('/roadmap/')) return 'roadmap';
  throw new Error(`Unknown page type for ${filePath}`);
}

function getOutputPath(inputPath) {
  const relativePath = path.relative(CONTENT_DIR, inputPath);
  const parsed = path.parse(relativePath);

  let pathSegments = parsed.dir.split(path.sep);

  if (pathSegments[0] === 'walkthroughs') {
    pathSegments[0] = 'walkthrough';
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
      'author': { '@type': 'Organization', 'name': 'SAP Extract Academy' },
      'publisher': { '@type': 'Organization', 'name': 'SAP Extract Academy' },
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
        'name': 'SAP Extract Academy Glossary',
        'url': baseUrl + '/glossary/'
      }
    });
  } else if (pageType === 'roadmap') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'SAP Extract Academy Roadmap',
      'description': 'Upcoming phases and content roadmap',
      'url': baseUrl + canonicalPath
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage' });
}

function buildPage(filePath, content) {
  const { data, content: body } = matter(content);
  const renderedBody = marked(body);
  const pageType = getPageType(filePath);
  const { outputPath, outputDir } = getOutputPath(filePath);
  const canonicalPath = getCanonicalPath(filePath);
  const breadcrumbs = buildBreadcrumbs(filePath, data);
  const jsonLd = buildJsonLd(pageType, data, canonicalPath, breadcrumbs);

  const stepCount = data.steps ? data.steps.length : 0;

  const mergedData = {
    ...data,
    strings,
    body: renderedBody,
    jsonLd,
    canonicalPath,
    currentYear,
    buttondownUsername: 'example',
    ogImage: 'default-og.png',
    ogType: pageType === 'article' ? 'article' : 'website',
    stepCount,
    destinations: Array.isArray(data.destinations) ? data.destinations.join(', ') : data.destinations,
    extractors: Array.isArray(data.extractors) ? data.extractors.join(', ') : data.extractors,
    prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : []
  };

  const pageTypeTemplate = pageTemplates[pageType];
  const pageContent = Mustache.render(pageTypeTemplate, mergedData);

  const baseData = {
    ...mergedData,
    content: pageContent
  };

  const html = Mustache.render(baseTemplate, baseData);

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
      const content = fs.readFileSync(fullPath, 'utf-8');
      buildPage(fullPath, content);
    }
  }
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
  console.log('Building SAP Extract Academy...\n');

  if (fs.existsSync(CONTENT_DIR)) {
    walkFiles(CONTENT_DIR);
  } else {
    console.log('No content directory found. Skipping content build.');
  }

  generateSitemap();

  console.log('\n✓ Build complete');
}

build();
