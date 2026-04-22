# SKILL: Deployment

Use this skill for GitHub Pages setup, the optional GitHub Action, custom domain, and email capture configuration.

---

## GitHub Pages — Stage 1

### Repository Setup

1. Create GitHub repo: `sap-extract-academy` (or the chosen name)
2. Push all code to `main` branch
3. Go to **Settings → Pages**
4. Source: **Deploy from a branch**
5. Branch: `main`, folder: `/docs`
6. Save

First deploy takes ~1-2 minutes. Subsequent pushes to `main` deploy automatically.

Verify at `https://<username>.github.io/sap-extract-academy/`.

---

## Optional GitHub Action (if `build.js` is used)

If you have a build script that regenerates `docs/` from `content/`, run it automatically on push:

`.github/workflows/build-and-deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
    paths:
      - 'content/**'
      - 'templates/**'
      - 'build.js'
      - 'package.json'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - name: Commit updated docs
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add docs/
          git diff --quiet && git diff --staged --quiet || git commit -m "Rebuild docs"
          git push
```

**Alternative:** if the team commits `docs/` manually after running `npm run build` locally, skip the Action entirely. Simpler for Stage 1.

---

## Custom Domain (Optional, Later)

When ready to move from `username.github.io/sap-extract-academy/` to `academy.extraktstudio.com`:

1. In **Settings → Pages**, add the custom domain
2. Create `docs/CNAME` containing just the domain:

   ```
   academy.extraktstudio.com
   ```

3. Configure DNS at your registrar:
   - `A` records pointing to GitHub IPs:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - OR `CNAME` record pointing to `<username>.github.io`

4. Wait for DNS propagation (usually under 30 min)
5. Enable "Enforce HTTPS" in Settings → Pages

### Update Site URLs

When custom domain goes live, update:

- All canonical URLs in templates
- All Open Graph URLs
- `sitemap.xml` URLs
- `robots.txt` sitemap reference

Do a find-replace from `<username>.github.io/sap-extract-academy` to the new domain.

---

## Email Capture — Buttondown

### Why Buttondown

- Privacy-respecting (GDPR-friendly, EU-hostable)
- Simple API
- Generous free tier (100 subscribers)
- Public embed endpoint needs no API key in client code

### Setup (Human)

1. Sign up at `buttondown.email`
2. Set username (used in embed URL)
3. Configure list: double opt-in ON, GDPR consent ON

### Client-Side Form

In `templates/base.html` footer (or wherever the capture appears):

```html
<form
  action="https://buttondown.email/api/emails/embed-subscribe/{{buttondownUsername}}"
  method="post"
  target="popupwindow"
  onsubmit="window.open('https://buttondown.email/{{buttondownUsername}}', 'popupwindow')"
  class="email-form"
>
  <label for="email-input">{{strings.form.emailLabel}}</label>
  <div class="row">
    <input
      type="email"
      name="email"
      id="email-input"
      required
      placeholder="{{strings.cta.emailPlaceholder}}"
      autocomplete="email"
    />
    <button type="submit">{{strings.cta.subscribeEmail}}</button>
  </div>
  <p class="consent">{{strings.form.consentText}}</p>
</form>
```

`{{buttondownUsername}}` is a template placeholder — the human sets the actual username before deploying.

### Fallback

If Buttondown isn't set up yet, use `mailto:`:

```html
<a href="mailto:hello@extraktstudio.com?subject=Academy updates">
  Email us to get on the update list
</a>
```

---

## Analytics — Plausible

### Setup (Human)

1. Sign up at `plausible.io` (or self-host)
2. Add site `academy.extraktstudio.com` (or GitHub Pages URL)
3. Copy the snippet

### Installation

Add to `templates/base.html` head, commented out until ready:

```html
<!-- <script defer data-domain="academy.example.com" src="https://plausible.io/js/script.js"></script> -->
```

When ready, uncomment and update `data-domain`.

### What to Track

Plausible tracks pageviews by default. Additional events worth adding:

- Email subscribe (success)
- Walkthrough step completion
- PDF download

Via Plausible's custom event API:

```js
plausible('Walkthrough Step Complete', { props: { walkthrough: 'expert-acdoca', step: 'step-5' } });
```

---

## Pre-Deploy Lighthouse Check

Before every deploy, run Lighthouse locally:

```bash
# Serve docs folder locally
npx serve docs

# Open http://localhost:3000 in Chrome
# DevTools → Lighthouse → Generate report (Mobile + Desktop)
```

Targets:
- Performance ≥ 95
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 95

Common fixes if short:
- **Performance:** optimize images, remove blocking JS, add `loading="lazy"`
- **Accessibility:** alt text, color contrast, form labels
- **Best Practices:** serve images as AVIF/WebP, HTTPS-only links, no `<script>` without `defer` or `async`
- **SEO:** valid title, meta description, canonical URL, robots not blocking

---

## Post-Deploy Verification

1. Visit deployed URL
2. All 15 walkthroughs load
3. Email form submits (test with real email)
4. localStorage persists across refreshes
5. Run Lighthouse on production URL
6. Submit sitemap to Google Search Console
7. Submit sitemap to Bing Webmaster Tools

---

## Rollback

GitHub Pages deploys from `main`/`docs` folder. To roll back:

1. `git revert <commit>` for the problematic commit
2. `git push`
3. Redeploys in ~1-2 min

Or in Settings → Pages, select a previous deployment from history.
