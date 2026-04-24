# SAP Extract Guide

> A free, production-grade field guide for extracting data out of SAP S/4HANA and ECC into any cloud data platform — without the licensing surprises, memory crashes, and 3 AM incidents that come from learning these patterns the hard way.

**Live site:** [https://darshanmeel.github.io/sawan_tech_sap_training/](https://darshanmeel.github.io/sawan_tech_sap_training/)

**Repo layout:** This is a mono-repo containing the static site source (`sap-extract-academy/`) plus supporting notes and planning docs at the root. The site itself is a fully static build output under `sap-extract-academy/docs/`, published to GitHub Pages from `main`.

---

## Table of Contents

1. [Who this is for](#who-this-is-for)
2. [What the site teaches](#what-the-site-teaches)
3. [Content architecture](#content-architecture)
4. [The five tables](#the-five-tables)
5. [Extraction methods covered](#extraction-methods-covered)
6. [Licensing guardrails](#licensing-guardrails)
7. [How to navigate the site](#how-to-navigate-the-site)
8. [Repository layout](#repository-layout)
9. [Local development](#local-development)
10. [Build system overview](#build-system-overview)
11. [Deployment](#deployment)
12. [Content conventions](#content-conventions)
13. [Contributing](#contributing)
14. [Roadmap](#roadmap)
15. [Trademarks and licensing](#trademarks-and-licensing)

---

## Who this is for

This guide is written for four audiences:

- **Data engineers** building extraction pipelines from SAP into Snowflake, Databricks, BigQuery, Redshift, Fabric, or object storage. You want patterns that survive real volumes (billions of rows), not toy tutorials against a demo system.
- **Data architects** designing the target architecture before a single line of config is written. You need to weigh ODP vs. SLT vs. RFC, understand the blast radius of each, and know what each license entitles you to.
- **SAP Basis / BTP teams** who own the source system and get paged when an extraction job locks ACDOCA during month-end close. You need to know which levers to pull in LTRC, LTRS, ODQMON, and SM50.
- **Analytics engineers and technical program managers** who don't touch SAP themselves but need to scope the work, budget the license, and set realistic expectations with finance and operations stakeholders.

The shared thread: everyone here is somewhere on the path from "we need SAP data in the warehouse" to "the pipeline runs unattended and Finance trusts it".

## What the site teaches

Every page is organised around the same three-part mental model:

1. **SAP-side reality first.** Released CDS views, authorization requirements, volume characteristics, delta mechanics, and the gotchas that break pipelines. This is the part most tutorials skip, and it is the part that actually determines whether your project ships.
2. **Tool configuration second.** ADF, Databricks, Fivetran, Qlik Replicate, Python/pyrfc, SAP Datasphere, SLT targets — wrapped so you only see the stack you care about.
3. **Operations and cost reality third.** Reconciliation patterns, partitioning math, license costs, lock contention on dialog users, and the failure modes you will actually hit in production.

The site deliberately does **not** teach "how to click through LTRC for the first time" as a standalone exercise — those walkthroughs exist all over the web. It teaches the patterns and trade-offs that are hard to find anywhere else, grounded in the tables your business actually cares about.

## Content architecture

The site is composed of five content types, all generated from Markdown:

| Content type | Path on site | What it is |
|---|---|---|
| **Landing** | `/` | Bento-style home page that frames the site and links to the five featured tables. |
| **Tables** | `/tables/<slug>/` | Per-table reference: business meaning, fields, ECC vs. S/4HANA DDL, typical volumes, and links to the table's end-to-end walkthrough. |
| **Walkthroughs** | `/walkthrough/<slug>/` | One end-to-end walkthrough per table. Each covers ODP, SLT, and RFC paths in a single canonical document — no more beginner / intermediate / expert fragmentation. |
| **Articles** | `/articles/<slug>/` | Long-form deep dives: ACDOCA memory internals, Runtime vs. Full Use licensing, Datasphere replication, OData integration, and a core "how to extract any SAP data" guide that glues everything together. |
| **Glossary** | `/glossary/<term>/` | 32 terms covering SAP transactions (LTRC, LTRS, ODQMON, SE16N, SM59), extraction concepts (ODP, SLT, RFC, delta, CDS), field types (CUKY, CURR, DATS, NUMC, QUAN, MEINS), and runtime concepts (dialog work process, extractor, transport request). |

One walkthrough per table is a deliberate choice made in April 2026. The earlier structure had three levels (beginner / intermediate / expert) per table, which meant readers had to context-switch between three very similar documents and maintainers had to keep them in sync. The merged model keeps all three trajectories — small batch, partitioned batch, real-time streaming — inside a single tabbed walkthrough.

## The five tables

This guide covers five SAP tables that together represent the bulk of enterprise extraction work:

| Table | Module | Business meaning | Why it's featured |
|---|---|---|---|
| **ACDOCA** | FI — Finance | Universal Journal. Every GL posting in S/4HANA. | The hardest table in SAP. 2–20 billion rows at large enterprises. Extracting it wrong will take the system down during close. |
| **BKPF** | FI — Finance | Accounting document headers. One row per financial document. | The classic FI extraction pattern — smaller volumes than ACDOCA, but you need it for audit trails and document-level reconciliation. |
| **VBAK** | SD — Sales & Distribution | Sales order headers. One row per sales order. | The canonical real-time streaming use case. Sales velocity dashboards, fulfillment SLAs, and order-to-cash analytics all start here. |
| **MARA** | MM — Materials Management | Material master. One row per material, across all plants. | Master data. Small enough to full-load, complex enough to teach Z-field handling and MANDT filtering. |
| **LFA1** | MM — Materials Management | Vendor master. One row per vendor / supplier. | The other canonical master data table. Great for teaching slowly-changing-dimension patterns against SAP. |

Each table has a dedicated reference page under `/tables/<slug>/` and a single end-to-end walkthrough under `/walkthrough/<slug>/`. The reference pages also ship ECC and S/4HANA DDL side by side, generated from the source-of-truth field lists in `content/en/directory/tables/<slug>/`.

## Extraction methods covered

Every walkthrough covers three paths, so you can see the trade-off directly:

### ODP — Operational Data Provisioning (OData or RFC)

- **What it is:** SAP's officially supported framework for third-party extraction. Exposes released CDS views over OData or (historically) RFC. Handles full loads and delta via built-in queues (monitored in ODQMON).
- **License:** Runtime-compatible when accessed via OData against published CDS views. Note 3255746 (Feb 2024) restricted third-party RFC access to ODP — this is covered in detail in the licensing articles.
- **Ceiling:** ~500M rows per partition before you start fighting timeouts. Delta latency is poll-based (typically 5–15 minutes at best).
- **Tools that speak ODP:** ADF, Fivetran, Qlik Replicate, Informatica, Airbyte, custom Python via pyrfc or OData clients.

### SLT — SAP Landscape Transformation

- **What it is:** SAP's real-time replication server. Trigger-based change data capture at the database layer. Configured via LTRC and LTRS. Pushes directly to Kafka, cloud storage, SAP Datasphere, HANA, or another SAP system.
- **License:** Full Use only. This is the single most expensive licensing surprise in SAP extraction — covered at length in [`articles/runtime-vs-full-use`](./sap-extract-academy/content/en/articles/runtime-vs-full-use.md) and [`articles/sap-runtime-license-trap`](./sap-extract-academy/content/en/articles/sap-runtime-license-trap.md).
- **Ceiling:** Billions of rows with LTRS parallelism (8–16 parallel readers is common). Sub-minute delta latency is achievable.
- **Targets:** Kafka, S3 / ADLS / GCS, Snowflake, Databricks, SAP HANA, SAP Datasphere, Google BigQuery via partners.

### RFC — Remote Function Call (custom)

- **What it is:** Direct function-module calls from Python, Java, or .NET into SAP. Low-level, flexible, and dangerous in the wrong hands.
- **License:** Mixed. Custom ABAP extractors are not permitted on Runtime. BAPIs for standard operations are fine. Third-party ODP-via-RFC is restricted by Note 3255746.
- **When to use:** Edge cases only — tables without CDS views, niche function modules, or one-off historical extractions. Not recommended for new projects.
- **Covered separately:** [`articles/rfc-replication-guide`](./sap-extract-academy/content/en/articles/rfc-replication-guide.md) covers the patterns and pitfalls.

The guide's opinion: most teams should start with ODP via OData, validate the license covers it, and only escalate to SLT when they have a concrete requirement that ODP cannot meet (typically sub-5-minute delta on a high-volume table).

## Licensing guardrails

Licensing is the single biggest cause of SAP extraction projects going sideways, and the site gives it proportionate weight. Two dedicated articles cover it in detail:

- **[`articles/runtime-vs-full-use`](./sap-extract-academy/content/en/articles/runtime-vs-full-use.md)** — the architect-facing decision framework. What each license type permits, how to validate yours before designing, and a decision matrix mapping requirements to license tier.
- **[`articles/sap-runtime-license-trap`](./sap-extract-academy/content/en/articles/sap-runtime-license-trap.md)** — the incident-facing view. Why organizations fall into the trap, how SAP audits detect it, what the retroactive bills look like, and the recovery paths when you are already in violation.

The short version that everyone should internalize:

- **ODP via OData against published CDS views** — permitted on Runtime.
- **SLT (any target)** — Full Use only.
- **Custom ABAP extractors** — Full Use only.
- **Third-party tools using ODP via RFC** — restricted by SAP Note 3255746 regardless of license tier.
- **Third-party tools using ODP via OData** — permitted on Runtime; verify with your vendor.

Treat license type as a hard architectural constraint. Validate in week one. Get it in writing from SAP licensing, not from your account exec.

## How to navigate the site

Four entry points, depending on what you're trying to do:

1. **I'm new — where do I start?** → Open the [Core Extraction Guide](https://darshanmeel.github.io/sawan_tech_sap_training/articles/how-to-extract-any-sap-data/). It walks through the full mental model, from "which method fits my use case" through two worked examples (ACDOCA via ODP and VBAK via SLT) end to end.
2. **I know which table I need.** → Go to `/tables/<slug>/` for the reference page, then follow the link to `/walkthrough/<slug>/`.
3. **I'm scoping a project and need the licensing view.** → Read the two licensing articles first, then skim the method-specific guides (`odp-setup-guide`, `slt-setup-guide`, `rfc-replication-guide`, `datasphere-replication-guide`, `odata-integration-guide`).
4. **I hit a term I don't recognize.** → `/glossary/<term>/`. The glossary is deliberately concise (one concept per page) so you can link back into it from walkthroughs without dragging readers into a 2000-word tangent.

## Repository layout

```
sawan_tech_sap_training/
├── README.md                        # This file — repo-level overview
├── sap-extract-academy/             # The site
│   ├── README.md                    # Site-level README (build details, content conventions)
│   ├── package.json                 # Node deps (marked, mustache, gray-matter, js-yaml)
│   ├── build.js                     # Main build script: markdown → HTML
│   ├── build/                       # Support modules
│   │   ├── ddl.js                   # Generates ECC + S/4HANA DDL from table field lists
│   │   └── directory-validator.js   # Sanity-checks table metadata
│   ├── content/en/                  # All content (English; structure is i18n-ready)
│   │   ├── index.md                 # Landing page
│   │   ├── about.md, roadmap.md     # Static pages
│   │   ├── tables/                  # 5 table reference pages
│   │   ├── walkthroughs/            # End-to-end walkthroughs (one per table)
│   │   ├── articles/                # 10 long-form articles
│   │   ├── glossary/                # 32 term definitions
│   │   └── directory/tables/        # Field-level metadata driving the DDL generator
│   ├── templates/                   # Mustache templates (one per page type)
│   ├── strings/en.json              # UI text — internationalization-ready
│   ├── docs/                        # BUILD OUTPUT — published to GitHub Pages
│   │   ├── index.html
│   │   ├── tables/, walkthrough/, articles/, glossary/, directory/
│   │   ├── assets/css/, assets/js/, assets/images/
│   │   └── sitemap.xml
│   ├── .github/workflows/           # CI/CD (GitHub Actions → GitHub Pages)
│   └── lighthouserc.json            # Performance budget for Lighthouse CI
├── academy_handoff/                 # Planning docs and the original project spec
└── .claude/                         # Claude Code settings (local only, not published)
```

## Local development

**Prerequisites:** Node.js 18 or newer, npm 9 or newer. No other runtimes, databases, or services required — the site is entirely static.

```bash
# One-time setup
cd sap-extract-academy
npm install

# Build the site
npm run build          # Generates docs/ from content/en/

# Serve it locally
cd docs
npx local-web-server   # Default port 8000
# Open http://localhost:8000
```

**Typical edit loop:**

1. Edit a Markdown file under `sap-extract-academy/content/en/`.
2. Re-run `npm run build` in `sap-extract-academy/`.
3. Refresh the browser on the local web server.
4. When it looks right, commit the Markdown source **and** the regenerated `docs/` output. Both are checked in; the deploy pipeline does not rebuild.

**Why we commit `docs/`:** GitHub Pages serves this repo from the `docs/` folder on `main`. Committing the build output means the live site is always exactly what is in the repo at HEAD — no CI race conditions, no surprises when the pipeline runtime changes. The trade-off is that every content PR includes both source and output changes; the build is fast enough that this is worth it.

## Build system overview

The build is a single Node script (`sap-extract-academy/build.js`) with no framework around it. It runs in two passes:

**Pass 1 — collect.** Walk `content/en/**/*.md`, parse frontmatter (via `gray-matter`), and build an in-memory index of all pages. This is what makes the auto-generated index pages (`/tables/`, `/articles/`, `/walkthrough/`, `/glossary/`) and cross-references (related walkthroughs on each article) possible without manual maintenance.

**Pass 2 — render.** For each page:

1. Render Markdown to HTML with `marked`.
2. Pick a template based on the page's location (`tables/*.md` → `table.html`, `walkthroughs/*.md` → `walkthrough.html`, etc.).
3. Render the template with `Mustache`, passing frontmatter + content + the Pass 1 index as context.
4. Wrap with `base.html` (shared header, footer, nav).
5. Write to `docs/<slug>/index.html`.

Additional outputs generated alongside HTML:

- `sitemap.xml` — every canonical URL.
- ECC and S/4HANA DDL files per table, generated from `content/en/directory/tables/<slug>/` metadata.
- JSON-LD structured data injected into each page (WebPage, HowTo, TechArticle, DefinedTerm — whichever matches the page type).

**Page types and their templates:**

| Source path | Type | Template | Notes |
|---|---|---|---|
| `index.md` | landing | `landing.html` | Bento grid layout, featured tables |
| `about.md`, `roadmap.md` | page | `page.html` | Generic static pages |
| `tables/*.md` | table | `table.html` | Table reference page; embeds DDL |
| `walkthroughs/*.md` | walkthrough | `walkthrough.html` | Tabbed walkthrough with checklist |
| `articles/*.md` | article | `article.html` | Long-form content, 1500–4000 words |
| `glossary/*.md` | glossary | `glossary.html` | One term per page |
| Any index | list | `list.html` | Auto-generated from Pass 1 index |

## Deployment

**GitHub Pages, from `main`, serving the `docs/` folder.** No GitHub Actions pipeline is required to deploy — a push to `main` with updated `docs/` is sufficient. There is a Lighthouse CI workflow under `.github/workflows/` that runs performance audits as advisory warnings, not hard gates.

**Performance budget (enforced in Lighthouse CI):**

- Performance ≥ 85
- Accessibility ≥ 95
- Best Practices ≥ 90
- SEO ≥ 95

The site hits these consistently because it is genuinely static HTML + a small amount of progressive-enhancement JavaScript (checklist persistence and the ECC/S/4HANA picker). No framework, no hydration, no client-side routing.

## Content conventions

A handful of rules keep the content maintainable as the site grows:

**Frontmatter.** Every Markdown file starts with YAML frontmatter. The required fields depend on page type, but `title`, `slug`, `seoTitle`, `seoDescription`, and `updatedAt` are universal. Walkthroughs and articles also declare `relatedWalkthroughs` to drive cross-linking — the build deduplicates by slug so you cannot accidentally link the same walkthrough twice.

**One walkthrough per table.** Do not create `/walkthrough/beginner/<slug>/` or `/walkthrough/expert/<slug>/` directories. The single canonical URL is `/walkthrough/<slug>/`. The walkthrough itself uses tabs or sections to cover small-batch, partitioned-batch, and real-time-streaming trajectories.

**ECC vs. S/4HANA.** Content that only applies to one source system is wrapped in `<div data-ecc-only>…</div>` or `<div data-s4hana-only>…</div>`. The reader's choice in the header picker (persisted in localStorage) shows or hides these blocks. When editing, always set a sensible default — the page should read cleanly if the reader has no preference set.

**Code blocks inside list items.** Markdown inside HTML blocks is tricky. When embedding `<pre><code>` inside an `<li>`, do not leave blank lines between the `<pre>` tags — CommonMark treats a blank line inside a type-6 HTML block as a terminator, which mangles the nested code. This has bitten us multiple times; the rule is: no blank lines inside `<pre>` when it is nested in `<li>`.

**Glossary entries stay short.** One concept per file, ideally under 200 words. Link back out to articles or walkthroughs for depth.

## Contributing

Contributions welcome, particularly:

1. **New tables.** Follow the existing pattern: a `tables/<slug>.md` reference page, a `walkthroughs/<slug>.md` end-to-end walkthrough, and field metadata under `directory/tables/<slug>/` to drive the DDL generator.
2. **Glossary terms.** Anything you had to look up while reading the site is a good candidate.
3. **Corrections.** Especially around licensing — SAP rules change, and this content has to stay accurate. Cite SAP Notes by number whenever possible.
4. **Translations.** The build is i18n-ready (`content/en/` is a locale directory, and UI strings live in `strings/en.json`). Adding a new locale means creating `content/<lang>/` and `strings/<lang>.json`.

Pull requests should include both the Markdown source and the regenerated `docs/` output (run `npm run build` before committing).

## Roadmap

The roadmap lives at [`content/en/roadmap.md`](./sap-extract-academy/content/en/roadmap.md) and is published as a page on the site. High-level direction:

- **Near term** — deepen the licensing content (BTP subscription models, Datasphere licensing), expand glossary to ~50 terms, add Qlik Replicate and Informatica setup guides.
- **Medium term** — add CO (Controlling) tables, cover OData V4 patterns, document the SAP S/4HANA Cloud public edition constraints separately from on-prem.
- **Long term** — HR / SuccessFactors extraction, community contributions, a real-time CDP pattern reference.

## Trademarks and licensing

SAP, S/4HANA, ECC, SLT, ODP, BTP, Datasphere, HANA, and related names are trademarks of SAP SE. This project is an independent educational resource and is not affiliated with, endorsed by, or sponsored by SAP SE.

Content is provided under a permissive license for non-commercial educational use. The build system (everything under `sap-extract-academy/build.js`, `build/`, and `templates/`) is open for reuse.

---

**Built with Node.js, Markdown, Mustache, and deployed to GitHub Pages.** Questions or corrections — open an issue.
