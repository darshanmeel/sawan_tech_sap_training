# agents/deployer.md — Deployer Agent

You handle deployment, verification, and submission tasks only.

---

## Scope

You touch ONLY:
- `docs/sitemap.xml`
- `docs/robots.txt`
- `docs/llms.txt`
- `docs/llms-full.txt`
- `docs/CNAME` (if custom domain)
- `.github/workflows/` (if CI/CD needed)
- Git push and GitHub Pages configuration commands

---

## Deploy Checklist

Run before every deploy to production:

### Pre-deploy
- [ ] `npm run build` completes without errors
- [ ] `find docs -name "*.html" | wc -l` — count matches expected page count
- [ ] No `[NEEDS_SAP_CITATION]` in any published content file
- [ ] No placeholder images in any page that is being published
- [ ] All internal links resolve (no 404s locally)
- [ ] Run: `npx serve docs` and spot-check 5 random pages

### Sitemap
- [ ] `docs/sitemap.xml` lists every page in `docs/`
- [ ] lastmod dates are current
- [ ] Submit to Google Search Console after deploy
- [ ] Submit to Bing Webmaster Tools after deploy

### robots.txt
- [ ] All AI crawlers allowed (see SEO Auditor agent)
- [ ] No important pages accidentally blocked

### llms.txt
- [ ] Lists every walkthrough, table, article, glossary term
- [ ] Descriptions are accurate (not stale)

### llms-full.txt
- [ ] Concatenation of all content markdown files
- [ ] Separated by clear page headers
- [ ] Under 5MB (if larger, split or summarize)

### GitHub Pages
- [ ] Repo Settings → Pages → Source: Deploy from branch
- [ ] Branch: `main`, Folder: `/docs`
- [ ] Custom domain entered if applicable
- [ ] HTTPS enforced: checked
- [ ] Wait 2-5 minutes after push for Pages to rebuild

### After Deploy Verification
- [ ] Visit live URL, confirm home page loads
- [ ] Check one walkthrough URL (should not 404)
- [ ] Check one glossary URL
- [ ] Check one article URL
- [ ] Check `robots.txt` at `/robots.txt`
- [ ] Check `sitemap.xml` at `/sitemap.xml`
- [ ] Check `llms.txt` at `/llms.txt`
- [ ] Run Lighthouse on home page — score 95+ all categories

---

## Common 404 Diagnosis

If pages 404 after deploy:

```bash
# Check what files actually exist in docs/
find docs -type f -name "*.html" | sort

# Check what URLs the nav expects
grep -r "href=" docs/index.html | grep -v "http"

# Compare: do href targets exist as files?
```

Most common causes:
1. Build script didn't run — run `npm run build` first
2. Content files are empty stubs — build skipped them
3. URL pattern mismatch — href says `/tables/vbak/` but file is at `docs/tables/vbak.html`
4. GitHub Pages hasn't rebuilt yet — wait 3 minutes and hard refresh

---

## Commit Format
```
[DEPLOY] rebuild sitemap with 52 pages
[DEPLOY] update llms.txt with new walkthroughs
[DEPLOY] add CNAME for custom domain
[DEPLOY] fix robots.txt AI crawler permissions
```
