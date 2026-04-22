# SAP Extract Academy Deployment

This document describes how the SAP Extract Academy is built and deployed.

## Build System

The site is built using Node.js with a custom build script that:

1. **Reads markdown files** from `content/en/` with YAML frontmatter
2. **Parses frontmatter** (gray-matter) to extract metadata
3. **Renders markdown** (marked) to HTML
4. **Selects templates** based on page type (table, walkthrough, article, glossary, landing, page)
5. **Renders templates** (Mustache) with metadata and content
6. **Generates index pages** automatically for tables, glossary, articles
7. **Outputs static HTML** to `docs/` directory
8. **Generates sitemap.xml** for SEO

### Build locally

```bash
cd sap-extract-academy
npm install
npm run build
```

Output is in `docs/` directory.

## GitHub Pages Deployment

The site is deployed to GitHub Pages automatically on every push to `main`.

### Setup (one-time)

1. Go to repository Settings → Pages
2. Set Source to `Deploy from a branch`
3. Set Branch to `main`, Folder to `/docs`
4. Save

Once configured, the site is live at `https://darshanmeel.github.io/sawan_tech_sap_training/`

### Deployment Workflow

GitHub Actions (`/.github/workflows/deploy.yml`) runs on every push to `main`:

1. **Build step**: Runs `npm run build` in `sap-extract-academy/`
2. **Upload step**: Uploads `docs/` as GitHub Pages artifact
3. **Deploy step**: Deploys artifact to GitHub Pages
4. **Lighthouse step** (optional): Runs Lighthouse CI performance checks

### Manual Deployment

To trigger a manual deployment:

```bash
git push origin main
```

The workflow will run automatically.

## Testing Locally

### Serve built site

```bash
cd sap-extract-academy/docs
npx local-web-server
# Open http://localhost:8000
```

### Run Lighthouse CI

```bash
cd /path/to/repo
npx lhci autorun --config=./lighthouserc.json
```

Lighthouse checks these pages:

- Home: `/`
- Tables: `/tables/`
- Glossary: `/glossary/`
- Articles: `/articles/`
- Walkthroughs (beginner, intermediate, expert)

### Performance Targets

Lighthouse CI enforces these minimum scores (on main branch):

- **Performance**: 85%
- **Accessibility**: 95%
- **Best Practices**: 90%
- **SEO**: 95%

Pull requests run Lighthouse tests but don't block on score thresholds (warnings only).

## Content Structure

```
content/en/
├── index.md                 # Landing page
├── about.md                 # About page
├── roadmap.md               # Roadmap page
├── tables/
│   ├── acdoca.md
│   ├── bkpf.md
│   ├── vbak.md
│   ├── mara.md
│   └── lfa1.md
├── walkthroughs/
│   ├── beginner/
│   ├── intermediate/
│   └── expert/
├── articles/
│   ├── why-acdoca-breaks-sap.md
│   ├── sap-runtime-license-trap.md
│   └── acdoca-complete-walkthrough.md
└── glossary/
    └── (32 glossary term files)
```

## Key Files

- `build.js`: Main build script
- `templates/`: Mustache templates for page types
- `strings/en.json`: UI strings for i18n
- `docs/assets/css/main.css`: Main stylesheet
- `docs/assets/js/checklist.js`: Walkthrough checklist functionality
- `lighthouserc.json`: Lighthouse CI configuration
- `.github/workflows/deploy.yml`: GitHub Actions workflow

## Troubleshooting

### Build Fails

1. Check Node.js version: `node --version` (should be 18+)
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check for syntax errors in markdown files (YAML frontmatter)

### Site Not Updating on GitHub Pages

1. Check GitHub Actions workflow (`.github/workflows/deploy.yml`)
2. Verify GitHub Pages settings (Settings → Pages)
3. Check build artifacts in GitHub Actions logs

### Lighthouse Tests Failing

1. Run locally: `npx lhci autorun --config=./lighthouserc.json`
2. Check `/sap-extract-academy/docs` is being served correctly
3. Review lighthouse assertions in `lighthouserc.json`

## Performance Optimization

### CSS

- Critical CSS is inlined in base template
- CSS custom properties for design tokens
- Mobile-first responsive design

### JavaScript

- Minimal, single checklist.js file
- Deferred script loading
- localStorage for client-side state

### Images

- Keep images in `/assets/images/` as SVG when possible
- Optimize PNGs with `optipng`

### Fonts

- System font stack (no web font requests)
- Reduced font files

## Continuous Integration

The workflow runs:

- On every push to `main` or `develop`
- On pull requests to `main`
- Manual trigger via `workflow_dispatch`

Pull requests show build status but only main branch triggers deployment.

## Adding New Content

1. Create `.md` file in appropriate `content/en/` subdirectory
2. Add YAML frontmatter with required fields
3. Run `npm run build` to verify
4. Commit and push to trigger deployment

## Deployment Checklist

- [ ] Build passes locally (`npm run build`)
- [ ] No build script errors
- [ ] HTML files generated in `docs/`
- [ ] Markdown syntax valid
- [ ] YAML frontmatter complete
- [ ] Links between pages work
- [ ] Lighthouse scores meet thresholds (optional for PRs)
