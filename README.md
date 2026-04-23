# SAP Training — Sawan Tech

This repository contains the **SAP Extract Academy** — a free, interactive learning platform for SAP data extraction.

## What's Inside

| Directory | Purpose |
|-----------|---------|
| [`sap-extract-academy/`](./sap-extract-academy/) | Main site: source code, content, build system |
| [`academy_handoff/`](./academy_handoff/) | Project specification, design guide, issue backlog |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Build and deployment documentation |
| [`LINKEDIN_OUTREACH.md`](./LINKEDIN_OUTREACH.md) | Social media strategy and post templates |
| [`lighthouserc.json`](./lighthouserc.json) | Lighthouse CI performance audit config |

## SAP Extract Academy

A free educational platform teaching data engineers how to extract data from SAP S/4HANA and ECC into cloud platforms (Snowflake, Redshift, BigQuery).

**Live site:** [https://darshanmeel.github.io/sawan_tech_sap_training/](https://darshanmeel.github.io/sawan_tech_sap_training/)

**What you'll learn:**
- ODP and SLT extraction patterns (beginner → expert)
- Partitioning strategies for billion-row tables (ACDOCA, BKPF)
- Runtime vs. Full Use licensing — how to avoid $500k+ audit surprises
- Real-time streaming to Kafka and Snowflake

**Tables covered:** ACDOCA, BKPF, VBAK, MARA, LFA1

**Each table includes:** Beginner, Intermediate, and Expert walkthroughs

## Quick Start

```bash
cd sap-extract-academy
npm install
npm run build
```

See [`sap-extract-academy/README.md`](./sap-extract-academy/README.md) for full documentation.

## Deployment

Site auto-deploys to GitHub Pages on every push to `main`.

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full build and deployment guide.
