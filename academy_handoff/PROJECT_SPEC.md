# PROJECT_SPEC.md — SAP Extract Academy MVP

Complete product specification.

---

## Positioning

**Tagline:** "Learn SAP S/4HANA data extraction the right way — straight from SAP's documentation."

**Elevator pitch:** A free, interactive learning site that teaches data engineers, architects, and SAP Basis professionals how to extract data from S/4HANA into cloud platforms. Every step cited from SAP's official documentation.

**Primary audiences:**
- Data engineers new to SAP (need to ship their first extraction)
- SAP Basis moving into cloud data (need target-side context)
- Junior consultants at SIs (need to ramp on CDS views and ODP)
- Enterprise architects evaluating extraction approaches

**Secondary audiences (incidental but valuable):**
- LLM users asking "how do I extract SAP table X" → our content gets cited
- SEO traffic for long-tail SAP queries → converts to email signups
- SAP certification prep candidates → validates us as a reference

---

## Site Map

```
/                              Landing page
/start/                        Start-here guide
/tables/                       Table library index
/tables/vbak/                  Table detail (and 4 others: lfa1, mara, bkpf, acdoca)
/walkthrough/beginner/vbak/    Individual walkthroughs (15 total at launch)
/walkthrough/intermediate/vbak/
/walkthrough/expert/vbak/
... (etc for 5 tables × 3 levels = 15 walkthroughs)
/glossary/                     Glossary index
/glossary/odp/                 Individual glossary term (32 at launch)
/articles/                     Articles index
/articles/why-acdoca-breaks-sap/
/articles/sap-runtime-license-trap/
/articles/acdoca-complete-walkthrough/
/about/                        About the project
/roadmap/                      Public roadmap
/404.html                      Not found
/sitemap.xml                   Sitemap
/robots.txt                    Robots
```

**URL rules:**
- All directory-style with trailing slash (`/tables/vbak/`), backed by `docs/tables/vbak/index.html`
- All lowercase, hyphens between words
- Never use query strings for content pages

---

## Page Specifications

### 1. Landing (`/`)

**Target query:** "SAP S/4HANA data extraction"

**Sections:**

1. **Hero**
   - H1: "Learn SAP S/4HANA data extraction the right way."
   - Subheading: "Free, step-by-step walkthroughs for VBAK, LFA1, MARA, BKPF, and ACDOCA. Every instruction cited to SAP's official documentation."
   - Primary CTA: "Pick a table" → `/tables/`
   - Secondary CTA: "Read the ACDOCA deep dive" → `/articles/why-acdoca-breaks-sap/`

2. **Three-column value props**
   - SAP-documented | Level-appropriate | Take-it-with-you

3. **Featured walkthrough: ACDOCA**
   - Card with "The Universal Journal at scale"
   - CTA: "See the walkthrough" → `/walkthrough/expert/acdoca/`

4. **Table library preview** — 5 cards

5. **Roadmap teaser**

6. **Email capture**

7. **Footer** with trademark disclaimer

### 2. Start (`/start/`)

Short page for people unsure where to begin. Three paths:
- "I'm new to SAP data extraction" → LFA1 Beginner
- "I need to extract a specific table" → `/tables/`
- "I want concepts first" → `/articles/`

### 3. Tables Index (`/tables/`)

Grid of 5 cards. Each: code, name, module, volume badge, level badges, "View walkthroughs."

### 4. Table Detail (`/tables/[code]/`)

Sections:
1. Header with code, name, module
2. "What this table is" — 2-3 paragraphs cited to SAP Help
3. "Key fields" — table of primary key + notable fields
4. "Volume characteristics"
5. "Extraction gotchas" — 2-3 items with SAP Note citations
6. "Walkthroughs available" — 3 cards linking to each level

**SEO:** this page targets "extract [TABLE] SAP" and "what is [TABLE] SAP" queries.

### 5. Walkthrough (`/walkthrough/[level]/[table]/`)

**The core page of the site.** Layout:

- **Left sidebar (desktop) / top bar (mobile):** table, level, progress ("Step 3 of 12")
- **Main content:** all steps visible in one scroll (not a single-step-at-a-time stepper — better for SEO, better for referencing, works without JS)
- **Right sidebar (desktop only):** "Jump to step" mini-nav, glossary quick links

Each step:
- Step number + title (anchor-linkable, e.g. `#step-3`)
- Explanation paragraph
- "Do this in SAP" block (transaction code, menu path, SAP Help link)
- Code block (if applicable) with syntax highlighting
- **Verify this step** box
- **Why this matters** collapsible (optional per step)
- Checkbox (JS-enhanced via localStorage; page works without JS)
- Glossary terms linked on first mention

End of walkthrough:
- "You've built..." summary
- Download PDF button (JS-generated client-side)
- Related walkthroughs

### 6. Glossary (`/glossary/` and `/glossary/[term]/`)

Index page: alphabetical list of all 32 terms.

Term pages: each has its own URL for SEO. Content per term:
- H1: "Term Name: Full Form in SAP" (e.g. "ODP: Operational Data Provisioning in SAP")
- Short definition (1-3 sentences)
- Extended explanation
- "Also see" cross-links
- "SAP documentation" external link

### 7. Articles Index + Detail

Three cornerstone articles at launch:

1. `why-acdoca-breaks-sap/` — problem → solution narrative
2. `sap-runtime-license-trap/` — warning article, high architect appeal
3. `acdoca-complete-walkthrough/` — long-form, paired with the expert walkthrough

Each article 2000-3500 words, cited throughout.

### 8. Roadmap (`/roadmap/`)

Timeline view:
- Now: S/4HANA on-prem
- Month 4-5: ECC 6.0
- Month 6-7: S/4HANA Cloud
- Month 8-9: BW 7.x + BW/4HANA
- Month 10-12: Datasphere

Each milestone: what ships, why, "notify me when it launches" email capture.

### 9. About (`/about/`)

Short. 400-600 words. See `SKILLS/content-writing.md` for copy.

---

## Content Inventory for Launch

### Tables (5)
VBAK, LFA1, MARA, BKPF, ACDOCA

### Walkthroughs (15)
Each table × 3 levels (Beginner, Intermediate, Expert)

### Articles (3)
The three cornerstone articles above

### Glossary (32 terms)
ABAP, ADT, Append Structure, BAdI, BW, CDS, CUKY, CURR, DATS, Delta, Dialog Work Process, Extractor, LTRC, LTRS, MANDT, MEINS, NUMC, ODP, ODQMON, OpenHub, QUAN, RFC, S/4HANA, SAP Help Portal, SE11, SE16N, SICF, SLT, SM59, Transport Request, TSV_TNEW_PAGE_ALLOC_FAILED, VBELN, Z-field

---

## Visual Design

### Typography

System font stacks. No web fonts:

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
             Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
font-family-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
                  monospace;
```

### Color Palette (CSS custom properties)

```css
:root {
  --color-ink: #1a1816;
  --color-paper: #faf7f2;
  --color-paper-2: #f2ede3;
  --color-rule: #2a2622;
  --color-accent: #c84a1a;       /* burnt orange */
  --color-accent-soft: #e8a77a;
  --color-muted: #6b655c;
  --color-success: #2d5a3d;
  --color-warning: #b8751f;
  --color-danger: #8a1f1a;
  --color-link: #1f4a6e;          /* blue, distinct from accent */
}
```

### Layout

- Max content width: 1100px general, 720px prose
- Mobile-first, breakpoints 640px, 1024px
- Generous whitespace — content site, not app

### Interactive Components

At Stage 1, minimal JS. Only:

- **Checklist** — localStorage-based step tracking (progressive enhancement; page works without JS)
- **Email form submission** — POSTs to Buttondown embed endpoint
- **PDF generation** — client-side via browser print-to-PDF or tiny lib like `jspdf`

Everything else is static HTML.

---

## Email Capture

**Buttondown** at launch (privacy-respecting, EU-friendly, free tier adequate).

Form posts to Buttondown's public embed endpoint:
```
POST https://buttondown.email/api/emails/embed-subscribe/<USERNAME>
Content-Type: application/x-www-form-urlencoded
email=reader@example.com
```

No API token needed in client code.

**Fallback** if Buttondown isn't configured: `mailto:` link to a project email.

---

## Analytics

**Plausible Analytics** (recommended) or **Simple Analytics**.

Why not Google Analytics:
- GDPR compliance friction (cookie banner, consent management)
- Blocked by many privacy-oriented browsers
- Doesn't help with our actual goals (SEO + LLM citation tracking)

Plausible: €9/month for up to 10k monthly pageviews. Worth it.

If zero-budget at launch: use no analytics initially, set up GitHub traffic stats (limited but free), and add Plausible once traffic justifies.

---

## Accessibility

WCAG 2.1 AA minimum. See `SKILLS/accessibility.md`. Every interactive element keyboard-navigable; every image alt-texted; semantic HTML throughout.

---

## Performance Targets

Lighthouse:
- Performance ≥ 95
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 95

Core Web Vitals:
- LCP < 1.0s
- FID < 50ms
- CLS < 0.05

Total page weight < 200KB excluding images. No web fonts. No third-party scripts beyond analytics and Buttondown embed.

---

## Browser Support

Modern evergreen: Chrome/Edge/Firefox/Safari last 2 versions. No IE11, no legacy polyfills.

---

## Out of Scope for Stage 1

- User authentication
- Server-side progress tracking
- Payment integration (Academy is free; Studio is a separate product)
- The Studio code generator
- German content (Stage 2)
- Sources other than S/4HANA on-prem (Stage 2+)
- More than 5 tables
- Search functionality (Stage 2, once content scale justifies)
- Certificates (Stage 2)
